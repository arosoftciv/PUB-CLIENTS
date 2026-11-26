// Carte de l'Afrique de l'Ouest (Natural Earth 50m, domaine public, via world-atlas) → src/data/map.json
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
const topo = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/countries-50m.json", import.meta.url)));
const all = feature(topo, topo.objects.countries).features;
const W = 1000, H = 1000;
// Cadre : lon -10.5 → 4.5, lat 1.5 → 13 (Côte d'Ivoire, Ghana, Togo, Bénin, golfe de Guinée)
const frame = { type: "Feature", geometry: { type: "MultiPoint", coordinates: [[-10.5, 1.5], [4.5, 1.5], [4.5, 13], [-10.5, 13]] } };
const proj = geoMercator().fitExtent([[0, 0], [W, H]], frame);
const path = geoPath(proj);
const ids = { "384": "Côte d'Ivoire", "288": "Ghana", "430": "Liberia", "324": "Guinée", "466": "Mali", "854": "Burkina Faso", "768": "Togo", "204": "Bénin", "566": "Nigeria", "694": "Sierra Leone", "562": "Niger" };
const pt = (lon, lat) => proj([lon, lat]).map((v) => Math.round(v * 10) / 10);
const out = {
  width: W, height: H,
  countries: all.filter((f) => ids[f.id]).map((f) => ({ id: f.id, name: ids[f.id], d: path(f), c: path.centroid(f).map((v) => Math.round(v)) })),
  cities: { abidjan: pt(-4.0083, 5.36), accra: pt(-0.187, 5.6037) },
  credit: "Fond de carte : Natural Earth (domaine public) via world-atlas",
};
writeFileSync(new URL("../src/data/map.json", import.meta.url), JSON.stringify(out));
console.log("map ok", out.cities, out.countries.map((c) => c.name + " " + c.c));
