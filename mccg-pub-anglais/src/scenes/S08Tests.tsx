import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish, GoldParticles, Kicker, NavyBackdrop, Words, clamp, ease } from "../components/lib";
import { ICheck } from "../components/icons";
import { C, F } from "../theme";
import { CUE, local } from "../timeline";

const ID = "tests";
// Scène 7 — Préparation aux tests internationaux (MCCG accompagne la préparation ; pas de mention de centre agréé).
const TESTS = [
  { name: "TOEFL", cue: CUE.test_toefl, skills: "Reading · Listening · Speaking · Writing" },
  { name: "IELTS", cue: CUE.test_ielts, skills: "Academic · General Training" },
  { name: "TOEIC", cue: CUE.test_toeic, skills: "Listening · Reading" },
  { name: "Duolingo\nEnglish Test", cue: CUE.test_duolingo, skills: "Test en ligne" },
];

export const S08Tests: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const acc = local(ID, CUE.test_accompagne);
  const head = spring({ frame: f - 2, fps, config: { damping: 15 } });
  return (
    <AbsoluteFill>
      <NavyBackdrop glowY={30} />
      <GoldParticles count={22} seed="s8" opacity={0.45} />
      <div style={{ position: "absolute", top: 240, left: 70, right: 70, height: 360, borderRadius: 30, overflow: "hidden", opacity: head, transform: `translateY(${(1 - head) * -60}px)`, boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
        <Img src={staticFile("images/h-exam-student.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 35%", transform: `scale(${1.12 - f * 0.0006})` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,11,51,0) 30%, rgba(0,11,51,0.92))" }} />
        <div style={{ position: "absolute", left: 30, bottom: 24, right: 30 }}>
          <Kicker style={{ fontSize: 26 }}>Préparation aux tests</Kicker>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 64, color: C.white, lineHeight: 1.05, marginTop: 6 }}>INTERNATIONAUX</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 650, left: 60, right: 60, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {TESTS.map((t, i) => {
          const at = local(ID, t.cue) - 3;
          const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 150 } });
          const pStart = acc + 4 + i * 12;
          const prog = interpolate(f, [pStart, pStart + 20], [0, 1], { ...clamp, easing: ease });
          const ok = spring({ frame: f - pStart - 18, fps, config: { damping: 9, stiffness: 220 } });
          const shine = interpolate(f, [at + 4, at + 22], [-60, 160], clamp);
          return (
            <div key={t.name} style={{
              position: "relative", height: 330, borderRadius: 30, padding: "30px 28px", overflow: "hidden",
              background: "linear-gradient(155deg, #0D3AA0 0%, #021F6F 55%, #01124A 100%)",
              border: `2px solid rgba(249,197,12,${0.3 + 0.5 * ok})`, boxShadow: `0 24px 50px rgba(0,0,0,0.4), 0 0 ${30 * ok}px rgba(249,197,12,0.35)`,
              opacity: s, transform: `translateY(${(1 - s) * 90}px) scale(${0.85 + 0.15 * s})`,
            }}>
              <div style={{ position: "absolute", top: 0, bottom: 0, width: 80, left: `${shine}%`, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))", transform: "skewX(-20deg)" }} />
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: t.name.includes("\n") ? 44 : 68, color: C.white, lineHeight: 1.02, whiteSpace: "pre-line", letterSpacing: "0.01em", minHeight: 96 }}>{t.name}</div>
              <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 24, color: C.dim, marginTop: 10, lineHeight: 1.3, minHeight: 62 }}>{t.skills}</div>
              <div style={{ position: "absolute", left: 28, right: 100, bottom: 44, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.14)" }}>
                <div style={{ height: "100%", width: `${prog * 100}%`, borderRadius: 6, background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})` }} />
              </div>
              <div style={{ position: "absolute", right: 24, bottom: 22, width: 60, height: 60, borderRadius: 30, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${ok})` }}>
                <ICheck size={38} color={C.navyDeep} stroke={3.4} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1380, left: 70, right: 70, textAlign: "center" }}>
        <Words text="MCCG vous accompagne" start={acc - 8} style={{ fontFamily: F.head, fontWeight: 800, fontSize: 56, color: C.white }} />
        <Words text="dans votre préparation" start={acc + 4} style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 60, color: C.gold, marginTop: 6 }} />
      </div>
      <Finish />
    </AbsoluteFill>
  );
};
