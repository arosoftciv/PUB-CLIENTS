import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, Finish, GoldParticles, KenBurns, Kicker, Words, clamp, ease, easeInOut } from "../components/lib";
import { IPlane } from "../components/icons";
import map from "../data/map.json";
import { C, F } from "../theme";
import { CUE, local, scene } from "../timeline";

const ID = "immersion";
const [AX, AY] = map.cities.abidjan;
const [GX, GY] = map.cities.accra;
const CX = (AX + GX) / 2;
const CY = Math.min(AY, GY) - 120; // point de contrôle de l'arc
const bez = (t: number) => [
  (1 - t) ** 2 * AX + 2 * (1 - t) * t * CX + t * t * GX,
  (1 - t) ** 2 * AY + 2 * (1 - t) * t * CY + t * t * GY,
];
const bezD = (t: number) => [2 * (1 - t) * (CX - AX) + 2 * t * (GX - CX), 2 * (1 - t) * (CY - AY) + 2 * t * (GY - CY)];

// Scène 6 — Carte exacte de l'Afrique de l'Ouest (Natural Earth), trajet Abidjan → Accra, puis Accra.
export const S07Immersion: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = (scene(ID).end - scene(ID).start) * 30;
  const accra = local(ID, CUE.imm_accra);
  const imm = local(ID, CUE.imm_immersion);
  const routeStart = 16;
  const routeEnd = accra - 10;
  const route = interpolate(f, [routeStart, routeEnd], [0, 1], { ...clamp, easing: easeInOut });
  const zoom = interpolate(f, [0, accra - 4], [1, 1.75], { ...clamp, easing: ease });
  const camX = interpolate(f, [0, accra - 4], [500, CX - 15], { ...clamp, easing: ease });
  const camY = interpolate(f, [0, accra - 4], [520, (AY + GY) / 2 - 30], { ...clamp, easing: ease });
  const pinA = spring({ frame: f - 8, fps, config: { damping: 9, stiffness: 180 } });
  const pinG = spring({ frame: f - (routeEnd - 2), fps, config: { damping: 9, stiffness: 180 } });
  const [px, py] = bez(route);
  const [dx, dy] = bezD(Math.min(0.999, Math.max(0.001, route)));
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  // passage à la photo d'Accra : ouverture circulaire depuis l'épingle
  const open = interpolate(f, [accra + 2, accra + 22], [0, 1], { ...clamp, easing: ease });
  const photoOn = open > 0;
  const titleS = spring({ frame: f - imm + 4, fps, config: { damping: 14 } });
  const sub = local(ID, CUE.imm_ghana);
  const b1 = spring({ frame: f - accra - 16, fps, config: { damping: 13 } });
  const b2 = spring({ frame: f - accra - 30, fps, config: { damping: 13 } });
  const card = spring({ frame: f - accra - 22, fps, config: { damping: 14 } });
  const S = 1080 / 1000; // échelle carte → écran
  const mapTop = 380;
  const pinScreen = { x: 540 + (GX - camX) * S * zoom, y: mapTop + 540 + (GY - camY) * S * zoom };

  return (
    <AbsoluteFill style={{ background: "#00113F" }}>
      {/* CARTE */}
      <AbsoluteFill>
        <div style={{ position: "absolute", left: 0, top: mapTop, width: 1080, height: 1080, overflow: "visible" }}>
          <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `scale(${zoom}) translate(${(500 - camX) * S}px, ${(500 - camY) * S}px)` }}>
            <svg width={1080} height={1080} viewBox="0 0 1000 1000" style={{ overflow: "visible" }}>
              <defs>
                <radialGradient id="sea" cx="50%" cy="80%" r="70%"><stop offset="0" stopColor="#0A2A86" /><stop offset="1" stopColor="#00113F" /></radialGradient>
                <filter id="glow"><feGaussianBlur stdDeviation="4" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <rect x={-600} y={-600} width={2200} height={2200} fill="url(#sea)" />
              {/* graticule */}
              {new Array(14).fill(0).map((_, i) => <line key={"v" + i} x1={i * 80 - 40} y1={-400} x2={i * 80 - 40} y2={1400} stroke="rgba(255,255,255,0.05)" />)}
              {new Array(14).fill(0).map((_, i) => <line key={"h" + i} x1={-400} y1={i * 80 - 40} x2={1400} y2={i * 80 - 40} stroke="rgba(255,255,255,0.05)" />)}
              {map.countries.map((c) => {
                const hl = c.id === "384" || c.id === "288";
                return <path key={c.id} d={c.d} fill={hl ? "#16449F" : "#0E2C78"} stroke={hl ? C.gold : "rgba(255,255,255,0.28)"} strokeWidth={hl ? 2.2 / zoom : 1 / zoom} strokeLinejoin="round" />;
              })}
              <text x={385} y={500} fill="rgba(255,255,255,0.75)" fontFamily="Montserrat" fontWeight={700} fontSize={22} textAnchor="middle" letterSpacing={3}>CÔTE D'IVOIRE</text>
              <text x={630} y={480} fill="rgba(255,255,255,0.75)" fontFamily="Montserrat" fontWeight={700} fontSize={22} textAnchor="middle" letterSpacing={3}>GHANA</text>
              <text x={560} y={790} fill="rgba(255,255,255,0.38)" fontFamily="DM Serif Display" fontStyle="italic" fontSize={26} textAnchor="middle">Golfe de Guinée</text>
              {/* trajet */}
              <path d={`M ${AX} ${AY} Q ${CX} ${CY} ${GX} ${GY}`} fill="none" stroke="rgba(249,197,12,0.25)" strokeWidth={3 / zoom * 1.4} strokeDasharray="2 8" />
              <path d={`M ${AX} ${AY} Q ${CX} ${CY} ${GX} ${GY}`} fill="none" stroke={C.gold} strokeWidth={5 / zoom * 1.4} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - route} filter="url(#glow)" />
              {/* villes */}
              {[{ x: AX, y: AY, p: pinA, n: "ABIDJAN", dx: -16, anchor: "end" }, { x: GX, y: GY, p: pinG, n: "ACCRA", dx: 16, anchor: "start" }].map((c) => (
                <g key={c.n} transform={`translate(${c.x} ${c.y})`}>
                  <circle r={(18 + ((f % 40) / 40) * 30) / zoom * 1.3} fill="none" stroke={C.gold} strokeWidth={2 / zoom} opacity={c.p * (1 - (f % 40) / 40)} />
                  <circle r={(9 / zoom) * 1.3 * c.p} fill={C.gold} stroke={C.white} strokeWidth={2.5 / zoom} />
                  <text x={c.dx / zoom * 1.3} y={-14 / zoom * 1.3} fill={C.white} fontFamily="Montserrat" fontWeight={900} fontSize={(30 / zoom) * 1.3} textAnchor={c.anchor as "end" | "start"} opacity={c.p} style={{ paintOrder: "stroke" }} stroke="#00113F" strokeWidth={6 / zoom}>{c.n}</text>
                </g>
              ))}
            </svg>
          </div>
          {/* avion */}
          {route > 0.01 && route < 0.995 && (
            <div style={{ position: "absolute", left: 540 + (px - camX) * S * zoom - 30, top: 540 + (py - camY) * S * zoom - 30, transform: `rotate(${ang + 45}deg)` }}>
              <IPlane size={60} color={C.white} stroke={2} style={{ filter: "drop-shadow(0 0 8px rgba(249,197,12,0.9))" }} />
            </div>
          )}
        </div>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, #00113F 0%, rgba(0,17,63,0.6) 18%, rgba(0,17,63,0) 30%, rgba(0,17,63,0) 80%, #00113F 100%)" }} />
      </AbsoluteFill>

      {/* PHOTO D'ACCRA (ouverture circulaire depuis l'épingle) */}
      {photoOn && (
        <AbsoluteFill style={{ clipPath: `circle(${open * 2300}px at ${pinScreen.x}px ${pinScreen.y}px)` }}>
          <KenBurns src="images/v-accra-street.jpg" dur={dur - accra} from={1.18} to={1.06} origin="50% 60%" filter="saturate(1.08) contrast(1.04)" />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,11,51,0.8) 0%, rgba(0,11,51,0.1) 30%, rgba(0,11,51,0.1) 55%, rgba(0,11,51,0.92) 85%)" }} />
          <div style={{ position: "absolute", left: 70, top: 980, width: 560, height: 330, borderRadius: 26, overflow: "hidden", border: `3px solid ${C.white}`, boxShadow: "0 24px 50px rgba(0,0,0,0.5)", transform: `rotate(${-4 + card * 2}deg) translateY(${(1 - card) * 200}px)`, opacity: card }}>
            <Img src={staticFile("images/h-accra-market.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "35% 40%" }} />
          </div>
          <Bubble text="Hi! Welcome to Accra!" p={b1} side="left" style={{ left: 420, top: 900 }} />
          <Bubble text="Thank you! I love it here." p={b2} side="right" dark style={{ right: 150, top: 1330, fontSize: 34 }} />
        </AbsoluteFill>
      )}

      {/* Titres */}
      <div style={{ position: "absolute", top: 240, left: 70, right: 70, textAlign: "center", opacity: titleS, transform: `translateY(${(1 - titleS) * -40}px)` }}>
        <Kicker style={{ fontSize: 30 }}>Immersion linguistique</Kicker>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 110, color: C.white, lineHeight: 1, marginTop: 10 }}>À <span style={{ color: C.gold }}>ACCRA</span></div>
      </div>
      <div style={{ position: "absolute", top: 1420, left: 70, right: 70, textAlign: "center" }}>
        <Words text="Vivez l'anglais au quotidien." start={Math.max(sub, accra + 8)} stagger={3} style={{ fontFamily: F.serif, fontStyle: "italic", fontSize: 70, color: C.white, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }} />
      </div>
      <GoldParticles count={16} seed="s7" opacity={0.4} />
      <Finish vignette={0.45} />
    </AbsoluteFill>
  );
};
