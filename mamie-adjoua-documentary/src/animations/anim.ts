import { interpolate, spring } from "remotion";
import { EASE, clamp } from "../styles/theme";

/** 0 → 1 à partir de `at` sur `dur` frames (ease-out). */
export const appear = (frame: number, at: number, dur = 18, ease = EASE.out) =>
  interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: ease });

/** 1 → 0 à partir de `at`. */
export const vanish = (frame: number, at: number, dur = 14) =>
  interpolate(frame, [at, at + dur], [1, 0], { ...clamp, easing: EASE.inOut });

/** Visible entre `a` et `b`, avec fondu. */
export const between = (frame: number, a: number, b: number, fade = 12) =>
  Math.min(appear(frame, a, fade), b === Infinity ? 1 : vanish(frame, b - fade, fade));

export const pop = (frame: number, at: number, fps = 30, damping = 14) =>
  spring({ frame: frame - at, fps, config: { damping, stiffness: 140, mass: 0.8 } });

/** Style d'entrée standard : fondu + translation verticale. */
export const rise = (p: number, dist = 40) => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dist}px)`,
});

/** Révélation par masque (clip-path) gauche → droite. */
export const wipe = (p: number) => ({ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` });
export const wipeUp = (p: number) => ({ clipPath: `inset(${(1 - p) * 100}% 0 0 0)` });

export const lerp = (p: number, a: number, b: number) => a + (b - a) * p;
