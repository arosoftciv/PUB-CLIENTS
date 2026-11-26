#!/usr/bin/env python3
"""Correctif de prononciation : remplace la phrase « Apprenez en présentiel à Abidjan… au Ghana. » de la voix off
par une nouvelle prise (graphie phonétique « Abidjean » → [a.bid.ʒɑ̃], sans e muet final), puis recale words.json.
Entrées : source/voiceover-raw/voix-off-tony.mp3 (prise d'origine), words-v1.json, abidjan/take-abidjean.mp3 (+ -words.json)
Sorties : source/voiceover-raw/voix-off.wav (voix off corrigée utilisée par build-audio.py), words.json
"""
import json, subprocess
from pathlib import Path
import numpy as np
from scipy.io import wavfile

R = Path(__file__).resolve().parent.parent / "source/voiceover-raw"
SR = 48000
CUT_A, CUT_B = 31.10, 38.96            # silences avant « Apprenez » et après « Ghana. » dans la prise d'origine

def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

orig = load(R / "voix-off-tony.mp3")
take = load(R / "abidjan/take-abidjean.mp3")
words_o = [w for w in json.loads((R / "words-v1.json").read_text())["words"] if w["type"] == "word"]
words_t = [w for w in json.loads((R / "abidjan/take-abidjean-words.json").read_text())["words"] if w["type"] == "word"]

# bornes utiles de la nouvelle prise (seuil -45 dB)
env = np.convolve(np.abs(take), np.ones(480) / 480, "same")
on = np.where(env > 10 ** (-45 / 20))[0]
t0, t1 = max(0, on[0] - 240), min(len(take), on[-1] + 2400)
clip = take[t0:t1]
# niveau : même RMS de parole active (fenêtres de 50 ms au-dessus de -40 dB) que la phrase d'origine
def speech_rms(x):
    fr = x[: len(x) // 2400 * 2400].reshape(-1, 2400)
    r = np.sqrt((fr ** 2).mean(1)); r = r[r > 10 ** (-40 / 20)]
    return np.sqrt((r ** 2).mean())
gain = speech_rms(orig[int(CUT_A * SR):int(CUT_B * SR)]) / speech_rms(clip)
clip = clip * gain
print(f"gain appliqué à la nouvelle prise : {20 * np.log10(gain):+.1f} dB")
# même respiration qu'à l'origine : « objectifs » finit à 31.01, « Apprenez » commençait à 31.185
first_o = next(w for w in words_o if w["start"] >= CUT_A)["start"]
lead = max(0.0, first_o - CUT_A - (on[0] - t0) / SR)
last_o = max(w["end"] for w in words_o if w["end"] <= CUT_B)
tail = max(0.0, CUT_B - last_o - 0.05)
fade = 240
clip[:fade] *= np.linspace(0, 1, fade); clip[-fade:] *= np.linspace(1, 0, fade)
a = orig[: int(CUT_A * SR)]; b = orig[int(CUT_B * SR):]
out = np.concatenate([a, np.zeros(int(lead * SR), np.float32), clip, np.zeros(int(tail * SR), np.float32), b])
wavfile.write(R / "voix-off.wav", SR, np.clip(out, -1, 1).astype(np.float32))

ins = CUT_A + lead - t0 / SR            # position de t=0 de la prise dans la nouvelle piste
new_len = lead + len(clip) / SR + tail
delta = new_len - (CUT_B - CUT_A)
words = [w for w in words_o if w["end"] <= CUT_A]
for w in words_t:
    words.append({**w, "text": w["text"].replace("Abidjean", "Abidjan"), "start": round(w["start"] + ins, 3), "end": round(w["end"] + ins, 3)})
words += [{**w, "start": round(w["start"] + delta, 3), "end": round(w["end"] + delta, 3)} for w in words_o if w["start"] >= CUT_B]
for i in range(len(words) - 1):   # Scribe étend parfois la fin du dernier mot jusqu'à la fin du fichier
    words[i]["end"] = min(words[i]["end"], round(words[i + 1]["start"] - 0.03, 3))
(R / "words.json").write_text(json.dumps({"words": words}, ensure_ascii=False, indent=0))
print(f"phrase remplacée : {CUT_B - CUT_A:.2f}s → {new_len:.2f}s (décalage {delta:+.3f}s), durée totale {len(out) / SR:.2f}s")
