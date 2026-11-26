import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { GoldParticles } from "./components/lib";
import { C, F } from "./theme";

// Couverture verticale indépendante (1080x1920), identité MCCG uniquement.
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: C.navyInk }}>
    <Img src={staticFile("images/v-cover-duo.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 70%", transform: "scale(1.06)", transformOrigin: "50% 80%" }} />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.navy} 0%, rgba(2,31,111,0.92) 22%, rgba(2,31,111,0.35) 42%, rgba(2,31,111,0) 55%, rgba(0,11,51,0.25) 75%, rgba(0,11,51,0.92) 92%)` }} />
    <GoldParticles count={30} seed="cover" opacity={0.7} area={[0, 0, 1080, 800]} />
    <Img src={staticFile("brand/mccg-logo-full.png")} style={{ position: "absolute", top: 120, right: 60, width: 190, filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.4))" }} />
    <div style={{ position: "absolute", top: 300, left: 70, right: 70, fontFamily: F.head, color: C.white }}>
      <div style={{ fontWeight: 900, fontSize: 138, lineHeight: 0.94, letterSpacing: "-0.02em" }}>L'ANGLAIS</div>
      <div style={{ fontWeight: 900, fontSize: 108, lineHeight: 1.04 }}>VOUS BLOQUE</div>
      <div style={{ fontWeight: 900, fontSize: 138, lineHeight: 1, color: C.gold }}>ENCORE ?</div>
      <div style={{ width: 300, height: 8, borderRadius: 4, background: C.gold, margin: "30px 0" }} />
    </div>
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 300, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "24px 40px", borderRadius: 50, background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})`, fontFamily: F.head, fontWeight: 800, fontSize: 44, color: C.navyDeep, textAlign: "center", lineHeight: 1.2, boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}>
        Apprenez à Abidjan,<br />en ligne ou à Accra.
      </div>
    </div>
  </AbsoluteFill>
);
