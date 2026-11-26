import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish, GoldParticles, KenBurns, Kicker, Words, clamp } from "../components/lib";
import { IBriefcase, ICap, IPlane, ITrend } from "../components/icons";
import { C, F } from "../theme";
import { CUE, local, scene } from "../timeline";

const ID = "opportunites";
const CARDS = [
  { cue: CUE.opp_emploi, label: "EMPLOI", sub: "Entretien d'embauche", img: "images/h-hero-hesitant.jpg", pos: "30% 40%", Icon: IBriefcase },
  { cue: CUE.opp_promo, label: "PROMOTION", sub: "Évolution de carrière", img: "images/h-promotion.jpg", pos: "35% 40%", Icon: ITrend },
  { cue: CUE.opp_etudes, label: "ÉTUDES", sub: "À l'international", img: "images/h-graduate.jpg", pos: "62% 35%", Icon: ICap },
  { cue: CUE.opp_voyage, label: "VOYAGES", sub: "Le monde s'ouvre", img: "images/h-travel.jpg", pos: "45% 50%", Icon: IPlane },
];

// Scène 2 — Quatre cartes d'opportunités au rythme de la narration.
export const S02Opportunites: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = (scene(ID).end - scene(ID).start) * 30;
  const out = interpolate(f, [dur - 14, dur + 4], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.navyInk }}>
      <KenBurns src="images/v-hero-hesitant.jpg" dur={dur} from={1.25} to={1.32} filter="blur(26px) saturate(0.6) brightness(0.45)" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,11,51,0.55), rgba(2,31,111,0.75))" }} />
      <GoldParticles count={24} seed="s2" opacity={0.5} />
      <div style={{ position: "absolute", top: 250, left: 80, right: 80, textAlign: "center" }}>
        <Kicker>Toutes ces opportunités</Kicker>
        <Words text="laissées de côté ?" start={4} style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 76, color: C.white, marginTop: 14 }} />
      </div>
      <div style={{ position: "absolute", top: 520, left: 70, right: 70, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 34, perspective: 1600 }}>
        {CARDS.map((c, i) => {
          const at = local(ID, c.cue) - 4;
          const s = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 120, mass: 0.8 } });
          const lit = interpolate(f, [at, at + 10], [0, 1], clamp);
          const parallax = (f - at) * 0.25;
          return (
            <div key={c.label} style={{
              height: 440, borderRadius: 30, overflow: "hidden", position: "relative",
              transform: `rotateY(${(1 - s) * (i % 2 ? -75 : 75)}deg) translateY(${(1 - s) * 80 + out * (i < 2 ? -40 : 40)}px) scale(${1 - out * 0.08})`,
              opacity: Math.min(1, s * 1.3) * (1 - out * 0.9),
              boxShadow: `0 28px 60px rgba(0,0,0,0.45), 0 0 0 2px rgba(249,197,12,${0.25 + 0.5 * lit * Math.exp(-Math.max(0, f - at - 10) / 20)})`,
              background: C.navyDeep,
            }}>
              <Img src={staticFile(c.img)} style={{ position: "absolute", width: "130%", height: "100%", left: `${-15 - parallax * 0.1}%`, objectFit: "cover", objectPosition: c.pos, filter: "saturate(0.95)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,11,51,0) 35%, rgba(0,11,51,0.92) 100%)" }} />
              <div style={{ position: "absolute", top: 22, left: 22, width: 84, height: 84, borderRadius: 42, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${spring({ frame: f - at - 6, fps, config: { damping: 10, stiffness: 200 } })})` }}>
                <c.Icon size={46} color={C.navyDeep} stroke={2.4} />
              </div>
              <div style={{ position: "absolute", left: 26, right: 20, bottom: 26 }}>
                <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 46, color: C.white, letterSpacing: "0.02em" }}>{c.label}</div>
                <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 30, color: C.gold, marginTop: 4 }}>{c.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
      <Finish />
    </AbsoluteFill>
  );
};
