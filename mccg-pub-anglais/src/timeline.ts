import tl from "./data/timeline.json";

export type SceneId = (typeof tl.scenes)[number]["id"];
export const TL = tl;
export const CUE = tl.cues;
export const FPS = tl.fps;
export const TOTAL_FRAMES = Math.round(tl.total * tl.fps);
export const TRANSITION = 14; // frames de recouvrement entre scènes

export const scene = (id: string) => {
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error("scène inconnue " + id);
  return s;
};
// Convertit un repère absolu (s) en frame locale à la scène
export const local = (id: string, cueSeconds: number) => Math.round((cueSeconds - scene(id).start) * FPS);
