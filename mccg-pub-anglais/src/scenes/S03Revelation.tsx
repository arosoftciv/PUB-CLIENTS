import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Finish, GoldParticles, NavyBackdrop, Words, clamp, ease, prog, useSpring } from "../components/lib";
import { C, F } from "../theme";
import { CUE, local } from "../timeline";

const ID = "revelation";
// Scène 3 — Du problème à la solution : question, éclat doré, révélation du logo officiel.
export const S03Revelation: React.FC = () => {
  const f = useCurrentFrame();
  const force = local(ID, CUE.force_word);
  const rev = local(ID, CUE.reveal_mccg);
  const sarl = local(ID, CUE.reveal_sarl);

  const qOut = prog(f, rev - 16, rev + 4);
  const burst = interpolate(f, [force - 2, force + 4, force + 30], [0, 1, 0.25], clamp);
  const bg = prog(f, rev - 10, rev + 14);
  // emblème : balayage circulaire (le « C » se dessine) + montée en échelle
  const sweep = interpolate(f, [rev, rev + 26], [0, 360], { ...clamp, easing: ease });
  const embS = useSpring(rev, { damping: 14, stiffness: 90 });
  const glow = interpolate(f, [rev + 20, rev + 34, rev + 70], [0, 1, 0.45], clamp);
  const wordP = prog(f, sarl - 40, sarl - 10);
  const sarlP = useSpring(sarl, { damping: 12 });
  const tag = prog(f, sarl + 12, sarl + 30);
  const breathe = 1 + Math.sin(f / 18) * 0.008;

  return (
    <AbsoluteFill style={{ background: C.navyInk }}>
      <AbsoluteFill style={{ opacity: bg }}><NavyBackdrop glowY={40} glow={1 + glow} /></AbsoluteFill>
      {/* rayons de lumière à « force » */}
      <AbsoluteFill style={{ opacity: burst * (1 - bg * 0.7), background: `conic-gradient(from ${f * 0.6}deg at 50% 46%, rgba(249,197,12,0) 0deg, rgba(249,197,12,0.35) 12deg, rgba(249,197,12,0) 24deg, rgba(249,197,12,0) 60deg, rgba(249,197,12,0.28) 72deg, rgba(249,197,12,0) 84deg, rgba(249,197,12,0) 140deg, rgba(249,197,12,0.3) 152deg, rgba(249,197,12,0) 164deg, rgba(249,197,12,0) 220deg, rgba(249,197,12,0.3) 232deg, rgba(249,197,12,0) 244deg, rgba(249,197,12,0) 300deg, rgba(249,197,12,0.3) 312deg, rgba(249,197,12,0) 324deg)` }} />
      <AbsoluteFill style={{ opacity: burst * 0.6, background: "radial-gradient(circle at 50% 46%, rgba(255,208,0,0.45), rgba(255,208,0,0) 40%)" }} />

      {/* Question */}
      <div style={{ position: "absolute", top: 640, left: 70, right: 70, textAlign: "center", opacity: 1 - qOut, transform: `translateY(${-qOut * 60}px) scale(${1 - qOut * 0.1})` }}>
        <Words text="Et si l'anglais devenait" start={2} stagger={4} style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 84, color: C.white, lineHeight: 1.1 }} />
        <div style={{ height: 30 }} />
        <Words text="VOTRE FORCE ?" start={force - 6} stagger={5} style={{ fontFamily: F.head, fontWeight: 900, fontSize: 128, color: C.gold, letterSpacing: "-0.01em", textShadow: `0 0 ${40 * burst}px rgba(255,208,0,0.8)` }} />
      </div>

      {/* Logo officiel */}
      {f >= rev - 2 && (
        <AbsoluteFill>
          <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${breathe})` }}>
            <div style={{
              width: 460, height: 478, transform: `scale(${0.7 + 0.3 * embS}) rotate(${(1 - embS) * -25}deg)`,
              ...(sweep < 360 ? {
                WebkitMaskImage: `conic-gradient(from 200deg, #000 ${sweep}deg, transparent ${sweep + 0.5}deg)`,
                maskImage: `conic-gradient(from 200deg, #000 ${sweep}deg, transparent ${sweep + 0.5}deg)`,
              } : {}),
            }}>
              <Img src={staticFile("brand/mccg-emblem.png")} style={{ width: "100%", height: "100%", filter: sweep < 360 ? undefined : `drop-shadow(0 0 ${8 + glow * 40}px rgba(249,197,12,${0.35 + glow * 0.4}))` }} />
            </div>
            <div style={{ marginTop: 56, width: 760, overflow: "hidden", position: "relative" }}>
              <Img src={staticFile("brand/mccg-wordmark.png")} style={{
                width: 760, display: "block",
                WebkitMaskImage: `linear-gradient(90deg, #000 ${wordP * 70 - 4}%, transparent ${wordP * 70}%), linear-gradient(90deg, transparent 71%, rgba(0,0,0,${Math.max(0, sarlP)}) 71%)`,
                maskImage: `linear-gradient(90deg, #000 ${wordP * 70 - 4}%, transparent ${wordP * 70}%), linear-gradient(90deg, transparent 71%, rgba(0,0,0,${Math.max(0, sarlP)}) 71%)`,
                transform: `translateY(${(1 - wordP) * 20}px)`,
              }} />
            </div>
            <div style={{ marginTop: 60, opacity: tag, transform: `translateY(${(1 - tag) * 24}px)`, fontFamily: F.serif, fontStyle: "italic", fontSize: 56, color: C.white, textAlign: "center", lineHeight: 1.2, padding: "0 90px" }}>
              Et si l'anglais devenait <span style={{ color: C.gold }}>votre force</span> ?
            </div>
          </div>
        </AbsoluteFill>
      )}
      <GoldParticles count={60} seed="s3" burstAt={rev + 4} opacity={f >= rev ? 1 : 0.4} />
      <Finish vignette={0.4} />
    </AbsoluteFill>
  );
};
