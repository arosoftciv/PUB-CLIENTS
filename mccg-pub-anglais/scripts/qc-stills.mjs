// Captures de contrôle → output/qc/  (usage : node scripts/qc-stills.mjs [t1,t2,...] en secondes ; défaut : 2 par scène + couverture)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const tl = JSON.parse(readFileSync(path.join(root, "src/data/timeline.json")));
const browserExecutable = process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const out = path.join(root, "output/qc");
mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const comp = await selectComposition({ serveUrl, browserExecutable, id: "MCCGPub" });
let times = process.argv[2] ? process.argv[2].split(",").map(Number) : tl.scenes.flatMap((s) => [s.start + (s.end - s.start) * 0.45, s.end - 0.2]);
for (const t of times) {
  const name = `t${t.toFixed(2).padStart(6, "0")}`;
  await renderStill({ composition: comp, serveUrl, browserExecutable, frame: Math.min(comp.durationInFrames - 1, Math.round(t * 30)), output: path.join(out, `${name}.jpg`), imageFormat: "jpeg", jpegQuality: 75, scale: 0.5 });
  process.stdout.write(name + " ");
}
if (!process.argv[2]) {
  const cover = await selectComposition({ serveUrl, browserExecutable, id: "Couverture" });
  await renderStill({ composition: cover, serveUrl, browserExecutable, output: path.join(out, "cover.jpg"), imageFormat: "jpeg", jpegQuality: 80, scale: 0.5 });
}
console.log("\nok");
