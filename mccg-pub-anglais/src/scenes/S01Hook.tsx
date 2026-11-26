import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bubble, Finish, GoldRule, KenBurns, clamp, prog, useSpring } from "../components/lib";
import { C, F } from "../theme";
import { CUE, local, scene } from "../timeline";

const ID = "hook";
// Scène 1 — Hook : entretien d'embauche, hésitation, question en anglais qui « bloque ».
export const S01Hook: React.FC = () => {
  const f = useCurrentFrame();
  const dur = (scene(ID).end - scene(ID).start) * 30;
  const impact = local(ID, CUE.hook_anglais);
  // battements « pression » (synchronisés au son de cœur)
  const beat = (t0: number) => Math.exp(-Math.max(0, f - t0) / 6) * (f >= t0 ? 1 : 0);
  const pulse = beat(2) + 0.7 * beat(38);
  const q1 = useSpring(10, { damping: 14 });
  const q2 = useSpring(46, { damping: 14 });
  const blurQ = interpolate(f, [70, 120], [0, 7], clamp);
  const l1 = useSpring(22, { damping: 13, stiffness: 180 });
  const l2 = useSpring(30, { damping: 13, stiffness: 180 });
  const l3 = useSpring(40, { damping: 11, stiffness: 200 });
  const shake = f >= impact && f < impact + 12 ? Math.sin((f - impact) * 2.6) * (12 - (f - impact)) * 1.4 : 0;
  const flash = interpolate(f, [impact, impact + 2, impact + 10], [0, 0.35, 0], clamp);
  const qMark = 1 + 0.18 * Math.exp(-Math.max(0, f - impact) / 7) * (f >= impact ? 1 : 0);

  return (
    <AbsoluteFill style={{ background: C.navyInk }}>
      <KenBurns src="images/v-hero-hesitant.jpg" dur={dur} from={1.0} to={1.12} y={[0, 30]} origin="50% 18%"
        filter={`saturate(0.72) contrast(1.05) brightness(${0.82 - pulse * 0.06})`} />
      {/* étalonnage froid + pression sur les bords */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(1,18,74,0.35) 0%, rgba(1,18,74,0.05) 35%, rgba(0,11,51,0.88) 78%, rgba(0,11,51,0.97) 100%)" }} />
      <AbsoluteFill style={{ boxShadow: `inset 0 0 ${180 + pulse * 120}px rgba(0,8,40,${0.6 + pulse * 0.25})` }} />

      {/* questions de l'interlocuteur, en anglais, qui deviennent floues */}
      <div style={{ filter: `blur(${blurQ}px)`, opacity: 1 - blurQ / 14 }}>
        <Bubble text="So, tell me about yourself…" p={q1} side="right" style={{ right: 170, top: 300 }} />
        <Bubble text="Why should we hire you?" p={q2} side="right" style={{ right: 230, top: 430, fontSize: 34 }} />
      </div>

      {/* Titre */}
      <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1080, fontFamily: F.head, color: C.white, textAlign: "left" }}>
          <div style={{ fontWeight: 900, fontSize: 132, lineHeight: 0.95, letterSpacing: "-0.02em", transform: `translateY(${(1 - l1) * 80}px)`, opacity: l1 }}>L'ANGLAIS</div>
          <div style={{ fontWeight: 900, fontSize: 104, lineHeight: 1.05, letterSpacing: "-0.01em", transform: `translateY(${(1 - l2) * 80}px)`, opacity: l2 }}>VOUS BLOQUE</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, transform: `translateY(${(1 - l3) * 80}px)`, opacity: l3 }}>
            <span style={{ fontWeight: 900, fontSize: 132, color: C.gold, lineHeight: 1 }}>ENCORE</span>
            <span style={{ fontWeight: 900, fontSize: 150, color: C.gold, display: "inline-block", transform: `scale(${qMark})`, transformOrigin: "50% 80%" }}>?</span>
          </div>
          <GoldRule p={prog(f, 48, 70)} width={360} style={{ marginTop: 26 }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.white, opacity: flash }} />
      <Finish vignette={0.5} />
    </AbsoluteFill>
  );
};
