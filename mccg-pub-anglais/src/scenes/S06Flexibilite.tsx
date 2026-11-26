import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish, GoldParticles, NavyBackdrop, clamp } from "../components/lib";
import { IMonitor, IPin } from "../components/icons";
import { C, F } from "../theme";
import { CUE, local } from "../timeline";

const ID = "flexibilite";
// Scène 5 — Présentiel à Abidjan / en ligne : interfaces ordinateur + smartphone.
export const S06Flexibilite: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pres = local(ID, CUE.flex_presentiel) - 4;
  const ligne = local(ID, CUE.flex_ligne) - 6;
  const a = spring({ frame: f - pres, fps, config: { damping: 15, stiffness: 140 } });
  const b = spring({ frame: f - ligne, fps, config: { damping: 15, stiffness: 120 } });
  const ph = spring({ frame: f - ligne - 7, fps, config: { damping: 13, stiffness: 140 } });
  const live = 0.5 + 0.5 * Math.sin(f / 4);
  const typed = "How are you today?".slice(0, Math.max(0, Math.floor((f - ligne - 10) / 1.4)));
  return (
    <AbsoluteFill>
      <NavyBackdrop glowY={55} />
      <GoldParticles count={20} seed="s6" opacity={0.4} />
      {/* PRÉSENTIEL */}
      <div style={{ position: "absolute", top: 250, left: 70, right: 70, height: 560, borderRadius: 34, overflow: "hidden", transform: `translateY(${(1 - a) * -120}px) scale(${0.9 + 0.1 * a})`, opacity: a, boxShadow: "0 30px 70px rgba(0,0,0,0.45)", border: `2px solid rgba(249,197,12,0.5)` }}>
        <Img src={staticFile("images/h-classroom.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.15 - 0.08 * a}) translateX(${f * 0.4}px)` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,11,51,0) 40%, rgba(0,11,51,0.9))" }} />
        <div style={{ position: "absolute", left: 34, bottom: 30, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 86, height: 86, borderRadius: 43, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}><IPin size={52} color={C.navyDeep} /></div>
          <div>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 56, color: C.white, lineHeight: 1 }}>EN PRÉSENTIEL</div>
            <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 36, color: C.gold, marginTop: 6 }}>à Abidjan</div>
          </div>
        </div>
      </div>
      {/* EN LIGNE : ordinateur */}
      <div style={{ position: "absolute", top: 880, left: 60, width: 720, opacity: b, transform: `translateX(${(1 - b) * -200}px) rotate(${(1 - b) * -4}deg)` }}>
        <div style={{ background: "#0D1424", borderRadius: "26px 26px 8px 8px", padding: 16, border: "2px solid #2A3550" }}>
          <div style={{ position: "relative", height: 400, borderRadius: 12, overflow: "hidden", background: "#000" }}>
            <Img src={staticFile("images/h-online.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "70% 40%" }} />
            <div style={{ position: "absolute", top: 14, left: 14, padding: "6px 14px", borderRadius: 8, background: "rgba(220,30,40,0.9)", color: "#fff", fontFamily: F.body, fontWeight: 700, fontSize: 22, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: "#fff", opacity: live }} />LIVE
            </div>
            <div style={{ position: "absolute", top: 14, right: 14, width: 150, height: 100, borderRadius: 10, background: `linear-gradient(135deg, ${C.navyLight}, ${C.navy})`, border: `2px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.head, fontWeight: 800, color: C.gold, fontSize: 24 }}>Teacher</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 64, background: "rgba(1,18,74,0.85)", display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
              {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 38, height: 38, borderRadius: 19, background: i === 3 ? "#D62D36" : "rgba(255,255,255,0.2)" }} />)}
            </div>
          </div>
        </div>
        <div style={{ height: 20, margin: "0 -40px", background: "linear-gradient(180deg,#3A465F,#1C2436)", borderRadius: "0 0 30px 30px" }} />
      </div>
      {/* smartphone */}
      <div style={{ position: "absolute", top: 940, left: 700, width: 300, height: 600, borderRadius: 48, background: "#0D1424", border: "3px solid #2A3550", padding: 14, opacity: ph, transform: `translateY(${(1 - ph) * 260}px) rotate(${6 - ph * 2}deg)`, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 36, background: `linear-gradient(180deg, ${C.navy}, ${C.navyDeep})`, overflow: "hidden", padding: "40px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 24, color: C.gold }}>Lesson 12</div>
          <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.15)" }}><div style={{ height: "100%", width: `${interpolate(f, [ligne, ligne + 40], [10, 72], clamp)}%`, borderRadius: 5, background: C.gold }} /></div>
          <div style={{ padding: 16, borderRadius: 18, background: "rgba(255,255,255,0.95)", fontFamily: F.body, fontWeight: 600, fontSize: 24, color: C.navyDeep }}>Hello!</div>
          <div style={{ alignSelf: "flex-end", padding: 16, borderRadius: 18, background: C.gold, fontFamily: F.body, fontWeight: 600, fontSize: 24, color: C.navyDeep, minHeight: 64, maxWidth: 230 }}>{typed}<span style={{ opacity: live }}>|</span></div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1380, left: 80, display: "flex", alignItems: "center", gap: 18, opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}><IMonitor size={46} color={C.navyDeep} /></div>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 60, color: C.white }}>EN LIGNE</div>
      </div>
      <Finish />
    </AbsoluteFill>
  );
};
