// Identité MCCG : couleurs mesurées sur le logo original fourni (fond #021F6F, jaune #F9C50C).
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  navy: "#021F6F", // bleu du logo
  navyDeep: "#01124A",
  navyInk: "#000B33",
  navyLight: "#0B3496",
  gold: "#F9C50C", // jaune du logo
  goldBright: "#FFD000",
  goldSoft: "rgba(249,197,12,0.18)",
  white: "#FFFFFF",
  dim: "rgba(255,255,255,0.72)",
  glass: "rgba(2,31,111,0.62)",
  line: "rgba(255,255,255,0.18)",
} as const;

export const F = {
  head: "'Montserrat', sans-serif",
  serif: "'DM Serif Display', serif",
  body: "'Inter', sans-serif",
} as const;

const fonts: [string, string, string, string?][] = [
  ["Montserrat", "montserrat-latin-500-normal.woff2", "500"],
  ["Montserrat", "montserrat-latin-600-normal.woff2", "600"],
  ["Montserrat", "montserrat-latin-700-normal.woff2", "700"],
  ["Montserrat", "montserrat-latin-800-normal.woff2", "800"],
  ["Montserrat", "montserrat-latin-900-normal.woff2", "900"],
  ["DM Serif Display", "dm-serif-display-latin-400-normal.woff2", "400"],
  ["DM Serif Display", "dm-serif-display-latin-400-italic.woff2", "400", "italic"],
  ["Inter", "inter-latin-400-normal.woff2", "400"],
  ["Inter", "inter-latin-500-normal.woff2", "500"],
  ["Inter", "inter-latin-600-normal.woff2", "600"],
  ["Inter", "inter-latin-700-normal.woff2", "700"],
];
for (const [family, file, weight, style] of fonts) {
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, style: style ?? "normal" });
}

export const W = 1080;
export const H = 1920;
export const FPS = 30;
// Zones de sécurité TikTok / Reels : rien d'essentiel au-dessus de 220 px, sous 1500 px, ni à moins de 150 px du bord droit (sous 900 px).
export const SAFE = { top: 220, bottom: 1500, side: 80, rightUi: 150 } as const;
