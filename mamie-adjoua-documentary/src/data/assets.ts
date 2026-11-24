import media from "./media.json";

// Registre des ressources visuelles. `null` = ressource manquante (PDF source non fourni) :
// la scène affiche alors une animation typographique / un schéma neutre étiqueté.
// Dès que le PDF est fourni, déposer les extractions dans public/images/... et renseigner le chemin.
export const ASSETS = {
  coverPoster: "images/newspaper/couverture-affaire.jpg", // fourni par le client (vignette)
  gate1: "images/school/portail-1.jpg", // fourni (crédit visible : « Vivre À Yamoussoukro »)
  gate2: "images/school/portail-2.jpg", // fourni (capture recadrée, élève exclue)
  directorCapture: "images/people/directeur-regional-capture.jpg", // capture TV fournie — identité à confirmer par le client
  principalCapture: "images/people/proviseure-capture.jpg", // capture fournie — identité à confirmer par le client
  principalEvent: "images/people/proviseure-evenement.jpg", // photo fournie (prise de parole, micro)
  principalNCI: "images/people/proviseure-nci.jpg", // capture NCI fournie (bandeau « LQI »)
  studentPortrait: "images/people/eleve-portrait.jpg", // photo fournie — élève (décision éditoriale du client)
  studentPortrait2: "images/people/eleve-portrait-2.jpg", // photo fournie — élève

  // --- Manquants : photos du PDF ---
  busPhoto: null as string | null, // p. 2, 5, 6 : bus spéciaux SOTRA
  ceremonyPhoto: null as string | null, // p. 4 : annonce du partenariat
  marcoryPhoto: null as string | null, // p. 7 : Collège Boulevard du Gabon
  articleReglement: null as string | null, // p. 7 : extrait règlement intérieur
  articlePartenariat: null as string | null, // p. 4 : extrait annonce
  articleHierarchie: null as string | null, // p. 8 : extrait instructions hiérarchie
  newspaperFrontPage: null as string | null, // p. 1 : véritable une du journal
  arosoftLogo: ((media as { arosoftLogo?: string | null }).arosoftLogo ?? null) as string | null, // généré par extract-assets.py (fond transparent)
};

/** Vidéo de l'élève (son coupé) : flouter l'image si true. Décision éditoriale du client : affichée nette. */
export const STUDENT_VIDEO_BLUR = false;

/** Les captures de personnes publiques sont affichées uniquement si true. */
export const USE_PEOPLE_CAPTURES = true;
