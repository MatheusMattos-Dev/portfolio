/*
 * Gera app/data/globe-data.ts: pontos do globo da seção "Captação" em quatro
 * níveis de detalhe (mundo, América do Sul, cone sul, região Sul, RS) e o
 * contorno do RS.
 *
 * Uso: node scripts/build_globe.js <pasta dos dados> app/data/globe-data.ts [prévia.svg]
 *
 * A pasta dos dados precisa destes arquivos (todos públicos):
 *   land50.json       https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json
 *   countries50.json  https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json
 *   lakes50.geojson   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_lakes.geojson
 *   rs_inter.geojson  https://servicodados.ibge.gov.br/api/v3/malhas/estados/43?formato=application/vnd.geo+json&qualidade=intermediaria
 *   rs_mun.geojson    https://servicodados.ibge.gov.br/api/v3/malhas/estados/43?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio
 *
 * Fontes: Natural Earth 1:50m (terra, países e lagos) e malhas do IBGE (RS e municípios).
 */
const fs = require("fs");
const dir = process.argv[2];
const out = process.argv[3];
const preview = process.argv[4];
const rd = (f) => JSON.parse(fs.readFileSync(dir + "/" + f, "utf8"));

/* ---------- TopoJSON ---------- */
function decodeArcs(topo) {
  const [sx, sy] = topo.transform.scale;
  const [tx, ty] = topo.transform.translate;
  return topo.arcs.map((arc) => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [x * sx + tx, y * sy + ty];
    });
  });
}
function ring(idxs, arcs) {
  const pts = [];
  for (const i of idxs) {
    const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse();
    for (let k = pts.length ? 1 : 0; k < a.length; k++) pts.push(a[k]);
  }
  return pts;
}
function polys(g, arcs) {
  if (g.type === "Polygon") return [g.arcs.map((r) => ring(r, arcs))];
  if (g.type === "MultiPolygon") return g.arcs.map((p) => p.map((r) => ring(r, arcs)));
  if (g.type === "GeometryCollection") return g.geometries.flatMap((x) => polys(x, arcs));
  return [];
}

/* ---------- ponto em polígono ---------- */
function prep(polyList) {
  return polyList.map((p) => {
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    for (const [x, y] of p[0]) {
      if (x < minx) minx = x; if (x > maxx) maxx = x;
      if (y < miny) miny = y; if (y > maxy) maxy = y;
    }
    return { rings: p, minx, maxx, miny, maxy };
  });
}
function inRing(x, y, r) {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function inside(x, y, prepared) {
  if (prepared.land) return inside(x, y, prepared.land) && !inside(x, y, prepared.lakes);
  for (const p of prepared) {
    if (x < p.minx || x > p.maxx || y < p.miny || y > p.maxy) continue;
    let c = false;
    for (const r of p.rings) if (inRing(x, y, r)) c = !c;
    if (c) return true;
  }
  return false;
}

/* ---------- simplificação (Douglas-Peucker) ---------- */
function simplify(pts, tol) {
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let md = 0, mi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-12;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / len;
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

/* ---------- bits ---------- */
function pack(bits) {
  const bytes = Buffer.alloc(Math.ceil(bits.length / 8));
  bits.forEach((b, i) => { if (b) bytes[i >> 3] |= 1 << (i & 7); });
  return bytes.toString("base64");
}
const r4 = (n) => Math.round(n * 1e4) / 1e4;

/* ---------- dados ---------- */
const land50 = rd("land50.json");
const landArcs = decodeArcs(land50);
const LAND0 = prep(polys(land50.objects.land, landArcs));
const LAKES = prep(rd("lakes50.geojson").features.map((f) => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates)).flat());
// "Terra" = dentro dos continentes e fora dos lagos (Lagoa Mirim, Grandes Lagos, Titicaca...).
const LAND = { land: LAND0, lakes: LAKES };

const c50 = rd("countries50.json");
const cArcs = decodeArcs(c50);
const brGeom = c50.objects.countries.geometries.find((g) => g.properties.name === "Brazil");
if (!brGeom) throw new Error("Brasil não encontrado");
const BR = prep(polys(brGeom, cArcs));

const rsFeat = rd("rs_inter.geojson").features[0].geometry;
const rsPolys = rsFeat.type === "Polygon" ? [rsFeat.coordinates] : rsFeat.coordinates;
const RS = prep(rsPolys);

const mun = rd("rs_mun.geojson").features.map((f) => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates)).flat();
const MUN = prep(mun);

// Lagoas: dentro do contorno do estado, mas fora de todos os municípios.
for (const [name, lat, lon] of [["Lagoa dos Patos", -31.1, -51.4], ["Lagoa Mirim", -32.75, -52.75], ["Porto Alegre", -30.03, -51.2], ["oceano", -31.5, -49.5]]) {
  console.log(name.padEnd(16), "RS", inside(lon, lat, RS), "municipios", inside(lon, lat, MUN), "land50", inside(lon, lat, LAND), "BR", inside(lon, lat, BR));
}

/* ---------- 1. mundo: linhas de latitude com espaçamento de área igual ---------- */
const WSTEP = 1.6;
const wbits = [], wbr = [];
let wland = 0;
for (let lat = -90 + WSTEP / 2; lat < 90; lat += WSTEP) {
  const n = Math.max(1, Math.round((360 * Math.cos((lat * Math.PI) / 180)) / WSTEP));
  for (let j = 0; j < n; j++) {
    const lon = -180 + ((j + 0.5) * 360) / n;
    const l = inside(lon, lat, LAND);
    wbits.push(l ? 1 : 0);
    wbr.push(l && inside(lon, lat, BR) ? 1 : 0);
    if (l) wland++;
  }
}
console.log("mundo:", wbits.length, "pontos na grade,", wland, "em terra,", wbr.filter(Boolean).length, "no Brasil");

/* ---------- 2 e 3. grades regulares (múltiplos inteiros do passo) ---------- */
function grid(step, lon0, lon1, lat0, lat1, test) {
  const cols = Math.round((lon1 - lon0) / step) + 1;
  const rows = Math.round((lat1 - lat0) / step) + 1;
  const bits = [], br = [];
  let n = 0;
  for (let i = 0; i < rows; i++) {
    const lat = lat0 + i * step;
    for (let j = 0; j < cols; j++) {
      const lon = lon0 + j * step;
      const [a, b] = test(lon, lat);
      bits.push(a ? 1 : 0);
      br.push(b ? 1 : 0);
      if (a) n++;
    }
  }
  return { step, lon0, lat0, cols, rows, bits, br, n };
}
const inRS = (lon, lat) => inside(lon, lat, RS);
// O interior do RS fica de fora das duas grades: de longe ele é a mancha do
// contorno preenchido e, de perto, a grade fina própria.
const SA = grid(0.5, -95, -30, -56, 24, (x, y) => {
  if (inRS(x, y)) return [false, false];
  const l = inside(x, y, LAND);
  return [l, l && inside(x, y, BR)];
});
const MID = grid(0.25, -80, -36, -56, -10, (x, y) => {
  if (inRS(x, y)) return [false, false];
  const l = inside(x, y, LAND);
  return [l, l && inside(x, y, BR)];
});
const REG = grid(0.125, -62, -46, -37, -22, (x, y) => {
  if (inRS(x, y)) return [false, false];
  const l = inside(x, y, LAND);
  return [l, l && inside(x, y, BR)];
});
// RS: dentro do estado e de algum município (deixa as lagoas de fora).
const RSG = grid(0.07, -57.68, -49.63, -33.81, -27.02, (x, y) => [inRS(x, y) && inside(x, y, MUN), false]);
console.log("américa do sul:", SA.cols + "x" + SA.rows, SA.n, "pontos");
console.log("cone sul:", MID.cols + "x" + MID.rows, MID.n, "pontos");
console.log("região:", REG.cols + "x" + REG.rows, REG.n, "pontos");
console.log("rs:", RSG.cols + "x" + RSG.rows, RSG.n, "pontos");

/* ---------- contorno do RS ---------- */
const outer = rsPolys[0][0];
let far = 0, fd = 0;
outer.forEach(([x, y], i) => { const d = Math.hypot(x - outer[0][0], y - outer[0][1]); if (d > fd) { fd = d; far = i; } });
const half1 = simplify(outer.slice(0, far + 1), 0.012);
const half2 = simplify(outer.slice(far), 0.012);
const outline = half1.concat(half2.slice(1, -1));
let gaps = 0;
for (let i = 0; i < 98; i++) for (let j = 0; j < 116; j++) { const x = -57.68 + j * 0.07, y = -33.81 + i * 0.07; if (inside(x, y, RS) && !inside(x, y, MUN)) gaps++; }
console.log("pontos no estado mas fora dos municípios:", gaps);
console.log("contorno RS:", outer.length, "->", outline.length, "pontos");

// Lagoas: contorno aproximado a partir da grade fina (células fora dos municípios e dentro do estado).
// Não é desenhado como linha; a ausência de pontos já mostra a lagoa.

/* ---------- cidades: confere que caem dentro do RS ---------- */
const cities = [
  ["São Borja", -28.6606, -56.0044],
  ["Alegrete", -29.7831, -55.7919],
  ["Uruguaiana", -29.7547, -57.0883],
  ["São Luiz Gonzaga", -28.4083, -54.9606],
  ["Itaqui", -29.1253, -56.5531],
  ["Santo Ângelo", -28.2992, -54.2631],
  ["Santa Maria", -29.6842, -53.8069],
  ["Santa Rosa", -27.8711, -54.4814],
];
for (const [n, lat, lon] of cities) console.log(n.padEnd(18), "no RS:", inRS(lon, lat));

/* ---------- saída ---------- */
const flat = [];
for (const [x, y] of outline) flat.push(Math.round(x * 100), Math.round(y * 100));
const g = (o, withBr) =>
  `{ step: ${o.step}, lon0: ${o.lon0}, lat0: ${o.lat0}, cols: ${o.cols}, rows: ${o.rows}, bits: "${pack(o.bits)}"${withBr ? `, br: "${pack(o.br)}"` : ""} }`;
const ts = `/*
 * Pontos do globo da seção "Captação". ARQUIVO GERADO: não edite à mão.
 * Para refazer, rode scripts/build_globe.js (veja o cabeçalho dele).
 *
 * Cada grade é uma máscara de bits em base64 (1 = terra). "br" marca os pontos
 * que ficam no Brasil. Fontes: Natural Earth 1:50m e malhas do IBGE.
 */

/** Mundo: linhas de latitude a cada ${WSTEP} graus, com n = round(360 * cos(lat) / passo) pontos por linha. */
export const WORLD = { step: ${WSTEP}, bits: "${pack(wbits)}", br: "${pack(wbr)}" };

/** América do Sul, grade regular de 0,5 grau, sem o interior do RS. */
export const SOUTH_AMERICA = ${g(SA, true)};

/** Metade sul do continente, grade de 0,25 grau, sem o interior do RS. */
export const MID = ${g(MID, true)};

/** Região Sul e vizinhos, grade de 0,125 grau, sem o interior do RS. */
export const REGION = ${g(REG, true)};

/** Rio Grande do Sul, grade de 0,07 grau, sem as lagoas dos Patos e Mirim. */
export const RS_GRID = ${g(RSG, false)};

/** Contorno do RS: pares [lon, lat] em centésimos de grau. */
export const RS_OUTLINE: number[] = [${flat.join(",")}];
`;
fs.writeFileSync(out, ts, "utf8");
console.log("gravado", out, (ts.length / 1024).toFixed(1) + " KB");

/* ---------- prévia em SVG (equirretangular) ---------- */
if (preview) {
  const W = 1400, H = 700;
  const px = (lon) => ((lon + 180) / 360) * W;
  const py = (lat) => ((90 - lat) / 180) * H;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H + 760}" width="${W}"><rect width="100%" height="100%" fill="#111"/>`;
  let k = 0;
  for (let lat = -90 + WSTEP / 2; lat < 90; lat += WSTEP) {
    const n = Math.max(1, Math.round((360 * Math.cos((lat * Math.PI) / 180)) / WSTEP));
    for (let j = 0; j < n; j++, k++) {
      if (!wbits[k]) continue;
      const lon = -180 + ((j + 0.5) * 360) / n;
      s += `<circle cx="${r4(px(lon))}" cy="${r4(py(lat))}" r="1.3" fill="${wbr[k] ? "#33E092" : "#bbb"}"/>`;
    }
  }
  // região + RS ampliados
  const Z = 44, ox = 60, oy = H + 30;
  const zx = (lon) => ox + (lon + 62) * Z * 0.875;
  const zy = (lat) => oy + (-22 - lat) * Z;
  for (let i = 0; i < REG.rows; i++) for (let j = 0; j < REG.cols; j++) {
    const q = i * REG.cols + j;
    if (!REG.bits[q]) continue;
    s += `<circle cx="${r4(zx(REG.lon0 + j * REG.step))}" cy="${r4(zy(REG.lat0 + i * REG.step))}" r="1.5" fill="${REG.br[q] ? "#4f9" : "#888"}" opacity=".7"/>`;
  }
  for (let i = 0; i < RSG.rows; i++) for (let j = 0; j < RSG.cols; j++) {
    if (!RSG.bits[i * RSG.cols + j]) continue;
    s += `<circle cx="${r4(zx(RSG.lon0 + j * RSG.step))}" cy="${r4(zy(RSG.lat0 + i * RSG.step))}" r="1" fill="#33E092"/>`;
  }
  s += `<path d="M${outline.map(([x, y]) => r4(zx(x)) + " " + r4(zy(y))).join("L")}Z" fill="none" stroke="#fff" stroke-width="1"/>`;
  for (const [n, lat, lon] of cities) s += `<circle cx="${r4(zx(lon))}" cy="${r4(zy(lat))}" r="4" fill="#f55"/><text x="${r4(zx(lon) + 7)}" y="${r4(zy(lat) + 4)}" fill="#fff" font-size="12" font-family="sans-serif">${n}</text>`;
  s += "</svg>";
  fs.writeFileSync(preview, s, "utf8");
  console.log("prévia", preview);
}
