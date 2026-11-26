import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, Finish, GoldParticles, GoldRule, KenBurns, clamp, prog } from "../components/lib";
import { C, F } from "../theme";
import { CUE, local, scene } from "../timeline";

const ID = "transformation";
// Scène 9 — Le personnage de la scène 1, désormais confiant. Montée émotionnelle.
export const S10Transformation: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = (scene(ID).end - scene(ID).start) * 30;
  const saisir = local(ID, CUE.tr_saisir);
  const prep = local(ID, CUE.tr_preparez);
  const l1 = spring({ frame: f - 10, fps, config: { damping: 13, stiffness: 170 } });
  const l2 = spring({ frame: f - (saisir - 8), fps, config: { damping: 11, stiffness: 190 } });
  const bub = spring({ frame: f - 22, fps, config: { damping: 13 } });
  const flash = interpolate(f, [saisir - 8, saisir - 6, saisir + 6], [0, 0.4, 0], clamp);
  const leak = 0.35 + 0.25 * Math.sin(f / 14);
  return (
    <AbsoluteFill style={{ background: C.navyInk }}>
      <KenBurns src="images/v-hero-confident.jpg" dur={dur + 14} from={1.02} to={1.16} y={[10, -20]} origin="50% 30%" filter="saturate(1.1) contrast(1.05) brightness(1.03)" />
      {/* lumière chaude */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 85% 18%, rgba(255,208,0,${leak}), rgba(255,208,0,0) 45%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,11,51,0.25) 0%, rgba(0,11,51,0) 30%, rgba(0,11,51,0.6) 62%, rgba(0,11,51,0.95) 85%)" }} />
      <Bubble text="I'd be glad to tell you about myself!" p={bub} side="left" style={{ left: 90, top: 330, maxWidth: 560 }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 1110, fontFamily: F.head }}>
        <div style={{ fontWeight: 900, fontSize: 128, color: C.white, lineHeight: 0.98, letterSpacing: "-0.02em", transform: `translateY(${(1 - l1) * 90}px)`, opacity: l1 }}>PARLEZ<br />ANGLAIS.</div>
        <GoldRule p={prog(f, 26, 46)} width={300} style={{ margin: "28px 0" }} />
        <div style={{ fontWeight: 900, fontSize: 80, color: C.gold, lineHeight: 1.02, transform: `translateY(${(1 - l2) * 80}px) scale(${0.9 + 0.1 * l2})`, transformOrigin: "0% 50%", opacity: l2, textShadow: "0 0 30px rgba(249,197,12,0.45)" }}>OUVREZ-VOUS<br />AU MONDE.</div>
      </div>
      <GoldParticles count={40} seed="s10" opacity={interpolate(f, [prep - 20, prep], [0.3, 1], clamp)} />
      <AbsoluteFill style={{ background: C.white, opacity: flash }} />
      <Finish vignette={0.35} />
    </AbsoluteFill>
  );
};
