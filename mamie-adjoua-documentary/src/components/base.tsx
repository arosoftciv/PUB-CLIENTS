// Composants de base : fond, grain, photo documentaire, étiquettes, référence de source.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, SAFE, clamp } from "../styles/theme";
import { appear } from "../animations/anim";

export const Backdrop: React.FC<{ tint?: string; children?: React.ReactNode }> = ({ tint, children }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 80% at 50% 35%, ${tint ?? "#161A20"} 0%, ${C.black} 70%)`,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Grain argentique + vignettage, posés au-dessus de toute la vidéo. */
export const FilmFinish: React.FC = () => {
  const frame = useCurrentFrame();
  const ox = (frame * 137) % 512;
  const oy = (frame * 251) % 512;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("images/grain.png")})`,
          backgroundPosition: `${ox}px ${oy}px`,
          opacity: 0.06,
          mixBlendMode: "overlay",
        }}
      />
      <AbsoluteFill
        style={{ background: "radial-gradient(110% 75% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }}
      />
    </AbsoluteFill>
  );
};

/** Photographie avec effet Ken Burns et étalonnage documentaire. */
export const Photo: React.FC<{
  src: string;
  frame: number;
  dur: number;
  from?: { s: number; x: number; y: number };
  to?: { s: number; x: number; y: number };
  style?: React.CSSProperties;
  grade?: "doc" | "cold" | "mono";
  fit?: "cover" | "contain";
}> = ({ src, frame, dur, from = { s: 1.04, x: 0, y: 0 }, to = { s: 1.14, x: 0, y: -20 }, style, grade = "doc", fit = "cover" }) => {
  const p = interpolate(frame, [0, Math.max(dur, 1)], [0, 1], clamp);
  const s = from.s + (to.s - from.s) * p;
  const x = from.x + (to.x - from.x) * p;
  const y = from.y + (to.y - from.y) * p;
  const filter =
    grade === "mono"
      ? "grayscale(1) contrast(1.15) brightness(0.8)"
      : grade === "cold"
        ? "saturate(0.55) contrast(1.12) brightness(0.85) hue-rotate(-6deg)"
        : "saturate(0.72) contrast(1.1) brightness(0.92)";
  return (
    <div style={{ position: "absolute", overflow: "hidden", ...style }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          transform: `translate(${x}px, ${y}px) scale(${s})`,
          filter,
        }}
      />
    </div>
  );
};

/** Référence documentaire discrète, en haut d'écran (zone sûre). */
export const SourceReference: React.FC<{ pages: number[] | string; at?: number }> = ({ pages, at = 0 }) => {
  const frame = useCurrentFrame();
  const p = appear(frame, at, 20);
  const label =
    typeof pages === "string"
      ? pages
      : pages.length === 0
        ? ""
        : `p. ${pages.length > 2 ? `${pages[0]}-${pages[pages.length - 1]}` : pages.join("-")}`;
  if (!label) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top - 62,
        fontFamily: F.mono,
        fontSize: 22,
        letterSpacing: 1,
        color: C.dim,
        opacity: p * 0.9,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ width: 8, height: 8, background: C.red, display: "inline-block" }} />
      Source : L'Éléphant Déchaîné, 23/11/2026, {label}
    </div>
  );
};

/** Étiquette obligatoire sur toute reconstitution. */
export const ReconstitutionTag: React.FC<{ style?: React.CSSProperties; opacity?: number }> = ({ style, opacity = 1 }) => (
  <div
    style={{
      fontFamily: F.mono,
      fontSize: 20,
      color: C.white,
      background: "rgba(11,13,16,0.72)",
      border: `1px solid ${C.line}`,
      padding: "6px 12px",
      letterSpacing: 0.5,
      opacity,
      position: "absolute",
      ...style,
    }}
  >
    Illustration - Reconstitution visuelle
  </div>
);

/** Mention d'attribution (témoignages, allégations…). */
export const Attribution: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties; opacity?: number }> = ({
  children,
  color = C.amber,
  style,
  opacity = 1,
}) => (
  <div
    style={{
      fontFamily: F.text,
      fontStyle: "italic",
      fontSize: 26,
      color,
      opacity,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties; mono?: boolean }> = ({
  children,
  color = C.white,
  style,
  mono,
}) => (
  <div
    style={{
      display: "inline-block",
      fontFamily: mono ? F.mono : F.title,
      fontWeight: 700,
      fontSize: mono ? 28 : 34,
      letterSpacing: mono ? 1 : 2,
      textTransform: "uppercase",
      color,
      border: `2px solid ${color}`,
      padding: "8px 18px",
      background: "rgba(11,13,16,0.6)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Caption: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: F.mono, fontSize: 20, color: C.dim, letterSpacing: 0.5, ...style }}>{children}</div>
);

/** Logo AroSoft en miniature, en haut à droite (fond transparent), présent sur toute la vidéo. */
export const BrandBug: React.FC<{ src: string | null }> = ({ src }) =>
  src ? (
    <Img
      src={staticFile(src)}
      style={{ position: "absolute", right: 44, top: 104, height: 64, width: "auto", maxWidth: 190, objectFit: "contain", opacity: 0.92, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.55))" }}
    />
  ) : null;
