# Rapport de contrôle qualité — « Lycée Mamie Adjoua : les mystères du portail fermé »

Date : 24 novembre 2026 · Version : v3, **avec voix-off** (ElevenLabs, voix « Brian »)

## 1. Synthèse

| Point | Résultat |
|---|---|
| Durée | 8 min 18 s, calée sur la voix-off réelle · teaser 56 s · hook 19 s |
| Format | 1080 × 1920, 30 i/s, H.264 + AAC 48 kHz. Version 4K 2160 × 3840 rendue nativement (`--scale=2`) |
| Loudness | -14,4 LUFS intégré. Crête vraie -0,9 dBTP après encodage AAC (-1,0 dBTP sur le master WAV) |
| Captures de contrôle | 102 images (3 à 13 par scène) dans `output/qc/`, toutes vérifiées visuellement |

**Écart par rapport au brief :** la durée cible de 5 à 6 minutes ne peut pas être tenue avec le script fourni. Le hook dure 19 s avec la voix de Brian, dans la cible de 15 à 20 s
(1 044 mots). Le brief interdit d'accélérer la narration ; il faut donc raccourcir le texte (voir § 6).

## 2. Fidélité et déontologie

- [x] L'investigation est attribuée à L'Éléphant Déchaîné : couverture, scène 04, référence de page sur chaque
  révélation, générique, teaser.
- [x] Aucune mention ne présente le producteur de la vidéo comme auteur de l'enquête (« Adaptation audiovisuelle et synthèse documentaire »).
- [x] Faits, témoignages et soupçons sont distingués à l'écran : « selon les témoignages recueillis », « allégué »,
  « reformulation », « selon le journal ». Le jaune ambre est réservé aux éléments non confirmés.
- [x] Aucune fraude n'est présentée comme avérée. La scène 08 ne montre aucun détournement ; la scène 14 affiche
  « Aucun lien de causalité établi · Aucune fraude démontrée ».
- [x] La chronologie n'utilise aucune flèche de causalité et porte la mention « aucun lien de causalité n'est établi ».
- [x] Élève mineure : silhouette anonyme, mention « identité protégée », aucun nom. L'image n° 2 (visage) est
  exclue du montage et du dépôt Git. Les captures 04 et 05 sont recadrées pour l'exclure.
- [x] Aucun faux document. Les extraits d'articles sont remplacés par des cartes de synthèse sourcées (« Synthèse —
  extrait original : p. 7 »), visuellement distinctes d'un fac-similé.
- [x] Chaque schéma ou reconstitution porte la mention « Illustration - Reconstitution visuelle ».
- [ ] **Non vérifiable : fidélité au PDF.** Le PDF n'a pas été fourni. Dates, chiffres et pages sont repris du
  prompt client. Points à confirmer sur le PDF :
  - la moyenne « 14,66/20 », alors que (16 + 14 + 14) / 3 = 14,67 : la valeur du journal a été conservée ;
  - la répartition des pages par révélation ;
  - le trajet vers « Kpoussoussou, ≈ 13 km » (cité dans le brief, pas dans la narration) ;
  - les dates du 2 novembre (publication du lycée) et du 3 novembre (mobilisation des bus) ;
  - l'heure « 07:42 » de la scène 11, illustrative et signalée comme telle.
- [ ] **À confirmer par le client : identité des personnes sur les captures.** L'image 04 est présentée comme le
  directeur régional (scènes 06 et 07). La capture de la proviseure (image 05) est préparée mais pas affichée.
  Pour retirer toutes les captures de personnes : `USE_PEOPLE_CAPTURES = false` dans `src/data/assets.ts`.

Les jours de la semaine ont été vérifiés au calendrier : jeudi 22/10, lundi 16/11, vendredi 20/11 et lundi 23/11/2026 sont exacts.

## 2 quater. Vidéo de l'élève (décision éditoriale du client)

- À la demande du client, au motif que la vidéo circule déjà largement en ligne, la vidéo publiée par l'élève est
  montrée en scène S03, **sans aucun son** : la piste audio est supprimée dès l'import, et l'image porte le badge « SON COUPÉ ».
  Elle apparaît plein cadre sur « Tout est parti d'une vidéo… », puis se range à gauche.
  Légende : « Vidéo publiée par l'élève · 16/11/2026 · son coupé ».
- Cette décision s'écarte de la consigne initiale de protection de l'identité de la mineure.
  Un floutage reste disponible : `STUDENT_VIDEO_BLUR = true` dans `src/data/assets.ts`.
- Fichier fourni : republication TikTok de « Zooma Média » (576 × 1024, 3 min 26 s), qui porte leur filigrane et le bandeau « La vidéo intégrale ».
  Extrait utilisé : de 4 à 34 s, sans piste audio (vérifié avec ffprobe). Le crédit « relayée par Zooma Média » figure à l'écran et au générique.
  Le fichier source n'est pas versionné dans Git.

## 2 ter. Nouvelle accroche (révision client)

- Le hook S01 (19,4 s, estimé) suit exactement le texte fourni, en 3 séquences synchronisées sur la voix-off :
  1. Photo du portail, mouvement de caméra lent, notifications, bulles et icônes génériques (sans texte ni chiffre
     inventés, étiquetées « Reconstitution »). Textes : LYCÉE MAMIE ADJOUA / YAMOUSSOUKRO / UNE AFFAIRE QUI DÉFRAYE LA CHRONIQUE.
  2. Sur « Le journal L'Éléphant Déchaîné… » : visuel du journal avec zoom progressif, cartes photo qui défilent,
     bruits de papier. Texte : L'ÉLÉPHANT DÉCHAÎNÉ / INVESTIGATION · 23 NOVEMBRE 2026.
  3. Sur « Reste connecté… » : montage rapide 07:30 → portail → bus → 27 000 FCFA ?, sous le titre CE QUE RÉVÈLE L'INVESTIGATION.
- Le carton d'ouverture S02 (3,6 s) remplace l'ancien contexte avec carte. Le logo AroSoft n'est pas affiché :
  il est toujours absent du projet.
- S03 commence par « Tout est parti d'une vidéo… par une élève de Terminale D, âgée de seize ans. »
- Redondances supprimées : l'ancienne scène de contexte (carte et présentation du lycée) et la deuxième présentation du journal en S04.
  S04 se termine désormais sur « 7 RÉVÉLATIONS ».
- **Ressources du PDF toujours absentes** (une réelle, pages, photos des bus et de la cérémonie). Elles sont remplacées par :
  le visuel n° 1 fourni, les photos du portail et un schéma de bus étiqueté. Les emplacements `busPhoto` et
  `newspaperFrontPage` les intégreront automatiquement.
- Sous-titres : dates, heures et noms propres ne sont plus coupés entre deux cartons.

## 2 bis. Appel à l'abonnement (ajout client)

- Scène S17, placée entre la signature et les sources. Voix-off et texte : « Vous avez aimé ? Abonnez-vous et activez la cloche de notification pour rester informés de l'actualité. » (« informer » corrigé en « informés »).
- Animation : bouton « ABONNEZ-VOUS » → « ABONNÉ ✓ », cloche générique qui sonne (aucun logo de plateforme).
- Teaser : même phrase ajoutée à l'écran de fin.

## 3. Qualité visuelle (constat sur les captures)

- Aucun débordement ni chevauchement après corrections. Les corrections apportées pendant le contrôle :
  - espaces insécables en typographie française (« 27 000 », « ? », « : »), pour éviter un « ? » orphelin
    ou « 27 / 000 » coupé sur deux lignes ;
  - chronologie : chevauchement du titre et du premier jalon supprimé, défilement retiré ;
  - horloge de la scène 01 : lueur parasite avant la bascule 07:29 → 07:30 supprimée ;
  - scène 01 : le portail ne recouvre plus le titre ;
  - libellés et cadres d'horloge qui apparaissaient avant leur valeur (scènes 05, 09, 11).
- Zones de sécurité : contenu entre x = 72 et 940 px et au-dessus de y ≈ 1290. Sous-titres placés à 420 px du bas
  (2 lignes maximum, 40 caractères par ligne au plus, découpage sur la ponctuation).
- Sous-titres masqués quand le même texte est déjà affiché : questions de la scène 13, signature de la scène 15.
  Ils restent présents dans les fichiers SRT et VTT.
- Images fournies en basse résolution (335 à 495 px de large) : agrandissement Lanczos ×3 avec accentuation.
  Elles sont acceptables en Full HD, mais visiblement douces en 4K. Il faut les remplacer par les originaux en haute définition.

## 4. Audio

- Musique et effets sonores 100 % originaux (synthèse numérique) : drone en ré mineur, pulsation à 72 bpm, montée
  dans la scène 13 ; tic-tac, fermeture et réouverture du portail, papier, signaux numériques, impacts.
- Ducking automatique (environ -10 dB) sur les plages de narration, déjà calé pour la future voix-off.
- **Voix-off** : générée avec ElevenLabs sur autorisation du client, voix **« Brian - Deep, Resonant and Comforting »**
  (premade, choix du client), modèle eleven_multilingual_v2, une piste par scène, environ 7 300 crédits.
  Une première version avec la voix « Martinez » (environ 7 300 crédits) a été remplacée à la demande du client.
  Elle reste archivée dans `source/voiceover-raw/martinez/`.
- « CFA » est prononcé « céfa » : les 2 phrases concernées (S06 tarif, S08 paiements) ont été régénérées seules (environ 230 crédits) puis insérées (`source/voiceover-raw/overrides/`).
- « Abidjan » est prononcé « a-bid-jan », sans e final : la phrase de S06 Marcory a été régénérée en 2 variantes phonétiques (A « Abid-jean », B « Abidjâ »). La A est intégrée, la B est disponible dans `source/voiceover-raw/variants/`.
- Brian est une voix d'origine anglophone. Son français peut garder une légère couleur d'accent : à valider à l'écoute.
  Le calage se fait phrase par phrase (`scripts/align-voiceover.py`) : détection des pauses, puis découpage et
  réassemblage avec les pauses du script. Diction ni accélérée ni modifiée. Animations, sous-titres et ducking
  suivent les timestamps réels.
- Mixage (révisé à la demande du client) : musique environ 23 dB sous la voix pendant la narration (13 dB auparavant), passe-haut à 100 Hz sur la musique sous la voix, bruitages atténués d'environ 8 dB sous la voix. Total -14 LUFS, passages musicaux seuls vers -18,5 LUFS.

## 5. Ressources manquantes (solutions temporaires signalées)

| Ressource | Solution temporaire |
|---|---|
| PDF (8 pages) | Narration du prompt, cartes de synthèse |
| Photos des bus SOTRA (p. 2, 5, 6) | Schéma de bus étiqueté « Reconstitution » |
| Cérémonie / annonce (p. 4) | Carte de constat typographique |
| Collège Boulevard du Gabon (p. 7) | Carte typographique |
| Véritable une du journal | Visuel n° 1 fourni |
| Logo AroSoft | Absent (emplacements prêts) |
| Voix-off | Timing estimé, `voiceover.txt` et `voiceover-tts.txt` prêts |

## 6. Recommandations avant publication

1. Fournir le PDF : relecture des chiffres et des dates, intégration des photos du journal.
2. Enregistrer ou générer la voix-off (une piste par scène), puis relancer `prepare-audio.py` et les rendus.
3. Pour viser 5 à 6 minutes : retirer environ 300 mots. Pistes de coupe : les phrases de transition des scènes 04
   et 09, la liste trimestre par trimestre (garder la moyenne), et la redite de la scène 14.
4. Plateformes : la version complète convient à TikTok (≤ 10 min), Facebook et WhatsApp (en fichier).
   Pour YouTube Shorts (≤ 3 min), publier le teaser de 60 s.
