import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Finish, GoldParticles, Logo, NavyBackdrop, clamp } from "../components/lib";
import { IChatPhone, IPhone, IPin } from "../components/icons";
import { C, F } from "../theme";
import { CUE, local } from "../timeline";

const ID = "cta";
export const WHATSAPP = "+225 05 03 32 31 31";
export const APPELS = "+225 01 02 91 46 49";
export const ADRESSE = "Abidjan, Cocody-Palmeraie, Rue Ministre";

// Scène 10 — Appel à l'action. Coordonnées tenues jusqu'à la fin (≈ 16 s de lecture).
export const S11Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number, cfg = {}) => spring({ frame: f - d, fps, config: { damping: 14, stiffness: 140, ...cfg } });
  const logo = sp(2, { damping: 16, stiffness: 90 });
  const pill = sp(14);
  const wa = sp(local(ID, CUE.cta_whatsapp) - 8);
  const num0 = local(ID, CUE.cta_numero) - 6;
  const num1 = local(ID, CUE.cta_numero_fin);
  // le numéro s'écrit au rythme où il est prononcé
  const digits = WHATSAPP.replace("+225 ", "");
  const shown = Math.round(interpolate(f, [num0, num1], [0, digits.length], clamp));
  const call = sp(num1 + 4);
  const addr = sp(num1 + 12);
  const slogan1 = sp(local(ID, CUE.cta_parlez) - 4);
  const slogan2 = sp(local(ID, CUE.cta_ouvrez) - 4);
  const mccg = local(ID, CUE.cta_mccg);
  const pulseT = ((f - wa * 0) % 45) / 45;
  const logoGlow = interpolate(f, [mccg, mccg + 8, mccg + 40], [10, 40, 16], clamp);
  return (
    <AbsoluteFill>
      <NavyBackdrop glowY={22} glow={1.2} />
      <GoldParticles count={34} seed="s11" opacity={0.6} />
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: logo, transform: `scale(${0.8 + 0.2 * logo})` }}>
        <Logo width={400} glow={logoGlow} />
      </div>
      {/* INSCRIVEZ-VOUS */}
      <div style={{ position: "absolute", top: 640, left: 70, right: 70, display: "flex", justifyContent: "center", opacity: pill, transform: `translateY(${(1 - pill) * 40}px)` }}>
        <div style={{ padding: "22px 44px", borderRadius: 60, background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})`, fontFamily: F.head, fontWeight: 900, fontSize: 50, color: C.navyDeep, textAlign: "center", lineHeight: 1.08, boxShadow: "0 16px 40px rgba(249,197,12,0.35)" }}>
          INSCRIVEZ-VOUS<br />DÈS MAINTENANT
        </div>
      </div>
      {/* Bouton WhatsApp + pulsation */}
      <div style={{ position: "absolute", top: 880, left: 70, right: 70, height: 190, opacity: wa, transform: `scale(${0.85 + 0.15 * wa})` }}>
        {[0, 0.5].map((o) => {
          const t = (pulseT + o) % 1;
          return <div key={o} style={{ position: "absolute", inset: 0, borderRadius: 40, border: `3px solid ${C.gold}`, transform: `scale(${1 + t * 0.12}, ${1 + t * 0.35})`, opacity: (1 - t) * 0.7 * wa }} />;
        })}
        <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "linear-gradient(160deg, #0F44B8, #021F6F)", border: `3px solid ${C.gold}`, display: "flex", alignItems: "center", padding: "0 34px", gap: 30, boxShadow: `0 0 ${30 + 20 * Math.sin(f / 7)}px rgba(249,197,12,0.35)` }}>
          <div style={{ width: 120, height: 120, borderRadius: 60, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${1 + 0.05 * Math.sin(f / 7)})` }}>
            <IChatPhone size={76} color={C.navyDeep} />
          </div>
          <div>
            <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 38, color: C.gold, letterSpacing: "0.04em" }}>WhatsApp</div>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 64, color: C.white, letterSpacing: "0.01em", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
              +225 {digits.slice(0, shown)}<span style={{ opacity: shown < digits.length ? 1 : 0 }}>|</span>
            </div>
          </div>
        </div>
      </div>
      {/* Appels + adresse */}
      <div style={{ position: "absolute", top: 1120, left: 90, right: 90 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: call, transform: `translateX(${(1 - call) * -60}px)` }}>
          <IPhone size={50} color={C.gold} />
          <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 42, color: C.white }}>Appels : <span style={{ fontWeight: 700 }}>{APPELS}</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 24, opacity: addr, transform: `translateX(${(1 - addr) * -60}px)` }}>
          <IPin size={50} color={C.gold} />
          <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 38, color: C.white, lineHeight: 1.25 }}>Abidjan, Cocody-Palmeraie,<br />Rue Ministre</div>
        </div>
      </div>
      {/* Signature */}
      <div style={{ position: "absolute", top: 1340, left: 60, right: 60, textAlign: "center", fontFamily: F.serif, fontStyle: "italic", fontSize: 58, color: C.white }}>
        <span style={{ display: "inline-block", opacity: slogan1, transform: `translateY(${(1 - slogan1) * 30}px)` }}>Parlez anglais.</span>{" "}
        <span style={{ display: "inline-block", opacity: slogan2, transform: `translateY(${(1 - slogan2) * 30}px)`, color: C.gold }}>Ouvrez-vous au monde.</span>
      </div>
      <Finish vignette={0.35} />
    </AbsoluteFill>
  );
};
