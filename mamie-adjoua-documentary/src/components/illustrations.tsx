// Illustrations neutres (traits, schémas). Toute reconstitution porte l'étiquette dédiée.
import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, clamp, EASE } from "../styles/theme";
import { appear } from "../animations/anim";
import map from "../data/map.json";
import { ASSETS } from "../data/assets";

/** Portail stylisé : deux vantaux de barreaux qui se ferment (p: 0 ouvert → 1 fermé). */
export const GateGraphic: React.FC<{ p: number; width?: number; height?: number; color?: string }> = ({ p, width = 760, height = 520, color = C.white }) => {
  const half = width / 2;
  const bars = 9;
  const Leaf = ({ side }: { side: -1 | 1 }) => {
    const offset = (1 - p) * (half + 20) * side;
    return (
      <g transform={`translate(${offset},0)`}>
        {Array.from({ length: bars }).map((_, i) => {
          const x = side === -1 ? 12 + (i * (half - 24)) / (bars - 1) : half + 12 + (i * (half - 24)) / (bars - 1);
          return <rect key={i} x={x - 5} y={40} width={10} height={height - 60} fill={color} />;
        })}
        <rect x={side === -1 ? 0 : half} y={60} width={half} height={12} fill={color} />
        <rect x={side === -1 ? 0 : half} y={height - 90} width={half} height={12} fill={color} />
        {Array.from({ length: bars }).map((_, i) => {
          const x = side === -1 ? 12 + (i * (half - 24)) / (bars - 1) : half + 12 + (i * (half - 24)) / (bars - 1);
          return <polygon key={`t${i}`} points={`${x - 12},40 ${x},10 ${x + 12},40`} fill={color} />;
        })}
      </g>
    );
  };
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "hidden" }}>
      <rect x={0} y={height - 18} width={width} height={6} fill={C.grey} opacity={0.5} />
      <Leaf side={-1} />
      <Leaf side={1} />
      {p > 0.98 ? <rect x={half - 18} y={height / 2 - 20} width={36} height={44} rx={6} fill={C.red} /> : null}
    </svg>
  );
};

/** Bus scolaire schématique (pas une représentation de véhicule réel). */
export const BusGraphic: React.FC<{ width?: number; color?: string; accent?: string }> = ({ width = 640, color = C.white, accent = C.red }) => {
  const h = width * 0.42;
  return (
    <svg width={width} height={h} viewBox="0 0 640 270">
      <rect x={20} y={30} width={590} height={190} rx={26} fill="none" stroke={color} strokeWidth={8} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={60 + i * 96} y={62} width={76} height={64} rx={6} fill="none" stroke={color} strokeWidth={5} />
      ))}
      <rect x={540} y={62} width={50} height={130} rx={6} fill="none" stroke={color} strokeWidth={5} />
      <rect x={20} y={150} width={590} height={14} fill={accent} />
      <circle cx={150} cy={222} r={34} fill={C.black} stroke={color} strokeWidth={8} />
      <circle cx={480} cy={222} r={34} fill={C.black} stroke={color} strokeWidth={8} />
      <text x={70} y={200} fill={color} fontFamily="IBM Plex Mono" fontSize={26} letterSpacing={3}>
        TRANSPORT SCOLAIRE
      </text>
    </svg>
  );
};

/** Silhouette anonyme (identité de l'élève protégée). */
export const Silhouette: React.FC<{ size?: number; color?: string }> = ({ size = 360, color = "#3A404A" }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <circle cx={100} cy={72} r={40} fill={color} />
    <path d="M30 196 C30 140 60 122 100 122 C140 122 170 140 170 196 Z" fill={color} />
  </svg>
);

/** Smartphone générique avec contenu. */
export const Phone: React.FC<{ width?: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ width = 460, children, style }) => {
  const h = width * 2.05;
  return (
    <div
      style={{
        width,
        height: h,
        borderRadius: width * 0.13,
        border: `10px solid #2C3139`,
        background: "#111418",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ position: "absolute", top: 18, left: "50%", width: 120, height: 26, marginLeft: -60, borderRadius: 14, background: "#000", zIndex: 3 }} />
      {children}
    </div>
  );
};

/** Notification générique de réseau social (aucune marque, aucun chiffre). */
export const Notification: React.FC<{ icon: string; text: string; p: number; style?: React.CSSProperties }> = ({ icon, text, p, style }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      background: "rgba(245,245,240,0.95)",
      color: C.black,
      borderRadius: 18,
      padding: "14px 20px",
      fontFamily: F.text,
      fontWeight: 600,
      fontSize: 24,
      boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
      opacity: p,
      transform: `translateY(${(1 - p) * -30}px) scale(${0.92 + p * 0.08})`,
      ...style,
    }}
  >
    <div style={{ width: 40, height: 40, borderRadius: 10, background: C.red, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
      {icon}
    </div>
    {text}
  </div>
);

/** Carte de la Côte d'Ivoire (Natural Earth). */
export const MapCI: React.FC<{
  draw: number;
  zoom?: { s: number; cx: number; cy: number };
  markers?: { key: "yamoussoukro" | "abidjan" | "marcory"; label: string; p: number; color?: string; dx?: number; dy?: number }[];
  route?: { from: "yamoussoukro" | "abidjan"; to: "abidjan" | "marcory" | "yamoussoukro"; p: number };
  size?: number;
}> = ({ draw, zoom = { s: 1, cx: 450, cy: 450 }, markers = [], route, size = 900 }) => {
  const frame = useCurrentFrame();
  const cities = map.cities as Record<string, number[]>;
  const tx = 450 - zoom.cx * zoom.s;
  const ty = 450 - zoom.cy * zoom.s;
  const inv = 1 / zoom.s;
  return (
    <svg width={size} height={size} viewBox="0 0 900 900">
      <g transform={`translate(${tx},${ty}) scale(${zoom.s})`}>
        {map.neighbours.map((n) => (
          <path key={n.id} d={n.d} fill="#15191F" stroke={C.grey} strokeOpacity={0.35} strokeWidth={1.5 * inv} opacity={draw} />
        ))}
        <path d={map.civ} fill={`rgba(36,40,48,${0.9 * draw})`} stroke="none" />
        <path d={map.civ} fill="none" stroke={C.white} strokeWidth={3 * inv} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        {route ? (() => {
          const a = cities[route.from];
          const b = cities[route.to];
          const mx = (a[0] + b[0]) / 2 + 40;
          const my = (a[1] + b[1]) / 2 - 60;
          return (
            <path
              d={`M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`}
              fill="none"
              stroke={C.red}
              strokeWidth={4 * inv}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - route.p}
            />
          );
        })() : null}
        {markers.map((m) => {
          const [x, y] = cities[m.key];
          const pulse = (frame % 45) / 45;
          const col = m.color ?? C.red;
          return (
            <g key={m.key} opacity={m.p}>
              <circle cx={x} cy={y} r={(10 + pulse * 26) * inv} fill="none" stroke={col} strokeWidth={2 * inv} opacity={1 - pulse} />
              <circle cx={x} cy={y} r={8 * inv} fill={col} />
              <text
                x={x + (m.dx ?? 18) * inv}
                y={y + (m.dy ?? -16) * inv}
                fill={C.white}
                fontFamily="Barlow Condensed"
                fontWeight={700}
                fontSize={38 * inv}
                letterSpacing={2 * inv}
              >
                {m.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/** Bloc calendrier (date mise en avant). */
export const CalendarCard: React.FC<{ weekday: string; day: string; month: string; p: number; accent?: string; note?: string }> = ({
  weekday,
  day,
  month,
  p,
  accent = C.red,
  note,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 34, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
    <div style={{ width: 230, background: C.white, borderRadius: 10, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
      <div style={{ background: accent, color: C.white, fontFamily: F.title, fontWeight: 700, fontSize: 34, textAlign: "center", padding: "8px 0", letterSpacing: 2 }}>
        {month}
      </div>
      <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 150, color: C.black, textAlign: "center", lineHeight: 1.05 }}>{day}</div>
    </div>
    <div>
      <div style={{ fontFamily: F.mono, fontSize: 30, color: accent, letterSpacing: 3 }}>{weekday}</div>
      {note ? <div style={{ fontFamily: F.text, fontSize: 32, color: C.white, marginTop: 10, maxWidth: 520, lineHeight: 1.3 }}>{note}</div> : null}
    </div>
  </div>
);

/** Révélation de la couverture / visuel du journal. */
export const NewspaperReveal: React.FC<{ at: number; width?: number; rotate?: number; style?: React.CSSProperties }> = ({ at, width = 560, rotate = -4, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 26], [0, 1], { ...clamp, easing: EASE.out });
  const drift = interpolate(frame, [at, at + 300], [0, 1], clamp);
  return (
    <div
      style={{
        width,
        transform: `perspective(1600px) rotateY(${(1 - p) * -55}deg) rotate(${rotate + drift * 1.5}deg) scale(${0.9 + p * 0.1 + drift * 0.04})`,
        transformOrigin: "left center",
        opacity: appear(frame, at, 10),
        boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
        ...style,
      }}
    >
      <Img src={staticFile(ASSETS.newspaperFrontPage ?? ASSETS.coverPoster)} style={{ width: "100%", display: "block" }} />
    </div>
  );
};
