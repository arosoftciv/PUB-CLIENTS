#!/usr/bin/env python3
"""Prépare les visuels pour Remotion.
- Logo MCCG : détourage du vrai logo fourni (source/logo-mccg-original.jpg) → PNG transparents
  (emblème seul, mot-symbole seul, logo complet). Aucune redessin : pixels d'origine, fond bleu retiré par démélange de couleur.
- Photos : conversion JPEG qualité 92 dans public/images (9:16 en 1080x1920 recadré, 16:9 à leur taille).
Usage : python3 scripts/prepare-assets.py
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"
(PUB / "brand").mkdir(parents=True, exist_ok=True)
(PUB / "images").mkdir(parents=True, exist_ok=True)

# ---------- logo
src = np.asarray(Image.open(ROOT / "source/logo-mccg-original.jpg").convert("RGB")).astype(np.float32)
H, W, _ = src.shape
bg = np.median(src[20:200, 20:200].reshape(-1, 3), axis=0)
print("fond bleu mesuré", bg.round())

def unmix(region, fg):
    d = fg - bg
    a = ((region - bg) @ d) / (d @ d)
    return np.clip(a, 0, 1)

def cutout(y0, y1, fg, name, recolor=True):
    reg = src[y0:y1]
    a = unmix(reg, fg)
    a = np.where(a < 0.12, 0, (a - 0.12) / 0.88)
    rgb = np.broadcast_to(fg, reg.shape) if recolor else reg
    out = np.dstack([rgb, a * 255]).astype(np.uint8)
    im = Image.fromarray(out, "RGBA")
    bbox = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(bbox)
    im.save(PUB / "brand" / name)
    print(name, im.size)
    return im

ys = np.where(np.abs(src - bg).sum(2).max(1) > 120)[0]
# emblème jaune : mesure de sa couleur réelle
mask_y = (src[..., 0] > 200) & (src[..., 2] < 90)
yellow = np.median(src[mask_y], axis=0)
mask_w = (src.min(2) > 225)
white = np.array([255.0, 255.0, 255.0])
print("jaune mesuré", yellow.round(), "couleur hex #%02X%02X%02X" % tuple(int(v) for v in yellow))
rows_y = np.where(mask_y.any(1))[0]; rows_w = np.where(mask_w.any(1))[0]
ey0, ey1 = rows_y.min() - 6, rows_y.max() + 6
wy0, wy1 = rows_w.min() - 6, rows_w.max() + 6
emb = cutout(ey0, ey1, yellow, "mccg-emblem.png")
word = cutout(wy0, wy1, white, "mccg-wordmark.png")
# logo complet (emblème + mot-symbole), même mise en page que l'original
full = Image.new("RGBA", (max(emb.width, word.width), emb.height + (wy0 - ey1) + 12 + word.height), (0, 0, 0, 0))
full.alpha_composite(emb, ((full.width - emb.width) // 2, 0))
full.alpha_composite(word, ((full.width - word.width) // 2, full.height - word.height))
full.save(PUB / "brand/mccg-logo-full.png")
print("full", full.size)

# ---------- photos
def cover(im, w, h):
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l = (im.width - w) // 2; t = (im.height - h) // 2
    return im.crop((l, t, l + w, t + h))

for p in sorted((ROOT / "source/images-9x16").glob("*.png")):
    im = Image.open(p).convert("RGB")
    # garde de la marge pour les mouvements de caméra : 1296x2304 (zoom 1.2 possible sans perte)
    cover(im, 1296, 2304).save(PUB / "images" / f"v-{p.stem}.jpg", quality=92)
for p in sorted((ROOT / "source/images-16x9").glob("*.png")):
    Image.open(p).convert("RGB").save(PUB / "images" / f"h-{p.stem}.jpg", quality=92)
print("images ok")
