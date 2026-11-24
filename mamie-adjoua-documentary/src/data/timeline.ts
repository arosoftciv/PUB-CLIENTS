// Accès typé à la timeline générée par scripts/prepare-audio.py (voix-off = référentiel temporel).
import timings from "./timings.json";
import cues from "./cues.json";
import teaserCues from "./teaser-cues.json";

export type Segment = { id: string; start: number; end: number; text: string | null };
export type SceneTiming = {
  id: string;
  name: string;
  start: number;
  duration: number;
  voStart: number;
  voFile: string | null;
  pages: number[];
  segments: Segment[];
};
export type Cue = { start: number; end: number; text: string; scene?: string };

export const TL = timings as unknown as {
  fps: number;
  total: number;
  estimated: boolean;
  scenes: SceneTiming[];
  teaser: {
    intro: number;
    outro: number;
    total: number;
    clips: { scene: string; seg: string; srcStart: number; start: number; duration: number; text: string }[];
  };
};
export const CUES = cues as Cue[];
export const TEASER_CUES = teaserCues as Cue[];
export const FPS = TL.fps;
export const f = (s: number) => Math.round(s * FPS);

export const scene = (id: string): SceneTiming => {
  const s = TL.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Scène inconnue ${id}`);
  return s;
};

/** Frame (relative au début de scène) du début d'un segment de narration. */
export const segFrame = (sc: SceneTiming, id: string, which: "start" | "end" = "start"): number => {
  const s = sc.segments.find((x) => x.id === id);
  if (!s) throw new Error(`Segment inconnu ${sc.id}/${id}`);
  return f(which === "start" ? s.start : s.end);
};

export const TOTAL_FRAMES = f(TL.total);
export const TEASER_FRAMES = f(TL.teaser.total);
