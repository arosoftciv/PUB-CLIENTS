import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(1.5);
// Navigateur pré-installé dans l'environnement de production (pas de téléchargement).
// Sur une autre machine : supprimer ces lignes ou définir REMOTION_BROWSER.
const browser = process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
Config.setBrowserExecutable(browser);
