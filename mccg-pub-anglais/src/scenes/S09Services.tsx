import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish, GoldParticles, NavyBackdrop, clamp, easeInOut } from "../components/lib";
import { IDoc, IMic } from "../components/icons";
import { C, F } from "../theme";
import { CUE, local } from "../timeline";

const ID = "services";
const Page: React.FC<{ lang: "FR" | "EN"; title: string; lines: string[] }> = ({ lang, title, lines }) => (
  <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "#FBFAF6", padding: "36px 38px", boxShadow: "0 20px 50px rgba(0,0,0,0.35)", backfaceVisibility: "hidden", overflow: "hidden" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ width: 70, height: 70, borderRadius: 35, border: `3px solid ${C.navy}`, opacity: 0.25 }} />
      <div style={{ padding: "8px 18px", borderRadius: 10, background: lang === "FR" ? C.navy : C.gold, color: lang === "FR" ? C.white : C.navyDeep, fontFamily: F.head, fontWeight: 900, fontSize: 30 }}>{lang}</div>
    </div>
    <div style={{ fontFamily: F.serif, fontSize: 40, color: C.navyDeep, marginTop: 26, lineHeight: 1.1 }}>{title}</div>
    <div style={{ height: 3, width: 120, background: C.gold, margin: "18px 0 22px" }} />
    {lines.map((l, i) => <div key={i} style={{ fontFamily: F.body, fontSize: 24, color: "#3B4664", lineHeight: 1.65 }}>{l}</div>)}
    {[0, 1, 2].map((i) => <div key={"b" + i} style={{ height: 12, borderRadius: 6, background: "#E3E6EE", marginTop: 16, width: `${90 - i * 18}%` }} />)}
  </div>
);

// Scène 8 — Traduction de documents (page FR → EN) et interprétation (ondes audio).
export const S09Services: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tr = local(ID, CUE.srv_traduction);
  const docs = local(ID, CUE.srv_documents);
  const it = local(ID, CUE.srv_interpretation);
  const pageIn = spring({ frame: f - 2, fps, config: { damping: 15 } });
  const flip = interpolate(f, [tr - 2, tr + 18], [0, 180], { ...clamp, easing: easeInOut });
  const label1 = spring({ frame: f - tr + 6, fps, config: { damping: 14 } });
  const stack = spring({ frame: f - docs, fps, config: { damping: 14 } });
  const card = spring({ frame: f - it + 16, fps, config: { damping: 15 } });
  const label2 = spring({ frame: f - it + 2, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <NavyBackdrop glowY={35} />
      <GoldParticles count={18} seed="s9" opacity={0.4} />
      {/* traduction */}
      <div style={{ position: "absolute", top: 250, left: 60, width: 470, height: 600, perspective: 2000, opacity: pageIn, transform: `translateY(${(1 - pageIn) * 120}px) rotate(-3deg)` }}>
        {/* pages déjà traduites qui s'empilent */}
        {[2, 1].map((k) => (
          <div key={k} style={{ position: "absolute", inset: 0, borderRadius: 18, background: "#F1EFE8", transform: `translate(${stack * k * 26}px, ${stack * k * -18}px) rotate(${stack * k * 3}deg)`, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }} />
        ))}
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${flip}deg)` }}>
          <Page lang="FR" title="Attestation de réussite" lines={["Nous certifions que l'étudiant(e)", "a validé la formation…"]} />
          <div style={{ position: "absolute", inset: 0, transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
            <Page lang="EN" title="Certificate of achievement" lines={["We hereby certify that the student", "has successfully completed…"]} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 360, left: 650, width: 360, opacity: label1, transform: `translateX(${(1 - label1) * 60}px)` }}>
        <div style={{ width: 96, height: 96, borderRadius: 48, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}><IDoc size={56} color={C.navyDeep} /></div>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 52, color: C.white, lineHeight: 1.02, marginTop: 20 }}>TRADUCTION</div>
        <div style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 44, color: C.gold, marginTop: 6 }}>de documents</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 24, fontFamily: F.head, fontWeight: 800, fontSize: 34, color: C.white }}>
          FR <svg width="54" height="34" viewBox="0 0 54 34"><path d="M4 10h42l-8-7M50 24H8l8 7" stroke={C.gold} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> EN
        </div>
      </div>
      {/* interprétation */}
      <div style={{ position: "absolute", top: 960, left: 60, right: 60, height: 520, borderRadius: 32, overflow: "hidden", opacity: card, transform: `translateY(${(1 - card) * 160}px)`, boxShadow: "0 30px 70px rgba(0,0,0,0.45)", border: `2px solid rgba(249,197,12,0.45)` }}>
        <Img src={staticFile("images/h-interpreter.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 40%", transform: `scale(${1.15 - (f - it) * 0.0008})` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,11,51,0.92) 0%, rgba(0,11,51,0.55) 45%, rgba(0,11,51,0) 75%)" }} />
        <div style={{ position: "absolute", left: 36, top: 60, opacity: label2, transform: `translateX(${(1 - label2) * -50}px)` }}>
          <div style={{ width: 96, height: 96, borderRadius: 48, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}><IMic size={54} color={C.navyDeep} /></div>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 60, color: C.white, marginTop: 22 }}>INTERPRÉTATION</div>
        </div>
        {/* ondes audio : FR (blanc) → EN (or) */}
        <div style={{ position: "absolute", left: 36, bottom: 50, display: "flex", alignItems: "center", gap: 6, height: 140 }}>
          {new Array(34).fill(0).map((_, i) => {
            const amp = Math.abs(Math.sin(f / 2.6 + i * 0.7) * Math.cos(f / 5.3 + i * 0.33));
            const on = interpolate(f, [it - 6 + i * 0.6, it + i * 0.6], [0, 1], clamp);
            return <div key={i} style={{ width: 9, height: 12 + amp * 120 * on, borderRadius: 5, background: i < 17 ? "rgba(255,255,255,0.95)" : C.gold }} />;
          })}
        </div>
      </div>
      <Finish />
    </AbsoluteFill>
  );
};
