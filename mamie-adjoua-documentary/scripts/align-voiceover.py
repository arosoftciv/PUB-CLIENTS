#!/usr/bin/env python3
"""Calage de la voix-off sur le script, phrase par phrase.

Entrée : source/voiceover-raw/sXX.mp3 (une piste par scène, phrases séparées par des pauses)
Sortie : public/audio/voiceover/sXX.wav + sXX.json [{"id", "start", "end"}]

Méthode : détection des silences (ffmpeg silencedetect), puis choix des N-1 silences qui
correspondent le mieux aux fins de phrase attendues (position proportionnelle au nombre de
caractères, pondérée par la durée du silence ; programmation dynamique, ordre respecté).
Chaque phrase est découpée, puis la piste est réassemblée avec les pauses définies dans
src/data/narration.json. La diction n'est ni accélérée ni modifiée ; seules les pauses entre
phrases sont normalisées.
"""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "source" / "voiceover-raw"
OUT = ROOT / "public" / "audio" / "voiceover"
SR = 48000
NARR = json.loads((ROOT / "src/data/narration.json").read_text())
DEFAULT_PAUSE = NARR["meta"]["defaultPause"]


def load(p: Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def silences(p: Path, noise="-38dB", d=0.22) -> list[tuple[float, float]]:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(p), "-af", f"silencedetect=noise={noise}:d={d}", "-f", "null", "-"],
                       capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return list(zip(starts, ends))


def choose(sils: list[tuple[float, float]], expected: list[float], lam=0.35) -> list[int]:
    """Programmation dynamique : un silence par frontière attendue, ordre strict."""
    n, m = len(expected), len(sils)
    if n == 0:
        return []
    if m < n:
        raise ValueError(f"{m} silences pour {n} frontières")
    score = np.array([[(s[1] - s[0]) - lam * abs((s[0] + s[1]) / 2 - e) for s in sils] for e in expected])
    best = np.full((n, m), -1e9)
    back = np.zeros((n, m), dtype=int)
    best[0] = score[0]
    for k in range(1, n):
        run, arg = -1e9, -1
        for j in range(m):
            if j - 1 >= 0 and best[k - 1][j - 1] > run:
                run, arg = best[k - 1][j - 1], j - 1
            if arg >= 0:
                best[k][j] = run + score[k][j]
                back[k][j] = arg
    j = int(np.argmax(best[n - 1]))
    path = [j]
    for k in range(n - 1, 0, -1):
        j = back[k][j]
        path.append(int(j))
    return path[::-1]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    report = {}
    for sc in NARR["scenes"]:
        segs = [s for s in sc["segments"] if "t" in s]
        src = RAW / f"{sc['id']}.mp3"
        if not segs or not src.exists():
            continue
        audio = load(src)
        total = len(audio) / SR
        sils = silences(src)
        # bornes de la parole (silences de tête et de queue retirés)
        head = sils[0][1] if sils and sils[0][0] < 0.05 else 0.0
        tail = sils[-1][0] if sils and sils[-1][1] > total - 0.05 else total
        inner = [s for s in sils if s[0] > head + 0.2 and s[1] < tail - 0.2]
        lens = np.array([len(s["t"]) for s in segs], dtype=float)
        cum = np.cumsum(lens)[:-1] / lens.sum()
        expected = [head + c * (tail - head) for c in cum]
        idx = choose(inner, expected)
        bounds = [head] + [x for i in idx for x in (inner[i][0], inner[i][1])] + [tail]
        pieces = []
        for k in range(len(segs)):
            a = max(0.0, bounds[2 * k] - 0.04)
            b = min(total, bounds[2 * k + 1] + 0.10)
            pieces.append(audio[int(a * SR): int(b * SR)])
        # remplacements de phrases isolées : source/voiceover-raw/overrides/sXX__<id>.mp3
        for k, sg in enumerate(segs):
            ov = RAW / "overrides" / f"{sc['id']}__{sg['id']}.mp3"
            if ov.exists():
                a2 = load(ov)
                sl = silences(ov)
                h = sl[0][1] if sl and sl[0][0] < 0.05 else 0.0
                t2 = sl[-1][0] if sl and sl[-1][1] > len(a2) / SR - 0.05 else len(a2) / SR
                piece = a2[int(max(0, h - 0.04) * SR): int(min(len(a2) / SR, t2 + 0.10) * SR)]
                # niveau aligné sur le reste de la scène
                ref = np.sqrt(np.mean(np.concatenate([p for j, p in enumerate(pieces) if j != k]) ** 2))
                cur = np.sqrt(np.mean(piece ** 2)) or 1
                pieces[k] = piece * (ref / cur)
                print(f"  ↺ phrase remplacée : {sc['id']}/{sg['id']}")
        # réassemblage avec les pauses du script
        out, marks, t = [], [], 0.0
        for k, (s, piece) in enumerate(zip(segs, pieces)):
            f = int(0.008 * SR)
            piece = piece.copy()
            piece[:f] *= np.linspace(0, 1, f)
            piece[-f:] *= np.linspace(1, 0, f)
            d = len(piece) / SR
            marks.append({"id": s["id"], "start": round(t, 3), "end": round(t + d, 3)})
            out.append(piece)
            t += d
            if k < len(segs) - 1:
                pause = s.get("pause", DEFAULT_PAUSE)
                out.append(np.zeros(int(pause * SR)))
                t += pause
        y = np.concatenate(out)
        wavfile.write(OUT / f"{sc['id']}.wav", SR, (np.clip(y, -1, 1) * 32767).astype(np.int16))
        (OUT / f"{sc['id']}.json").write_text(json.dumps(marks, ensure_ascii=False, indent=1))
        report[sc["id"]] = {"raw_s": round(total, 2), "aligned_s": round(t, 2), "sentences": len(segs),
                            "silences": len(inner),
                            "boundaries": [round((inner[i][0] + inner[i][1]) / 2, 2) for i in idx],
                            "expected": [round(e, 2) for e in expected]}
        print(sc["id"], report[sc["id"]]["raw_s"], "→", report[sc["id"]]["aligned_s"], "s",
              "| frontières", report[sc["id"]]["boundaries"], "| attendues", report[sc["id"]]["expected"])
    (ROOT / "output/voiceover-alignment.json").write_text(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
