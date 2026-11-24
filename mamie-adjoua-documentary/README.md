# Lycée Mamie Adjoua — Les mystères du portail fermé

Motion design documentaire vertical (9:16) adapté de l'investigation de **L'Éléphant Déchaîné**
(édition spéciale du lundi 23 novembre 2026). Projet Remotion + React + TypeScript entièrement piloté par le code.

> L'investigation est celle de L'Éléphant Déchaîné. Cette vidéo en est une adaptation audiovisuelle et une synthèse :
> les faits n'ont pas été vérifiés de façon indépendante.

## État actuel (lire en premier)

| Élément | Statut |
|---|---|
| PDF source `ELEPHANT AFFAIRE MAMIE ADJOUA.pdf` | **Manquant.** La narration reprend mot pour mot le prompt client. |
| Voix-off | **Manquante.** Le timing est estimé (147 mots/min). La vidéo actuelle contient la musique et les effets sonores, sans voix. |
| Photos des bus, de la cérémonie, de Marcory, extraits d'articles | **Manquants.** Ils sont remplacés par des schémas et des cartes typographiques étiquetés. |
| Logo AroSoft | **Manquant.** La couverture et le générique n'affichent aucun logo. |
| Images fournies (5) | 4 sont utilisées. L'image n° 2 est exclue (visage de l'élève mineure). |

## Installation

```bash
npm install
pip install numpy scipy pillow     # scripts Python
# ffmpeg / ffprobe requis
```

Sur une autre machine que l'environnement d'origine, supprimez ou adaptez `Config.setBrowserExecutable`
dans `remotion.config.ts` et `scripts/qc-stills.mjs`, ou définissez la variable `REMOTION_BROWSER`.

## Chaîne de production

```bash
python3 scripts/extract-assets.py      # recadrages / agrandissements (+ pages du PDF s'il est présent)
node scripts/build-map.mjs             # tracés de la carte de Côte d'Ivoire
python3 scripts/prepare-audio.py       # timeline, SRT/VTT, voiceover.txt, storyboard.json, musique, SFX, mix -14 LUFS
npm run dev                            # Remotion Studio (aperçu)
node scripts/qc-stills.mjs             # captures de contrôle → output/qc/
```

### Rendus

```bash
npx remotion render Documentaire               output/mamie-adjoua-documentaire-1080p-soustitres.mp4 --crf=18
npx remotion render DocumentaireSansSousTitres output/mamie-adjoua-documentaire-1080p-sans-soustitres.mp4 --crf=18
npx remotion render Documentaire               output/mamie-adjoua-documentaire-4k-soustitres.mp4 --scale=2 --crf=20
npx remotion render Teaser                     output/mamie-adjoua-teaser-1080p.mp4 --crf=18
npx remotion still  Couverture output/couverture.png
npx remotion still  Couverture output/couverture.jpg --image-format=jpeg --jpeg-quality=95
python3 scripts/validate-render.py             # contrôle codecs / fps / loudness
```

## Voix-off actuelle

Voix « Martinez » (ElevenLabs, eleven_multilingual_v2), pistes brutes dans `source/voiceover-raw/sXX.mp3`.
`python3 scripts/align-voiceover.py` découpe chaque piste phrase par phrase et produit `public/audio/voiceover/sXX.wav` + `sXX.json`.
Ensuite, `prepare-audio.py` recale toute la timeline.

## Ajouter ou remplacer la voix-off (référentiel temporel)

1. Enregistrez ou générez une piste par scène à partir de `voiceover.txt` (narrateur humain) ou de
   `voiceover-tts.txt` (version phonétique pour un moteur TTS comme ElevenLabs).
2. Déposez les fichiers sous `public/audio/voiceover/s01.wav` … `s15.wav`.
3. Optionnel, pour un calage exact à la phrase : ajoutez à côté de chaque piste un fichier `sXX.json`
   au format `[{"id":"hook","start":0.0,"end":4.1}, …]`. Les `id` sont ceux de `src/data/narration.json`.
   Sans ce fichier, les phrases sont réparties proportionnellement sur la durée réelle de la piste.
4. Relancez `python3 scripts/prepare-audio.py`, puis les rendus. Scènes, animations, sous-titres, ducking
   et mixage se recalent automatiquement. La narration n'est jamais accélérée.

## Ajouter la vidéo de l'élève (son coupé)

Déposez le fichier sous `source/video-eleve.mp4` (ou .mov / .webm), puis lancez `python3 scripts/extract-assets.py`.
La vidéo est réencodée sans piste audio et apparaît en scène S03. Floutage optionnel : `STUDENT_VIDEO_BLUR` dans `src/data/assets.ts`.

## Ajouter les ressources du PDF

- Déposez le PDF dans `source/`, puis relancez `extract-assets.py` : les pages sont extraites en PNG
  (nécessite `pip install pymupdf`).
- Recadrez les photos et renseignez leur chemin dans `src/data/assets.ts`
  (`busPhoto`, `ceremonyPhoto`, `marcoryPhoto`…). Les scènes remplacent alors automatiquement les schémas.
- Logo AroSoft : `public/branding/arosoft.png` (fond transparent), puis `arosoftLogo` dans `assets.ts`.

## Architecture

```
src/
  styles/theme.ts          couleurs, polices, zones de sécurité, easings
  data/narration.json      script de narration (source unique du texte)
  data/timings.json        timeline générée (ne pas éditer)
  data/assets.ts           registre des visuels (+ ressources manquantes)
  components/base.tsx      Backdrop, FilmFinish, Photo (Ken Burns), SourceReference, ReconstitutionTag…
  components/editorial.tsx DocumentaryTitle, AnimatedCounter, AnimatedClock, EvidenceCard,
                           InvestigationChapter, SplitScreenComparison, QuestionCard, Timeline,
                           FinancialFlow, SubtitleOverlay
  components/illustrations.tsx GateGraphic, BusGraphic, Silhouette, Phone, MapCI, CalendarCard, NewspaperReveal
  scenes/                  Cover, intro (S01-04), revelations (S05-11), outro (S12-16)
  Documentary.tsx          assemblage + teaser
```

Zones de sécurité : contenu entre x = 72 et 940 px (icônes à droite), au-dessus de y ≈ 1290.
Sous-titres posés à 420 px du bas (au-dessus des légendes TikTok et Reels).
