#!/usr/bin/env python3
"""Timeline + sous-titres + design sonore + mixage.

La voix-off est le référentiel temporel :
  - si public/audio/voiceover/sXX.wav|mp3 existe, la durée réelle du fichier
    fixe la durée de la narration de la scène (et, si sXX.json existe avec
    [{"id": "...", "start": s, "end": s}], les timestamps exacts par phrase) ;
  - sinon la durée est ESTIMÉE (débit de 141 mots/min) — solution temporaire.

Produit :
  src/data/timings.json      timeline utilisée par Remotion
  subtitles/*.srt / *.vtt    sous-titres (documentaire + teaser)
  voiceover.txt              script de narration (narrateur humain)
  voiceover-tts.txt          variante phonétique pour moteur TTS
  storyboard.json            storyboard horodaté
  public/audio/music/bed.wav, public/audio/sfx/*.wav
  public/audio/mix/master.wav (+ teaser.wav) normalisés -14 LUFS / -1 dBTP

Musique et effets : 100 % synthétisés ici (aucun droit tiers).
Usage : python3 scripts/prepare-audio.py [--no-audio]
"""
from __future__ import annotations

import json
import math
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parent.parent
NARR = json.loads((ROOT / "src/data/narration.json").read_text())
FPS = 30
SR = 48000
VO_DIR = ROOT / "public/audio/voiceover"

# ---------------------------------------------------------------- texte TTS
TTS_REPLACE = [
    (r"\b7 heures 30\b", "sept heures trente"),
    (r"\b6 heures 54\b", "six heures cinquante-quatre"),
    (r"\b22 octobre 2026\b", "vingt-deux octobre deux mille vingt-six"),
    (r"\b16 novembre 2026\b", "seize novembre deux mille vingt-six"),
    (r"\b23 novembre 2026\b", "vingt-trois novembre deux mille vingt-six"),
    (r"\b20 novembre\b", "vingt novembre"),
    (r"\b2 novembre\b", "deux novembre"),
    (r"\bTerminale D\b", "Terminale D"),
]
TTS_PHONETIC = [
    (r"\bCOGES\b", "Cogèsse"),
    (r"\bSOTRA\b", "Sotra"),
]


def tts_text(t: str, phonetic: bool = False) -> str:
    for a, b in TTS_REPLACE:
        t = re.sub(a, b, t)
    if phonetic:
        for a, b in TTS_PHONETIC:
            t = re.sub(a, b, t)
    return t


def words(t: str) -> int:
    return len(re.findall(r"[\wÀ-ÿ'’-]+", tts_text(t)))


def probe_duration(p: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
        capture_output=True, text=True, check=True,
    ).stdout
    return float(out.strip())


def vo_file(sid: str) -> Path | None:
    for ext in ("wav", "mp3", "m4a"):
        p = VO_DIR / f"{sid}.{ext}"
        if p.exists():
            return p
    return None


# ---------------------------------------------------------------- timeline
def build_timeline() -> dict:
    wps = NARR["meta"]["wordsPerSecond"]
    dpause = NARR["meta"]["defaultPause"]
    t = 0.0
    scenes = []
    voice_found = []
    for sc in NARR["scenes"]:
        segs = []
        cur = sc["lead"]
        est = []
        for s in sc["segments"]:
            if "silent" in s:
                est.append((s["id"], None, s["silent"], 0.0))
            else:
                d = max(1.1, words(s["t"]) / wps)
                est.append((s["id"], s["t"], d, s.get("pause", dpause)))
        vf = vo_file(sc["id"])
        exact = None
        if vf:
            voice_found.append(sc["id"])
            j = vf.with_suffix(".json")
            if j.exists():
                exact = {x["id"]: x for x in json.loads(j.read_text())}
            spoken = sum(d + p for _, txt, d, p in est if txt)
            real = probe_duration(vf)
            scale = real / spoken if spoken else 1
        else:
            scale = 1.0
        vo_start = cur
        for sid, txt, d, p in est:
            if txt is None:
                segs.append({"id": sid, "start": round(cur, 3), "end": round(cur + d, 3), "text": None})
                cur += d
                continue
            if exact and sid in exact:
                a, b = vo_start + exact[sid]["start"], vo_start + exact[sid]["end"]
                segs.append({"id": sid, "start": round(a, 3), "end": round(b, 3), "text": txt})
                cur = max(cur, b + p * 0.5)
            else:
                segs.append({"id": sid, "start": round(cur, 3), "end": round(cur + d * scale, 3), "text": txt})
                cur += (d + p) * scale
        dur = cur + sc["tail"]
        dur = math.ceil(dur * FPS) / FPS
        scenes.append({
            "id": sc["id"], "name": sc["name"], "start": round(t, 3), "duration": round(dur, 3),
            "voStart": round(vo_start, 3), "voFile": f"audio/voiceover/{vf.name}" if vf else None,
            "pages": sc["pages"], "segments": segs,
        })
        t += dur
    return {
        "fps": FPS, "total": round(t, 3), "estimated": len(voice_found) == 0,
        "voiceScenes": voice_found, "scenes": scenes,
    }


# ---------------------------------------------------------------- sous-titres
def _balance(text: str, max_line: int) -> str:
    ws = text.split(" ")
    if len(text) <= max_line or len(ws) < 2:
        return text
    best, best_i = 10**9, 1
    for i in range(1, len(ws)):
        a, b = " ".join(ws[:i]), " ".join(ws[i:])
        score = max(len(a), len(b)) + (0 if a[-1] in ",:;" else 3)
        if score < best:
            best, best_i = score, i
    return " ".join(ws[:best_i]) + "\n" + " ".join(ws[best_i:])


def chunk_sentence(text: str, max_line: int = 40) -> list[str]:
    """Découpe en cues de 2 lignes max, en privilégiant la ponctuation."""
    max_cue = max_line * 2 - 4
    # dates et heures insécables (« 16 novembre 2026 », « 7 heures 30 »)
    text = re.sub(r"(\d+) (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)( \d{4})?",
                  lambda m: m.group(0).replace(" ", "\u00a0"), text)
    text = re.sub(r"(\d+) heures (\d+)", lambda m: m.group(0).replace(" ", "\u00a0"), text)
    text = re.sub(r"(lundi|mardi|mercredi|jeudi|vendredi) (\d)", lambda m: m.group(0).replace(" ", "\u00a0"), text)
    for name in ("Mamie Adjoua", "L'Éléphant Déchaîné", "Terminale D", "Boulevard du Gabon"):
        text = text.replace(name, name.replace(" ", "\u00a0"))
    clauses = [c.strip() for c in re.split(r"(?<=[,:;])\s+", text) if c.strip()]
    pieces = []
    for c in clauses:
        if len(c) <= max_cue:
            pieces.append(c)
            continue
        ws, cur = c.split(" "), ""
        n_parts = math.ceil(len(c) / max_cue)
        target = len(c) / n_parts
        for w in ws:
            if cur and len(cur) + 1 + len(w) > target + 6:
                pieces.append(cur)
                cur = w
            else:
                cur = f"{cur} {w}".strip()
        if cur:
            pieces.append(cur)
    cues, cur = [], ""
    for pc in pieces:
        if cur and len(cur) + 1 + len(pc) <= max_cue:
            cur = f"{cur} {pc}"
        else:
            if cur:
                cues.append(cur)
            cur = pc
    if cur:
        cues.append(cur)
    return [_balance(c, max_line).replace("\u00a0", " ") for c in cues]


def build_cues(tl: dict, offset_scene: str | None = None) -> list[dict]:
    cues = []
    for sc in tl["scenes"]:
        for s in sc["segments"]:
            if not s["text"]:
                continue
            parts = chunk_sentence(s["text"])
            a, b = sc["start"] + s["start"], sc["start"] + s["end"]
            total = sum(len(p) for p in parts)
            t = a
            for p in parts:
                d = (b - a) * len(p) / total
                cues.append({"start": round(t, 3), "end": round(t + d, 3), "text": p, "scene": sc["id"]})
                t += d
    return cues


def ts(x: float, sep: str = ",") -> str:
    ms = int(round(x * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}"


def write_subs(cues: list[dict], name: str) -> None:
    d = ROOT / "subtitles"
    d.mkdir(exist_ok=True)
    srt = "\n".join(f"{i}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n" for i, c in enumerate(cues, 1))
    (d / f"{name}.srt").write_text(srt)
    vtt = "WEBVTT\n\n" + "\n".join(f"{ts(c['start'], '.')} --> {ts(c['end'], '.')}\n{c['text']}\n" for c in cues)
    (d / f"{name}.vtt").write_text(vtt)


# ---------------------------------------------------------------- teaser
TEASER = [  # (scene, segment ids) — contexte + contradictions principales
    ("s01", ["chronique", "enquete"]),
    ("s03", ["soupcon"]),
    ("s06", ["drena"]),
    ("s07", ["constat", "resume", "contradiction"]),
]


def build_teaser(tl: dict) -> dict:
    by = {s["id"]: s for s in tl["scenes"]}
    clips = []
    t = 0.0
    for sid, ids in TEASER:
        sc = by[sid]
        for seg_id in ids:
            seg = next(x for x in sc["segments"] if x["id"] == seg_id)
            a = seg["start"] - 0.25
            b = seg["end"] + 0.45
            clips.append({"scene": sid, "seg": seg_id, "srcStart": round(sc["start"] + a, 3),
                          "start": round(t, 3), "duration": round(b - a, 3), "text": seg["text"]})
            t += b - a
    outro = 6.5
    return {"intro": 2.5, "clips": clips, "outro": outro, "total": round(2.5 + t + outro, 3)}


# ---------------------------------------------------------------- synthèse
def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


rng = np.random.default_rng(23112026)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def sfx_tick(high=True):
    n = int(0.06 * SR)
    x = rng.standard_normal(n) * env_exp(n, 0.004)
    x = bp(x, 2500 if high else 1400, 6000 if high else 3000)
    body = np.sin(2 * np.pi * (1900 if high else 1250) * np.arange(n) / SR) * env_exp(n, 0.01)
    return (x * 0.7 + body * 0.5) * 0.8


def sfx_gate(open_=False):
    n = int(2.2 * SR)
    tt = np.arange(n) / SR
    parts = [(97, 1.0, 0.9), (183, 0.8, 0.7), (412, 0.55, 0.6), (687, 0.4, 0.45), (1131, 0.28, 0.3), (1723, 0.18, 0.2)]
    x = sum(a * np.sin(2 * np.pi * f * tt * (1 - 0.004 * tt)) * np.exp(-tt / d) for f, a, d in parts)
    hit = lp(rng.standard_normal(n), 2500) * np.exp(-tt / 0.05) * 1.4
    thump = np.sin(2 * np.pi * 52 * tt) * np.exp(-tt / 0.18) * 1.2
    x = x * 0.5 + hit + thump
    if open_:  # grincement doux + clang léger
        creak = bp(rng.standard_normal(n), 600, 1400) * (np.sin(2 * np.pi * 11 * tt) ** 2) * np.clip(1 - tt / 1.2, 0, 1)
        x = creak * 0.6 + np.roll(x * 0.35, int(0.9 * SR))
    return x / np.max(np.abs(x)) * 0.9


def sfx_paper():
    n = int(0.9 * SR)
    tt = np.arange(n) / SR
    mod = np.abs(lp(rng.standard_normal(n), 30)) * 6
    x = bp(rng.standard_normal(n), 1800, 7000) * mod * np.sin(np.pi * tt / tt[-1]) ** 0.7
    return x / np.max(np.abs(x)) * 0.5


def sfx_blip(f=1500):
    n = int(0.09 * SR)
    tt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 1.5 * tt)) * env_exp(n, 0.025)
    return x * 0.35


def sfx_whoosh(d=1.0):
    n = int(d * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    steps = 24
    for i in range(steps):
        a, b = i * n // steps, (i + 1) * n // steps
        fc = 300 + 3500 * (i / steps) ** 1.5
        out[a:b] = bp(noise, fc * 0.6, min(fc * 1.6, 20000))[a:b]
    e = np.sin(np.pi * tt / tt[-1]) ** 2
    return out * e / np.max(np.abs(out * e)) * 0.35


def sfx_impact(strength=1.0):
    n = int(2.0 * SR)
    tt = np.arange(n) / SR
    f = 62 * np.exp(-tt / 0.5) + 34
    ph = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(ph) * np.exp(-tt / 0.55)
    air = lp(rng.standard_normal(n), 900) * np.exp(-tt / 0.12) * 0.5
    x = boom + air
    return x / np.max(np.abs(x)) * 0.85 * strength


def sfx_notif():
    a = sfx_blip(880)
    b = sfx_blip(1320)
    out = np.zeros(int(0.25 * SR))
    out[: len(a)] += a
    out[int(0.09 * SR): int(0.09 * SR) + len(b)] += b
    return out


SFX = {
    "tick": sfx_tick(True), "tock": sfx_tick(False), "gate": sfx_gate(), "gate_open": sfx_gate(True),
    "paper": sfx_paper(), "blip": sfx_blip(), "blip_low": sfx_blip(990), "whoosh": sfx_whoosh(),
    "impact": sfx_impact(), "impact_soft": sfx_impact(0.5), "notif": sfx_notif(),
}

# intensité musicale par scène (0..1), pulsation on/off
MOOD = {
    "s00": (0.2, 0), "s01": (0.55, 1), "s02": (0.7, 0), "s03": (0.5, 1), "s04": (0.6, 1),
    "s05": (0.55, 1), "s06": (0.6, 1), "s07": (0.75, 1), "s08": (0.6, 1), "s09": (0.6, 1),
    "s10": (0.55, 1), "s11": (0.6, 1), "s12": (0.7, 1), "s13": (0.85, 1), "s14": (0.45, 0),
    "s15": (0.3, 0), "s17": (0.35, 0), "s16": (0.2, 0),
}


def cue_list(tl: dict) -> list[tuple[float, str, float]]:
    """(temps absolu, sfx, gain)."""
    cues = []
    for sc in tl["scenes"]:
        S = sc["start"]
        seg = {s["id"]: S + s["start"] for s in sc["segments"]}
        sid = sc["id"]
        if sid == "s01":
            ch, en, rs = seg["chronique"], seg["enquete"], seg["resume"]
            cues += [(S + 0.05, "impact_soft", 0.7), (S + 0.3, "whoosh", 0.5)]
            cues += [(ch + 2.6 + k * 0.45, "notif", 0.45 - k * 0.04) for k in range(5)]
            cues += [(en - 0.1, "paper", 1.0), (en + 2.2, "paper", 0.6), (en + 3.4, "paper", 0.5)]
            cues += [(rs + 0.15 + k * 0.85, "tick" if k == 0 else "blip", 0.7) for k in range(4)]
        elif sid == "s02":
            cues += [(S + 0.05, "impact", 0.9)]
        elif sid == "s03":
            cues += [(seg["video"] + 0.4, "notif", 0.5), (seg["denonce"] + 3.4, "tick", 0.8), (seg["denonce"] + 5.4, "gate", 0.55),
                     (seg["soupcon"] + 2.0, "whoosh", 0.7)]
        elif sid == "s04":
            cues += [(seg["virale"] + k * 0.35, "notif", 0.4) for k in range(5)]
            cues += [(seg["voici"], "whoosh", 0.6)]
        elif sid in {"s05", "s06", "s07", "s08", "s09", "s10", "s11"}:
            cues += [(S + 0.15, "impact", 0.9), (S + 0.9, "whoosh", 0.4)]
            if sid == "s05":
                cues += [(seg["date"], "paper", 0.5), (seg["portail"] + 2.2, "gate", 0.7), (seg["reglement"], "paper", 0.8)]
            if sid == "s06":
                cues += [(seg["tarif"] + 0.6 + k * 0.08, "blip", 0.35) for k in range(18)]
                cues += [(seg["drena"], "whoosh", 0.5)]
            if sid == "s07":
                cues += [(seg["videoprov"], "paper", 0.6), (seg["publication"] + 0.6, "blip_low", 0.6),
                         (seg["constat"], "tick", 0.9), (seg["constat"] + 0.5, "tock", 0.8), (seg["suivi"], "whoosh", 0.6),
                         (seg["contradiction"], "impact", 0.85)]
            if sid == "s08":
                cues += [(seg["verse"] + 1.0, "blip", 0.6), (seg["circuit"], "impact_soft", 0.6)]
            if sid == "s09":
                cues += [(seg["heures"] + 0.3, "blip_low", 0.6), (seg["archives"], "paper", 0.8)]
                cues += [(seg[k], "blip", 0.7) for k in ("t1", "t2", "t3", "moyenne", "bien", "aucune")]
                cues += [(seg["justif"], "impact_soft", 0.5)]
            if sid == "s10":
                cues += [(seg["abidjan"], "whoosh", 0.8)]
            if sid == "s11":
                cues += [(seg["entrer"] + 0.4, "gate_open", 0.8), (seg["hierarchie"], "paper", 0.6)]
        elif sid == "s12":
            cues += [(S + 0.1, "whoosh", 0.7)]
            cues += [(seg[f"e{k}"] + 0.15, "blip", 0.6) for k in range(1, 8)]
        elif sid == "s13":
            cues += [(seg[f"q{k}"], "impact_soft", 0.55) for k in range(1, 7)]
        elif sid == "s14":
            cues += [(seg["prudent"], "paper", 0.7)]
        elif sid == "s15":
            cues += [(seg["rouvert"], "impact_soft", 0.6), (seg["demeurent"], "impact", 0.7)]
        elif sid == "s17":
            cues += [(seg["abonnez"] + 1.43, "blip", 0.6), (seg["abonnez"] + 1.9, "notif", 0.8), (seg["abonnez"] + 2.2, "notif", 0.6)]
    return cues


def synth_bed(tl: dict) -> np.ndarray:
    T = tl["total"]
    n = int(T * SR) + SR
    tt = np.arange(n) / SR
    # enveloppe d'intensité par scène, lissée
    inten = np.zeros(n)
    pulse_on = np.zeros(n)
    for sc in tl["scenes"]:
        a, b = int(sc["start"] * SR), int((sc["start"] + sc["duration"]) * SR)
        i, p = MOOD[sc["id"]]
        if sc["id"] == "s13":  # montée progressive
            inten[a:b] = np.linspace(0.55, 1.0, b - a)
        elif sc["id"] == "s15":
            inten[a:b] = np.linspace(0.4, 0.0, b - a)
        else:
            inten[a:b] = i
        pulse_on[a:b] = p
    inten = lp(inten, 0.6, 1)
    pulse_on = lp(pulse_on, 1.0, 1)

    # drone (ré mineur) : D2, A2, F3, C4 avec désaccord lent
    drone = np.zeros(n)
    for f, a in [(73.42, 0.5), (110.0, 0.35), (174.61, 0.22), (261.63, 0.10), (36.71, 0.35)]:
        for det in (-0.12, 0.12):
            drone += a * np.sin(2 * np.pi * (f + det) * tt + rng.uniform(0, 6.28))
    drone *= 0.55 + 0.45 * np.sin(2 * np.pi * tt / 11.0) ** 2
    texture = lp(hp(rng.standard_normal(n), 200), 1200) * (0.5 + 0.5 * np.sin(2 * np.pi * tt / 7.3) ** 2) * 0.25
    # pad aigu pour la montée (scène 13)
    pad = np.zeros(n)
    for f in (293.66, 349.23, 440.0, 587.33):
        saw = 2 * ((tt * f) % 1) - 1
        pad += saw * 0.08
    pad = lp(pad, 1400)
    # pulsation « battement » 72 bpm
    beat = np.zeros(n)
    period = 60 / 72
    k = int(0.5 * SR)
    kt = np.arange(k) / SR
    kick = np.sin(2 * np.pi * np.cumsum(48 * np.exp(-kt / 0.08) + 40) / SR) * np.exp(-kt / 0.22)
    soft = kick * 0.55
    t0 = 0.0
    idx = 0
    while t0 < T:
        s = int(t0 * SR)
        e = min(n, s + k)
        beat[s:e] += (kick if idx % 2 == 0 else soft)[: e - s]
        t0 += period if idx % 2 == 0 else period * 0.35
        if idx % 2 == 1:
            t0 += period * 0.65 - period * 0.35 + period * 0.35  # motif « dum-dum … »
        idx += 1
    bed = drone * 0.30 * (0.35 + inten) + texture * inten + pad * np.clip(inten - 0.6, 0, 1) * 1.8 + beat * 0.55 * pulse_on * inten
    bed = lp(bed, 6000)
    return bed


def duck_env(tl: dict, n: int) -> np.ndarray:
    g = np.ones(n)
    for sc in tl["scenes"]:
        for s in sc["segments"]:
            if s["text"]:
                a = int((sc["start"] + s["start"] - 0.15) * SR)
                b = int((sc["start"] + s["end"] + 0.25) * SR)
                g[max(a, 0):min(b, n)] = 0.32  # ≈ -10 dB sous la voix
    # lissage attaque/relâche
    return lp(g, 3.0, 1)


def place(buf, x, t, gain):
    s = int(t * SR)
    if s >= len(buf) or s < 0:
        return
    e = min(len(buf), s + len(x))
    buf[s:e] += x[: e - s] * gain


def to_stereo(x, width=0.0):
    return np.stack([x, x], axis=1)


def write_wav(p: Path, x: np.ndarray) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    peak = np.max(np.abs(x)) or 1
    if peak > 0.98:
        x = x / peak * 0.98
    wavfile.write(p, SR, (x * 32767).astype(np.int16))


def loudnorm(src: Path, dst: Path, target=-14.0, tp=-1.0) -> dict:
    dst.parent.mkdir(parents=True, exist_ok=True)
    pre = "acompressor=threshold=-20dB:ratio=4:attack=3:release=150:makeup=2,alimiter=limit=0.7:level=false,"
    flt = pre + f"loudnorm=I={target}:TP={tp}:LRA=20:print_format=json"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-y", "-i", str(src), "-af", flt, "-f", "null", "-"],
                       capture_output=True, text=True)
    m = json.loads(r.stderr[r.stderr.rindex("{"): r.stderr.rindex("}") + 1])
    flt2 = pre + (f"loudnorm=I={target}:TP={tp}:LRA=20:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
            f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json")
    r2 = subprocess.run(["ffmpeg", "-hide_banner", "-y", "-i", str(src), "-af", flt2, "-ar", str(SR), "-c:a", "pcm_s16le", str(dst)],
                        capture_output=True, text=True, check=True)
    return json.loads(r2.stderr[r2.stderr.rindex("{"): r2.stderr.rindex("}") + 1])


def load_audio(p: Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def build_audio(tl: dict, teaser: dict) -> dict:
    bed = synth_bed(tl)
    n = len(bed)
    music = bed / (np.max(np.abs(bed)) or 1) * 0.5
    write_wav(ROOT / "public/audio/music/bed.wav", music)
    for k, x in SFX.items():
        write_wav(ROOT / f"public/audio/sfx/{k}.wav", x)
    sfx = np.zeros(n)
    for t, k, g in cue_list(tl):
        place(sfx, SFX[k], t, g * 0.55)
    voice = np.zeros(n)
    for sc in tl["scenes"]:
        if sc["voFile"]:
            v = load_audio(ROOT / "public" / sc["voFile"])
            place(voice, v, sc["start"] + sc["voStart"], 1.0)
    duck = duck_env(tl, n)
    mix = music * duck * 0.55 + sfx + voice * 1.0
    raw = ROOT / "output/_mix_raw.wav"
    write_wav(raw, to_stereo(mix))
    report = loudnorm(raw, ROOT / "public/audio/mix/master.wav")
    # teaser : extraits du master + intro/outro musicaux
    master = load_audio(ROOT / "public/audio/mix/master.wav")
    tn = int(teaser["total"] * SR) + SR
    tmix = np.zeros(tn)
    tb = bed[: tn] if len(bed) >= tn else np.pad(bed, (0, tn - len(bed)))
    tmix += tb / (np.max(np.abs(bed)) or 1) * 0.12
    place(tmix, SFX["impact"], 0.1, 0.5)
    for c in teaser["clips"]:
        a = int(c["srcStart"] * SR)
        seg = master[a: a + int(c["duration"] * SR)].copy()
        f = int(0.05 * SR)
        seg[:f] *= np.linspace(0, 1, f)
        seg[-f:] *= np.linspace(1, 0, f)
        place(tmix, seg, teaser["intro"] + c["start"], 0.9)
    place(tmix, SFX["impact"], teaser["total"] - teaser["outro"] + 0.1, 0.6)
    traw = ROOT / "output/_teaser_raw.wav"
    write_wav(traw, to_stereo(tmix))
    treport = loudnorm(traw, ROOT / "public/audio/mix/teaser.wav")
    raw.unlink(missing_ok=True)
    traw.unlink(missing_ok=True)
    return {"master": report, "teaser": treport}


# ---------------------------------------------------------------- main
def main() -> None:
    tl = build_timeline()
    teaser = build_teaser(tl)
    tl["teaser"] = teaser
    (ROOT / "src/data/timings.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1))
    cues = build_cues(tl)
    write_subs(cues, "mamie-adjoua-documentaire")
    (ROOT / "src/data/cues.json").write_text(json.dumps(cues, ensure_ascii=False))
    tcues = []
    for c in teaser["clips"]:
        for p in chunk_sentence(c["text"]):
            pass
    # cues teaser : on décale les cues du master tombant dans chaque extrait
    for c in teaser["clips"]:
        a, b = c["srcStart"], c["srcStart"] + c["duration"]
        for q in cues:
            if q["start"] >= a - 0.01 and q["end"] <= b + 0.01:
                off = teaser["intro"] + c["start"] - a
                tcues.append({"start": round(q["start"] + off, 3), "end": round(q["end"] + off, 3), "text": q["text"]})
    write_subs(tcues, "mamie-adjoua-teaser")
    (ROOT / "src/data/teaser-cues.json").write_text(json.dumps(tcues, ensure_ascii=False))

    # textes de narration
    human, tts = [], []
    for sc in NARR["scenes"]:
        lines = [s["t"] for s in sc["segments"] if "t" in s]
        if not lines:
            continue
        human.append(f"[{sc['id'].upper()} — {sc['name']}]\n" + "\n".join(lines))
        tts.append("\n".join(tts_text(x, phonetic=True) for x in lines))
    header = ("SCRIPT DE NARRATION — « Lycée Mamie Adjoua : les mystères du portail fermé »\n"
              "Adaptation de l'investigation de L'Éléphant Déchaîné (édition spéciale du 23 novembre 2026).\n"
              "Voix : masculine, grave, posée, journalistique. Débit 135-150 mots/min.\n"
              "Prononciations : Yamoussoukro « Ya-mou-sou-kro » · Mamie Adjoua « Ma-mi A-djou-a » · Abidjan « A-bi-djan » ·\n"
              "SOTRA « So-tra » · COGES « Co-jesse » · Kpoussoussou : à vérifier localement.\n"
              "Les repères [Sxx] ne sont pas à lire. Un fichier audio par scène : public/audio/voiceover/sXX.wav\n\n")
    (ROOT / "voiceover.txt").write_text(header + "\n\n".join(human) + "\n")
    (ROOT / "voiceover-tts.txt").write_text("\n\n".join(tts) + "\n")
    words_total = sum(words(s["t"]) for sc in NARR["scenes"] for s in sc["segments"] if "t" in s)

    sb = {"title": NARR["meta"]["title"], "fps": FPS, "resolution": "1080x1920", "total_seconds": tl["total"],
          "timing_source": "estimation (voix-off absente)" if tl["estimated"] else "voix-off réelle",
          "narration_words": words_total, "scenes": []}
    for sc in tl["scenes"]:
        sb["scenes"].append({"id": sc["id"], "name": sc["name"], "start": ts(sc["start"], "."),
                             "end": ts(sc["start"] + sc["duration"], "."), "duration_s": sc["duration"],
                             "source_pages": sc["pages"],
                             "narration": [s["text"] for s in sc["segments"] if s["text"]]})
    (ROOT / "storyboard.json").write_text(json.dumps(sb, ensure_ascii=False, indent=2))
    print(f"Timeline : {tl['total']:.1f}s ({tl['total']/60:.2f} min), {words_total} mots, estimée={tl['estimated']}")
    print(f"Teaser : {teaser['total']:.1f}s, {len(cues)} cues sous-titres")
    if "--no-audio" not in sys.argv:
        rep = build_audio(tl, teaser)
        (ROOT / "output/audio-report.json").write_text(json.dumps(rep, indent=2))
        print("Master :", rep["master"]["output_i"], "LUFS", rep["master"]["output_tp"], "dBTP")
        print("Teaser :", rep["teaser"]["output_i"], "LUFS", rep["teaser"]["output_tp"], "dBTP")


if __name__ == "__main__":
    main()
