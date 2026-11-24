# Rapport de contrôle qualité — « Lycée Mamie Adjoua : les mystères du portail fermé »

Date : 24 novembre 2026 · Version : maquette finale v1, **sans voix-off**

## 1. Synthèse

| Point | Résultat |
|---|---|
| Durée | 9 min 04 s (timing **estimé** : 1 060 mots à 147 mots/min, plus les pauses, la chronologie et le générique) |
| Format | 1080 × 1920, 30 i/s, H.264 + AAC 48 kHz. Version 4K 2160 × 3840 rendue nativement (`--scale=2`) |
| Loudness | -14,4 LUFS intégré. Crête vraie -0,9 dBTP après encodage AAC (-1,0 dBTP sur le master WAV) |
| Captures de contrôle | 102 images (3 à 13 par scène) dans `output/qc/`, toutes vérifiées visuellement |

**Écart par rapport au brief :** la durée cible de 5 à 6 minutes ne peut pas être tenue avec le script fourni
(1 060 mots). Le brief interdit d'accélérer la narration ; il faut donc raccourcir le texte (voir § 6).

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
- **Voix-off absente.** Aucun crédit d'API payante n'a été consommé, faute d'autorisation. La vidéo actuelle
  est une maquette musicale sous-titrée.

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
