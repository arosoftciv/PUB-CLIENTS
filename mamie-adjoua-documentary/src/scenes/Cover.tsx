// Couverture éditoriale 9:16 — l'image n°1 fournie par le client sert de vignette.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, F } from "../styles/theme";
import { ASSETS } from "../data/assets";
import { FilmFinish } from "../components/base";

export const Cover: React.FC<{ grain?: boolean; logo?: boolean }> = ({ grain = true, logo = true }) => (
  <AbsoluteFill style={{ background: C.black }}>
    {/* fond : même visuel, agrandi, flouté et assombri */}
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(ASSETS.coverPoster)}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(28px) brightness(0.35) saturate(0.7)", transform: "scale(1.15)" }}
      />
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 70, top: 150, width: 940, boxShadow: "0 30px 90px rgba(0,0,0,0.8)" }}>
      <Img src={staticFile(ASSETS.coverPoster)} style={{ width: 940, height: 1410, objectFit: "cover", display: "block" }} />
    </div>
    {logo && ASSETS.arosoftLogo ? (
      <Img src={staticFile(ASSETS.arosoftLogo)} style={{ position: "absolute", right: 40, top: 22, height: 112, width: "auto", maxWidth: 230, objectFit: "contain", filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.8))" }} />
    ) : null}
    <div style={{ position: "absolute", left: 40, right: 40, top: 1600, textAlign: "center" }}>
      <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 70, color: C.white, lineHeight: 1, letterSpacing: 1 }}>
        LYCÉE MAMIE ADJOUA
      </div>
      <div
        style={{
          display: "inline-block",
          marginTop: 12,
          fontFamily: F.title,
          fontWeight: 800,
          fontSize: 76,
          color: C.white,
          background: C.red,
          padding: "2px 22px",
          lineHeight: 1.08,
        }}
      >
        LES MYSTÈRES DU PORTAIL FERMÉ
      </div>
      <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 32, color: C.white, marginTop: 20 }}>
        Ce que révèle l'investigation de L'Éléphant Déchaîné
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 24, color: C.dim, marginTop: 12, letterSpacing: 4 }}>23 NOVEMBRE 2026</div>
    </div>
    {grain ? <FilmFinish /> : null}
  </AbsoluteFill>
);
