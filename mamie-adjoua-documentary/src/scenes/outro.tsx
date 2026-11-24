// Scènes 12 à 16 : chronologie, questions, conclusion, signature, sources.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, SAFE, CONTENT_W, clamp } from "../styles/theme";
import { appear, rise, vanish } from "../animations/anim";
import { SceneTiming, segFrame, f } from "../data/timeline";
import { Backdrop, Photo, Attribution } from "../components/base";
import { DocumentaryTitle, QuestionCard, Timeline } from "../components/editorial";
import { NewspaperReveal } from "../components/illustrations";
import { ASSETS } from "../data/assets";

type P = { sc: SceneTiming };

export const S12Chronology: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const at = (k: number) => segFrame(sc, `e${k}`);
  const items = [
    { date: "22 OCTOBRE 2026", label: "Instauration de la mesure d'exclusion", accent: C.red },
    { date: "2 NOVEMBRE 2026", label: "Annonce du démarrage du transport scolaire" },
    { date: "3 NOVEMBRE 2026", label: "Mobilisation des bus spéciaux" },
    { date: "16 NOVEMBRE 2026", label: "Publication de la vidéo de l'élève", accent: C.amber },
    { date: "17 ET 18 NOVEMBRE 2026", label: "Réactions officielles" },
    { date: "20 NOVEMBRE 2026", label: "Assouplissement de la mesure constaté par le journal" },
    { date: "23 NOVEMBRE 2026", label: "Publication de l'investigation", accent: C.red },
  ].map((it, i) => ({ ...it, at: at(i + 1) }));
  return (
    <Backdrop>
      <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top, width: CONTENT_W }}>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: C.red, letterSpacing: 4, opacity: appear(frame, 0, 14) }}>CHRONOLOGIE</div>
        <DocumentaryTitle at={4} lines={[{ text: "DES DATES QUI INTERPELLENT", size: 74 }]} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: SAFE.W, height: 1290, overflow: "hidden", clipPath: "inset(300px 0 0 0)" }}>
        <Timeline items={items} top={330} spacing={132} />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, top: 1300, opacity: appear(frame, at(1), 20) }}>
        <Attribution color={C.dim}>Succession chronologique — aucun lien de causalité n'est établi</Attribution>
      </div>
    </Backdrop>
  );
};

export const S13Questions: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const g = (id: string, w: "start" | "end" = "start") => segFrame(sc, id, w);
  const qs = [
    "Existe-t-il une convention formelle entre le lycée et la SOTRA ?",
    "Qui a autorisé ce partenariat ?",
    "Comment le tarif de 27 000 francs a-t-il été déterminé ?",
    "Qui encaisse les paiements et comment ces fonds sont-ils gérés ?",
    "Pourquoi les parents et le COGES n'auraient-ils pas été associés aux négociations ?",
    "Existe-t-il un lien entre la fermeture du portail et le transport scolaire payant ?",
  ];
  const D = sc.duration * 30;
  const introOut = vanish(frame, g("q1") - 12, 12);
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Photo
        src={ASSETS.gate2}
        frame={frame}
        dur={D}
        grade="mono"
        from={{ s: 1.1, x: -20, y: 0 }}
        to={{ s: 1.3, x: 20, y: -30 }}
        style={{ left: 0, top: 0, width: SAFE.W, height: SAFE.H, opacity: 0.14 + 0.06 * (frame / D) }}
        fit="cover"
      />
      <div style={{ position: "absolute", left: SAFE.left, top: 520, width: CONTENT_W, opacity: introOut }}>
        <DocumentaryTitle
          at={g("retenir")}
          lines={[
            { text: "Que retenir de cette investigation ?", size: 54, font: "text", weight: 500, color: C.dim },
            { text: "LES QUESTIONS", size: 150 },
            { text: "SANS RÉPONSE", size: 150, color: C.amber },
          ]}
        />
      </div>
      {qs.map((q, i) => {
        const a = g(`q${i + 1}`);
        const b = i < 5 ? g(`q${i + 2}`) : D - 6;
        return <QuestionCard key={i} text={q} index={i + 1} total={6} at={a - 4} end={b} />;
      })}
    </AbsoluteFill>
  );
};

export const S14Conclusion: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const g = (id: string) => segFrame(sc, id);
  const words = ["GOUVERNANCE", "TRANSPARENCE", "RESPONSABILITÉ"];
  const partA = vanish(frame, g("gouvernance") - 10, 12);
  const partB = Math.min(appear(frame, g("gouvernance"), 14), vanish(frame, g("simple") - 10, 12));
  const partC = appear(frame, g("simple"), 20);
  return (
    <Backdrop>
      <div style={{ opacity: partA }}>
        <div style={{ position: "absolute", left: 470, top: 260 }}>
          <NewspaperReveal at={4} width={440} rotate={-3} />
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: 300, width: 380 }}>
          <div style={{ fontFamily: F.mono, fontSize: 22, color: C.red, letterSpacing: 3, opacity: appear(frame, 6, 14) }}>L'ÉLÉPHANT DÉCHAÎNÉ</div>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 84, color: C.white, lineHeight: 1, ...rise(appear(frame, g("prudent"), 18)) }}>RESTE PRUDENT</div>
        </div>
        <div style={{ position: "absolute", left: SAFE.left, top: 1000, width: CONTENT_W, display: "flex", flexDirection: "column", gap: 14 }}>
          {["AUCUN LIEN DE CAUSALITÉ ÉTABLI", "AUCUNE FRAUDE DÉMONTRÉE"].map((t, i) => (
            <div key={t} style={{ ...rise(appear(frame, g("causalite") + f(1.5) + i * f(2.6), 16)), fontFamily: F.title, fontWeight: 700, fontSize: 52, color: C.white, borderLeft: `6px solid ${C.grey}`, paddingLeft: 20 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: SAFE.left, top: 420, width: CONTENT_W, opacity: partB }}>
        <div style={{ fontFamily: F.text, fontSize: 36, color: C.dim, marginBottom: 30 }}>De sérieuses interrogations sur :</div>
        {words.map((w, i) => (
          <div key={w} style={{ overflow: "hidden" }}>
            <div
              style={{
                fontFamily: F.title,
                fontWeight: 800,
                fontSize: 140,
                lineHeight: 1.02,
                color: i === 1 ? C.red : C.white,
                transform: `translateY(${(1 - appear(frame, g("gouvernance") + f(1.2) + i * f(1.1), 18)) * 100}%)`,
              }}
            >
              {w}
            </div>
          </div>
        ))}
      </div>
      <div style={{ opacity: partC }}>
        <Photo src={ASSETS.gate1} frame={frame - g("simple")} dur={f(12)} style={{ left: 0, top: 0, width: SAFE.W, height: SAFE.H, opacity: 0.55 }} to={{ s: 1.18, x: 0, y: -40 }} />
        <AbsoluteFill style={{ background: "linear-gradient(rgba(11,13,16,0.4), rgba(11,13,16,0.85))" }} />
        <div style={{ position: "absolute", left: SAFE.left, top: 560, width: CONTENT_W }}>
          <div style={{ fontFamily: F.text, fontSize: 40, color: C.white, lineHeight: 1.35, ...rise(appear(frame, g("simple") + 10, 18)) }}>Un simple problème de ponctualité scolaire…</div>
          <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 104, color: C.white, lineHeight: 1, marginTop: 30, ...rise(appear(frame, g("debat") + f(2), 18)) }}>
            DEVENU UN DÉBAT NATIONAL
          </div>
        </div>
      </div>
    </Backdrop>
  );
};

export const S15Signature: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const g = (id: string) => segFrame(sc, id);
  const D = sc.duration * 30;
  const photoO = interpolate(frame, [0, 10, g("rouvert") + 10, g("demeurent") - 6], [0, 0.8, 0.8, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Photo src={ASSETS.gate1} frame={frame} dur={D} from={{ s: 1.05, x: 0, y: 0 }} to={{ s: 1.45, x: 0, y: 60 }} style={{ left: 0, top: 0, width: SAFE.W, height: SAFE.H, opacity: photoO }} />
      <div style={{ position: "absolute", left: SAFE.left, top: 700, width: CONTENT_W, textAlign: "center" }}>
        <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 104, color: C.white, lineHeight: 1, opacity: appear(frame, g("rouvert"), 20) }}>LE PORTAIL S'EST ROUVERT.</div>
        <div style={{ fontFamily: F.title, fontWeight: 800, fontSize: 104, color: C.amber, lineHeight: 1, marginTop: 40, opacity: appear(frame, g("demeurent"), 20) }}>
          MAIS LES QUESTIONS DEMEURENT.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const S16Credits: React.FC<P> = () => {
  const frame = useCurrentFrame();
  const Line = ({ at, children, style }: { at: number; children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ ...rise(appear(frame, at, 18), 20), ...style }}>{children}</div>
  );
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <div style={{ position: "absolute", left: SAFE.left, top: 300, width: CONTENT_W }}>
        <Line at={0} style={{ fontFamily: F.mono, fontSize: 26, color: C.red, letterSpacing: 5 }}>
          SOURCE PRINCIPALE
        </Line>
        <Line at={6} style={{ fontFamily: F.title, fontWeight: 800, fontSize: 110, color: C.white, lineHeight: 1, marginTop: 12 }}>
          L'ÉLÉPHANT DÉCHAÎNÉ
        </Line>
        <Line at={12} style={{ fontFamily: F.text, fontSize: 34, color: C.white, marginTop: 20 }}>
          Édition spéciale du 23 novembre 2026
        </Line>
        <Line at={16} style={{ fontFamily: F.title, fontWeight: 700, fontSize: 52, color: C.amber, marginTop: 8 }}>
          « Les mystères du portail fermé »
        </Line>
        <Line at={22} style={{ fontFamily: F.text, fontSize: 30, color: C.white, marginTop: 40, lineHeight: 1.4 }}>
          Investigation réalisée par les journalistes de L'Éléphant Déchaîné.
        </Line>
        <Line at={28} style={{ fontFamily: F.text, fontSize: 30, color: C.dim, marginTop: 18, lineHeight: 1.4 }}>
          Adaptation audiovisuelle et synthèse documentaire.
        </Line>
        <Line at={34} style={{ fontFamily: F.text, fontStyle: "italic", fontSize: 26, color: C.dim, marginTop: 30, lineHeight: 1.45, borderLeft: `4px solid ${C.grey}`, paddingLeft: 20 }}>
          Les faits, témoignages et déclarations présentés sont issus de cette publication et n'ont pas fait l'objet d'une vérification indépendante dans le cadre de cette adaptation.
        </Line>
        <Line at={42} style={{ fontFamily: F.mono, fontSize: 20, color: C.dim, marginTop: 40, lineHeight: 1.6 }}>
          Photos du portail : visuels fournis (dont « Vivre À Yamoussoukro »).
          <br />
          Vidéo de l'élève : extrait muet, publication relayée par Zooma Média (TikTok).
          <br />
          Fond de carte : Natural Earth. Musique et effets sonores originaux.
          <br />
        </Line>
        {ASSETS.arosoftLogo ? (
          <Line at={50} style={{ marginTop: 50, display: "flex", alignItems: "center", gap: 20 }}>
            <Img src={staticFile(ASSETS.arosoftLogo)} style={{ height: 70 }} />
            <span style={{ fontFamily: F.text, fontSize: 28, color: C.white }}>Production audiovisuelle : AroSoft</span>
          </Line>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};


/** Cloche de notification générique (aucune marque de plateforme). */
const Bell: React.FC<{ swing: number; size?: number; color?: string }> = ({ swing, size = 220, color = C.white }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ rotate: `${swing}deg`, transformOrigin: "50% 8%", overflow: "visible" }}>
    <path d="M50 10 C33 10 25 24 25 40 L25 60 L16 72 L84 72 L75 60 L75 40 C75 24 67 10 50 10 Z" fill={color} />
    <circle cx={50} cy={8} r={5} fill={color} />
    <path d="M40 78 A10 10 0 0 0 60 78 Z" fill={color} />
  </svg>
);

export const S17CallToAction: React.FC<P> = ({ sc }) => {
  const frame = useCurrentFrame();
  const g = (id: string) => segFrame(sc, id);
  const ab = g("abonnez");
  const pressAt = ab + f(1.3);
  const press = interpolate(frame, [pressAt, pressAt + 4, pressAt + 10], [1, 0.93, 1], clamp);
  const subscribed = frame >= pressAt + 4;
  const bellAt = ab + f(1.9);
  const t = Math.max(0, frame - bellAt);
  const swing = frame >= bellAt ? Math.sin(t * 0.9) * 22 * Math.exp(-t / 22) : 0;
  const ring = appear(frame, bellAt, 6) * (1 - appear(frame, bellAt + 20, 20));
  return (
    <Backdrop tint="#1A1215">
      <div style={{ position: "absolute", left: SAFE.left, top: 380, width: CONTENT_W, textAlign: "center" }}>
        <DocumentaryTitle align="center" at={g("aime")} lines={[{ text: "VOUS AVEZ AIMÉ ?", size: 120 }]} />
      </div>
      <div style={{ position: "absolute", left: SAFE.left, top: 600, width: CONTENT_W, display: "flex", justifyContent: "center", ...rise(appear(frame, ab, 16), 30) }}>
        <div
          style={{
            fontFamily: F.title,
            fontWeight: 800,
            fontSize: 88,
            letterSpacing: 2,
            color: subscribed ? C.dim : C.white,
            background: subscribed ? C.anthracite : C.red,
            border: `3px solid ${subscribed ? C.grey : C.red}`,
            padding: "14px 56px",
            borderRadius: 14,
            transform: `scale(${press})`,
            boxShadow: subscribed ? "none" : "0 20px 60px rgba(185,45,50,0.45)",
          }}
        >
          {subscribed ? "ABONNÉ ✓" : "ABONNEZ-VOUS"}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, width: SAFE.W - 0, top: 800, display: "flex", justifyContent: "center", opacity: appear(frame, bellAt - 10, 14) }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: -40, top: -40, width: 300, height: 300, borderRadius: 150, border: `4px solid ${C.amber}`, opacity: ring, transform: `scale(${0.8 + (1 - ring) * 0.4})` }} />
          <Bell swing={swing} color={frame >= bellAt ? C.amber : C.white} />
        </div>
      </div>
      <div style={{ position: "absolute", left: SAFE.left, top: 1080, width: CONTENT_W, textAlign: "center", ...rise(appear(frame, bellAt + 6, 18), 20) }}>
        <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 40, color: C.white, lineHeight: 1.3 }}>Activez la cloche de notification</div>
        <div style={{ fontFamily: F.text, fontSize: 34, color: C.dim, lineHeight: 1.3, marginTop: 8 }}>pour rester informés de l'actualité</div>
      </div>
    </Backdrop>
  );
};
