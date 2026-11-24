// Scènes 01 à 04 : accroche, contexte, vidéo virale, présentation de l'investigation.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, F, SAFE, CONTENT_W, clamp, EASE } from "../styles/theme";
import { appear, between, rise, wipe } from "../animations/anim";
import { SceneTiming, segFrame, f } from "../data/timeline";
import { Backdrop, Photo, SourceReference, ReconstitutionTag, Chip, Caption, Attribution } from "../components/base";
import { AnimatedClock, DocumentaryTitle } from "../components/editorial";
import { GateGraphic, MapCI, Phone, Notification, Silhouette, BusGraphic, NewspaperReveal } from "../components/illustrations";
import { ASSETS } from "../data/assets";
import map from "../data/map.json";

type P = { sc: SceneTiming };

// ------------------------------------------------------------------ S01
export const S01Hook: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const flip = f(2.0);
  const gateAt = f(2.45);
  const titleAt = f(3.4);
  const gateP = interpolate(frame, [gateAt - 8, gateAt], [0, 1], { ...clamp, easing: EASE.inOut });
  const shake = frame >= gateAt && frame < gateAt + 8 ? Math.sin(frame * 3) * (gateAt + 8 - frame) * 1.5 : 0;
  const clockUp = interpolate(frame, [titleAt - 10, titleAt + 10], [0, 1], { ...clamp, easing: EASE.inOut });
  const gateFade = interpolate(frame, [titleAt - 6, titleAt + 10], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.black, transform: `translateX(${shake}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560 - clockUp * 290, display: "flex", justifyContent: "center", transform: `scale(${1 - clockUp * 0.35})` }}>
        <AnimatedClock from="07:29" to="07:30" flipAt={flip} at={4} size={230} />
      </div>
      <div style={{ position: "absolute", left: 160, top: 860 - clockUp * 120, opacity: appear(frame, gateAt - 10, 6) * gateFade }}>
        <GateGraphic p={gateP} width={760} height={520} />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, top: 620, width: CONTENT_W }}>
        <DocumentaryTitle
          at={titleAt}
          stagger={9}
          lines={[
            { text: "7 H 30", font: "mono", size: 96, color: C.red, weight: 600 },
            { text: "UN PORTAIL FERMÉ", size: 150 },
            { text: "UNE JOURNÉE DE COURS PERDUE ?", size: 84, color: C.amber },
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ S02
export const S02Context: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const lycee = segFrame(sc, "lycee");
  const video = segFrame(sc, "video");
  const draw = appear(frame, 0, 40, EASE.inOut);
  const zoomP = interpolate(frame, [30, lycee + 20], [0, 1], { ...clamp, easing: EASE.inOut });
  const [yx, yy] = map.cities.yamoussoukro;
  const zoom = { s: 1 + zoomP * 1.6, cx: 450 + (yx - 450) * zoomP, cy: 450 + (yy - 450) * zoomP };
  const mapOut = interpolate(frame, [lycee + 30, lycee + 50], [1, 0.25], clamp);
  const photoP = appear(frame, lycee + 30, 24);
  const tags = ["SA NOUVELLE PROVISEURE", "UNE ÉLÈVE DE 16 ANS", "UN PROJET DE TRANSPORT SCOLAIRE"];
  const tagAt = [lycee + f(4.6), lycee + f(6.4), lycee + f(7.6)];
  const phoneP = appear(frame, video - 6, 22);
  const sceneA = 1 - appear(frame, video - 10, 16);
  return (
    <Backdrop>
      <div style={{ position: "absolute", left: 90, top: 260, opacity: mapOut }}>
        <MapCI draw={draw} zoom={zoom} markers={[{ key: "yamoussoukro", label: "YAMOUSSOUKRO", p: appear(frame, 40, 16) }]} />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top, opacity: appear(frame, 6, 20) * sceneA }}>
        <Caption>CÔTE D'IVOIRE · {"6°49′N 5°17′O"}</Caption>
      </div>
      {/* Photo du lycée + éléments clés */}
      <div style={{ opacity: sceneA }}>
        <Photo
          src={ASSETS.gate1}
          frame={frame - lycee}
          dur={sc.duration * 30}
          style={{ left: SAFE.left, top: 240, width: CONTENT_W, height: 560, opacity: photoP, ...wipe(photoP) }}
        />
        <Caption style={{ position: "absolute", left: SAFE.left, top: 812, opacity: photoP }}>Photo : Vivre À Yamoussoukro (fournie)</Caption>
        <div style={{ position: "absolute", left: SAFE.left, top: 860, width: CONTENT_W, ...rise(appear(frame, lycee + 40, 20)) }}>
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.red, letterSpacing: 4 }}>LYCÉE D'EXCELLENCE</div>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 104, color: C.white, lineHeight: 1 }}>MAMIE ADJOUA</div>
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: 1010, display: "flex", flexDirection: "column", gap: 14 }}>
          {tags.map((t, i) => (
            <div key={t} style={{ ...rise(appear(frame, tagAt[i], 16), 20) }}>
              <Chip color={i === 2 ? C.amber : C.white} style={{ fontSize: 32 }}>
                {t}
              </Chip>
            </div>
          ))}
        </div>
      </div>
      {/* Smartphone + notifications */}
      <div style={{ position: "absolute", left: 310, top: 250, opacity: phoneP, transform: `translateY(${(1 - phoneP) * 80}px)` }}>
        <Phone width={460}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#1B2027, #0E1115)" }} />
          <div style={{ position: "absolute", left: 50, top: 260 }}>
            <Silhouette size={340} />
          </div>
          <div style={{ position: "absolute", left: 30, right: 30, bottom: 60, fontFamily: F.text, color: C.white, fontSize: 22 }}>
            <div style={{ height: 14, width: "70%", background: "#2E343D", borderRadius: 7, marginBottom: 12 }} />
            <div style={{ height: 14, width: "45%", background: "#2E343D", borderRadius: 7 }} />
          </div>
        </Phone>
      </div>
      {[
        ["▶", "Nouvelle vidéo publiée"],
        ["♥", "Réactions en hausse"],
        ["↗", "Vidéo partagée"],
        ["✉", "Nouveaux commentaires"],
      ].map(([ic, tx], i) => (
        <Notification
          key={tx}
          icon={ic}
          text={tx}
          p={between(frame, video + f(0.6) + i * f(0.45), Infinity)}
          style={{ position: "absolute", left: i % 2 === 0 ? 120 : 420, top: 300 + i * 120, width: 460 }}
        />
      ))}
      <div style={{ position: "absolute", left: SAFE.left, top: 1150, ...rise(appear(frame, video + 6, 18)) }}>
        <Chip mono color={C.red}>LUNDI 16 NOVEMBRE 2026</Chip>
      </div>
      <ReconstitutionTag style={{ left: SAFE.left, top: 1225 }} opacity={phoneP} />
      <SourceReference pages={sc.pages} at={10} />
    </Backdrop>
  );
};

// ------------------------------------------------------------------ S03
export const S03Video: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const den = segFrame(sc, "denonce");
  const loin = segFrame(sc, "plusloin");
  const sou = segFrame(sc, "soupcon");
  const p0 = appear(frame, 0, 20);
  const clockAt = den + f(3.2);
  const gateAt = den + f(5.2);
  const calAt = den + f(7.0);
  const gateP = interpolate(frame, [gateAt, gateAt + 10], [0, 1], { ...clamp, easing: EASE.inOut });
  const partA = 1 - appear(frame, loin, 16);
  const days = ["LUN", "MAR", "MER", "JEU", "VEN"];
  const linkP = appear(frame, sou + f(2.4), 30);
  return (
    <Backdrop>
      {/* Partie A : téléphone + éléments de la dénonciation */}
      <div style={{ opacity: partA }}>
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
        <div style={{ position: "absolute", left: 480, top: 270, width: 460, ...rise(appear(frame, 10, 20)) }}>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.red, letterSpacing: 3 }}>UNE ÉLÈVE</div>
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
  const jour = segFrame(sc, "journal");
  const voici = segFrame(sc, "voici");
  // réseau de propagation
  const nodes = Array.from({ length: 26 }).map((_, i) => {
    const a = i * 2.399;
    const r = 60 + Math.sqrt(i) * 78;
    return { x: 434 + Math.cos(a) * r, y: 470 + Math.sin(a) * r * 0.95, at: vir + i * 2 };
  });
  const netOut = 1 - appear(frame, q - 4, 14);
  const dates = ["16 NOV", "17 NOV", "18 NOV"];
  const qP = between(frame, q, jour - 2, 10);
  const jP = appear(frame, jour, 10);
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
        <div style={{ position: "absolute", left: SAFE.left, top: 1000, width: CONTENT_W, display: "flex", flexDirection: "column", gap: 16 }}>
          {["ADMINISTRATION DU LYCÉE", "DIRECTION RÉGIONALE DE L'ÉDUCATION NATIONALE"].map((t, i) => (
            <div key={t} style={{ ...rise(appear(frame, rea + f(2.2) + i * 12, 18)), background: C.panel, borderLeft: `6px solid ${C.grey}`, padding: "16px 22px" }}>
              <div style={{ fontFamily: F.mono, fontSize: 20, color: C.dim, letterSpacing: 2 }}>RÉACTION OFFICIELLE · 17-18 NOV</div>
              <div style={{ fontFamily: F.title, fontWeight: 700, fontSize: 40, color: C.white }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: SAFE.left, top: 560, width: CONTENT_W, opacity: qP }}>
        <DocumentaryTitle at={q} lines={[{ text: "MAIS QUE S'EST-IL", size: 120 }, { text: "RÉELLEMENT PASSÉ ?", size: 120, color: C.amber }]} />
      </div>
      {/* Le journal */}
      <div style={{ opacity: jP }}>
        <div style={{ position: "absolute", left: 420, top: 250 }}>
          <NewspaperReveal at={jour} width={500} rotate={4} />
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: 300, width: 400 }}>
          <DocumentaryTitle
            at={jour + 8}
            stagger={8}
            lines={[
              { text: "L'ÉLÉPHANT", size: 84 },
              { text: "DÉCHAÎNÉ", size: 84, color: C.red },
              { text: "INVESTIGATION", size: 30, font: "mono", color: C.white, weight: 500 },
              { text: "23 NOV. 2026", size: 30, font: "mono", color: C.dim, weight: 500 },
            ]}
          />
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: 1040, width: CONTENT_W, ...rise(appear(frame, jour + f(3.6), 20)) }}>
          <div style={{ fontFamily: F.mono, fontSize: 22, color: C.dim, letterSpacing: 3 }}>ÉDITION SPÉCIALE · YAMOUSSOUKRO & ABIDJAN</div>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 70, color: C.white, lineHeight: 1.05, marginTop: 8 }}>« LES MYSTÈRES DU PORTAIL FERMÉ »</div>
        </div>
      </div>
      {/* 7 révélations */}
      <div style={{ position: "absolute", left: SAFE.left, top: 1235, display: "flex", gap: 10 }}>
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
      <SourceReference pages="p. 1" at={jour} />
    </Backdrop>
  );
};

