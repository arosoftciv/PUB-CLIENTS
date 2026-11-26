import React from "react";
import {
  AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { C, F } from "../theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export const useSpring = (delay: number, cfg: { damping?: number; mass?: number; stiffness?: number } = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.7, stiffness: 140, ...cfg } });
};

export const prog = (frame: number, a: number, b: number, e = ease) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: e });

/** Photo plein cadre avec mouvement de caméra (zoom + panoramique) et étalonnage. */
export const KenBurns: React.FC<{
  src: string; from?: number; to?: number; x?: [number, number]; y?: [number, number];
  dur: number; filter?: string; origin?: string; style?: React.CSSProperties;
}> = ({ src, from = 1.05, to = 1.18, x = [0, 0], y = [0, 0], dur, filter, origin = "50% 40%", style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 0, 0.67, 1) });
  const s = from + (to - from) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%", height: "100%", objectFit: "cover", transformOrigin: origin,
          transform: `translate(${x[0] + (x[1] - x[0]) * p}px, ${y[0] + (y[1] - y[0]) * p}px) scale(${s})`,
          filter,
        }}
      />
    </AbsoluteFill>
  );
};

/** Poussière dorée maîtrisée (déterministe). */
export const GoldParticles: React.FC<{ count?: number; seed?: string; opacity?: number; burstAt?: number; area?: [number, number, number, number] }> = ({
  count = 40, seed = "p", opacity = 1, burstAt, area = [0, 0, 1080, 1920],
}) => {
  const f = useCurrentFrame();
  const [ax, ay, aw, ah] = area;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const size = 3 + r("s") * 9;
        const speed = 0.25 + r("v") * 0.9;
        const x0 = ax + r("x") * aw;
        const y0 = ay + r("y") * ah;
        let x = x0 + Math.sin(f / (40 + r("w") * 50) + r("p") * 6) * 30;
        let y = ((y0 - f * speed - ay) % ah + ah) % ah + ay;
        let o = (0.25 + r("o") * 0.6) * (0.6 + 0.4 * Math.sin(f / 12 + r("t") * 9));
        if (burstAt !== undefined && f >= burstAt) {
          const t = (f - burstAt) / 30;
          const ang = r("a") * Math.PI * 2;
          const dist = (200 + r("d") * 500) * (1 - Math.exp(-t * 2.2));
          x = 540 + Math.cos(ang) * dist;
          y = 760 + Math.sin(ang) * dist - t * 40;
          o = Math.max(0, 1 - t * 0.45) * (0.5 + r("o") * 0.5);
        }
        const blur = size > 9 ? 2 : 0;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%",
            background: `radial-gradient(circle, ${C.goldBright} 0%, rgba(249,197,12,0.55) 45%, rgba(249,197,12,0) 72%)`,
            opacity: o, filter: blur ? `blur(${blur}px)` : undefined,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Vignette + grain fin pour l'unité photographique. */
export const Finish: React.FC<{ vignette?: number }> = ({ vignette = 0.55 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,8,40,${vignette}) 100%)` }} />
      <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 12} /></filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Typographie cinétique : chaque mot monte depuis un masque. */
export const Words: React.FC<{
  text: string; start: number; stagger?: number; style?: React.CSSProperties; wordStyle?: (i: number) => React.CSSProperties; align?: "center" | "left";
}> = ({ text, start, stagger = 3, style, wordStyle, align = "center" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", columnGap: "0.28em", ...style }}>
      {words.map((w, i) => {
        const s = spring({ frame: f - start - i * stagger, fps, config: { damping: 18, stiffness: 160, mass: 0.6 } });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - s) * 105}%)`, opacity: Math.min(1, s * 1.4), ...wordStyle?.(i) }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

/** Petit libellé capitales espacées. */
export const Kicker: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.gold, style }) => (
  <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 30, letterSpacing: "0.32em", color, textTransform: "uppercase", ...style }}>{children}</div>
);

/** Logo officiel MCCG (emblème + mot-symbole détourés depuis le fichier fourni). */
export const Logo: React.FC<{ width: number; style?: React.CSSProperties; glow?: number }> = ({ width, style, glow = 0 }) => (
  <Img src={staticFile("brand/mccg-logo-full.png")} style={{ width, height: "auto", filter: glow ? `drop-shadow(0 0 ${glow}px rgba(249,197,12,0.55))` : undefined, ...style }} />
);

export const GoldRule: React.FC<{ p: number; width?: number; style?: React.CSSProperties }> = ({ p, width = 220, style }) => (
  <div style={{ width: width * p, height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})`, boxShadow: "0 0 18px rgba(249,197,12,0.6)", ...style }} />
);

/** Fond bleu profond avec halo et lignes de profondeur. */
export const NavyBackdrop: React.FC<{ glowY?: number; glow?: number }> = ({ glowY = 45, glow = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% ${glowY}%, ${C.navyLight} 0%, ${C.navy} 45%, ${C.navyInk} 100%)` }}>
      <AbsoluteFill style={{ opacity: 0.35 * glow, background: `radial-gradient(circle at 50% ${glowY}%, rgba(249,197,12,0.22), rgba(249,197,12,0) 45%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.12 }}>
        {new Array(9).fill(0).map((_, i) => {
          const r = 260 + i * 150 + ((f * 0.8) % 150);
          return <circle key={i} cx={540} cy={(glowY / 100) * 1920} r={r} fill="none" stroke={C.gold} strokeWidth={1.2} opacity={1 - i / 9} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Carte « verre » premium. */
export const Glass: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{
    background: "linear-gradient(160deg, rgba(11,52,150,0.72), rgba(1,18,74,0.82))",
    border: `1.5px solid rgba(249,197,12,0.35)`, borderRadius: 32,
    boxShadow: "0 30px 60px rgba(0,6,30,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
    backdropFilter: "blur(14px)", ...style,
  }}>{children}</div>
);

export const Bubble: React.FC<{ text: string; p: number; side?: "left" | "right"; style?: React.CSSProperties; dark?: boolean }> = ({ text, p, side = "left", style, dark }) => (
  <div style={{
    position: "absolute", padding: "22px 30px", borderRadius: 30,
    borderBottomLeftRadius: side === "left" ? 6 : 30, borderBottomRightRadius: side === "right" ? 6 : 30,
    background: dark ? "rgba(1,18,74,0.85)" : "rgba(255,255,255,0.94)", color: dark ? C.white : C.navyDeep,
    fontFamily: F.body, fontWeight: 600, fontSize: 38, lineHeight: 1.2, boxShadow: "0 18px 40px rgba(0,0,0,0.3)",
    transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * 30}px)`, opacity: p, transformOrigin: side === "left" ? "0% 100%" : "100% 100%",
    border: dark ? `1.5px solid ${C.gold}` : undefined, ...style,
  }}>{text}</div>
);
