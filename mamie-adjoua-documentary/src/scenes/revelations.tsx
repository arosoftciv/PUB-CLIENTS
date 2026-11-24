// Scènes 05 à 11 : les sept révélations rapportées par L'Éléphant Déchaîné.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, F, SAFE, CONTENT_W, clamp, EASE } from "../styles/theme";
import { appear, between, rise } from "../animations/anim";
import { SceneTiming, segFrame, f } from "../data/timeline";
import { Backdrop, Photo, SourceReference, ReconstitutionTag, Chip, Caption, Attribution } from "../components/base";
import {
  AnimatedClock,
  AnimatedCounter,
  EvidenceCard,
  FinancialFlow,
  InvestigationChapter,
  SplitScreenComparison,
} from "../components/editorial";
import { BusGraphic, CalendarCard, GateGraphic, MapCI, Silhouette } from "../components/illustrations";
import { ASSETS, USE_PEOPLE_CAPTURES } from "../data/assets";
import map from "../data/map.json";

type P = { sc: SceneTiming };
const TOP = 320; // début de la zone de contenu sous le bandeau

/** Groupe visible entre deux segments. */
const Stage: React.FC<{ a: number; b?: number; children: React.ReactNode }> = ({ a, b = Infinity, children }) => {
  const frame = useCurrentFrame();
  const o = between(frame, a, b, 12);
  if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, opacity: o }}>{children}</div>;
};

const Steps: React.FC<{ items: string[]; at: number; color: string; stagger?: number; label: string; x: number; w: number }> = ({ items, at, color, stagger = 9, label, x, w }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: 0, width: w }}>
      <div style={{ fontFamily: F.mono, fontSize: 24, color, letterSpacing: 3, marginBottom: 18, opacity: appear(frame, at - 6, 12) }}>{label}</div>
      {items.map((t, i) => {
        const p = appear(frame, at + i * stagger, 14);
        return (
          <div key={t}>
            {i > 0 ? <div style={{ width: 3, height: 26 * p, background: color, marginLeft: 22, opacity: 0.7 }} /> : null}
            <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: p, transform: `translateX(${(1 - p) * 20}px)` }}>
              <div style={{ width: 46, height: 46, borderRadius: 23, border: `3px solid ${color}`, fontFamily: F.mono, fontSize: 22, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ fontFamily: F.title, fontWeight: 700, fontSize: 40, color: C.white, lineHeight: 1.05, textTransform: "uppercase" }}>{t}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PersonCapture: React.FC<{ src: string; label: string; frame: number; style?: React.CSSProperties }> = ({ src, label, frame, style }) =>
  USE_PEOPLE_CAPTURES ? (
    <div style={{ position: "absolute", ...style }}>
      <Photo src={src} frame={frame} dur={300} grade="cold" style={{ left: 0, top: 0, width: "100%", height: "100%" }} from={{ s: 1.02, x: 0, y: 0 }} to={{ s: 1.08, x: 0, y: 0 }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, right: 0, padding: "10px 14px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))", fontFamily: F.mono, fontSize: 18, color: C.white }}>
        {label}
      </div>
    </div>
  ) : (
    <div style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", background: C.anthracite, ...style }}>
      <Silhouette size={200} />
    </div>
  );

/** Visuel « bus » : photo du journal si disponible, sinon schéma étiqueté. */
const BusVisual: React.FC<{ frame: number; style: React.CSSProperties; width?: number }> = ({ frame, style, width = 560 }) =>
  ASSETS.busPhoto ? (
    <Photo src={ASSETS.busPhoto} frame={frame} dur={300} style={style} />
  ) : (
    <div style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(#1A1F26,#101317)", ...style }}>
      <BusGraphic width={width} />
      <ReconstitutionTag style={{ left: 14, bottom: 14 }} />
    </div>
  );

// ------------------------------------------------------------------ R1
export const S05Revelation1: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const g = (id: string) => segFrame(sc, id);
  const gateClose = g("portail") + f(2.2);
  const gP = interpolate(frame, [gateClose - 8, gateClose], [0, 1], { ...clamp, easing: EASE.inOut });
  return (
    <Backdrop>
      <InvestigationChapter n={1} title="Une nouvelle mesure disciplinaire" settleAt={g("date") - 14} />
      <Stage a={g("date") - 4} b={g("portail")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 120 }}>
          <CalendarCard weekday="JEUDI" day="22" month="OCTOBRE 2026" p={appear(frame, g("date"), 20)} note="À la veille des congés de la Toussaint" />
        </div>
      </Stage>
      <Stage a={g("portail")} b={g("avant")}>
        <Photo src={ASSETS.gate1} frame={frame - g("portail")} dur={f(14)} style={{ left: SAFE.left, top: TOP, width: CONTENT_W, height: 620 }} to={{ s: 1.22, x: 0, y: 40 }} />
        <div style={{ position: "absolute", left: SAFE.left + 24, top: TOP + 24, background: "rgba(11,13,16,0.75)", padding: "6px 18px", opacity: appear(frame, g("portail") + 10, 16) }}>
          <AnimatedClock from="07:30" at={g("portail") + 10} size={96} color={C.red} />
        </div>
        <div style={{ position: "absolute", left: SAFE.left + 480, top: TOP + 360, opacity: appear(frame, gateClose - 10, 8) }}>
          <GateGraphic p={gP} width={360} height={240} />
        </div>
        <Caption style={{ position: "absolute", left: SAFE.left, top: TOP + 632 }}>Photo : portail du lycée (fournie)</Caption>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 690, width: CONTENT_W }}>
          <div style={{ fontFamily: F.title, fontWeight: 700, fontSize: 52, color: C.white, lineHeight: 1.1, ...rise(appear(frame, g("portail") + 20, 18)) }}>
            LA PROVISEURE SUPERVISE LA FERMETURE DU PORTAIL
          </div>
          <div style={{ marginTop: 22, ...rise(appear(frame, g("maison"), 16)) }}>
            <Chip color={C.red}>RETARDATAIRES RENVOYÉES À LA MAISON</Chip>
          </div>
          <div style={{ marginTop: 18, ...rise(appear(frame, g("sanscom"), 16)) }}>
            <Chip color={C.amber}>SANS COMMUNICATION PRÉALABLE</Chip>
            <Attribution style={{ marginTop: 8 }}>selon les témoignages recueillis</Attribution>
          </div>
        </div>
      </Stage>
      <Stage a={g("avant")} b={g("reglement")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 40, width: CONTENT_W, height: 800 }}>
          <Steps label="ANCIENNE PRATIQUE" color={C.grey} at={g("avant") + 8} items={["Retard", "Accueil dans une salle", "Reprise des cours à la 2e heure"]} x={0} w={420} />
          <Steps label="NOUVELLE MESURE RAPPORTÉE" color={C.red} at={g("avant") + f(3)} items={["Retard", "Portail fermé", "Retour à la maison", "Journée de cours perdue"]} x={448} w={420} />
        </div>
      </Stage>
      <Stage a={g("reglement")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 140 }}>
          <EvidenceCard
            at={g("reglement")}
            kicker="Règlement intérieur"
            body={
              <>
                Selon le journal, il ne prévoit explicitement <span style={{ color: C.red }}>aucune fermeture définitive</span> du portail à 7 h 30.
              </>
            }
            source={ASSETS.articleReglement ? undefined : "Synthèse — extrait original : L'Éléphant Déchaîné, p. 7"}
          />
        </div>
      </Stage>
      <SourceReference pages={sc.pages} at={g("date")} />
    </Backdrop>
  );
};

// ------------------------------------------------------------------ R2
export const S06Revelation2: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const g = (id: string) => segFrame(sc, id);
  const cx = CONTENT_W / 2;
  const nodes = [
    { label: "ADMINISTRATION", x: cx - 230, y: 120, solid: true },
    { label: "SOTRA", x: cx + 230, y: 120, solid: true },
    { label: "PARENTS", x: cx - 230, y: 520, solid: false },
    { label: "COGES", x: cx + 230, y: 520, solid: false },
  ];
  return (
    <Backdrop>
      <InvestigationChapter n={2} title="Un partenariat aux contours flous" settleAt={g("annonce") - 14} />
      <Stage a={g("annonce") - 4} b={g("coges")}>
        <BusVisual frame={frame - g("annonce")} style={{ left: SAFE.left, top: TOP, width: CONTENT_W, height: 480, opacity: appear(frame, g("annonce"), 20) }} />
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 510, ...rise(appear(frame, g("annonce") + 20, 16)) }}>
          <Chip>TRANSPORT SCOLAIRE · SOTRA</Chip>
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 610, opacity: appear(frame, g("tarif"), 10) }}>
          <AnimatedCounter to={27000} at={g("tarif") + 10} dur={40} size={170} />
          <div style={{ fontFamily: F.title, fontWeight: 700, fontSize: 60, color: C.red, marginTop: -6 }}>FCFA</div>
          <div style={{ fontFamily: F.mono, fontSize: 28, color: C.white, letterSpacing: 3, marginTop: 8, opacity: appear(frame, g("tarif") + 40, 14) }}>
            PAR MOIS ET PAR ÉLÈVE
          </div>
        </div>
      </Stage>
      <Stage a={g("coges")} b={g("drena")}>
        <svg width={CONTENT_W} height={700} style={{ position: "absolute", left: SAFE.left, top: TOP + 40 }}>
          {nodes.map((n, i) => {
            const p = appear(frame, g("coges") + 10 + i * 6, 20);
            return (
              <line
                key={i}
                x1={cx}
                y1={320}
                x2={cx + (n.x - cx) * p}
                y2={320 + (n.y - 320) * p}
                stroke={n.solid ? C.white : C.amber}
                strokeWidth={4}
                strokeDasharray={n.solid ? undefined : "12 12"}
              />
            );
          })}
        </svg>
        <div style={{ position: "absolute", left: SAFE.left + cx - 150, top: TOP + 40 + 280, width: 300, textAlign: "center", background: C.red, padding: "16px 0", fontFamily: F.title, fontWeight: 800, fontSize: 44, color: C.white, opacity: appear(frame, g("coges"), 14) }}>
          PARTENARIAT
        </div>
        {nodes.map((n, i) => (
          <div
            key={n.label}
            style={{
              position: "absolute",
              left: SAFE.left + n.x - 150,
              top: TOP + 40 + n.y - 40,
              width: 300,
              textAlign: "center",
              border: `3px ${n.solid ? "solid" : "dashed"} ${n.solid ? C.white : C.amber}`,
              background: C.panel,
              padding: "16px 0",
              fontFamily: F.title,
              fontWeight: 700,
              fontSize: 40,
              color: n.solid ? C.white : C.amber,
              opacity: appear(frame, g("coges") + 20 + i * 6, 14),
            }}
          >
            {n.label}
          </div>
        ))}
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 700, width: CONTENT_W, textAlign: "center", opacity: appear(frame, g("coges") + f(2.5), 16) }}>
          <div style={{ fontFamily: F.title, fontWeight: 700, fontSize: 46, color: C.amber }}>NON ASSOCIÉS AUX NÉGOCIATIONS INITIALES ?</div>
          <Attribution>selon l'enquête du journal</Attribution>
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 850, width: CONTENT_W, textAlign: "center", ...rise(appear(frame, g("reduction"), 16)) }}>
          <Chip color={C.white} style={{ fontSize: 30 }}>
            DEMANDE DE RÉDUCTION DU TARIF : SANS SUITE
          </Chip>
          <Attribution style={{ marginTop: 8 }}>selon plusieurs parents</Attribution>
        </div>
      </Stage>
      <Stage a={g("drena")} b={g("verifier")}>
        <PersonCapture src={ASSETS.directorCapture} label="Directeur régional de l'Éducation nationale — capture TV" frame={frame - g("drena")} style={{ left: SAFE.left, top: TOP, width: CONTENT_W, height: 520 }} />
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 560 }}>
          <EvidenceCard
            at={g("drena") + 14}
            accent={C.grey}
            kicker="Position officielle (reformulation)"
            body={
              <>
                Aucune convention signée.
                <br />
                Un projet « jamais véritablement démarré ».
              </>
            }
          />
        </div>
      </Stage>
      <Stage a={g("verifier")}>
        <div style={{ position: "absolute", left: SAFE.left, top: 620, width: CONTENT_W, textAlign: "center" }}>
          <svg width={180} height={180} viewBox="0 0 100 100" style={{ opacity: appear(frame, g("verifier"), 16) }}>
            <circle cx={42} cy={42} r={28} fill="none" stroke={C.white} strokeWidth={6} />
            <line x1={62} y1={62} x2={88} y2={88} stroke={C.white} strokeWidth={9} strokeLinecap="round" />
          </svg>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 110, color: C.white, ...rise(appear(frame, g("verifier") + 6, 18)) }}>VÉRIFICATION</div>
        </div>
      </Stage>
      <SourceReference pages={sc.pages} at={g("annonce")} />
    </Backdrop>
  );
};

// ------------------------------------------------------------------ R3
export const S07Revelation3: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const g = (id: string) => segFrame(sc, id);
  const routeP = appear(frame, g("suivi") + 10, f(3), EASE.inOut);
  return (
    <Backdrop>
      <InvestigationChapter n={3} title="Les bus circulent bel et bien" settleAt={g("videoprov") - 14} />
      <Stage a={g("videoprov") - 4} b={g("pastout")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 20, width: CONTENT_W }}>
          <EvidenceCard
            at={g("videoprov")}
            kicker="Retrouvé par les journalistes"
            body="Une vidéo : la proviseure annonce publiquement la signature du partenariat avec la SOTRA."
            source={ASSETS.ceremonyPhoto ? undefined : "Image de la cérémonie : voir L'Éléphant Déchaîné, p. 4"}
          />
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 470, width: CONTENT_W, ...rise(appear(frame, g("publication"), 18)) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Chip mono color={C.red} style={{ fontSize: 40 }}>
              2 NOV.
            </Chip>
            <div style={{ fontFamily: F.text, fontSize: 32, color: C.white, lineHeight: 1.3, flex: 1 }}>Publication du lycée : le service est « officiellement opérationnel »</div>
          </div>
        </div>
      </Stage>
      <Stage a={g("pastout")} b={g("suivi")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 20, width: CONTENT_W }}>
          <div style={{ fontFamily: F.mono, fontSize: 30, color: C.red, letterSpacing: 4, opacity: appear(frame, g("pastout"), 12) }}>VENDREDI 20 NOVEMBRE</div>
          <AnimatedClock from="06:54" at={g("constat")} size={210} />
        </div>
        <BusVisual frame={frame - g("constat")} style={{ left: SAFE.left, top: TOP + 300, width: CONTENT_W, height: 440, opacity: appear(frame, g("constat") + 10, 18) }} />
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 770, ...rise(appear(frame, g("constat") + f(2.5), 16)) }}>
          <Chip color={C.white} style={{ fontSize: 40 }}>
            2 BUS SPÉCIAUX DEVANT LE LYCÉE
          </Chip>
          <Attribution color={C.dim} style={{ marginTop: 10 }}>
            constat des journalistes
          </Attribution>
        </div>
      </Stage>
      <Stage a={g("suivi")} b={g("resume")}>
        <svg width={CONTENT_W} height={760} style={{ position: "absolute", left: SAFE.left, top: TOP + 20 }}>
          <path d="M120 640 C 260 560, 220 420, 400 380 S 640 220, 740 120" fill="none" stroke={C.line} strokeWidth={14} strokeLinecap="round" />
          <path d="M120 640 C 260 560, 220 420, 400 380 S 640 220, 740 120" fill="none" stroke={C.red} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - routeP} />
          {[
            [120, 640],
            [400, 380],
            [600, 250],
            [740, 120],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 0 ? 20 : 13} fill={i === 0 ? C.white : C.red} opacity={routeP >= i / 3 - 0.02 ? 1 : 0.15} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: SAFE.left + 20, top: TOP + 690, fontFamily: F.title, fontWeight: 700, fontSize: 40, color: C.white }}>LYCÉE</div>
        <div style={{ position: "absolute", left: SAFE.left + 470, top: TOP + 50, fontFamily: F.title, fontWeight: 700, fontSize: 40, color: C.white, opacity: routeP > 0.95 ? 1 : 0.3 }}>
          KPOUSSOUSSOU
        </div>
        <div style={{ position: "absolute", left: SAFE.left + 470, top: TOP + 360, opacity: appear(frame, g("suivi") + f(2), 16) }}>
          <div style={{ fontFamily: F.mono, fontSize: 56, fontWeight: 600, color: C.white }}>≈ 13 km</div>
          <div style={{ fontFamily: F.text, fontSize: 24, color: C.dim }}>points de dépose des élèves</div>
        </div>
        <Caption style={{ position: "absolute", left: SAFE.left, top: TOP + 790 }}>Schéma — non à l'échelle · trajet suivi par les journalistes</Caption>
      </Stage>
      <Stage a={g("resume")}>
        <SplitScreenComparison
          at={g("resume")}
          top={TOP}
          height={800}
          left={{
            label: "VERSION OFFICIELLE",
            title: "Projet non démarré",
            note: "Reformulation des propos du directeur régional",
            media: <PersonCapture src={ASSETS.directorCapture} label="Capture TV" frame={frame} style={{ left: 0, top: 0, width: "100%", height: "100%" }} />,
          }}
          right={{
            label: "CONSTAT DU JOURNAL",
            title: "Des élèves transportées",
            note: "Bus observés et suivis le 20 novembre",
            media: <BusVisual frame={frame} width={340} style={{ left: 0, top: 0, width: "100%", height: "100%" }} />,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: SAFE.left,
            top: TOP + 830,
            width: CONTENT_W,
            background: C.red,
            textAlign: "center",
            fontFamily: F.title,
            fontWeight: 800,
            fontSize: 64,
            color: C.white,
            padding: "10px 0",
            transform: `scaleX(${appear(frame, g("contradiction"), 14)})`,
          }}
        >
          UNE CONTRADICTION MAJEURE
        </div>
      </Stage>
      <SourceReference pages={sc.pages} at={g("videoprov")} />
    </Backdrop>
  );
};

// ------------------------------------------------------------------ R4
export const S08Revelation4: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const g = (id: string) => segFrame(sc, id);
  return (
    <Backdrop>
      <InvestigationChapter n={4} title="Qui encaisse les 27 000 francs ?" settleAt={g("verse") - 14} />
      <Stage a={g("verse") - 4} b={g("educatrices")}>
        <FinancialFlow at={g("verse") + 6} questionAt={g("verse") + f(4)} top={TOP + 10} />
      </Stage>
      <Stage a={g("educatrices")} b={g("circuit")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 40 }}>
          <EvidenceCard
            at={g("educatrices")}
            accent={C.amber}
            kicker="Selon les témoignages recueillis"
            body="Des éducatrices auraient multiplié les sollicitations auprès des élèves pour convaincre leurs parents de souscrire."
          />
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 520 }}>
          <EvidenceCard
            at={g("admin")}
            accent={C.grey}
            kicker="Position de l'administration"
            body="Adhésion entièrement volontaire. Aucun bénéfice financier pour le lycée."
          />
        </div>
      </Stage>
      <Stage a={g("circuit")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 120, width: CONTENT_W, textAlign: "center" }}>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 380, color: C.amber, lineHeight: 0.9, opacity: appear(frame, g("circuit"), 16), transform: `scale(${0.8 + 0.2 * appear(frame, g("circuit"), 30)})` }}>?</div>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 80, color: C.white, lineHeight: 1, ...rise(appear(frame, g("circuit") + 10, 18)) }}>CIRCUIT FINANCIER</div>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 80, color: C.amber, lineHeight: 1, ...rise(appear(frame, g("circuit") + 18, 18)) }}>NON DÉTERMINÉ</div>
          <Attribution color={C.dim} style={{ marginTop: 20 }}>
            l'enquête ne permet pas de l'établir précisément
          </Attribution>
        </div>
      </Stage>
      <div style={{ position: "absolute", left: SAFE.left, top: 1225, opacity: appear(frame, g("verse"), 20) }}>
        <Attribution>Selon les témoignages recueillis par L'Éléphant Déchaîné</Attribution>
      </div>
      <SourceReference pages={sc.pages} at={g("verse")} />
    </Backdrop>
  );
};

// ------------------------------------------------------------------ R5
export const S09Revelation5: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const g = (id: string) => segFrame(sc, id);
  const grades = [
    { id: "t1", label: "1er trimestre", v: 16 },
    { id: "t2", label: "2e trimestre", v: 14 },
    { id: "t3", label: "3e trimestre", v: 14 },
  ];
  return (
    <Backdrop>
      <InvestigationChapter n={5} title="Les accusations contre l'élève" settleAt={g("antecedents") - 14} />
      <Stage a={g("antecedents") - 4} b={g("archives")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP, width: CONTENT_W, ...rise(appear(frame, g("antecedents"), 18)) }}>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.grey, letterSpacing: 3 }}>DÉCLARATIONS DU DIRECTEUR RÉGIONAL · INTERVENTION TÉLÉVISÉE</div>
          <div style={{ display: "flex", gap: 24, marginTop: 26, alignItems: "center" }}>
            <div style={{ width: 200, height: 250, background: "#C9B88F", borderRadius: "6px 30px 6px 6px", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              <div style={{ position: "absolute", left: 20, top: 30, right: 20, fontFamily: F.mono, fontSize: 18, color: C.black }}>DOSSIER SCOLAIRE</div>
              <div style={{ position: "absolute", left: 20, top: 70, width: 150, height: 24, background: C.black }} />
              <div style={{ position: "absolute", left: 20, bottom: 20, fontFamily: F.mono, fontSize: 14, color: C.black }}>IDENTITÉ PROTÉGÉE</div>
            </div>
            <div style={{ fontFamily: F.title, fontWeight: 700, fontSize: 52, color: C.white, lineHeight: 1.05, flex: 1 }}>« ANTÉCÉDENTS DISCIPLINAIRES » ALLÉGUÉS</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 380, display: "flex", gap: 40 }}>
          <div>
            <AnimatedCounter to={58} at={g("heures") + 6} suffix=" h" size={150} color={C.white} />
            <div style={{ fontFamily: F.text, fontSize: 26, color: C.dim, opacity: appear(frame, g("heures") + 6, 10) }}>d'absence (année précédente)</div>
          </div>
          <div>
            <AnimatedCounter to={18} at={g("heures") + f(2.8)} suffix=" h" size={150} color={C.white} />
            <div style={{ fontFamily: F.text, fontSize: 26, color: C.dim, opacity: appear(frame, g("heures") + f(2.8), 10) }}>(trimestre en cours)</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 640, ...rise(appear(frame, g("heures") + f(5.5), 16)) }}>
          <Chip color={C.amber}>CONSEIL DE DISCIPLINE ALLÉGUÉ</Chip>
        </div>
      </Stage>
      <Stage a={g("archives")} b={g("justif")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP, width: CONTENT_W }}>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.red, letterSpacing: 3, opacity: appear(frame, g("archives"), 12) }}>
            ARCHIVES SCOLAIRES CONSULTÉES PAR LE JOURNAL
          </div>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 64, color: C.white, marginTop: 10, opacity: appear(frame, g("notes") - 6, 14) }}>NOTES DE CONDUITE</div>
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 170, width: CONTENT_W }}>
          {grades.map((gr, i) => {
            const p = appear(frame, g(gr.id), 24);
            return (
              <div key={gr.id} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 26, opacity: appear(frame, g(gr.id) - 4, 8) }}>
                <div style={{ width: 210, fontFamily: F.text, fontSize: 28, color: C.dim }}>{gr.label}</div>
                <div style={{ width: 460, height: 54, background: C.anthracite, position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(gr.v / 20) * 100 * p}%`, background: C.white }} />
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 40, color: C.white, fontWeight: 600 }}>{gr.v}/20</div>
              </div>
            );
          })}
          <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 10, opacity: appear(frame, g("moyenne"), 14) }}>
            <div style={{ fontFamily: F.mono, fontSize: 26, color: C.dim, letterSpacing: 2 }}>MOYENNE ANNUELLE</div>
            <div style={{ fontFamily: F.mono, fontSize: 84, color: C.white, fontWeight: 600 }}>14,66/20</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 640, width: CONTENT_W, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ ...rise(appear(frame, g("bien"), 16)) }}>
            <Chip color={C.white} style={{ fontSize: 40 }}>
              APPRÉCIATION : BIEN
            </Chip>
          </div>
          <div style={{ ...rise(appear(frame, g("aucune"), 16)) }}>
            <Chip color={C.white} style={{ fontSize: 34 }}>
              SANCTION INSCRITE AU DOSSIER CONSULTÉ : AUCUNE
            </Chip>
          </div>
        </div>
      </Stage>
      <Stage a={g("justif")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 100, width: CONTENT_W }}>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 96, color: C.amber, lineHeight: 1, ...rise(appear(frame, g("justif"), 18)) }}>
            JUSTIFICATIFS NON COMMUNIQUÉS AU JOURNAL
          </div>
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 500 }}>
          <EvidenceCard
            at={g("nuance")}
            accent={C.grey}
            kicker="Nuance"
            body="Ces constats ne démontrent pas que les absences alléguées n'ont jamais existé."
          />
        </div>
      </Stage>
      <SourceReference pages={sc.pages} at={g("antecedents")} />
    </Backdrop>
  );
};

// ------------------------------------------------------------------ R6
export const S10Revelation6: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const g = (id: string) => segFrame(sc, id);
  const a = g("abidjan");
  const routeP = appear(frame, a, f(2.2), EASE.inOut);
  const zoomP = interpolate(frame, [a + f(2.2), a + f(4.2)], [0, 1], { ...clamp, easing: EASE.inOut });
  const [mx, my] = map.cities.marcory;
  const zoom = { s: 1 + zoomP * 2.2, cx: 450 + (mx - 450) * zoomP, cy: 450 + (my - 450) * zoomP };
  return (
    <Backdrop>
      <InvestigationChapter n={6} title="Un précédent à Marcory" settleAt={a - 14} />
      <Stage a={a - 4} b={g("similaire")}>
        <div style={{ position: "absolute", left: 90, top: TOP - 20 }}>
          <MapCI
            draw={1}
            size={900}
            zoom={zoom}
            route={{ from: "yamoussoukro", to: "abidjan", p: routeP }}
            markers={[
              { key: "yamoussoukro", label: "YAMOUSSOUKRO", p: 1 - zoomP, color: C.grey },
              { key: "marcory", label: "MARCORY · ABIDJAN", p: appear(frame, a + f(2), 14), dx: -330, dy: 50 },
            ]}
          />
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 860, width: CONTENT_W, ...rise(appear(frame, a + f(3.5), 18)) }}>
          <div style={{ fontFamily: F.mono, fontSize: 22, color: C.red, letterSpacing: 3 }}>ANCIEN ÉTABLISSEMENT DE LA PROVISEURE</div>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 64, color: C.white, lineHeight: 1 }}>COLLÈGE BOULEVARD DU GABON</div>
        </div>
      </Stage>
      <Stage a={g("similaire")}>
        {ASSETS.marcoryPhoto ? (
          <Photo src={ASSETS.marcoryPhoto} frame={frame - g("similaire")} dur={300} style={{ left: SAFE.left, top: TOP, width: CONTENT_W, height: 420 }} />
        ) : (
          <div style={{ position: "absolute", left: SAFE.left, top: TOP, width: CONTENT_W }}>
            <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 70, color: C.white, lineHeight: 1 }}>COLLÈGE BOULEVARD DU GABON</div>
            <div style={{ fontFamily: F.mono, fontSize: 26, color: C.dim, marginTop: 8 }}>MARCORY · ABIDJAN</div>
          </div>
        )}
        {/* Frise année scolaire 2025-2026 */}
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 260, width: CONTENT_W }}>
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.white, marginBottom: 20 }}>ANNÉE SCOLAIRE 2025-2026</div>
          <div style={{ position: "relative", height: 120 }}>
            <div style={{ position: "absolute", left: 0, top: 50, height: 6, width: `${appear(frame, g("similaire"), 30) * 100}%`, background: C.line }} />
            {["SEPT.", "DÉC.", "MARS", "JUIN"].map((m, i) => (
              <div key={m} style={{ position: "absolute", left: `${i * 31}%`, top: 70, fontFamily: F.mono, fontSize: 22, color: C.dim, opacity: appear(frame, g("similaire") + i * 4, 10) }}>
                {m}
              </div>
            ))}
            <div style={{ position: "absolute", left: "16%", top: 36, width: 34, height: 34, borderRadius: 17, background: C.amber, opacity: appear(frame, g("similaire") + f(2.5), 12) }} />
            <div style={{ position: "absolute", left: "62%", top: 36, width: 34, height: 34, borderRadius: 17, border: `4px solid ${C.grey}`, background: C.black, opacity: appear(frame, g("abandon"), 12) }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 440, width: CONTENT_W, display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ ...rise(appear(frame, g("similaire") + f(2.5), 16)) }}>
            <Chip color={C.amber} style={{ fontSize: 34 }}>
              MESURE SIMILAIRE D'EXCLUSION DES RETARDATAIRES
            </Chip>
          </div>
          <div style={{ ...rise(appear(frame, g("abandon"), 16)) }}>
            <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ opacity: appear(frame, g("abandon") + i * 3, 10) }}>
                  <Silhouette size={90} color="#4A515C" />
                </div>
              ))}
            </div>
            <Chip color={C.white} style={{ fontSize: 34 }}>
              ABANDONNÉE APRÈS LA CONTESTATION DES PARENTS
            </Chip>
          </div>
          <Attribution style={{ opacity: appear(frame, g("similaire") + f(3), 16) }}>Selon les témoignages recueillis par le journal</Attribution>
        </div>
        <ReconstitutionTag style={{ right: SAFE.right, top: TOP + 860 }} opacity={appear(frame, g("abandon"), 16)} />
      </Stage>
      <SourceReference pages={sc.pages} at={a} />
    </Backdrop>
  );
};

// ------------------------------------------------------------------ R7
export const S11Revelation7: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const g = (id: string) => segFrame(sc, id);
  const ent = g("entrer");
  const openP = interpolate(frame, [ent + 20, ent + 50], [1, 0], { ...clamp, easing: EASE.inOut });
  const days = [16, 17, 18, 19, 20];
  return (
    <Backdrop>
      <InvestigationChapter n={7} title="Un changement après la polémique" settleAt={g("vendredi") - 14} />
      <Stage a={g("vendredi") - 4} b={g("hierarchie")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP, display: "flex", gap: 12 }}>
          {days.map((d, i) => {
            const p = appear(frame, g("vendredi") + i * 6, 12);
            const hl = d === 20 || d === 16;
            return (
              <div key={d} style={{ width: 160, padding: "14px 0", textAlign: "center", border: `3px solid ${hl ? (d === 20 ? C.red : C.grey) : C.line}`, background: C.panel, opacity: p }}>
                <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 64, color: C.white }}>{d}</div>
                <div style={{ fontFamily: F.mono, fontSize: 18, color: C.dim }}>{d === 16 ? "VIDÉO" : d === 20 ? "CONSTAT" : "NOV."}</div>
              </div>
            );
          })}
        </div>
        <Photo src={ASSETS.gate2} frame={frame - ent} dur={f(12)} style={{ left: SAFE.left, top: TOP + 200, width: CONTENT_W, height: 520, opacity: appear(frame, ent - 10, 18) }} />
        <div style={{ position: "absolute", left: SAFE.left + 470, top: TOP + 460, opacity: appear(frame, ent, 10) * interpolate(frame, [ent + 55, ent + 75], [1, 0.0], clamp) }}>
          <GateGraphic p={openP} width={360} height={240} color={C.white} />
        </div>
        <div style={{ position: "absolute", left: SAFE.left + 24, top: TOP + 224, background: "rgba(11,13,16,0.75)", padding: "6px 18px", opacity: appear(frame, ent, 16) }}>
          <AnimatedClock from="07:42" at={ent} size={90} color={C.amber} />
        </div>
        <Caption style={{ position: "absolute", left: SAFE.left, top: TOP + 732 }}>Photo : portail du lycée (capture fournie) · heure illustrative</Caption>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 780, width: CONTENT_W, display: "flex", gap: 14, flexWrap: "wrap" }}>
          {["ENTRÉE AUTORISÉE", "TRAVAUX DE NETTOYAGE", "COURS À LA 2E HEURE"].map((t, i) => (
            <div key={t} style={{ ...rise(appear(frame, (i === 0 ? ent + 30 : g("nettoyage")) + (i > 0 ? (i - 1) * f(1.6) : 0), 16), 20) }}>
              <Chip color={i === 0 ? C.white : C.grey} style={{ fontSize: 30 }}>
                {t}
              </Chip>
            </div>
          ))}
        </div>
      </Stage>
      <Stage a={g("hierarchie")}>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 60 }}>
          <EvidenceCard
            at={g("hierarchie")}
            kicker="Instructions de la hiérarchie"
            body={
              <>
                Le directeur régional indique avoir reçu pour consigne de <span style={{ color: C.red }}>ne plus commenter</span> cette affaire.
              </>
            }
            source="Propos rapportés par L'Éléphant Déchaîné, p. 8"
          />
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: TOP + 560, ...rise(appear(frame, g("proviseure"), 16)) }}>
          <Chip color={C.amber} style={{ fontSize: 34 }}>
            MÊMES INSTRUCTIONS POUR LA PROVISEURE
          </Chip>
          <Attribution style={{ marginTop: 10 }}>selon le journal</Attribution>
        </div>
      </Stage>
      <SourceReference pages={sc.pages} at={g("vendredi")} />
    </Backdrop>
  );
};

