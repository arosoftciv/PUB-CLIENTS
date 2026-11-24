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
import numpy as np

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

    # Photos fournies (2e envoi) : proviseure et élève — décision éditoriale du client de les montrer
    duo = Image.open(SRC / "06-proviseure-et-eleve.jpg")
    w, h = duo.size
    save(upscale(duo.crop((0, 0, w // 2 - 2, h)), 3), "people/proviseure-evenement.jpg")
    save(upscale(duo.crop((w // 2 + 2, 0, w, h)), 3), "people/eleve-portrait-2.jpg")
    save(upscale(Image.open(SRC / "07-eleve-portrait.jpg"), 1.5), "people/eleve-portrait.jpg")
    nci = Image.open(SRC / "08-proviseure-nci.jpg")
    save(upscale(nci.crop((0, 0, nci.size[0], int(nci.size[1] * 0.74))), 2.5), "people/proviseure-nci.jpg")  # bandeau TV retiré, crédit NCI ajouté à l'écran

    # Une de L'Éléphant Déchaîné (capture d'une publication TikTok, carrousel 1/8) : une + photos du journal
    une = Image.open(SRC / "social" / "04-61ffc569.jpg")
    save(upscale(une.crop((30, 250, 1050, 1170)), 1.6), "newspaper/une-elephant.jpg")
    save(upscale(une.crop((41, 990, 497, 1612)), 2.4), "buses/bus-sotra-journal.jpg")
    save(upscale(une.crop((506, 842, 929, 1612)), 2.4), "school/portail-journal.jpg")

    # Mur d'écrans (réseaux sociaux) en arrière-plan — exclus : contenus générés par IA (01, 08 et le visuel bus de 07),
    # appel téléphonique privé (07), collage sans rapport (11). Barre d'état du téléphone retirée.
    social_dir = OUT / "social"
    social_dir.mkdir(parents=True, exist_ok=True)
    keep = []
    for p in sorted((SRC / "social").glob("*.jpg")):
        idx = int(p.name[:2])
        if idx in (1, 7, 8, 11):
            continue
        im = Image.open(p).convert("RGB")
        im = im.crop((0, 150, im.width, im.height))
        im = im.resize((300, int(300 * im.height / im.width)), Image.LANCZOS)
        im = ImageEnhance.Color(im).enhance(0.55)
        dst = social_dir / f"ecran-{idx:02d}.jpg"
        im.save(dst, quality=80)
        keep.append(f"images/social/{dst.name}")
    social_keep = keep
    print("→ mur d'écrans :", len(keep), "captures")

    # Vidéo publiée par l'élève (optionnelle) : source/video-eleve.(mp4|mov|webm)
    # → réencodée en H.264, PISTE AUDIO SUPPRIMÉE (aucune voix), durée enregistrée pour Remotion.
    import json, subprocess
    media = {"studentVideo": None, "socialScreens": social_keep}
    vid = next((p for ext in ("mp4", "mov", "webm", "m4v") for p in (ROOT / "source").glob(f"video-eleve*.{ext}")), None)
    if vid:
        dst = ROOT / "public" / "video" / "video-eleve.mp4"
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists() and dst.stat().st_mtime > vid.stat().st_mtime:
            print("= vidéo élève déjà à jour (pas de réencodage)")
        else:
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
    # Logo AroSoft (optionnel) : source/arosoft-logo.(png|jpg|jpeg|webp|svg)
    # → PNG à fond transparent (le blanc uni est rendu transparent si l'image n'a pas d'alpha), recadré au contenu.
    media["arosoftLogo"] = None
    logo = next((p for ext in ("png", "webp", "jpg", "jpeg") for p in (ROOT / "source").glob(f"arosoft-logo*.{ext}")), None)
    if logo:
        im = Image.open(logo).convert("RGBA")
        px = np.asarray(im).astype(np.float32)
        if px[..., 3].min() > 250:  # pas de transparence : retirer le fond blanc
            whiteness = px[..., :3].min(axis=2)
            alpha = np.clip((255 - whiteness) / (255 - 225) * 255, 0, 255)
            px[..., 3] = np.minimum(px[..., 3], alpha)
        im = Image.fromarray(px.astype(np.uint8), "RGBA")
        bbox = im.getbbox()
        if bbox:
            im = im.crop(bbox)
        im.thumbnail((800, 800), Image.LANCZOS)
        dst = ROOT / "public" / "branding" / "arosoft.png"
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst)
        media["arosoftLogo"] = "branding/arosoft.png"
        print("→ logo AroSoft (fond transparent)", im.size)
    else:
        print("! Logo AroSoft absent : déposer source/arosoft-logo.png puis relancer ce script.")
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
