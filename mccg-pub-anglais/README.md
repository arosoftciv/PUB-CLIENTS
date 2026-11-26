# MCCG Sarl — Publicité motion design « Parlez anglais »

Vidéo publicitaire verticale pour MCCG Sarl (formations en anglais à Abidjan, en ligne, immersion à Accra).
Objectif : générer des demandes d'inscription sur WhatsApp. Projet Remotion + React + TypeScript.

## Livrables (`output/`)

| Fichier | Description |
|---|---|
| `mccg-pub-1080x1920.mp4` | Vidéo finale : 1080×1920, 30 i/s, H.264 + AAC, ≈ 72,1 s, -14 LUFS |
| `mccg-couverture-1080x1920.png` | Couverture verticale indépendante |
| `mccg-voix-off.wav` | Voix off seule, prononciation d'« Abidjan » corrigée (67,2 s) |
| `qc/` | Captures de contrôle (non versionnées) |

## Sources

- **Logo** : le vrai logo fourni (`source/logo-mccg-original.jpg`), détouré sans redessin par `scripts/prepare-assets.py`
  → `public/brand/` (emblème, mot-symbole, logo complet, fonds transparents).
  Couleurs mesurées sur le logo : bleu **#021F6F**, jaune **#F9C50C** (accent lumineux #FFD000).
- **Voix off** : ElevenLabs, voix « Tony – Punchy Ad & Social Voice » (voix francophone, accent africain), modèle
  eleven_multilingual_v2. Le numéro est dicté en toutes lettres (« zéro cinq, zéro trois, trente-deux, trente et un, trente et un »)
  pour une prononciation correcte. **Correctif « Abidjan »** : la phrase « Apprenez en présentiel à Abidjan… au Ghana. » a été régénérée
  avec la graphie phonétique « Abidjean » ([a.bid.ʒɑ̃], sans e muet final), recalée au même niveau (-7 dB) et insérée par
  `scripts/splice-voiceover.py`. La prise d'origine (`voix-off-tony.mp3`, `words-v1.json`) et une variante (`abidjan/take-abid-jan.mp3`) sont conservées.
  Horodatage mot à mot : ElevenLabs Scribe → `source/voiceover-raw/words.json`.
- **Musique** : ElevenLabs Music (instrumentale générée pour le projet, aucune voix détectée à la transcription).
- **Effets sonores** : synthétisés par `scripts/build-audio.py`, sans aucune source tierce.
- **Photos** : images photoréalistes générées par IA (ElevenLabs / Nano Banana 2), `source/images-9x16` (plein cadre)
  et `source/images-16x9` (cartes, incrustations). Personnages fictifs : aucune personne réelle n'est représentée.
- **Carte** : Natural Earth 50m (domaine public) via world-atlas, positions réelles d'Abidjan (5,36 N, 4,01 O) et d'Accra (5,60 N, 0,19 O).
- **Polices** : Montserrat, DM Serif Display, Inter (licence OFL, via @fontsource).

## Chaîne de production

```bash
npm install
pip install numpy scipy pillow      # + ffmpeg / ffprobe
python3 scripts/prepare-assets.py   # logo détouré, photos → public/
node scripts/build-map.mjs          # tracés de la carte → src/data/map.json
python3 scripts/splice-voiceover.py # correctif de prononciation « Abidjan » → voix-off.wav + words.json
python3 scripts/build-timeline.py   # scènes + repères depuis words.json → src/data/timeline.json
python3 scripts/build-audio.py      # SFX + ducking + mix -14 LUFS → public/audio/mix.wav
npm run dev                         # Remotion Studio
node scripts/qc-stills.mjs          # captures de contrôle → output/qc/
npx remotion render MCCGPub output/_brut.mp4 --codec=h264 --crf=18 --audio-codec=aac --audio-bitrate=256k --concurrency=4
# conversion yuvj420p (pleine plage) → yuv420p BT.709 plage TV + faststart (compatibilité TikTok / Instagram / WhatsApp)
ffmpeg -i output/_brut.mp4 -vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.1 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -c:a copy -movflags +faststart output/mccg-pub-1080x1920.mp4
python3 scripts/validate-render.py  # contrôle format / loudness / crête
npx remotion still Couverture output/mccg-couverture-1080x1920.png
```

**Synchronisation** : toutes les animations sont calées sur les horodatages réels des mots de la voix off
(`src/data/timeline.json`, champ `cues`). Pour changer de voix : générer la nouvelle piste, la transcrire avec horodatage mot à mot,
remplacer `source/voiceover-raw/voix-off.wav` et `words.json` (sans relancer `splice-voiceover.py`), puis relancer `build-timeline.py` et `build-audio.py`.
Scènes, animations, effets sonores et ducking se recalent automatiquement.

**Navigateur** : `remotion.config.ts` pointe vers le Chromium pré-installé de l'environnement de production.
Sur une autre machine, supprimez cette ligne ou définissez la variable `REMOTION_BROWSER`.

## Découpage (temps réels)

| # | Scène | Début | Contenu |
|---|---|---|---|
| 1 | Hook | 0,0 s | Entretien, hésitation, questions en anglais qui se brouillent, « L'ANGLAIS VOUS BLOQUE ENCORE ? » |
| 2 | Opportunités | 6,1 s | 4 cartes (Emploi, Promotion, Études, Voyages) calées sur chaque mot |
| 3 | Révélation | 11,8 s | « Et si l'anglais devenait votre force ? », éclat doré, révélation du logo officiel |
| 4 | Apprentissage | 18,7 s | Salle de formation, COMPRENDRE / S'EXPRIMER / PRENDRE CONFIANCE |
| 4b | Niveaux | 23,7 s | BEGINNER → INTERMEDIATE → ADVANCED, profils, objectifs |
| 5 | Flexibilité | 31,4 s | Présentiel à Abidjan, ordinateur + smartphone animés |
| 6 | Immersion | 34,2 s | Carte de l'Afrique de l'Ouest, trajet Abidjan → Accra, Accra, échanges en anglais |
| 7 | Tests | 40,0 s | TOEFL, IELTS, TOEIC, Duolingo English Test : progression et validation |
| 8 | Services | 47,8 s | Traduction (page FR → EN), interprétation (ondes audio) |
| 9 | Transformation | 52,5 s | Le même personnage, confiant : « PARLEZ ANGLAIS. OUVREZ-VOUS AU MONDE. » |
| 10 | Appel à l'action | 56,4 s | Logo, INSCRIVEZ-VOUS, WhatsApp (pulsation), appels, adresse : 16 s à l'écran |

## Points à valider par le client

- Les tests sont présentés comme une **préparation** (« MCCG vous accompagne dans votre préparation »). Aucune mention de centre d'examen agréé,
  et aucun logo officiel des tests n'est utilisé (marques déposées).
- La durée est de **72,1 s** au lieu des 60 s visées : la voix off fait 67,2 s au débit naturel, et l'écran final est tenu 4,6 s après la dernière phrase pour laisser lire les coordonnées.
  Pour revenir à 60 s, il faut raccourcir le texte.
- Les visuels sont générés par IA. Remplacer les photos par des photos réelles du centre, si elles existent, renforcerait la crédibilité.
- Le pictogramme WhatsApp est une bulle de messagerie générique aux couleurs MCCG, pas le logo officiel WhatsApp.

## Contrôle qualité effectué

- Rendu : 1080×1920, 30 i/s, H.264 High yuv420p BT.709, AAC 48 kHz, 72,15 s. Loudness -14,2 LUFS, crête vraie -0,5 dBFS.
- Synchronisation : chaque apparition est déclenchée par l'horodatage du mot prononcé (Scribe). Exemples : cartes Emploi, Promotion, Études et Voyages
  sur « entretien », « promotion », « études » et « voyage » ; logo sur « Avec MCCG » ; tests sur chaque nom ; numéro WhatsApp tapé au rythme de la dictée.
- Coordonnées vérifiées : WhatsApp +225 05 03 32 31 31, appels +225 01 02 91 46 49, Abidjan, Cocody-Palmeraie, Rue Ministre (conformes à l'affiche fournie).
- Logo : pixels d'origine du fichier fourni, sans rectangle de fond. Miniature en haut à droite, masquée pendant la révélation et l'écran final, où le logo s'affiche en grand.
- Zones de sécurité : textes essentiels entre 220 et 1 500 px de hauteur, marges latérales ≥ 70 px.
- Musique : environ 9 dB sous la voix pendant la narration (ducking + creux de médiums), jamais au-dessus de la voix.
- Aucune promesse non vérifiée : pas de mention de centre agréé, pas de taux de réussite, pas de prix.
