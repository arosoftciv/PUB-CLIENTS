// Captures de contrôle : 3 images par scène (début de narration, milieu, fin) → output/qc/
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const tl = JSON.parse(readFileSync(path.join(root, "src/data/timings.json")));
const only = process.argv[2] ? process.argv[2].split(",") : null;
const out = path.join(root, "output/qc");
mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const composition = await selectComposition({ serveUrl, browserExecutable: process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", id: "Documentaire", inputProps: { subtitles: true } });
const frames = [];
for (const sc of tl.scenes) {
  if (only && !only.includes(sc.id)) continue;
  const segs = sc.segments;
  const pts = [0.5];
  for (const s of segs) pts.push(s.start + Math.min(2.5, (s.end - s.start) * 0.7));
  for (const [i, t] of pts.entries()) frames.push({ name: `${sc.id}-${String(i).padStart(2, "0")}`, frame: Math.round((sc.start + t) * 30) });
}
for (const fr of frames) {
  await renderStill({ composition, serveUrl, browserExecutable: process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", frame: fr.frame, output: path.join(out, `${fr.name}.jpg`), imageFormat: "jpeg", jpegQuality: 70, scale: 0.5, inputProps: { subtitles: true } });
  process.stdout.write(fr.name + " ");
}
console.log("\nok", frames.length);
