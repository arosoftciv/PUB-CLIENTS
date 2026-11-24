// Assemblage du documentaire et du teaser.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import "./styles/theme";
import { C, F, SAFE, CONTENT_W, clamp } from "./styles/theme";
import { TL, CUES, TEASER_CUES, f, SceneTiming } from "./data/timeline";
import { FilmFinish, BrandBug } from "./components/base";
import { ASSETS } from "./data/assets";
import { SubtitleOverlay, DocumentaryTitle } from "./components/editorial";
import { Cover } from "./scenes/Cover";
import { S01Hook, S02TitleCard, S03Video, S04Investigation } from "./scenes/intro";
import { S05Revelation1, S06Revelation2, S07Revelation3, S08Revelation4, S09Revelation5, S10Revelation6, S11Revelation7 } from "./scenes/revelations";
import { S12Chronology, S13Questions, S14Conclusion, S15Signature, S16Credits, S17CallToAction } from "./scenes/outro";
import { appear } from "./animations/anim";

const SCENES: Record<string, React.FC<{ sc: SceneTiming }>> = {
  s00: () => <Cover grain={false} logo={false} />,
  s01: S01Hook,
  s02: S02TitleCard,
  s03: S03Video,
  s04: S04Investigation,
  s05: S05Revelation1,
  s06: S06Revelation2,
  s07: S07Revelation3,
  s08: S08Revelation4,
  s09: S09Revelation5,
  s10: S10Revelation6,
  s11: S11Revelation7,
  s12: S12Chronology,
  s13: S13Questions,
  s14: S14Conclusion,
  s15: S15Signature,
  s16: S16Credits,
  s17: S17CallToAction,
};

/** Fondu enchaîné court en entrée de scène (sauf coupe sèche après la couverture). */
const SceneFade: React.FC<{ children: React.ReactNode; id: string; dur: number }> = ({ children, id, dur }) => {
  const frame = useCurrentFrame();
  const fin = id === "s00" || id === "s01" ? 1 : interpolate(frame, [0, 10], [0, 1], clamp);
  const fout = id === "s15" ? 1 : interpolate(frame, [dur - 8, dur], [1, 0], clamp);
  return <AbsoluteFill style={{ opacity: Math.min(fin, fout) }}>{children}</AbsoluteFill>;
};

// sous-titres masqués quand le même texte est déjà affiché à l'écran
const HIDE_SUBS = new Set(["s15", "s17"]);
const QUESTION_SEGS = TL.scenes.find((s) => s.id === "s13")!.segments.filter((s) => s.id.startsWith("q"));
const s13Start = TL.scenes.find((s) => s.id === "s13")!.start;
const hideCue = (c: { scene?: string; text: string; start?: number }) => {
  if (c.scene && HIDE_SUBS.has(c.scene)) return true;
  if (c.scene === "s13" && c.start !== undefined) {
    return QUESTION_SEGS.some((q) => c.start! >= s13Start + q.start - 0.05 && c.start! < s13Start + q.end);
  }
  return false;
};

export const DocumentaryVisuals: React.FC = () => (
  <AbsoluteFill style={{ background: C.black }}>
    {TL.scenes.map((sc) => {
      const Comp = SCENES[sc.id];
      const dur = f(sc.duration);
      return (
        <Sequence key={sc.id} from={f(sc.start)} durationInFrames={dur} name={`${sc.id} · ${sc.name}`}>
          <SceneFade id={sc.id} dur={dur}>
            <Comp sc={sc} />
          </SceneFade>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

export const Documentary: React.FC<{ subtitles: boolean }> = ({ subtitles }) => (
  <AbsoluteFill style={{ background: C.black }}>
    <DocumentaryVisuals />
    <FilmFinish />
    <BrandBug src={ASSETS.arosoftLogo} />
    {subtitles ? <SubtitleOverlay cues={CUES} hide={hideCue as never} /> : null}
    <Audio src={staticFile("audio/mix/master.wav")} />
  </AbsoluteFill>
);

// ------------------------------------------------------------------ Teaser
const TeaserCard: React.FC<{ kind: "intro" | "outro" }> = ({ kind }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <div style={{ position: "absolute", left: SAFE.left, top: 560, width: CONTENT_W }}>
        {kind === "intro" ? (
          <DocumentaryTitle
            lines={[
              { text: "L'ÉLÉPHANT DÉCHAÎNÉ · 23/11/2026", size: 30, font: "mono", color: C.red, weight: 500 },
              { text: "LYCÉE MAMIE ADJOUA", size: 110 },
              { text: "LES MYSTÈRES DU PORTAIL FERMÉ", size: 76, color: C.amber },
            ]}
          />
        ) : (
          <>
            <DocumentaryTitle
              lines={[
                { text: "DÉCOUVREZ", size: 120 },
                { text: "LE DOCUMENTAIRE COMPLET", size: 84, color: C.amber },
              ]}
            />
            <div style={{ fontFamily: F.text, fontSize: 32, color: C.white, marginTop: 40, lineHeight: 1.4, opacity: appear(frame, 20, 16) }}>
              Les 7 révélations de l'investigation de L'Éléphant Déchaîné
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 22, color: C.dim, marginTop: 30, lineHeight: 1.5, opacity: appear(frame, 30, 16) }}>
              Source : L'Éléphant Déchaîné, édition spéciale du 23/11/2026. Faits rapportés, non vérifiés de manière indépendante.
            </div>
            <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 34, color: C.white, marginTop: 50, lineHeight: 1.35, opacity: appear(frame, 45, 16) }}>
              Vous avez aimé ? <span style={{ color: C.red }}>Abonnez-vous</span> et activez la cloche de notification pour rester informés de l'actualité.
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const Teaser: React.FC<{ subtitles: boolean }> = ({ subtitles }) => {
  const T = TL.teaser;
  const intro = f(T.intro);
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Sequence durationInFrames={intro}>
        <TeaserCard kind="intro" />
      </Sequence>
      {T.clips.map((c, i) => (
        <Sequence key={i} from={intro + f(c.start)} durationInFrames={f(c.duration)} name={`clip ${c.scene}/${c.seg}`}>
          <Sequence from={-f(c.srcStart)}>
            <DocumentaryVisuals />
          </Sequence>
        </Sequence>
      ))}
      <Sequence from={f(T.total - T.outro)}>
        <TeaserCard kind="outro" />
      </Sequence>
      <FilmFinish />
      <BrandBug src={ASSETS.arosoftLogo} />
      {subtitles ? <SubtitleOverlay cues={TEASER_CUES} /> : null}
      <Audio src={staticFile("audio/mix/teaser.wav")} />
    </AbsoluteFill>
  );
};
