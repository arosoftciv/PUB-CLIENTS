#!/usr/bin/env python3
"""Timeline pilotée par la voix off.
Lit les horodatages mot à mot (source/voiceover-raw/words.json, transcription ElevenLabs Scribe)
et produit src/data/timeline.json : bornes des scènes + repères d'animation (secondes, déjà décalées de VO_OFFSET).
Si la voix off est régénérée : retranscrire, remplacer words.json, relancer ce script puis build-audio.py.
"""
import json, re, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORDS = [w for w in json.loads((ROOT / "source/voiceover-raw/words.json").read_text())["words"] if w["type"] == "word"]
VO_OFFSET = 0.35
TAIL = 4.6          # temps de lecture des coordonnées après la dernière phrase
LEAD = 0.12         # les visuels anticipent légèrement la voix

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return re.sub(r"[^a-z0-9']", "", "".join(c for c in s if unicodedata.category(c) != "Mn"))

def at(text, after=0.0, end=False):
    t = norm(text)
    for w in WORDS:
        if w["start"] >= after - 1e-6 and norm(w["text"]).startswith(t):
            return round((w["end"] if end else w["start"]) + VO_OFFSET, 3)
    raise SystemExit(f"mot introuvable : {text} après {after}")

def raw_at(text, after=0.0):
    """Temps brut (sans décalage) d'un mot, pour ancrer une recherche sur un autre mot plutôt que sur une valeur fixe."""
    return at(text, after) - VO_OFFSET

vo_end = WORDS[-1]["end"] + VO_OFFSET
total = round(vo_end + TAIL, 2)
raw = lambda x: x - VO_OFFSET  # pour chercher « après » en temps brut

cues = {
    # S1 hook
    "hook_q": at("combien"), "hook_anglais": at("anglais"), "hook_end": at("anglais", end=True),
    # S2 opportunités
    "opp_emploi": at("entretien"), "opp_promo": at("promotion"), "opp_etudes": at("etudes"), "opp_voyage": at("voyage"),
    # S3 révélation
    "force_q": at("et", raw_at("voyage")), "force_word": at("force"), "reveal_mccg": at("avec", raw_at("force")), "reveal_sarl": at("sarl"),
    # S4a apprentissage
    "learn_apprenez": at("apprenez"), "learn_confiance": at("confiance"), "learn_oral": at("l'oral"), "learn_niveau": at("niveau"),
    # S4b niveaux / profils
    "lvl_debutant": at("debutant"), "lvl_avance": at("avance"), "prof_etudiant": at("etudiant"),
    "prof_pro": at("professionnel"), "prof_entrepreneur": at("entrepreneur"), "prof_formations": at("formations"), "prof_objectifs": at("objectifs"),
    # S5 flexibilité
    "flex_presentiel": at("presentiel"), "flex_abidjan": at("abidjan"), "flex_ligne": at("ligne"),
    # S6 immersion
    "imm_vivez": at("vivez"), "imm_immersion": at("d'immersion"), "imm_accra": at("accra"), "imm_ghana": at("ghana"),
    # S7 tests
    "test_toefl": at("toefl"), "test_ielts": at("l'ielts"), "test_toeic": at("toeic"), "test_duolingo": at("duolingo"),
    "test_accompagne": at("accompagne"), "test_preparation": at("preparation"),
    # S8 services
    "srv_traduction": at("traduction"), "srv_documents": at("documents"), "srv_interpretation": at("d'interpretation"),
    # S9 transformation
    "tr_attendez": at("n'attendez"), "tr_preparez": at("preparez-vous"), "tr_saisir": at("saisir"),
    # S10 CTA
    "cta_contactez": at("contactez"), "cta_whatsapp": at("whatsapp"), "cta_numero": at("zero", raw_at("whatsapp")), "cta_numero_fin": at("un", raw_at("trente", raw_at("trente", raw_at("trente", raw_at("whatsapp")) + 0.1) + 0.1), end=True),
    "cta_mccg": at("mccg", raw_at("contactez") + 1.0), "cta_parlez": at("parlez", raw_at("contactez")), "cta_ouvrez": at("ouvrez-vous"),
    "vo_end": round(vo_end, 3),
}

b = [0.0,
     cues["opp_emploi"] - LEAD,          # S2
     cues["force_q"] - LEAD,             # S3
     cues["learn_apprenez"] - LEAD,      # S4a
     cues["lvl_debutant"] - LEAD,        # S4b
     at("apprenez", raw_at("objectifs")) - LEAD,          # S5
     at("ou", raw_at("ligne")) - LEAD,              # S6
     at("le", raw_at("preparez")) - LEAD,              # S7 (J-cut : « Vous préparez » commence sur Accra)
     at("profitez") - LEAD,              # S8
     cues["tr_attendez"] - LEAD,         # S9
     cues["cta_contactez"] - LEAD,       # S10
     total]
ids = ["hook", "opportunites", "revelation", "apprentissage", "niveaux", "flexibilite", "immersion", "tests", "services", "transformation", "cta"]
scenes = [{"id": i, "start": round(b[k], 3), "end": round(b[k + 1], 3)} for k, i in enumerate(ids)]
out = {"fps": 30, "voOffset": VO_OFFSET, "total": total, "scenes": scenes, "cues": cues}
(ROOT / "src/data/timeline.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
for s in scenes:
    print(f'{s["id"]:15s} {s["start"]:6.2f} → {s["end"]:6.2f}  ({s["end"]-s["start"]:.2f}s)')
print("total", total)
