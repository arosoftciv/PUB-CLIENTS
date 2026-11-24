// Composants éditoriaux réutilisables.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, SAFE, CONTENT_W, clamp, EASE } from "../styles/theme";
import { appear, pop, rise, wipe, vanish } from "../animations/anim";

/** Typographie française : espaces insécables avant ? ! : ; » et dans les nombres. */
export const nb = (t: string) => t.replace(/ ([?!:;»])/g, "\u00A0$1").replace(/« /g, "«\u00A0").replace(/(\d) (\d{3})/g, "$1\u202F$2");

/** Titre typographique cinétique, ligne par ligne. */
export const DocumentaryTitle: React.FC<{
  lines: { text: string; color?: string; size?: number; font?: "title" | "mono" | "text"; weight?: number }[];
  at?: number;
  stagger?: number;
  align?: "left" | "center";
  style?: React.CSSProperties;
}> = ({ lines, at = 0, stagger = 7, align = "left", style }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", ...style }}>
      {lines.map((l, i) => {
        const p = appear(frame, at + i * stagger, 20);
        return (
          <div key={i} style={{ overflow: "hidden", paddingBottom: 4 }}>
            <div
              style={{
                fontFamily: l.font === "mono" ? F.mono : l.font === "text" ? F.text : F.title,
                fontWeight: l.weight ?? (l.font === "text" ? 500 : 800),
                fontSize: l.size ?? 120,
                lineHeight: 1.0,
                color: l.color ?? C.white,
                textTransform: l.font === "text" ? "none" : "uppercase",
                letterSpacing: l.font === "mono" ? 2 : 0.5,
                transform: `translateY(${(1 - p) * 110}%)`,
                opacity: Math.min(1, p * 1.6),
                textAlign: align,
              }}
            >
              {nb(l.text)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Compteur numérique progressif. */
export const AnimatedCounter: React.FC<{
  to: number;
  at: number;
  dur?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ to, at, dur = 36, decimals = 0, suffix = "", prefix = "", size = 160, color = C.white, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: EASE.out });
  const v = to * p;
  const txt = v
    .toFixed(decimals)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (
    <div
      style={{
        fontFamily: F.mono,
        fontWeight: 600,
        fontSize: size,
        color,
        opacity: appear(frame, at, 8),
        fontVariantNumeric: "tabular-nums",
        letterSpacing: -2,
        lineHeight: 1,
        ...style,
      }}
    >
      {prefix}
      {txt}
      {suffix}
    </div>
  );
};

/** Horloge numérique (HH:MM) avec bascule de minute. */
export const AnimatedClock: React.FC<{
  from: string;
  to?: string;
  flipAt?: number;
  at?: number;
  size?: number;
  color?: string;
  flipColor?: string;
  style?: React.CSSProperties;
}> = ({ from, to, flipAt = 1e9, at = 0, size = 200, color = C.white, flipColor = C.red, style }) => {
  const frame = useCurrentFrame();
  const flipped = to && frame >= flipAt;
  const p = appear(frame, at, 16);
  const flash = to && frame >= flipAt ? interpolate(frame, [flipAt, flipAt + 10], [1, 0], clamp) : 0;
  const colon = Math.floor(frame / 15) % 2 === 0 ? 1 : 0.25;
  const [h, m] = (flipped ? to! : from).split(":");
  return (
    <div
      style={{
        fontFamily: F.mono,
        fontWeight: 500,
        fontSize: size,
        color: flipped ? flipColor : color,
        opacity: p,
        letterSpacing: -4,
        display: "flex",
        textShadow: flash > 0 ? `0 0 ${40 * flash}px ${flipColor}` : "none",
        transform: `scale(${1 + flash * 0.05})`,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      <span>{h}</span>
      <span style={{ opacity: colon }}>:</span>
      <span>{m}</span>
    </div>
  );
};

/** Carte de constat éditorial — jamais présentée comme un document original. */
export const EvidenceCard: React.FC<{
  kicker: string;
  body: React.ReactNode;
  source?: string;
  at: number;
  accent?: string;
  style?: React.CSSProperties;
  width?: number;
}> = ({ kicker, body, source, at, accent = C.red, style, width = CONTENT_W }) => {
  const frame = useCurrentFrame();
  const p = appear(frame, at, 22);
  const bar = appear(frame, at + 4, 26);
  return (
    <div
      style={{
        width,
        background: C.panel,
        borderLeft: `8px solid ${accent}`,
        padding: "34px 40px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        ...rise(p, 50),
        ...style,
      }}
    >
      <div style={{ fontFamily: F.mono, fontSize: 24, color: accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>
        {kicker}
      </div>
      <div style={{ height: 2, background: C.line, width: `${bar * 100}%`, marginBottom: 22 }} />
      <div style={{ fontFamily: F.text, fontSize: 40, lineHeight: 1.32, color: C.white, fontWeight: 500 }}>{body}</div>
      {source ? (
        <div style={{ fontFamily: F.mono, fontSize: 20, color: C.dim, marginTop: 22 }}>{source}</div>
      ) : null}
    </div>
  );
};

/** En-tête de révélation : grand numéro puis bandeau compact en haut. */
export const InvestigationChapter: React.FC<{ n: number; title: string; settleAt?: number }> = ({ n, title, settleAt = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = pop(frame, 2, fps, 16);
  const settle = interpolate(frame, [settleAt, settleAt + 22], [0, 1], { ...clamp, easing: EASE.inOut });
  const num = String(n).padStart(2, "0");
  const titleP = appear(frame, 10, 22);
  // Grand format (centre) → compact (haut)
  const bigOpacity = 1 - settle;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: 520 - settle * 120,
          opacity: bigOpacity,
          width: CONTENT_W,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: 8, color: C.red, ...rise(inP, 20) }}>RÉVÉLATION</div>
        <div
          style={{
            fontFamily: F.title,
            fontWeight: 800,
            fontSize: 420,
            lineHeight: 0.85,
            color: "transparent",
            WebkitTextStroke: `4px ${C.white}`,
            transform: `scale(${0.85 + inP * 0.15})`,
            transformOrigin: "left center",
            opacity: inP,
          }}
        >
          {num}
        </div>
        <div style={{ height: 6, width: 160 * titleP, background: C.red, margin: "28px 0" }} />
        <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 96, lineHeight: 1, color: C.white, textTransform: "uppercase", ...wipe(titleP) }}>
          {nb(title)}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: SAFE.top,
          width: CONTENT_W,
          display: "flex",
          alignItems: "center",
          gap: 22,
          opacity: settle,
          transform: `translateY(${(1 - settle) * 30}px)`,
        }}
      >
        <div
          style={{
            fontFamily: F.title,
            fontWeight: 800,
            fontSize: 76,
            color: C.black,
            background: C.red,
            padding: "0 16px",
            lineHeight: 1.1,
          }}
        >
          {num}
        </div>
        <div style={{ fontFamily: F.title, fontWeight: 700, fontSize: 46, color: C.white, textTransform: "uppercase", lineHeight: 1.0 }}>
          {nb(title)}
        </div>
      </div>
    </>
  );
};

/** Écran divisé : version officielle / constat du journal. */
export const SplitScreenComparison: React.FC<{
  at: number;
  left: { label: string; title: string; note?: string; media?: React.ReactNode };
  right: { label: string; title: string; note?: string; media?: React.ReactNode };
  top?: number;
  height?: number;
}> = ({ at, left, right, top = 300, height = 900 }) => {
  const frame = useCurrentFrame();
  const p = appear(frame, at, 24);
  const q = appear(frame, at + 12, 24);
  const W = (CONTENT_W - 20) / 2;
  const Pane = ({ d, prog, accent, x }: { d: typeof left; prog: number; accent: string; x: number }) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: W,
        height,
        background: C.panel,
        borderTop: `8px solid ${accent}`,
        overflow: "hidden",
        opacity: prog,
        transform: `translateY(${(1 - prog) * 60}px)`,
      }}
    >
      <div style={{ position: "absolute", inset: 0, top: 0, height: height * 0.55, overflow: "hidden" }}>{d.media}</div>
      <div style={{ position: "absolute", left: 26, right: 26, top: height * 0.58 }}>
        <div style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: 3, color: accent }}>{d.label}</div>
        <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 64, color: C.white, lineHeight: 1, marginTop: 14, textTransform: "uppercase" }}>
          {d.title}
        </div>
        {d.note ? (
          <div style={{ fontFamily: F.text, fontStyle: "italic", fontSize: 24, color: C.dim, marginTop: 16, lineHeight: 1.3 }}>{d.note}</div>
        ) : null}
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: SAFE.left, top, width: CONTENT_W, height }}>
      <Pane d={left} prog={p} accent={C.grey} x={0} />
      <Pane d={right} prog={q} accent={C.red} x={W + 20} />
      <div
        style={{
          position: "absolute",
          left: W - 30,
          top: height * 0.5 - 40,
          width: 80,
          height: 80,
          borderRadius: 40,
          background: C.black,
          border: `2px solid ${C.white}`,
          color: C.white,
          fontFamily: F.title,
          fontWeight: 800,
          fontSize: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: q,
        }}
      >
        VS
      </div>
    </div>
  );
};

/** Carte d'interrogation (scène 13). */
export const QuestionCard: React.FC<{ text: string; index: number; total: number; at: number; end: number }> = ({ text, index, total, at, end }) => {
  const frame = useCurrentFrame();
  const p = appear(frame, at, 20);
  const out = vanish(frame, end - 10, 10);
  const q = appear(frame, at + 6, 30);
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: 560,
        width: CONTENT_W,
        opacity: Math.min(p, out),
        transform: `translateY(${(1 - p) * 40 - (1 - out) * 30}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 26 }}>
        <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 200, color: C.amber, lineHeight: 0.8, transform: `scale(${0.7 + q * 0.3})`, transformOrigin: "left bottom" }}>
          ?
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 28, color: C.dim, letterSpacing: 3 }}>
          QUESTION {index}/{total}
        </div>
      </div>
      <div style={{ height: 3, background: C.amber, width: `${q * 100}%`, marginBottom: 30, opacity: 0.8 }} />
      <div style={{ fontFamily: F.title, fontWeight: 700, fontSize: 80, lineHeight: 1.05, color: C.white, textTransform: "uppercase" }}>{nb(text)}</div>
    </div>
  );
};

/** Frise chronologique verticale (sans flèches de causalité). */
export const Timeline: React.FC<{
  items: { date: string; label: string; at: number; accent?: string }[];
  top?: number;
  spacing?: number;
}> = ({ items, top = 380, spacing = 128 }) => {
  const frame = useCurrentFrame();
  // défilement doux quand la liste dépasse la zone visible
  const visible = items.filter((i) => frame >= i.at).length;
  const scroll = interpolate(frame, items.map((i) => i.at), items.map((_, k) => Math.max(0, k - 7) * spacing), clamp);
  const lineH = interpolate(frame, [items[0].at, items[items.length - 1].at + 20], [0, (items.length - 1) * spacing], clamp);
  return (
    <div style={{ position: "absolute", left: SAFE.left, top: top - scroll, width: CONTENT_W }}>
      <div style={{ position: "absolute", left: 18, top: 24, width: 3, height: lineH, background: C.line }} />
      {items.map((it, k) => {
        const p = appear(frame, it.at, 18);
        const active = k === visible - 1;
        return (
          <div key={k} style={{ position: "absolute", top: k * spacing, left: 0, display: "flex", gap: 34, opacity: p, transform: `translateX(${(1 - p) * 40}px)` }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginTop: 4,
                border: `3px solid ${it.accent ?? C.white}`,
                background: active ? (it.accent ?? C.white) : C.black,
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 34, color: it.accent ?? C.white, letterSpacing: 1 }}>{it.date}</div>
              <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 32, color: active ? C.white : C.dim, marginTop: 6, maxWidth: 760, lineHeight: 1.25 }}>
                {it.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Flux financier rapporté — sans représentation de détournement. */
export const FinancialFlow: React.FC<{ at: number; questionAt: number; top?: number }> = ({ at, questionAt, top = 330 }) => {
  const frame = useCurrentFrame();
  const n1 = appear(frame, at, 20);
  const a1 = appear(frame, at + 18, 26);
  const n2 = appear(frame, at + 30, 20);
  const a2 = appear(frame, at + 50, 30);
  const n3 = appear(frame, at + 62, 20);
  const qm = appear(frame, questionAt, 24);
  const Node = ({ label, sub, y, p, color = C.white }: { label: string; sub?: string; y: number; p: number; color?: string }) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: CONTENT_W,
        display: "flex",
        justifyContent: "center",
        opacity: p,
        transform: `scale(${0.9 + p * 0.1})`,
      }}
    >
      <div style={{ border: `3px solid ${color}`, background: C.panel, padding: "22px 34px", textAlign: "center", minWidth: 520 }}>
        <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 54, color, textTransform: "uppercase", lineHeight: 1 }}>{label}</div>
        {sub ? <div style={{ fontFamily: F.text, fontSize: 24, color: C.dim, marginTop: 8 }}>{sub}</div> : null}
      </div>
    </div>
  );
  const cx = CONTENT_W / 2;
  return (
    <div style={{ position: "absolute", left: SAFE.left, top, width: CONTENT_W, height: 900 }}>
      <svg width={CONTENT_W} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={cx} y1={130} x2={cx} y2={130 + 210 * a1} stroke={C.white} strokeWidth={4} />
        <line x1={cx} y1={470} x2={cx} y2={470 + 230 * a2} stroke={C.amber} strokeWidth={4} strokeDasharray="14 14" />
      </svg>
      <Node label="Parents d'élèves" y={0} p={n1} />
      <div style={{ position: "absolute", left: cx + 30, top: 190, opacity: a1, fontFamily: F.mono, fontSize: 44, fontWeight: 600, color: C.white }}>
        27&#8239;000 FCFA
        <div style={{ fontFamily: F.text, fontStyle: "italic", fontSize: 22, color: C.amber, fontWeight: 400 }}>versés, selon les témoignages</div>
      </div>
      <Node label="Administration du lycée" sub="encaissement rapporté" y={340} p={n2} />
      <Node label="SOTRA" sub="transporteur" y={700} p={n3} color={C.grey} />
      <div
        style={{
          position: "absolute",
          left: cx - 230,
          top: 520,
          fontFamily: F.title,
          fontWeight: 800,
          fontSize: 150,
          color: C.amber,
          opacity: Math.max(qm, a2 * 0.0),
          transform: `scale(${0.6 + qm * 0.4})`,
          lineHeight: 1,
        }}
      >
        ?
      </div>
      <div
        style={{
          position: "absolute",
          left: cx + 30,
          top: 545,
          opacity: a2,
          fontFamily: F.text,
          fontStyle: "italic",
          fontSize: 24,
          color: C.amber,
          width: 380,
        }}
      >
        circuit financier non établi par l'enquête
      </div>
    </div>
  );
};

/** Sous-titres synchronisés (2 lignes max). */
export const SubtitleOverlay: React.FC<{ cues: { start: number; end: number; text: string; scene?: string }[]; hide?: (c: { scene?: string; text: string }) => boolean }> = ({
  cues,
  hide,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const c = cues.find((x) => t >= x.start && t < x.end);
  if (!c || (hide && hide(c))) return null;
  const local = (t - c.start) * fps;
  const p = interpolate(local, [0, 4], [0, 1], clamp);
  const KEY = /(27[\s\u202F]?000|SOTRA|COGES|7 heures 30|6 heures 54|contradiction|aucune|Bien|seize ans)/gi;
  const parts = nb(c.text).split(KEY);
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left - 12,
        width: SAFE.W - SAFE.left - SAFE.right + 24 + 40,
        bottom: SAFE.subtitleBottom,
        display: "flex",
        justifyContent: "center",
        opacity: p,
      }}
    >
      <div
        style={{
          background: "rgba(11,13,16,0.72)",
          padding: "14px 26px",
          borderRadius: 6,
          fontFamily: F.text,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: 1.28,
          color: C.white,
          textAlign: "center",
          whiteSpace: "pre-line",
          maxWidth: 940,
        }}
      >
        {parts.map((s, i) =>
          i % 2 === 1 ? (
            <span key={i} style={{ color: C.amber }}>
              {s}
            </span>
          ) : (
            <React.Fragment key={i}>{s}</React.Fragment>
          ),
        )}
      </div>
    </div>
  );
};
