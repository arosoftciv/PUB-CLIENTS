import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, ease } from "./components/lib";
import { S01Hook } from "./scenes/S01Hook";
import { S02Opportunites } from "./scenes/S02Opportunites";
import { S03Revelation } from "./scenes/S03Revelation";
import { S04Apprentissage } from "./scenes/S04Apprentissage";
import { S05Niveaux } from "./scenes/S05Niveaux";
import { S06Flexibilite } from "./scenes/S06Flexibilite";
import { S07Immersion } from "./scenes/S07Immersion";
import { S08Tests } from "./scenes/S08Tests";
import { S09Services } from "./scenes/S09Services";
import { S10Transformation } from "./scenes/S10Transformation";
import { S11Cta } from "./scenes/S11Cta";
import { CUE, FPS, TL, TRANSITION } from "./timeline";
import { C } from "./theme";

type Kind = "none" | "zoom" | "wipe" | "slide" | "iris" | "flash";
const SCENES: { id: string; C: React.FC; enter: Kind }[] = [
  { id: "hook", C: S01Hook, enter: "none" },
  { id: "opportunites", C: S02Opportunites, enter: "zoom" },
  { id: "revelation", C: S03Revelation, enter: "iris" },
  { id: "apprentissage", C: S04Apprentissage, enter: "wipe" },
  { id: "niveaux", C: S05Niveaux, enter: "slide" },
  { id: "flexibilite", C: S06Flexibilite, enter: "wipe" },
  { id: "immersion", C: S07Immersion, enter: "zoom" },
  { id: "tests", C: S08Tests, enter: "slide" },
  { id: "services", C: S09Services, enter: "wipe" },
  { id: "transformation", C: S10Transformation, enter: "flash" },
  { id: "cta", C: S11Cta, enter: "iris" },
];

/** Transitions cinématographiques d'entrée (la scène précédente reste dessous pendant TRANSITION frames). */
const Enter: React.FC<{ kind: Kind; children: React.ReactNode }> = ({ kind, children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, TRANSITION], [0, 1], { ...clamp, easing: ease });
  if (kind === "none" || p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  let style: React.CSSProperties = {};
  let edge: React.ReactNode = null;
  if (kind === "zoom") style = { opacity: p, transform: `scale(${1.25 - 0.25 * p})`, filter: `blur(${(1 - p) * 14}px)` };
  if (kind === "slide") style = { transform: `translateY(${(1 - p) * 1920}px)` };
  if (kind === "iris") style = { clipPath: `circle(${p * 1150}px at 50% 46%)` };
  if (kind === "flash") style = { opacity: p };
  if (kind === "wipe") {
    // volet diagonal avec liseré doré
    const x = -400 + p * 1900;
    style = { clipPath: `polygon(0 0, ${x}px 0, ${x - 400}px 1920px, 0 1920px)` };
    edge = <div style={{ position: "absolute", top: -100, left: x - 210, width: 18, height: 2200, background: `linear-gradient(180deg, ${C.gold}, ${C.goldBright})`, transform: "rotate(11.8deg)", boxShadow: "0 0 30px rgba(249,197,12,0.9)" }} />;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
      {edge}
      {kind === "flash" && <AbsoluteFill style={{ background: "#FFF6D0", opacity: (1 - p) * 0.6 }} />}
    </AbsoluteFill>
  );
};

/** Logo officiel en miniature, coin supérieur droit, sans fond. Masqué pendant la révélation et l'écran final. */
const LogoCorner: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const revStart = CUE.reveal_mccg - 0.4;
  const revEnd = TL.scenes.find((s) => s.id === "revelation")!.end + 0.2;
  const ctaStart = TL.scenes.find((s) => s.id === "cta")!.start;
  const fadeIn = interpolate(t, [0.3, 0.9], [0, 1], clamp);
  const hideRev = interpolate(t, [revStart - 0.3, revStart, revEnd, revEnd + 0.4], [1, 0, 0, 1], clamp);
  const hideCta = interpolate(t, [ctaStart - 0.2, ctaStart + 0.2], [1, 0], clamp);
  const o = fadeIn * hideRev * hideCta;
  if (o <= 0) return null;
  return (
    <Img src={staticFile("brand/mccg-logo-full.png")} style={{ position: "absolute", top: 120, right: 50, width: 150, opacity: o * 0.96, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))" }} />
  );
};

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: C.navyInk }}>
    {SCENES.map((s, i) => {
      const sc = TL.scenes[i];
      const from = Math.round(sc.start * FPS);
      const isLast = i === SCENES.length - 1;
      const dur = Math.round((sc.end - sc.start) * FPS) + (isLast ? 0 : TRANSITION);
      return (
        <Sequence key={s.id} from={from} durationInFrames={dur} name={s.id}>
          <Enter kind={s.enter}><s.C /></Enter>
        </Sequence>
      );
    })}
    <LogoCorner />
    <Audio src={staticFile("audio/mix.wav")} />
  </AbsoluteFill>
);
