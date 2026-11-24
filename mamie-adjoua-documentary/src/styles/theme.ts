// Identité visuelle centralisée : couleurs, polices, zones de sécurité, animation.
import { loadFont } from "@remotion/fonts";
import { staticFile, Easing } from "remotion";

export const C = {
  black: "#0B0D10",
  white: "#F5F5F0",
  red: "#B92D32",
  anthracite: "#242830",
  grey: "#81909A",
  amber: "#E8B44F",
  // dérivés
  panel: "rgba(36,40,48,0.82)",
  line: "rgba(245,245,240,0.16)",
  dim: "rgba(245,245,240,0.62)",
} as const;

export const F = {
  title: "'Barlow Condensed', 'Oswald', sans-serif",
  text: "'Inter', 'Manrope', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

const fonts: [string, string, string, string?][] = [
  ["Barlow Condensed", "barlow-condensed-latin-500-normal.woff2", "500"],
  ["Barlow Condensed", "barlow-condensed-latin-600-normal.woff2", "600"],
  ["Barlow Condensed", "barlow-condensed-latin-700-normal.woff2", "700"],
  ["Barlow Condensed", "barlow-condensed-latin-800-normal.woff2", "800"],
  ["Inter", "inter-latin-400-normal.woff2", "400"],
  ["Inter", "inter-latin-400-italic.woff2", "400", "italic"],
  ["Inter", "inter-latin-500-normal.woff2", "500"],
  ["Inter", "inter-latin-600-normal.woff2", "600"],
  ["Inter", "inter-latin-700-normal.woff2", "700"],
  ["IBM Plex Mono", "ibm-plex-mono-latin-400-normal.woff2", "400"],
  ["IBM Plex Mono", "ibm-plex-mono-latin-500-normal.woff2", "500"],
  ["IBM Plex Mono", "ibm-plex-mono-latin-600-normal.woff2", "600"],
];
for (const [family, file, weight, style] of fonts) {
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, style: style ?? "normal" });
}

/** Canevas 1080×1920 — zones compatibles TikTok / Reels / Shorts. */
export const SAFE = {
  W: 1080,
  H: 1920,
  left: 72,
  right: 140, // icônes d'interaction à droite
  top: 170,
  contentBottom: 1270, // fin de la zone de contenu principal
  subtitleBottom: 420, // distance du bas de l'écran au bas des sous-titres
};
export const CONTENT_W = SAFE.W - SAFE.left - SAFE.right; // 868

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
