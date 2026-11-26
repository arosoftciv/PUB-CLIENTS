import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish, GoldParticles, Glass, KenBurns, Kicker, Words, clamp, ease } from "../components/lib";
import { IBriefcase, ICap, IRocket, ITarget } from "../components/icons";
import { C, F } from "../theme";
import { CUE, local, scene } from "../timeline";

const ID = "niveaux";
// Scène 4b — Progression BEGINNER → INTERMEDIATE → ADVANCED, profils, objectifs.
export const S05Niveaux: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = (scene(ID).end - scene(ID).start) * 30;
  const deb = local(ID, CUE.lvl_debutant);
  const adv = local(ID, CUE.lvl_avance);
  const mid = Math.round((deb + adv) / 2);
  const fill = interpolate(f, [deb, adv + 6], [0, 1], { ...clamp, easing: ease });
  const levels = [
    { t: "BEGINNER", at: deb, h: 150 },
    { t: "INTERMEDIATE", at: mid, h: 250 },
    { t: "ADVANCED", at: adv, h: 360 },
  ];
  const profiles = [
    { t: "Étudiant", at: local(ID, CUE.prof_etudiant), Icon: ICap },
    { t: "Professionnel", at: local(ID, CUE.prof_pro), Icon: IBriefcase },
    { t: "Entrepreneur", at: local(ID, CUE.prof_entrepreneur), Icon: IRocket },
  ];
  const form = local(ID, CUE.prof_formations);
  const obj = local(ID, CUE.prof_objectifs);
  const hit = spring({ frame: f - obj, fps, config: { damping: 9, stiffness: 220 } });
  const ring = interpolate(f, [obj, obj + 24], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.navyInk }}>
      <KenBurns src="images/v-classroom.jpg" dur={dur} from={1.3} to={1.38} filter="blur(30px) brightness(0.4) saturate(0.8)" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,31,111,0.75), rgba(0,11,51,0.9))" }} />
      <GoldParticles count={26} seed="s5" opacity={0.5} />
      <div style={{ position: "absolute", top: 250, left: 80, right: 80 }}>
        <Kicker>Débutant ou avancé</Kicker>
      </div>
      {/* escalier de progression */}
      <div style={{ position: "absolute", top: 330, left: 80, right: 80, height: 470 }}>
        <svg width={920} height={470} style={{ position: "absolute", inset: 0 }}>
          <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stopColor={C.gold} /><stop offset="1" stopColor={C.goldBright} /></linearGradient></defs>
          <path d="M 150 400 L 460 300 L 770 190" stroke="rgba(255,255,255,0.18)" strokeWidth={6} fill="none" strokeDasharray="4 14" strokeLinecap="round" />
          <path d="M 150 400 L 460 300 L 770 190" stroke="url(#g)" strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - fill} />
          <path d={`M 770 190 l -8 -40 l 40 30 z`} fill={C.gold} opacity={fill > 0.98 ? 1 : 0} />
        </svg>
        {levels.map((l, i) => {
          const s = spring({ frame: f - l.at, fps, config: { damping: 13, stiffness: 160 } });
          const active = f >= l.at;
          return (
            <div key={l.t} style={{ position: "absolute", left: 30 + i * 310, bottom: 0, width: 240, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: l.t.length > 9 ? 31 : 36, color: active ? C.white : "rgba(255,255,255,0.4)", letterSpacing: "0.04em", marginBottom: 14, opacity: 0.4 + 0.6 * s }}>{l.t}</div>
              <div style={{ width: 200, height: l.h * (0.25 + 0.75 * s), borderRadius: "22px 22px 8px 8px", background: active ? `linear-gradient(180deg, ${C.goldBright}, ${C.gold})` : "rgba(255,255,255,0.12)", boxShadow: active ? "0 0 40px rgba(249,197,12,0.45)" : undefined, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 16 }}>
                <span style={{ fontFamily: F.head, fontWeight: 900, fontSize: 54, color: active ? C.navyDeep : "rgba(255,255,255,0.4)" }}>{i + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
      {/* profils */}
      <div style={{ position: "absolute", top: 860, left: 60, right: 60, display: "flex", justifyContent: "space-between" }}>
        {profiles.map((p) => {
          const s = spring({ frame: f - p.at + 3, fps, config: { damping: 12, stiffness: 170 } });
          return (
            <Glass key={p.t} style={{ width: 300, height: 230, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, opacity: s, transform: `translateY(${(1 - s) * 70}px) scale(${0.8 + 0.2 * s})` }}>
              <p.Icon size={70} color={C.gold} />
              <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 36, color: C.white }}>{p.t}</div>
            </Glass>
          );
        })}
      </div>
      {/* objectifs */}
      <div style={{ position: "absolute", top: 1170, left: 80, right: 80, display: "flex", alignItems: "center", gap: 36 }}>
        <div style={{ position: "relative", width: 190, height: 190, flexShrink: 0, opacity: interpolate(f, [form - 6, form + 6], [0, 1], clamp) }}>
          <ITarget size={190} color={C.gold} stroke={1.6} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${C.gold}`, transform: `scale(${1 + ring * 0.6})`, opacity: (1 - ring) * (f >= obj ? 1 : 0) }} />
          <div style={{ position: "absolute", left: 95, top: 95, width: 120, height: 8, background: C.white, transformOrigin: "0% 50%", borderRadius: 4, transform: `rotate(-35deg) translateX(${(1 - hit) * 220}px)`, opacity: f >= obj - 4 ? 1 : 0, boxShadow: "0 0 10px rgba(255,255,255,0.6)" }} />
        </div>
        <div>
          <Words text="Des formations adaptées" start={form - 4} align="left" style={{ fontFamily: F.head, fontWeight: 800, fontSize: 58, color: C.white, lineHeight: 1.1 }} />
          <Words text="à vos objectifs" start={obj - 6} align="left" style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 66, color: C.gold, lineHeight: 1.15 }} />
        </div>
      </div>
      <Finish />
    </AbsoluteFill>
  );
};
