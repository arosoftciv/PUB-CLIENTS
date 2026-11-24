// Génère les tracés SVG de la Côte d'Ivoire et des pays voisins (world-atlas, Natural Earth, domaine public).
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
const topo = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/countries-50m.json", import.meta.url)));
const all = feature(topo, topo.objects.countries).features;
const civ = all.find((f) => f.id === "384");
const neighbours = all.filter((f) => ["466", "430", "324", "288", "854"].includes(f.id));
const W = 900, H = 900;
const proj = geoMercator().fitExtent([[60, 60], [W - 60, H - 60]], civ);
const path = geoPath(proj);
const pt = (lon, lat) => proj([lon, lat]).map((v) => Math.round(v * 10) / 10);
const out = {
  width: W, height: H,
  civ: path(civ),
  neighbours: neighbours.map((f) => ({ id: f.id, name: f.properties.name, d: path(f) })),
  cities: {
    yamoussoukro: pt(-5.2767, 6.8276),
    abidjan: pt(-4.0083, 5.36),
    marcory: pt(-3.9826, 5.3039),
  },
  credit: "Fond de carte : Natural Earth (domaine public) via world-atlas",
};
writeFileSync(new URL("../src/data/map.json", import.meta.url), JSON.stringify(out));
console.log("map ok", out.cities);
