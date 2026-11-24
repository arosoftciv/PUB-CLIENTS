#!/usr/bin/env python3
"""Prépare les ressources visuelles du documentaire.

Sources disponibles (source/uploads/) : 5 images fournies par le client.
Le PDF « ELEPHANT AFFAIRE MAMIE ADJOUA.pdf » n'a PAS été fourni : les photos
des bus SOTRA, de la cérémonie, du Collège Boulevard du Gabon et les extraits
d'articles (p. 2 à 8) ne peuvent pas être extraits. Si le PDF est déposé dans
source/, relancer ce script : il extrait automatiquement chaque page en PNG
(nécessite `pip install pymupdf`).

Règles appliquées :
- L'image 02 (publication réseaux sociaux montrant le visage de l'élève
  mineure) n'est JAMAIS utilisée.
- Les captures 04 et 05 sont recadrées pour exclure l'élève.
- Aucune image n'est modifiée dans son sens : recadrage + agrandissement
  Lanczos + légère accentuation uniquement.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source" / "uploads"
OUT = ROOT / "public" / "images"


def upscale(img: Image.Image, factor: float = 3.0) -> Image.Image:
    img = img.convert("RGB")
    w, h = img.size
    big = img.resize((int(w * factor), int(h * factor)), Image.LANCZOS)
    big = big.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    return big


def save(img: Image.Image, rel: str) -> None:
    p = OUT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    img.save(p, quality=92)
    print("→", p.relative_to(ROOT), img.size)


def main() -> None:
    cover = Image.open(SRC / "01-couverture-elephant.jpg")
    save(upscale(cover, 3), "newspaper/couverture-affaire.jpg")

    gate = Image.open(SRC / "03-portail-lycee.jpg")
    save(upscale(gate, 3), "school/portail-1.jpg")

    cap5 = Image.open(SRC / "05-capture-proviseure.jpg")
    save(upscale(cap5.crop((0, 0, 447, 295)), 3), "school/portail-2.jpg")
    # Proviseure (personnalité publique, intervention médiatique) — l'élève est exclue
    save(upscale(cap5.crop((0, 300, 222, 447)), 4), "people/proviseure-capture.jpg")

    cap4 = Image.open(SRC / "04-capture-directeur-regional.jpg")
    save(upscale(cap4.crop((0, 0, 335, 310)), 3), "people/directeur-regional-capture.jpg")

    # Vidéo publiée par l'élève (optionnelle) : source/video-eleve.(mp4|mov|webm)
    # → réencodée en H.264, PISTE AUDIO SUPPRIMÉE (aucune voix), durée enregistrée pour Remotion.
    import json, subprocess
    media = {"studentVideo": None}
    vid = next((p for ext in ("mp4", "mov", "webm", "m4v") for p in (ROOT / "source").glob(f"video-eleve*.{ext}")), None)
    if vid:
        dst = ROOT / "public" / "video" / "video-eleve.mp4"
        dst.parent.mkdir(parents=True, exist_ok=True)
        # extrait utilisé : de 4 s à 34 s de la vidéo source (passage où l'élève s'exprime face caméra)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "4", "-t", "30", "-i", str(vid), "-an", "-vf", "scale='min(1080,iw)':-2,fps=30",
                        "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", str(dst)], check=True)
        info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(dst)],
                                         capture_output=True, text=True, check=True).stdout)
        v = next(x for x in info["streams"] if x["codec_type"] == "video")
        media["studentVideo"] = {"src": "video/video-eleve.mp4", "duration": float(info["format"]["duration"]),
                                 "width": int(v["width"]), "height": int(v["height"])}
        print("→ vidéo élève (sans audio)", media["studentVideo"])
    else:
        print("! Vidéo de l'élève absente : déposer source/video-eleve.mp4 puis relancer ce script.")
    (ROOT / "src" / "data" / "media.json").write_text(json.dumps(media, indent=1))

    # PDF optionnel
    pdf = next((ROOT / "source").glob("*.pdf"), None)
    if pdf:
        try:
            import fitz  # type: ignore
        except ImportError:
            print("PDF trouvé mais pymupdf absent : pip install pymupdf")
            return
        doc = fitz.open(pdf)
        for i, page in enumerate(doc, start=1):
            pix = page.get_pixmap(dpi=200)
            target = OUT / "documents" / f"page-{i:02d}.png"
            pix.save(target)
            print("→ page", i, target)
    else:
        print("! PDF source absent : extraits d'articles et photos des bus non disponibles.")


if __name__ == "__main__":
    main()
