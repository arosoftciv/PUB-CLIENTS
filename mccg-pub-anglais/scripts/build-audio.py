#!/usr/bin/env python3
"""Design sonore + mixage final.
- Voix off : source/voiceover-raw/voix-off.wav (ElevenLabs, corrigée par splice-voiceover.py), décalée de voOffset.
- Musique : source/music/music-eleven.mp3 (ElevenLabs Music, instrumentale), ducking automatique sous la voix.
- Effets : synthétisés ici (numpy), placés sur les repères de src/data/timeline.json.
Sorties : public/audio/mix.wav (piste unique utilisée par Remotion), public/audio/voix-off.wav, public/audio/musique.wav
Normalisation finale : -14 LUFS intégré, -1 dBTP (standard réseaux sociaux).
"""
import json, subprocess
from pathlib import Path
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src/data/timeline.json").read_text())
C = TL["cues"]; SR = 48000; N = int(TL["total"] * SR)
AUD = ROOT / "public/audio"; AUD.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)

def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)

def env(n, a=0.005, tau=0.2):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / tau)

def whoosh(d=0.7, up=True):
    n = int(d * SR); t = np.linspace(0, 1, n)
    x = rng.standard_normal(n)
    shape = np.sin(np.pi * t) ** 2 if not up else t ** 2.2 * (1 - t) ** 0.3 * 2.4
    lo = filt(x, "bandpass", [300, 2500]) * shape
    hi = filt(x, "highpass", 3000) * shape * 0.35
    return (lo + hi) * 0.5

def swish(d=0.45):
    n = int(d * SR); t = np.linspace(0, 1, n)
    return filt(rng.standard_normal(n), "bandpass", [600, 6000]) * np.sin(np.pi * t) ** 3 * 0.45

def pop(f=900):
    n = int(0.18 * SR); t = np.arange(n) / SR
    fr = f * (1 + 1.5 * np.exp(-t / 0.01))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.002, 0.045) * 0.55

def tick(f=2400):
    n = int(0.06 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * env(n, 0.0008, 0.012) * 0.5

def impact(s=1.0):
    n = int(1.6 * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * (48 + 60 * np.exp(-t / 0.05)) * t) * env(n, 0.003, 0.45)
    nz = filt(rng.standard_normal(n), "lowpass", 900) * env(n, 0.001, 0.08) * 0.6
    return (sub + nz) * 0.75 * s

def chime(base=880, d=1.6, bright=1.0):
    n = int(d * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for k, (m, a) in enumerate([(1, 1), (2.01, .45), (3.0, .25), (4.2, .12 * bright)]):
        y += a * np.sin(2 * np.pi * base * m * t + k) * env(n, 0.002, 0.5 / m ** 0.5)
    return y * 0.22

def shimmer(d=2.2):
    n = int(d * SR); y = np.zeros(n)
    for i in range(14):
        st = int(rng.uniform(0, d * 0.6) * SR); f = rng.choice([1318.5, 1567.98, 1975.5, 2637, 3135.9])
        m = min(n - st, int(0.9 * SR)); tt = np.arange(m) / SR
        y[st:st + m] += np.sin(2 * np.pi * f * tt) * env(m, 0.004, 0.3) * 0.08
    return y * np.linspace(1, 0.6, n)

def riser(d=2.0):
    n = int(d * SR); t = np.linspace(0, 1, n)
    x = rng.standard_normal(n)
    bp = np.zeros(n)
    for i in range(0, n, 2400):   # filtre qui s'ouvre
        seg = slice(i, min(n, i + 2400)); fc = 400 + 5000 * t[i] ** 2
        bp[seg] = filt(x[seg], "bandpass", [fc * 0.6, fc * 1.4])
    tone = np.sin(2 * np.pi * np.cumsum(180 + 500 * t ** 2) / SR) * 0.25
    return (bp * 0.5 + tone) * t ** 2.5

def paper():
    n = int(0.35 * SR); t = np.linspace(0, 1, n)
    return filt(rng.standard_normal(n), "bandpass", [1500, 7000]) * (np.sin(np.pi * t) ** 0.6) * (0.6 + 0.4 * np.sin(40 * t)) * 0.3

def blip(f=1200):
    n = int(0.09 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * env(n, 0.002, 0.03) * 0.35

def heartbeat():
    n = int(0.7 * SR); y = np.zeros(n)
    for off, a in [(0, 1), (0.22, 0.7)]:
        st = int(off * SR); m = int(0.25 * SR); tt = np.arange(m) / SR
        y[st:st + m] += np.sin(2 * np.pi * (55 + 25 * np.exp(-tt / 0.03)) * tt) * env(m, 0.004, 0.07) * a
    return y * 0.8

def ping(f=1046.5):
    c = chime(f, 1.0, 0.4) * 1.3; q = pop(f * 0.8) * 0.4; c[:len(q)] += q
    return c

sfx = np.zeros((N, 2))
def place(x, t, g=1.0, pan=0.0):
    i = int(t * SR); x = x[: max(0, N - i)]
    if i < 0 or len(x) == 0: return
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    sfx[i:i + len(x), 0] += x * g * l * 1.414; sfx[i:i + len(x), 1] += x * g * r * 1.414

S = {s["id"]: s for s in TL["scenes"]}
# S1 hook
place(heartbeat(), 0.05, 0.9); place(heartbeat(), 1.25, 0.7)
place(impact(0.8), C["hook_anglais"] - 0.05, 0.8)
place(whoosh(0.6), S["opportunites"]["start"] - 0.45, 0.7)
# S2 cartes
for k, (key, pan) in enumerate([("opp_emploi", -.4), ("opp_promo", .4), ("opp_etudes", -.4), ("opp_voyage", .4)]):
    place(swish(), C[key] - 0.2, 0.7, pan); place(pop(700 + 120 * k), C[key] + 0.05, 0.6, pan)
# S3 révélation
place(riser(1.8), C["force_q"] - 0.1, 0.55)
place(impact(0.6), C["force_word"], 0.6)
place(whoosh(0.9, up=True), C["reveal_mccg"] - 0.85, 0.7)
place(chime(587.3, 2.4), C["reveal_mccg"] + 0.05, 0.9); place(shimmer(2.6), C["reveal_mccg"] + 0.05, 0.9)
place(pop(1200), C["reveal_sarl"], 0.35)
# S4
place(whoosh(0.5), S["apprentissage"]["start"] - 0.35, 0.6)
for key in ["learn_apprenez", "learn_confiance", "learn_oral"]: place(pop(950), C[key], 0.45)
place(swish(), S["niveaux"]["start"] - 0.15, 0.6)
for k, key in enumerate(["lvl_debutant", "lvl_avance"]): place(tick(1800 + 600 * k), C[key], 0.8); place(blip(880 + 220 * k), C[key] + 0.04, 0.6)
for k, key in enumerate(["prof_etudiant", "prof_pro", "prof_entrepreneur"]): place(pop(800 + 150 * k), C[key], 0.5, [-.4, 0, .4][k])
place(chime(1046.5, 1.2, .5), C["prof_objectifs"], 0.5)
# S5
place(whoosh(0.6), S["flexibilite"]["start"] - 0.4, 0.6)
place(tick(2000), C["flex_presentiel"], 0.6, -.4); place(blip(1320), C["flex_ligne"], 0.7, .4)
# S6 carte
place(swish(0.5), S["immersion"]["start"] - 0.2, 0.6)
place(ping(784), S["immersion"]["start"] + 0.45, 0.6, -.3)
place(whoosh(1.3, up=False), S["immersion"]["start"] + 0.75, 0.45)
place(ping(1174.7), C["imm_accra"] - 0.35, 0.7, .3)
place(whoosh(0.6), C["imm_accra"] + 0.25, 0.5)
# S7 tests
place(whoosh(0.5), S["tests"]["start"] - 0.35, 0.6)
for k, key in enumerate(["test_toefl", "test_ielts", "test_toeic", "test_duolingo"]): place(pop(900 + 100 * k), C[key], 0.5, [-.3, .3, -.3, .3][k])
for k in range(4): place(chime(1318.5 + 80 * k, 0.8, .3), C["test_accompagne"] + 0.35 + k * 0.42, 0.55)
# S8
place(swish(), S["services"]["start"] - 0.15, 0.6)
place(paper(), C["srv_traduction"] - 0.1, 0.8); place(paper(), C["srv_traduction"] + 0.45, 0.6); place(paper(), C["srv_documents"] + 0.2, 0.6)
place(blip(660), C["srv_interpretation"], 0.6); place(blip(990), C["srv_interpretation"] + 0.12, 0.5)
# S9
place(riser(2.2), S["transformation"]["start"] - 0.3, 0.6)
place(impact(1.0), C["tr_saisir"] - 0.25, 0.75)
# S10
place(whoosh(0.7), S["cta"]["start"] - 0.5, 0.7)
place(chime(698.5, 2.0), S["cta"]["start"] + 0.3, 0.7); place(shimmer(2.2), S["cta"]["start"] + 0.3, 0.6)
place(pop(1100), C["cta_whatsapp"], 0.5); place(chime(1567.98, 1.0, .4), C["cta_numero_fin"], 0.5)
place(chime(587.3, 2.6), C["cta_mccg"], 0.6); place(shimmer(2.6), C["cta_mccg"], 0.5)

# ---------- voix, musique, ducking
vo_raw = load(ROOT / "source/voiceover-raw/voix-off.wav")  # voix off corrigée (splice-voiceover.py)
vo = np.zeros((N, 2)); i0 = int(TL["voOffset"] * SR); vo[i0:i0 + len(vo_raw)] = vo_raw[: N - i0]
mus_raw = load(ROOT / "source/music/music-eleven.mp3")
mus = np.zeros((N, 2)); m = min(N, len(mus_raw)); mus[:m] = mus_raw[:m]
fade = int(2.5 * SR); mus[m - fade:m] *= (np.linspace(1, 0, fade) ** 1.5)[:, None]

# enveloppe de voix (RMS 30 ms) → gain musique : -11 dB sous la voix, retour lent
mono = np.abs(vo).mean(1); win = int(0.03 * SR)
rms = np.sqrt(np.convolve(mono ** 2, np.ones(win) / win, "same"))
speech = (rms > 0.012).astype(float)
hold = int(0.35 * SR); speech = np.convolve(speech, np.ones(hold), "same") > 0
g_db = np.where(speech, -11.0, 0.0)
# lissage attaque 60 ms / relâche 400 ms
g = np.empty(N); cur = 0.0; a_att = np.exp(-1 / (0.06 * SR)); a_rel = np.exp(-1 / (0.4 * SR))
for i in range(N):
    tgt = g_db[i]; a = a_att if tgt < cur else a_rel; cur = a * cur + (1 - a) * tgt; g[i] = cur
duck = 10 ** (g / 20)[:, None]
# la musique ne couvre jamais la voix : coupe aussi un peu de médiums (zone de la voix)
mus_mid_cut = mus - 0.35 * np.stack([filt(mus[:, c], "bandpass", [700, 3500]) for c in range(2)], 1) * (1 - duck)
music_gain = 10 ** (-7 / 20)
mix = vo * 1.0 + mus_mid_cut * duck * music_gain + sfx * 0.42

def write(p, x):
    wavfile.write(p, SR, np.clip(x, -1, 1).astype(np.float32))

write(ROOT / "source/voiceover-raw/voix-off-calee.wav", vo)
tmp = AUD / "_mix_tmp.wav"; write(tmp, mix)
# normalisation loudness en 2 passes
meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(tmp), "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
af = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", af, "-ar", "48000", "-c:a", "pcm_s16le", str(AUD / "mix.wav")], check=True)
tmp.unlink()
# livrables séparés
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(ROOT / "source/voiceover-raw/voix-off.wav"), "-c:a", "pcm_s16le", "-ar", "48000", str(ROOT / "output/mccg-voix-off.wav")], check=True)
print("mix ok", TL["total"], "s ; mesure entrée", js["input_i"], "LUFS")
