import React from "react";
import { Composition, Still } from "remotion";
import { Documentary, Teaser } from "./Documentary";
import { Cover } from "./scenes/Cover";
import { TOTAL_FRAMES, TEASER_FRAMES, FPS } from "./data/timeline";

const W = 1080;
const H = 1920;

export const RemotionRoot: React.FC = () => (
  <>
    {/* Version principale avec sous-titres intégrés (4K : --scale=2) */}
    <Composition id="Documentaire" component={Documentary} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ subtitles: true }} />
    <Composition id="DocumentaireSansSousTitres" component={Documentary} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ subtitles: false }} />
    <Composition id="Teaser" component={Teaser} durationInFrames={TEASER_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ subtitles: true }} />
    <Still id="Couverture" component={Cover} width={W} height={H} defaultProps={{ grain: false }} />
  </>
);
