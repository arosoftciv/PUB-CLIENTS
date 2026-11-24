// Scènes 01 à 04 : accroche, contexte, vidéo virale, présentation de l'investigation.
import React from "react";
import { AbsoluteFill, Img, Loop, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, SAFE, CONTENT_W, clamp, EASE } from "../styles/theme";
import { appear, between, rise, wipe } from "../animations/anim";
import { SceneTiming, segFrame, f } from "../data/timeline";
import { Backdrop, Photo, PhotoCard, SourceReference, ReconstitutionTag, Chip, Caption, Attribution } from "../components/base";
import { AnimatedClock, DocumentaryTitle } from "../components/editorial";
import { GateGraphic, Phone, Notification, Silhouette, BusGraphic, NewspaperReveal } from "../components/illustrations";
import { ASSETS, STUDENT_VIDEO_BLUR } from "../data/assets";
import media from "../data/media.json";

type StudentVideo = { src: string; duration: number; width: number; height: number } | null;
const STUDENT_VIDEO = (media as { studentVideo: StudentVideo }).studentVideo;

type P = { sc: SceneTiming };

// ------------------------------------------------------------------ S01 — Hook
/** Bulle de commentaire générique (aucun texte inventé). */
const CommentBubble: React.FC<{ p: number; w?: number; style?: React.CSSProperties }> = ({ p, w = 300, style }) => (
  <div style={{ position: "absolute", opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + p * 0.1})`, ...style }}>
    <div style={{ background: "rgba(245,245,240,0.94)", borderRadius: 22, padding: "16px 20px", width: w, display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: 22, background: "#9AA4AD", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, borderRadius: 6, background: "#B8BFC6", width: "80%", marginBottom: 10 }} />
        <div style={{ height: 12, borderRadius: 6, background: "#CDD2D7", width: "55%" }} />
      </div>
    </div>
    <div style={{ width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "16px solid rgba(245,245,240,0.94)", marginLeft: 36 }} />
  </div>
);

const ShareIcon: React.FC<{ glyph: string; p: number; x: number; y: number }> = ({ glyph, p, x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y - p * 140,
      width: 74,
      height: 74,
      borderRadius: 37,
      background: C.red,
      color: C.white,
      fontSize: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: p > 0 ? Math.min(1, p * 4) * (1 - Math.max(0, p - 0.7) / 0.3) : 0,
      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    }}
  >
    {glyph}
  </div>
);

export const S01Hook: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const ch = segFrame(sc, "chronique");
  const en = segFrame(sc, "enquete");
  const rs = segFrame(sc, "resume");
  // --- Séquence 1 : l'affaire
  const seq1 = 1 - appear(frame, en - 8, 12);
  const titleAt = ch + f(2.4); // « … le lycée d'excellence Mamie Adjoua »
  const chipAt = ch + f(5.0); // « … défraye la chronique »
  const socialAt = ch + f(2.6);
  // --- Séquence 2 : le journal
  const seq2 = Math.min(appear(frame, en - 6, 12), 1 - appear(frame, rs - 8, 10));
  const zoom = interpolate(frame, [en, rs], [1, 1.35], { ...clamp, easing: EASE.inOut });
  const cardsAt = en + f(2.4);
  // --- Séquence 3 : la promesse (montage rapide)
  const seq3 = appear(frame, rs - 6, 8);
  const rsLen = segFrame(sc, "resume", "end") - rs;
  const beat = Math.max(f(0.6), Math.min(f(0.85), Math.floor((rsLen - f(0.6)) / 6)));
  // ordre : 07:30 → élève → portail → proviseure → bus → 27 000 FCFA
  const montage = [0, 1, 2, 3, 4, 5].map((k) => rs + f(0.15) + k * beat);
  const slot = (k: number) => Math.min(appear(frame, montage[k], 5), k < 5 ? 1 - appear(frame, montage[k + 1], 5) : 1);
  const order = { clock: 0, student: 1, gate: 2, principal: 3, bus: 4, money: 5 };
  return (
    <AbsoluteFill style={{ background: C.black }}>
      {/* ===== Séquence 1 ===== */}
      {seq1 > 0 ? (
        <AbsoluteFill style={{ opacity: seq1 }}>
          <Photo src={ASSETS.gate1} frame={frame} dur={en} from={{ s: 1.08, x: 0, y: 0 }} to={{ s: 1.22, x: -10, y: 40 }} style={{ left: 0, top: 0, width: SAFE.W, height: SAFE.H }} />
          <AbsoluteFill style={{ background: "linear-gradient(rgba(11,13,16,0.55) 0%, rgba(11,13,16,0.25) 35%, rgba(11,13,16,0.9) 75%)" }} />
          {/* Polémique sur les réseaux : éléments génériques */}
          <Notification icon="▶" text="Nouvelle vidéo" p={between(frame, socialAt, Infinity)} style={{ position: "absolute", left: SAFE.left, top: 230, width: 340 }} />
          <Notification icon="↗" text="Partagé" p={between(frame, socialAt + f(0.45), Infinity)} style={{ position: "absolute", left: 520, top: 320, width: 300 }} />
          <CommentBubble p={appear(frame, socialAt + f(0.9), 14)} style={{ left: SAFE.left + 30, top: 420 }} />
          <CommentBubble p={appear(frame, socialAt + f(1.35), 14)} w={260} style={{ left: 560, top: 520 }} />
          <Notification icon="✉" text="Commentaires" p={between(frame, socialAt + f(1.8), Infinity)} style={{ position: "absolute", left: SAFE.left + 80, top: 640, width: 340 }} />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <ShareIcon key={k} glyph={["♥", "↗", "✉", "♥", "↗", "♥"][k]} x={700 + (k % 3) * 70 - (k > 2 ? 40 : 0)} y={760} p={interpolate(frame, [socialAt + f(0.5) + k * 9, socialAt + f(0.5) + k * 9 + 40], [0, 1], clamp)} />
          ))}
          <ReconstitutionTag style={{ left: SAFE.left, top: 760 }} opacity={appear(frame, socialAt, 14) * 0.9} />
          <div style={{ position: "absolute", left: SAFE.left, top: 880, width: CONTENT_W }}>
            <DocumentaryTitle
              at={titleAt}
              stagger={8}
              lines={[
                { text: "LYCÉE MAMIE ADJOUA", size: 128 },
                { text: "YAMOUSSOUKRO", size: 44, font: "mono", color: C.dim, weight: 500 },
              ]}
            />
            <div style={{ marginTop: 34, ...wipe(appear(frame, chipAt, 18)) }}>
              <div style={{ display: "inline-block", background: C.red, color: C.white, fontFamily: F.title, fontWeight: 800, fontSize: 52, padding: "6px 20px" }}>
                UNE AFFAIRE QUI DÉFRAYE LA CHRONIQUE
              </div>
            </div>
          </div>
          <Caption style={{ position: "absolute", left: SAFE.left, top: 1290, opacity: appear(frame, titleAt, 14) }}>Photo : portail du lycée (Vivre À Yamoussoukro)</Caption>
        </AbsoluteFill>
      ) : null}

      {/* ===== Séquence 2 ===== */}
      {seq2 > 0 ? (
        <AbsoluteFill style={{ opacity: seq2 }}>
          <Backdrop tint="#1B1416" />
          <div style={{ position: "absolute", left: 230, top: 210, transform: `scale(${zoom})`, transformOrigin: "50% 38%" }}>
            <NewspaperReveal at={en - 4} width={620} rotate={-2} />
          </div>
          {/* Pages / photographies qui défilent */}
          {[
            { src: ASSETS.journalGate, label: "LE PORTAIL FERMÉ", r: -6 },
            { src: ASSETS.busPhoto ?? ASSETS.gate2, label: "LES BUS SOTRA", r: 4 },
          ].map((c, k) => {
            const p = appear(frame, cardsAt + k * f(1.1), 16);
            const out = 1 - appear(frame, cardsAt + k * f(1.1) + f(1.6), 12);
            return (
              <div key={k} style={{ position: "absolute", left: 120 + k * 360, top: 760, width: 420, opacity: Math.min(p, Math.max(out, k === 1 ? 1 : 0)), transform: `translateX(${(1 - p) * (k ? 200 : -200)}px) rotate(${c.r}deg)` }}>
                <div style={{ background: C.white, padding: 12, boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}>
                  <Img src={staticFile(c.src)} style={{ width: "100%", height: 250, objectFit: "cover", display: "block", filter: "saturate(0.75) contrast(1.08)" }} />
                  <div style={{ fontFamily: F.mono, fontSize: 20, color: C.black, marginTop: 8, letterSpacing: 2 }}>{c.label}</div>
                </div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: SAFE.left, top: 1090, width: CONTENT_W, background: "rgba(11,13,16,0.82)", padding: "18px 24px", borderLeft: `8px solid ${C.red}` }}>
            <DocumentaryTitle
              at={en + 6}
              stagger={7}
              lines={[
                { text: "L'ÉLÉPHANT DÉCHAÎNÉ", size: 84 },
                { text: "INVESTIGATION · 23 NOVEMBRE 2026", size: 30, font: "mono", color: C.red, weight: 600 },
              ]}
            />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ===== Séquence 3 ===== */}
      {seq3 > 0 ? (
        <AbsoluteFill style={{ opacity: seq3 }}>
          <Backdrop />
          <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top, width: CONTENT_W }}>
            <DocumentaryTitle at={rs} lines={[{ text: "CE QUE RÉVÈLE", size: 96 }, { text: "L'INVESTIGATION", size: 96, color: C.amber }]} />
          </div>
          <div style={{ position: "absolute", left: SAFE.left, top: 470, width: CONTENT_W, height: 700 }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: slot(order.clock), transform: `scale(${1.08 - 0.08 * slot(order.clock)})` }}>
              <AnimatedClock from="07:30" at={montage[0]} size={240} color={C.red} />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: slot(order.student) }}>
              <PhotoCard src={ASSETS.studentPortrait} at={montage[order.student]} dur={beat} contain label="L'élève" style={{ left: 0, top: 40, width: CONTENT_W, height: 620 }} />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: slot(order.principal) }}>
              <PhotoCard src={ASSETS.principalEvent} at={montage[order.principal]} dur={beat} contain label="La proviseure" style={{ left: 0, top: 40, width: CONTENT_W, height: 620 }} />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: slot(order.gate) }}>
              <Photo src={ASSETS.journalGate} pos="50% 55%" frame={frame - montage[order.gate]} dur={beat} from={{ s: 1.05, x: 0, y: 0 }} to={{ s: 1.15, x: 0, y: 0 }} style={{ left: 0, top: 80, width: CONTENT_W, height: 540 }} />
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: slot(order.bus) }}>
              {ASSETS.busPhoto ? (
                <Photo src={ASSETS.busPhoto} frame={frame - montage[order.bus]} dur={beat} style={{ left: 0, top: 80, width: CONTENT_W, height: 540 }} />
              ) : (
                <>
                  <BusGraphic width={680} />
                  <div style={{ fontFamily: F.mono, fontSize: 28, color: C.white, marginTop: 20, letterSpacing: 3 }}>BUS SOTRA</div>
                </>
              )}
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: slot(order.money) }}>
              <div style={{ fontFamily: F.mono, fontWeight: 600, fontSize: 190, color: C.white, letterSpacing: -4 }}>27&#8239;000</div>
              <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 70, color: C.red }}>FCFA</div>
              <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 120, color: C.amber, marginTop: 10, opacity: appear(frame, montage[order.money] + 14, 10) }}>?</div>
            </div>
          </div>
          {!ASSETS.busPhoto ? <ReconstitutionTag style={{ left: SAFE.left, top: 1210 }} opacity={slot(order.bus)} /> : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ S02 — Carton d'ouverture
export const S02TitleCard: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const D = f(sc.duration);
  const line = appear(frame, 6, 24);
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Photo src={ASSETS.gate1} frame={frame} dur={D} grade="cold" from={{ s: 1.25, x: 0, y: 30 }} to={{ s: 1.15, x: 0, y: 0 }} style={{ left: 0, top: 0, width: SAFE.W, height: SAFE.H, opacity: 0.5 }} />
      {ASSETS.busPhoto ? (
        <Photo src={ASSETS.busPhoto} frame={frame} dur={D} grade="cold" style={{ left: 0, top: 1150, width: SAFE.W, height: 770, opacity: 0.35 }} />
      ) : null}
      <AbsoluteFill style={{ background: "radial-gradient(90% 60% at 50% 45%, rgba(11,13,16,0.35), rgba(11,13,16,0.92))" }} />
      <div style={{ position: "absolute", left: SAFE.left, top: 640, width: CONTENT_W, textAlign: "center" }}>
        <div style={{ height: 4, width: 220 * line, background: C.red, margin: "0 auto 40px" }} />
        <DocumentaryTitle align="center" at={4} stagger={8} lines={[{ text: "LES MYSTÈRES", size: 124 }, { text: "DU PORTAIL FERMÉ", size: 124 }]} />
        <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 40, color: C.white, marginTop: 36, ...rise(appear(frame, 22, 18), 20) }}>Lycée Mamie Adjoua de Yamoussoukro</div>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: C.dim, marginTop: 40, lineHeight: 1.5, ...rise(appear(frame, 32, 18), 16) }}>
          D'après l'investigation de L'Éléphant Déchaîné
          <br />
          du 23 novembre 2026
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ S03
export const S03Video: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const vid = segFrame(sc, "video");
  const den = segFrame(sc, "denonce");
  const loin = segFrame(sc, "plusloin");
  const sou = segFrame(sc, "soupcon");
  const p0 = appear(frame, 0, 20);
  const clockAt = den + f(3.2);
  const gateAt = den + f(5.2);
  const calAt = den + f(7.0);
  const gateP = interpolate(frame, [gateAt, gateAt + 10], [0, 1], { ...clamp, easing: EASE.inOut });
  const partA = 1 - appear(frame, loin, 16);
  // la vidéo de l'élève occupe l'écran pendant « Tout est parti d'une vidéo… », puis se range à gauche
  const shrink = interpolate(frame, [den - 6, den + 14], [0, 1], { ...clamp, easing: EASE.inOut });
  const days = ["LUN", "MAR", "MER", "JEU", "VEN"];
  const linkP = appear(frame, sou + f(2.4), 30);
  return (
    <Backdrop>
      {/* Partie A : téléphone + éléments de la dénonciation */}
      <div style={{ opacity: partA }}>
        {STUDENT_VIDEO ? (
          <>
            {/* Vidéo publiée par l'élève, son coupé : grand format, puis réduite à gauche */}
            <div
              style={{
                position: "absolute",
                left: interpolate(shrink, [0, 1], [(SAFE.W - 500) / 2, SAFE.left]),
                top: 230,
                opacity: p0,
                transform: `scale(${interpolate(shrink, [0, 1], [1, 0.72])})`,
                transformOrigin: "top left",
              }}
            >
              <Phone width={500}>
                <Loop durationInFrames={Math.max(1, Math.round(STUDENT_VIDEO.duration * 30))}>
                  <OffthreadVideo
                    src={staticFile(STUDENT_VIDEO.src)}
                    muted
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: STUDENT_VIDEO_BLUR ? "blur(18px)" : undefined }}
                  />
                </Loop>
                <div style={{ position: "absolute", right: 18, top: 60, background: "rgba(11,13,16,0.75)", color: C.white, fontFamily: F.mono, fontSize: 18, padding: "6px 10px", borderRadius: 6 }}>
                  SON COUPÉ
                </div>
              </Phone>
            </div>
            <Caption style={{ position: "absolute", left: SAFE.left, width: CONTENT_W, textAlign: "center", top: 1275, opacity: p0 * (1 - shrink) }}>
              Vidéo de l'élève (16/11/2026) · relayée par Zooma Média · son coupé
            </Caption>
          </>
        ) : (
          <div style={{ position: "absolute", left: SAFE.left, top: 240, opacity: p0 }}>
            <Phone width={360}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#1B2027, #0E1115)" }} />
              <div style={{ position: "absolute", left: 40, top: 200 }}>
                <Silhouette size={260} />
              </div>
              <div style={{ position: "absolute", left: 24, right: 24, bottom: 40, fontFamily: F.mono, fontSize: 18, color: C.dim, textAlign: "center" }}>
                IDENTITÉ PROTÉGÉE
              </div>
            </Phone>
          </div>
        )}
        <div style={{ position: "absolute", left: 480, top: 270, width: 460, ...rise(appear(frame, STUDENT_VIDEO ? den + 10 : 10, 20)) }}>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.red, letterSpacing: 3 }}>UNE ÉLÈVE DE 16 ANS</div>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 84, color: C.white, lineHeight: 1 }}>TERMINALE D</div>
          <div style={{ fontFamily: F.text, fontSize: 30, color: C.dim, marginTop: 14, lineHeight: 1.3 }}>dénonce une mesure de l'administration du lycée</div>
        </div>
        <div style={{ position: "absolute", left: 480, top: 560 }}>
          <AnimatedClock from="07:30" at={clockAt} size={130} color={C.red} />
          <div style={{ fontFamily: F.text, fontSize: 26, color: C.white, opacity: appear(frame, clockAt + 6, 14) }}>accès interdit après 7 h 30</div>
        </div>
        <div style={{ position: "absolute", left: 480, top: 760, opacity: appear(frame, gateAt - 6, 8) }}>
          <GateGraphic p={gateP} width={300} height={220} />
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top - 10, ...rise(appear(frame, vid + f(1.8), 16), 20) }}>
          <Chip mono color={C.red}>VIDÉO PUBLIÉE LE LUNDI 16 NOVEMBRE 2026</Chip>
        </div>
        {/* Semaine : une journée disparaît */}
        <div style={{ position: "absolute", left: SAFE.left, top: 1040, display: "flex", gap: 14, opacity: appear(frame, calAt, 16) }}>
          {days.map((d, i) => {
            const lost = i === 2;
            const lp = appear(frame, calAt + 20, 18);
            return (
              <div
                key={d}
                style={{
                  width: 156,
                  height: 150,
                  border: `3px solid ${lost ? C.red : C.line}`,
                  background: lost ? `rgba(185,45,50,${0.25 * lp})` : C.panel,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: lost ? 1 - lp * 0.35 : 1,
                  position: "relative",
                }}
              >
                <div style={{ fontFamily: F.mono, fontSize: 28, color: C.white }}>{d}</div>
                <div style={{ fontFamily: F.title, fontWeight: 700, fontSize: 26, color: lost ? C.red : C.dim, marginTop: 6, opacity: lost ? lp : 1 }}>
                  {lost ? "COURS PERDUS" : "COURS"}
                </div>
                {lost ? (
                  <svg width={156} height={150} style={{ position: "absolute", left: -3, top: -3 }}>
                    <line x1={10} y1={10} x2={10 + 136 * lp} y2={10 + 130 * lp} stroke={C.red} strokeWidth={6} />
                  </svg>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      {/* Partie B : le soupçon */}
      <div style={{ opacity: appear(frame, loin, 16) }}>
        <div style={{ position: "absolute", left: SAFE.left, top: 300, width: CONTENT_W }}>
          <DocumentaryTitle at={loin} lines={[{ text: "MAIS LA JEUNE FILLE", size: 70, color: C.dim }, { text: "VA PLUS LOIN", size: 130 }]} />
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: 640, ...rise(appear(frame, sou + 10, 18)) }}>
          <Chip color={C.white} style={{ fontSize: 38 }}>
            MESURE DISCIPLINAIRE
          </Chip>
        </div>
        <svg width={CONTENT_W} height={300} style={{ position: "absolute", left: SAFE.left, top: 720 }}>
          <line x1={200} y1={0} x2={200} y2={300 * linkP} stroke={C.amber} strokeWidth={5} strokeDasharray="16 14" />
        </svg>
        <div style={{ position: "absolute", left: 300, top: 820, opacity: linkP }}>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 64, color: C.amber }}>UN LIEN ?</div>
          <Attribution>soupçon exprimé par l'élève</Attribution>
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: 1020, ...rise(appear(frame, sou + f(1.6), 18)) }}>
          <Chip color={C.red} style={{ fontSize: 38 }}>
            TRANSPORT SCOLAIRE PAYANT · SOTRA
          </Chip>
        </div>
        <div style={{ position: "absolute", left: 470, top: 610, opacity: appear(frame, sou + f(2), 20) * 0.9, transform: `translateX(${(1 - appear(frame, sou + f(2), 30)) * 200}px)` }}>
          <BusGraphic width={440} />
        </div>
        <ReconstitutionTag style={{ left: 520, top: 820 }} opacity={appear(frame, sou + f(2), 20)} />
      </div>
      <SourceReference pages={sc.pages} at={10} />
    </Backdrop>
  );
};

// ------------------------------------------------------------------ S04
export const S04Investigation: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const vir = segFrame(sc, "virale");
  const rea = segFrame(sc, "reactions");
  const q = segFrame(sc, "question");
  const voici = segFrame(sc, "voici");
  // réseau de propagation
  const nodes = Array.from({ length: 26 }).map((_, i) => {
    const a = i * 2.399;
    const r = 60 + Math.sqrt(i) * 78;
    return { x: 434 + Math.cos(a) * r, y: 470 + Math.sin(a) * r * 0.95, at: vir + i * 2 };
  });
  const netOut = 1 - appear(frame, q - 4, 14);
  const dates = ["16 NOV", "17 NOV", "18 NOV"];
  const qP = between(frame, q, voici - 2, 10);
  return (
    <Backdrop>
      <div style={{ opacity: netOut }}>
        <svg width={CONTENT_W} height={960} style={{ position: "absolute", left: SAFE.left, top: 230 }}>
          {nodes.map((n, i) => {
            if (i === 0) return null;
            const parent = nodes[Math.floor((i - 1) / 2)];
            const p = appear(frame, n.at, 10);
            return <line key={`l${i}`} x1={parent.x} y1={parent.y} x2={parent.x + (n.x - parent.x) * p} y2={parent.y + (n.y - parent.y) * p} stroke={C.red} strokeOpacity={0.6} strokeWidth={2} />;
          })}
          {nodes.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={i === 0 ? 20 : 9} fill={i === 0 ? C.red : C.white} opacity={appear(frame, n.at, 8)} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top, display: "flex", gap: 16 }}>
          {dates.map((d, i) => (
            <div key={d} style={{ ...rise(appear(frame, vir + 10 + i * 10, 14), 20) }}>
              <Chip mono color={i === 0 ? C.red : C.white}>
                {d}
              </Chip>
            </div>
          ))}
        </div>
        {/* Réactions officielles : la proviseure (capture NCI) et le directeur régional */}
        <AbsoluteFill style={{ background: "rgba(11,13,16,0.6)", opacity: appear(frame, rea + f(1.8), 14) }} />
        <PhotoCard src={ASSETS.principalNCI} at={rea + f(2.2)} label="Administration du lycée" credit="La proviseure · capture NCI" pos="40% 30%" accent={C.grey}
          style={{ left: SAFE.left, top: 330, width: CONTENT_W, height: 440 }} />
        <PhotoCard src={ASSETS.directorCapture} at={rea + f(4.2)} label="Direction régionale de l'Éducation nationale" credit="Le directeur régional · capture TV" pos="50% 30%" accent={C.grey}
          style={{ left: SAFE.left, top: 800, width: CONTENT_W, height: 400 }} />
        <div style={{ position: "absolute", right: SAFE.right, top: 270, opacity: appear(frame, rea + f(2.2), 14) }}>
          <Chip mono color={C.white} style={{ fontSize: 22 }}>RÉACTIONS OFFICIELLES · 17-18 NOV</Chip>
        </div>
      </div>
      <div style={{ position: "absolute", left: SAFE.left, top: 560, width: CONTENT_W, opacity: qP }}>
        <DocumentaryTitle at={q} lines={[{ text: "MAIS QUE S'EST-IL", size: 120 }, { text: "RÉELLEMENT PASSÉ ?", size: 120, color: C.amber }]} />
      </div>
      {/* 7 révélations */}
      <div style={{ position: "absolute", left: SAFE.left, top: 560, width: CONTENT_W, opacity: appear(frame, voici, 10) }}>
        <DocumentaryTitle at={voici} lines={[{ text: "7 RÉVÉLATIONS", size: 150 }, { text: "SELON L'ÉLÉPHANT DÉCHAÎNÉ", size: 52, color: C.dim, weight: 700 }]} />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, top: 900, display: "flex", gap: 10 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 112,
              height: 56,
              border: `2px solid ${C.red}`,
              fontFamily: F.mono,
              fontSize: 26,
              color: C.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: appear(frame, voici + i * 4, 10),
              background: "rgba(185,45,50,0.15)",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </div>
        ))}
      </div>
    </Backdrop>
  );
};

