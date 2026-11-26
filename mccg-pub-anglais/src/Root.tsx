import React from "react";
import { Composition, Still } from "remotion";
import "./theme";
import { Cover } from "./Cover";
import { Main } from "./Main";
import { FPS, TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MCCGPub" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
    <Still id="Couverture" component={Cover} width={1080} height={1920} />
  </>
);
