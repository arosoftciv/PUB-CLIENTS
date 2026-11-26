import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish, GoldParticles, KenBurns, Kicker, clamp } from "../components/lib";
import { ICheck } from "../components/icons";
import { C, F } from "../theme";
import { CUE, local, scene } from "../timeline";

const ID = "apprentissage";
// Scène 4a — Salle de formation + COMPRENDRE / S'EXPRIMER / PRENDRE CONFIANCE.
export const S04Apprentissage: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = (scene(ID).end - scene(ID).start) * 30;
  const items = [
    { t: "COMPRENDRE", at: local(ID, CUE.learn_apprenez) },
    { t: "S'EXPRIMER", at: local(ID, CUE.learn_apprenez) + Math.round((local(ID, CUE.learn_confiance) - local(ID, CUE.learn_apprenez)) * 0.55) },
    { t: "PRENDRE CONFIANCE", at: local(ID, CUE.learn_confiance) },
  ];
  const niveau = local(ID, CUE.learn_niveau);
  const chip = spring({ frame: f - niveau + 4, fps, config: { damping: 12 } });
  // ondes vocales (prise de parole) synchronisées
  const bars = new Array(26).fill(0).map((_, i) => 0.25 + 0.75 * Math.abs(Math.sin(f / 3.2 + i * 0.9) * Math.sin(f / 7 + i * 0.4)));
  const wave = interpolate(f, [items[1].at, items[1].at + 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.navyInk }}>
      <KenBurns src="images/v-classroom.jpg" dur={dur + 14} from={1.12} to={1.02} x={[-20, 20]} origin="40% 45%" filter="saturate(1.05) contrast(1.03)" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,11,51,0.25) 0%, rgba(0,11,51,0) 30%, rgba(0,11,51,0.55) 55%, rgba(0,11,51,0.95) 82%)" }} />
      <GoldParticles count={18} seed="s4" opacity={0.45} />
      {/* ondes de parole à côté de l'apprenante */}
      <div style={{ position: "absolute", left: 600, top: 760, display: "flex", gap: 7, alignItems: "center", height: 120, opacity: wave }}>
        {bars.map((b, i) => <div key={i} style={{ width: 8, height: 20 + b * 90 * wave, borderRadius: 4, background: i % 3 === 0 ? C.gold : "rgba(255,255,255,0.9)" }} />)}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1040 }}>
        <Kicker style={{ marginBottom: 26 }}>Avec MCCG, vous allez</Kicker>
        {items.map((it, i) => {
          const s = spring({ frame: f - it.at, fps, config: { damping: 15, stiffness: 150 } });
          const check = spring({ frame: f - it.at - 8, fps, config: { damping: 10, stiffness: 220 } });
          return (
            <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 22, opacity: s, transform: `translateX(${(1 - s) * -120}px)` }}>
              <div style={{ width: 78, height: 78, borderRadius: 39, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${check})`, flexShrink: 0, boxShadow: "0 0 30px rgba(249,197,12,0.5)" }}>
                <ICheck size={48} color={C.navyDeep} stroke={3.2} />
              </div>
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: i === 2 ? 76 : 86, color: i === 2 ? C.gold : C.white, letterSpacing: "-0.01em", lineHeight: 1 }}>{it.t}</div>
            </div>
          );
        })}
        <div style={{ marginTop: 26, display: "inline-flex", padding: "14px 30px", borderRadius: 40, border: `2px solid ${C.gold}`, color: C.white, fontFamily: F.body, fontWeight: 600, fontSize: 36, opacity: chip, transform: `scale(${0.7 + 0.3 * chip})`, transformOrigin: "0% 50%", background: "rgba(1,18,74,0.6)" }}>
          Quel que soit votre niveau
        </div>
      </div>
      <Finish vignette={0.4} />
    </AbsoluteFill>
  );
};
