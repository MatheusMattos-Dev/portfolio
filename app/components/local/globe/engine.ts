import { MID, REGION, RS_GRID, RS_OUTLINE, SOUTH_AMERICA, WORLD } from "@/app/data/globe-data";
import type { City, Journey, Source } from "@/app/data/story";

/*
 * Motor do globo da seção "Captação": um canvas 2D, sem biblioteca.
 *
 * O disco tem sempre o mesmo tamanho. De longe ele é o planeta; quando a câmera
 * desce, vira uma lente sobre o Rio Grande do Sul. O corpo, o brilho e a sombra
 * do disco são CSS (.globe-body e .globe-shade em globals.css): aqui só entra o
 * que se move. A terra é feita de pontos em cinco níveis de detalhe, que se
 * revezam conforme o zoom.
 *
 * Tudo sai de um relógio só (segundos). O mesmo instante desenha sempre o mesmo
 * quadro, o que permite pausar, pular para um caminho e conferir um quadro exato.
 */

const RAD = Math.PI / 180;
const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ tempo */

export const TIMING = { world: 8.4, dive: 2.8, reveal: 2.0, journey: 4.8, perLoop: 3, rise: 2.4 };

const A = TIMING.world; // fim do giro
const B = A + TIMING.dive; // chegou no RS
const C = B + TIMING.reveal; // começa o primeiro caminho
const TJ = TIMING.journey;
const D = C + TIMING.perLoop * TJ; // começa a subida
export const LOOP = D + TIMING.rise;

/** Momentos dentro de um caminho, em segundos. */
const J = { source: 0.3, signal: 1.25, page: 1.85, message: 3.05, leave: 4.45 };

const S_RS = 12; // o estado inteiro cabe no disco
const S_CITY = 21; // zoom dos caminhos
const RS_CENTER = { lat: -30.35, lon: -53.6 };
const WORLD_LAT = 8;
const WORLD_ROLL = -13 * RAD;

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** Longitude de volta para [-180, 180). */
const wrap = (lon: number) => ((((lon + 180) % 360) + 360) % 360) - 180;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const sstep = (x: number, a: number, b: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const easeIO = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const backOut = (u: number) => 1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2);
/** Número pseudoaleatório fixo em [0, 1) para cada n. */
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Giro do planeta: arranca devagar, gira em velocidade constante e freia ao chegar. */
const SPIN: number[] = (() => {
  const n = 240;
  const out = [0];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    acc += sstep(u, 0, 0.14) * (1 - sstep(u, 0.68, 1));
    out.push(acc);
  }
  return out.map((x) => x / acc);
})();
const spin = (u: number) => {
  const x = clamp01(u) * (SPIN.length - 1);
  const i = Math.min(SPIN.length - 2, Math.floor(x));
  return lerp(SPIN[i], SPIN[i + 1], x - i);
};
const SWEEP = A + 0.9; // o giro termina já dentro do mergulho

/**
 * Onde o relógio começa: a África está de frente e a América do Sul chega em
 * poucos segundos, em vez de esperar a volta inteira na primeira vez.
 */
export const START: number = (() => {
  for (let t = 0; t < A; t += 0.02) if (360 * (1 - spin(t / SWEEP)) <= 96) return t;
  return 0;
})();

/* ------------------------------------------------------------------ dados */

type Layer = { n: number; v: Float32Array; br: Uint8Array; fine: Uint8Array };

function fromBase64(s: string) {
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
const bitAt = (u: Uint8Array, i: number) => (u[i >> 3] >> (i & 7)) & 1;

function unit(lat: number, lon: number, out: number[] | Float32Array, o: number) {
  const cl = Math.cos(lat * RAD);
  out[o] = cl * Math.cos(lon * RAD);
  out[o + 1] = cl * Math.sin(lon * RAD);
  out[o + 2] = Math.sin(lat * RAD);
}

function pack(pts: number[], br: number[], fine: number[]): Layer {
  return { n: br.length, v: new Float32Array(pts), br: new Uint8Array(br), fine: new Uint8Array(fine) };
}

function worldLayer(): Layer {
  const bits = fromBase64(WORLD.bits);
  const brb = fromBase64(WORLD.br);
  const pts: number[] = [];
  const br: number[] = [];
  const fine: number[] = [];
  let k = 0;
  // Mesma conta do gerador: a ordem dos pontos precisa bater com a dos bits.
  for (let lat = -90 + WORLD.step / 2; lat < 90; lat += WORLD.step) {
    const n = Math.max(1, Math.round((360 * Math.cos((lat * Math.PI) / 180)) / WORLD.step));
    for (let j = 0; j < n; j++, k++) {
      if (!bitAt(bits, k)) continue;
      unit(lat, -180 + ((j + 0.5) * 360) / n, pts, pts.length);
      br.push(bitAt(brb, k));
      fine.push(0);
    }
  }
  return pack(pts, br, fine);
}

function gridLayer(g: { step: number; lon0: number; lat0: number; cols: number; rows: number; bits: string; br?: string }, split: boolean): Layer {
  const bits = fromBase64(g.bits);
  const brb = g.br ? fromBase64(g.br) : null;
  const pts: number[] = [];
  const br: number[] = [];
  const fine: number[] = [];
  for (let i = 0; i < g.rows; i++) {
    for (let j = 0; j < g.cols; j++) {
      const q = i * g.cols + j;
      if (!bitAt(bits, q)) continue;
      unit(g.lat0 + i * g.step, g.lon0 + j * g.step, pts, pts.length);
      br.push(brb ? bitAt(brb, q) : 0);
      // No RS, um ponto a cada dois (nas duas direções) forma a malha de longe; o resto entra de perto.
      fine.push(split && !(i % 2 === 0 && j % 2 === 0) ? 1 : 0);
    }
  }
  return pack(pts, br, fine);
}

type Data = { world: Layer; sa: Layer; mid: Layer; region: Layer; rs: Layer; outline: Float32Array; ring: number[][] };
let cache: Data | null = null;
function data(): Data {
  if (cache) return cache;
  const outline = new Float32Array((RS_OUTLINE.length / 2) * 3);
  const ring: number[][] = [];
  for (let i = 0; i < RS_OUTLINE.length; i += 2) {
    const lon = RS_OUTLINE[i] / 100;
    const lat = RS_OUTLINE[i + 1] / 100;
    unit(lat, lon, outline, (i / 2) * 3);
    ring.push([lon, lat]);
  }
  cache = {
    world: worldLayer(),
    sa: gridLayer(SOUTH_AMERICA, false),
    mid: gridLayer(MID, false),
    region: gridLayer(REGION, false),
    rs: gridLayer(RS_GRID, true),
    outline,
    ring,
  };
  return cache;
}

function inRing(lon: number, lat: number, ring: number[][]) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/* ------------------------------------------------------------------ cores */

type Palette = {
  grid: string;
  gridA: number;
  land: string;
  landA: number;
  brazil: string;
  rs: string;
  rsLine: string;
  pin: string;
  pinCore: string;
  text: string;
  muted: string;
  halo: string;
  person: string;
  beam: string;
  twinkle: string;
  src: Record<Source, string>;
};

const DARK: Palette = {
  grid: "255,255,255",
  gridA: 0.055,
  land: "#a8a8b3",
  landA: 0.62,
  brazil: "#7fe0b5",
  rs: "#33E092",
  rsLine: "#5cf0ae",
  pin: "#33E092",
  pinCore: "#07110c",
  text: "#fafafa",
  muted: "#c4c4cc",
  halo: "9,13,11",
  person: "#ffffff",
  beam: "#33E092",
  twinkle: "#ffffff",
  src: { google: "#8ab4f8", maps: "#fbbf24", instagram: "#f472b6" },
};

const LIGHT: Palette = {
  grid: "0,0,0",
  gridA: 0.05,
  land: "#6b6b77",
  landA: 0.68,
  brazil: "#3aa873",
  rs: "#12a150",
  rsLine: "#0f8a43",
  pin: "#12a150",
  pinCore: "#ffffff",
  text: "#18181b",
  muted: "#52525b",
  halo: "255,255,255",
  person: "#18181b",
  beam: "#12a150",
  twinkle: "#0f8a43",
  src: { google: "#1a73e8", maps: "#d97706", instagram: "#db2777" },
};

/* ------------------------------------------------------------------ tipos */

export type GlobeLayout = {
  /** Tamanho do canvas em px de CSS e a densidade da tela. */
  w: number;
  h: number;
  dpr: number;
  /** Centro e raio do disco. */
  cx: number;
  cy: number;
  r: number;
  /** "side": origem à esquerda e cartões à direita. "stack": tudo empilhado. */
  mode: "side" | "stack";
  /** Pontos da interface, em px do canvas, onde os feixes começam e terminam. */
  src: [number, number];
  page: [number, number];
  wa: [number, number];
};

export type Phase = "world" | "dive" | "reveal" | "journey" | "rise";

export type GlobeView = {
  phase: Phase;
  /** Índice do caminho mostrado nos cartões. */
  journey: number;
  /** 0 nada, 1 origem, 2 página, 3 mensagem. */
  step: 0 | 1 | 2 | 3;
  /** Cartões apagados: o globo está girando e o caminho mostrado é o anterior. */
  dim: boolean;
  /** Nome do lugar que a câmera mostra. */
  place: string;
  lat: number;
  lon: number;
  zoom: number;
  /** As cidades já estão no mapa. */
  pins: boolean;
};

type Cam = { lon: number; lat: number; s: number; roll: number };

export type Globe = {
  setLayout(l: GlobeLayout): void;
  setTheme(dark: boolean): void;
  setFont(family: string): void;
  draw(T: number): GlobeView;
  /** Instante em que o caminho j começa, a partir de T. */
  timeOf(j: number, T: number): number;
  /** Instante com o caminho j completo na tela (para "reduzir movimento"). */
  still(j: number): number;
};

/* ------------------------------------------------------------------ motor */

export function createGlobe(canvas: HTMLCanvasElement, cities: City[], journeys: Journey[]): Globe | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const DT = data();
  const NJ = journeys.length;
  const PER = TIMING.perLoop;

  let L: GlobeLayout = { w: 0, h: 0, dpr: 1, cx: 0, cy: 0, r: 0, mode: "side", src: [0, 0], page: [0, 0], wa: [0, 0] };
  let P = DARK;
  let font = "system-ui, sans-serif";

  /* cidades, de oeste para leste: é a ordem em que aparecem */
  const cityV = new Float32Array(cities.length * 3);
  cities.forEach((c, i) => unit(c.lat, c.lon, cityV, i * 3));
  const order = cities.map((_, i) => i).sort((a, b) => cities[a].lon - cities[b].lon);
  const rank = cities.map((_, i) => order.indexOf(i));

  /*
   * Pontos de onde saem os sinais, sempre dentro do RS: quem mora perto.
   * O primeiro de cada cidade é o do caminho em destaque e fica, de preferência,
   * do lado de onde vem o feixe da origem.
   */
  const origins: number[][][] = cities.map((c, i) => {
    const list: number[][] = [];
    const prefer = [150, 120, 180, 90, 210, 60, 240, 30, 270, 0, 300, 330];
    const at = (deg: number, d: number) => [c.lat + d * Math.sin(deg * RAD), c.lon + (d * Math.cos(deg * RAD)) / Math.cos(c.lat * RAD)];
    for (let k = 0; k < prefer.length && !list.length; k++) {
      const p = at(prefer[k], 0.42);
      const q = at(prefer[k], 0.62);
      if (inRing(p[1], p[0], DT.ring) && inRing(q[1], q[0], DT.ring)) list.push(p);
    }
    if (!list.length) list.push(at(0, 0.3));
    for (let k = 0; k < 40 && list.length < 8; k++) {
      const p = at(hash(i * 31 + k) * 360, 0.22 + hash(i * 17 + k * 3) * 0.4);
      if (inRing(p[1], p[0], DT.ring)) list.push(p);
    }
    return list;
  });

  /** Os caminhos de cada volta: três por vez, em rodízio. */
  const slots = (n: number) => {
    const out: number[] = [];
    for (let k = 0; k < PER; k++) out.push((((n * PER + k) % NJ) + NJ) % NJ);
    return out;
  };

  /* ---------------------------------------------------------------- câmera */

  let sCity = S_CITY;
  let fx = -0.2;
  let fy = 0.02;

  function focusCam(city: number, drift: number): Cam {
    const c = cities[city];
    const s = sCity * (1 + 0.035 * drift);
    // O pino fica em (fx, fy) raios do centro: a câmera olha para o ponto ao lado.
    return { lon: c.lon - fx / s / Math.cos(c.lat * RAD) / RAD, lat: c.lat + fy / s / RAD, s, roll: 0 };
  }
  const mix = (a: Cam, b: Cam, u: number, uz = u): Cam => ({
    lon: lerp(a.lon, b.lon, u),
    lat: lerp(a.lat, b.lat, u),
    roll: lerp(a.roll, b.roll, u),
    s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), uz)),
  });
  const overview = (hold: number): Cam => ({ lon: RS_CENTER.lon, lat: RS_CENTER.lat, s: S_RS * (1 + 0.03 * hold), roll: 0 });
  const planet: Cam = { lon: RS_CENTER.lon, lat: WORLD_LAT, s: 1, roll: WORLD_ROLL };

  function camAt(n: number, t: number): Cam {
    const seq = slots(n);
    if (t < C) {
      const u = clamp01((t - A) / TIMING.dive);
      const turn = easeIO(clamp01(u / 0.78));
      const c = mix(planet, overview(clamp01((t - B) / TIMING.reveal)), turn, easeIO(u));
      c.lon = RS_CENTER.lon + 360 * (1 - spin(t / SWEEP));
      return c;
    }
    if (t < D) {
      const k = Math.min(PER - 1, Math.floor((t - C) / TJ));
      const tau = t - C - k * TJ;
      const from = k === 0 ? overview(1) : focusCam(journeys[seq[k - 1]].city, 1);
      return mix(from, focusCam(journeys[seq[k]].city, tau / TJ), easeIO(clamp01(tau / 1.05)));
    }
    const u = clamp01((t - D) / TIMING.rise);
    // Primeiro afasta, depois vira para o equador: assim o RS segue no meio enquanto encolhe.
    return mix(focusCam(journeys[seq[PER - 1]].city, 1), planet, easeIO(clamp01((u - 0.4) / 0.6)), easeIO(u));
  }

  function viewOf(T: number, cam: Cam): GlobeView {
    const n = Math.floor(T / LOOP);
    const t = T - n * LOOP;
    const seq = slots(n);
    let phase: Phase = "world";
    let journey = n <= 0 ? seq[0] : slots(n - 1)[PER - 1];
    let step: 0 | 1 | 2 | 3 = 3;
    let dim = true;
    let city = -1;
    if (t >= D) {
      phase = "rise";
      journey = seq[PER - 1];
      dim = t - D > 0.9;
    } else if (t >= C) {
      const k = Math.min(PER - 1, Math.floor((t - C) / TJ));
      const tau = t - C - k * TJ;
      phase = "journey";
      journey = seq[k];
      city = journeys[journey].city;
      step = tau < J.source ? 0 : tau < J.page ? 1 : tau < J.message ? 2 : 3;
      dim = false;
    } else if (t >= B) phase = "reveal";
    else if (t >= A) phase = "dive";

    let place = "Planeta Terra";
    if (city >= 0) place = cities[city].name + ", RS";
    else if (cam.s > 6.5) place = "Rio Grande do Sul";
    else if (cam.s > 2.4) place = "América do Sul";
    return { phase, journey, step, dim, place, lat: cam.lat, lon: cam.lon, zoom: cam.s, pins: phase === "reveal" ? t - B > 0.5 : phase === "journey" || (phase === "rise" && cam.s > 6) };
  }

  /* ---------------------------------------------------------------- projeção */

  let Xx = 1, Xy = 0, Xz = 0, Yx = 0, Yy = 1, Yz = 0, Zx = 0, Zy = 0, Zz = 1;
  let K = 1; // px por unidade na esfera
  let px = 0, py = 0, pz = 0;

  function setBasis(cam: Cam) {
    const cl = Math.cos(cam.lat * RAD), sl = Math.sin(cam.lat * RAD);
    const co = Math.cos(cam.lon * RAD), so = Math.sin(cam.lon * RAD);
    const ex = -so, ey = co;
    const nx = -sl * co, ny = -sl * so, nz = cl;
    const cr = Math.cos(cam.roll), sr = Math.sin(cam.roll);
    Xx = ex * cr - nx * sr; Xy = ey * cr - ny * sr; Xz = -nz * sr;
    Yx = ex * sr + nx * cr; Yy = ey * sr + ny * cr; Yz = nz * cr;
    Zx = cl * co; Zy = cl * so; Zz = sl;
    K = L.r * cam.s;
  }
  /** Projeta o vetor v[o..o+2] e deixa o resultado em px, py (tela) e pz (profundidade). */
  function proj(v: ArrayLike<number>, o: number) {
    const x = v[o], y = v[o + 1], z = v[o + 2];
    pz = x * Zx + y * Zy + z * Zz;
    px = L.cx + (x * Xx + y * Xy + z * Xz) * K;
    py = L.cy - (x * Yx + y * Yy + z * Yz) * K;
  }
  const tmp = [0, 0, 0];
  function projLL(lat: number, lon: number) {
    unit(lat, lon, tmp, 0);
    proj(tmp, 0);
  }

  /* ---------------------------------------------------------------- pontos */

  const BUSY = new Float32Array(4 * 41 * 2);
  /** Caixas dos nomes de cidade desenhados no quadro atual. */
  const LBL = new Float32Array(cities.length * 4);
  let nLbl = 0;
  const BUF: Float32Array[] = [];
  let most = 0;
  [DT.world, DT.sa, DT.mid, DT.region, DT.rs].forEach((l) => (most = Math.max(most, l.n)));
  for (let i = 0; i < 8; i++) BUF.push(new Float32Array(2 * most));
  const CNT = [0, 0, 0, 0, 0, 0, 0, 0];
  const DEPTH_A = [0.26, 0.48, 0.74, 1];
  const DEPTH_R = [0.62, 0.78, 0.92, 1];

  /** sel: 0 todos, 1 só a malha de longe, 2 só os pontos finos. */
  function dots(layer: Layer, alpha: number, rad: number, c0: string, c1: string, depth: boolean, sel: number) {
    const { cx, cy, r } = L;
    const lim = (r + 2) * (r + 2);
    const v = layer.v, br = layer.br, fine = layer.fine;
    for (let b = 0; b < 8; b++) CNT[b] = 0;
    for (let i = 0, j = 0; i < layer.n; i++, j += 3) {
      if (sel && fine[i] !== sel - 1) continue;
      const x = v[j], y = v[j + 1], z = v[j + 2];
      const dz = x * Zx + y * Zy + z * Zz;
      if (dz <= 0.03) continue;
      const dx = (x * Xx + y * Xy + z * Xz) * K;
      const dy = (x * Yx + y * Yy + z * Yz) * K;
      if (dx * dx + dy * dy > lim) continue;
      const b = (br[i] ? 4 : 0) + (depth ? (dz < 0.3 ? 0 : dz < 0.55 ? 1 : dz < 0.8 ? 2 : 3) : 3);
      const o = CNT[b];
      BUF[b][o] = cx + dx;
      BUF[b][o + 1] = cy - dy;
      CNT[b] = o + 2;
    }
    for (let b = 0; b < 8; b++) {
      const n = CNT[b];
      if (!n) continue;
      const buf = BUF[b];
      const rr = rad * DEPTH_R[b & 3];
      ctx!.globalAlpha = alpha * DEPTH_A[b & 3];
      ctx!.fillStyle = b < 4 ? c0 : c1;
      ctx!.beginPath();
      // Ponto pequeno vira quadrado: em tela de alta densidade não se nota e custa bem menos que um arco.
      if (rr < 0.85 || (L.dpr >= 1.5 && rr * L.dpr < 1.8)) {
        for (let o = 0; o < n; o += 2) ctx!.rect(buf[o] - rr, buf[o + 1] - rr, rr * 2, rr * 2);
      } else {
        for (let o = 0; o < n; o += 2) {
          ctx!.moveTo(buf[o] + rr, buf[o + 1]);
          ctx!.arc(buf[o], buf[o + 1], rr, 0, TAU);
        }
      }
      ctx!.fill();
    }
    ctx!.globalAlpha = 1;
  }

  /* ---------------------------------------------------------------- traços */

  function graticule(cam: Cam, far: number, near: number) {
    const c = ctx!;
    c.lineWidth = 1;
    if (far > 0.02) {
      c.strokeStyle = `rgba(${P.grid},${P.gridA * far})`;
      c.beginPath();
      for (let lon = -180; lon < 180; lon += 30) line(-88, 88, 4, (a) => projLL(a, lon));
      for (let lat = -60; lat <= 60; lat += 30) line(-180, 180, 4, (a) => projLL(lat, a));
      c.stroke();
    }
    if (near > 0.02) {
      // De perto, uma linha por grau: dá a noção de mapa e de movimento sobre o oceano.
      const ang = Math.asin(Math.min(1, 1 / cam.s)) / RAD + 0.6;
      const lonSpan = ang / Math.cos(cam.lat * RAD);
      c.strokeStyle = `rgba(${P.grid},${P.gridA * 0.8 * near})`;
      c.beginPath();
      for (let lat = Math.floor(cam.lat - ang); lat <= Math.ceil(cam.lat + ang); lat++) line(cam.lon - lonSpan, cam.lon + lonSpan, lonSpan / 5, (a) => projLL(lat, a));
      for (let lon = Math.floor(cam.lon - lonSpan); lon <= Math.ceil(cam.lon + lonSpan); lon++) line(cam.lat - ang, cam.lat + ang, ang / 5, (a) => projLL(a, lon));
      c.stroke();
    }
  }
  function line(a0: number, a1: number, step: number, f: (a: number) => void) {
    let pen = false;
    for (let a = a0; a <= a1 + 1e-6; a += step) {
      f(a);
      if (pz <= 0.02) {
        pen = false;
        continue;
      }
      if (pen) ctx!.lineTo(px, py);
      else ctx!.moveTo(px, py);
      pen = true;
    }
  }

  function state(S: number) {
    const c = ctx!;
    const v = DT.outline;
    unit(RS_CENTER.lat, RS_CENTER.lon, tmp, 0);
    proj(tmp, 0);
    if (pz < 0.05) return;
    const edge = sstep(pz, 0.05, 0.3);
    c.beginPath();
    for (let i = 0; i < v.length; i += 3) {
      proj(v, i);
      if (i) c.lineTo(px, py);
      else c.moveTo(px, py);
    }
    c.closePath();
    // De longe o estado é uma mancha verde no planeta; de perto, um contorno sobre os pontos.
    c.globalAlpha = lerp(0.92, 0.09, sstep(S, 2.2, 7)) * edge;
    c.fillStyle = P.rs;
    c.fill();
    const la = sstep(S, 2.6, 5.5);
    if (la > 0.01) {
      c.globalAlpha = la * 0.95;
      c.strokeStyle = P.rsLine;
      c.lineWidth = lerp(1, 1.5, sstep(S, 8, 14));
      c.lineJoin = "round";
      c.stroke();
    }
    c.globalAlpha = 1;
  }

  function ring(x: number, y: number, rad: number, color: string, alpha: number, width = 1.4) {
    if (alpha <= 0.01 || rad <= 0) return;
    const c = ctx!;
    c.globalAlpha = alpha;
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    c.arc(x, y, rad, 0, TAU);
    c.stroke();
    c.globalAlpha = 1;
  }
  function dot(x: number, y: number, rad: number, color: string, alpha: number) {
    if (alpha <= 0.01 || rad <= 0) return;
    const c = ctx!;
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.beginPath();
    c.arc(x, y, rad, 0, TAU);
    c.fill();
    c.globalAlpha = 1;
  }

  /** Texto com contorno na cor do fundo, para ler por cima dos pontos. */
  function label(text: string, x: number, y: number, size: number, weight: number, color: string, alpha: number, align: CanvasTextAlign, tracking = 0) {
    if (alpha <= 0.01) return;
    const c = ctx!;
    c.font = `${weight} ${size}px ${font}`;
    c.textBaseline = "middle";
    c.lineJoin = "round";
    c.lineWidth = Math.max(3, size * 0.32);
    c.strokeStyle = `rgba(${P.halo},${0.85 * alpha})`;
    c.fillStyle = color;
    if (!tracking) {
      c.textAlign = align;
      c.strokeText(text, x, y);
      c.globalAlpha = alpha;
      c.fillText(text, x, y);
      c.globalAlpha = 1;
      return;
    }
    // Espaçamento entre letras feito à mão: ctx.letterSpacing ainda não existe em todo navegador.
    c.textAlign = "left";
    let w = 0;
    const ws: number[] = [];
    for (let i = 0; i < text.length; i++) {
      const cw = c.measureText(text[i]).width + tracking;
      ws.push(cw);
      w += cw;
    }
    const start = align === "center" ? x - (w - tracking) / 2 : align === "right" ? x - w + tracking : x;
    for (let pass = 0; pass < 2; pass++) {
      let xx = start;
      c.globalAlpha = pass ? alpha : 1;
      for (let i = 0; i < text.length; i++) {
        if (pass) c.fillText(text[i], xx, y);
        else c.strokeText(text[i], xx, y);
        xx += ws[i];
      }
    }
    c.globalAlpha = 1;
  }

  /** Curva entre dois pontos: "h" e "v" saem e chegam retos, "arc" é um salto curto. */
  const CP = [0, 0, 0, 0, 0, 0, 0, 0];
  function curve(x0: number, y0: number, x3: number, y3: number, bend: "h" | "v" | "arc") {
    let x1: number, y1: number, x2: number, y2: number;
    if (bend === "h") {
      const d = (x3 - x0) * 0.5;
      x1 = x0 + d; y1 = y0; x2 = x3 - d; y2 = y3;
    } else if (bend === "v") {
      const d = (y3 - y0) * 0.5;
      x1 = x0; y1 = y0 + d; x2 = x3; y2 = y3 - d;
    } else {
      // arco curto, sempre arqueado para cima, como um salto
      let nx = -(y3 - y0) * 0.26, ny = (x3 - x0) * 0.26;
      if (ny > 0) {
        nx = -nx;
        ny = -ny;
      }
      x1 = x2 = (x0 + x3) / 2 + nx; y1 = y2 = (y0 + y3) / 2 + ny;
    }
    CP[0] = x0; CP[1] = y0; CP[2] = x1; CP[3] = y1; CP[4] = x2; CP[5] = y2; CP[6] = x3; CP[7] = y3;
  }
  let bx = 0, by = 0;
  function bez(u: number) {
    const m = 1 - u;
    const a = m * m * m, b = 3 * m * m * u, c = 3 * m * u * u, d = u * u * u;
    bx = a * CP[0] + b * CP[2] + c * CP[4] + d * CP[6];
    by = a * CP[1] + b * CP[3] + c * CP[5] + d * CP[7];
  }
  /** Traça o trecho [u0, u1] da curva atual, com um halo largo por baixo. */
  function stroke(u0: number, u1: number, color: string, alpha: number, width: number) {
    if (alpha <= 0.01 || u1 <= u0) return;
    const c = ctx!;
    c.beginPath();
    const n = 28;
    for (let i = 0; i <= n; i++) {
      bez(lerp(u0, u1, i / n));
      if (i) c.lineTo(bx, by);
      else c.moveTo(bx, by);
    }
    c.lineCap = "round";
    c.strokeStyle = color;
    c.globalAlpha = alpha * 0.22;
    c.lineWidth = width * 3.4;
    c.stroke();
    c.globalAlpha = alpha;
    c.lineWidth = width;
    c.stroke();
    c.globalAlpha = 1;
  }
  /** Sinal correndo pela curva: rastro que some e uma ponta acesa. */
  function comet(u: number, color: string, alpha: number, size: number) {
    if (u <= 0 || u >= 1.35) return;
    const head = Math.min(1, u);
    const tail = Math.max(0, u - 0.42);
    stroke(tail, head, color, alpha * (u > 1 ? clamp01((1.35 - u) / 0.35) : 1), size * 0.7);
    if (u < 1) {
      bez(head);
      dot(bx, by, size * 2.6, color, alpha * 0.25);
      dot(bx, by, size * 1.15, "#ffffff", alpha);
    }
  }

  /* ---------------------------------------------------------------- quadro */

  function draw(T: number): GlobeView {
    const n = Math.floor(T / LOOP);
    const t = T - n * LOOP;
    const cam = camAt(n, t);
    const view = viewOf(T, cam);
    const { w, h, dpr, cx, cy, r } = L;
    const c = ctx!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    if (r < 20) return view;
    setBasis(cam);
    const S = cam.s;
    const far = 1 - sstep(S, 1.6, 4);
    const near = sstep(S, 5, 9);
    const unitPx = clamp(r / 220, 0.75, 1.25); // tudo que é traço e marcador escala com o disco

    /* 1. o corpo, o brilho e a sombra do disco são CSS (pintados uma vez só); aqui entra só o que se move */
    c.save();
    c.beginPath();
    c.arc(cx, cy, r, 0, TAU);
    c.clip();

    graticule(cam, far, near);

    /* 2. terra: os cinco níveis se revezam com o zoom */
    const r0 = clamp(r / 200, 0.78, 1.3);
    const sp = (step: number) => step * RAD * K;
    const size = (px: number) => r0 * clamp(px / 5.4, 0.5, 1.25);
    /*
     * Uma malha mais fina só entra quando o que o disco mostra cabe dentro dela;
     * senão a borda da malha apareceria. Os limites são os da grade, a não ser
     * onde depois dela só há oceano (o Atlântico até a África, o mar ao sul).
     */
    const seen = Math.asin(Math.min(1, 1 / S)) / RAD;
    const lon0 = wrap(cam.lon);
    const fits = (w: number, e: number, s: number, n: number, soft: number) =>
      sstep(Math.min(cam.lat - s, n - cam.lat, Math.min(lon0 - w, e - lon0) * Math.cos(cam.lat * RAD)) - seen, 0, soft);
    const toSA = sstep(S, 1.55, 2.05) * fits(-95, -17, -62, 24, 4);
    const toMID = sstep(S, 4, 5.5) * fits(-110, -17, -62, -10, 3);
    const toREG = sstep(S, 8.5, 10.5) * fits(-62, -17, -37, -22, 2);
    const aW = 1 - toSA;
    if (aW > 0.01) dots(DT.world, aW * P.landA, r0 * Math.min(1.4, 1 + 0.3 * (S - 1)) * (0.55 + 0.45 * aW), P.land, P.brazil, true, 0);
    const aSA = toSA * (1 - toMID);
    if (aSA > 0.01) dots(DT.sa, aSA * P.landA, size(sp(0.5)), P.land, P.brazil, S < 3, 0);
    const aMID = toMID * (1 - toREG);
    if (aMID > 0.01) dots(DT.mid, aMID * P.landA * 0.9, size(sp(0.25)), P.land, P.brazil, false, 0);
    const aREG = toREG;
    if (aREG > 0.01) dots(DT.region, aREG * P.landA * 0.82, size(sp(0.125)), P.land, P.brazil, false, 0);

    state(S);

    const aRS = sstep(S, 4.5, 8);
    const aFine = sstep(S, 13, 17);
    if (aRS > 0.01) {
      const rr = size(lerp(sp(0.14), sp(0.07), aFine));
      dots(DT.rs, aRS * 0.9, rr, P.rs, P.rs, false, aFine > 0.99 ? 0 : 1);
      if (aFine > 0.01 && aFine <= 0.99) dots(DT.rs, aRS * 0.9 * aFine, rr, P.rs, P.rs, false, 2);
    }

    /* 3. de longe: buscas piscando pelo mundo e o RS chamando */
    if (far > 0.02) {
      const wv = DT.world.v;
      for (let i = 0; i < 10; i++) {
        const k = Math.floor(T / 0.11) - i;
        const life = (T - k * 0.11) / 1.0;
        if (life >= 1) continue;
        proj(wv, Math.floor(hash(k) * DT.world.n) * 3);
        if (pz < 0.12) continue;
        const a = Math.sin(Math.PI * life) * far * sstep(pz, 0.12, 0.4);
        dot(px, py, r0 * (1.3 + 1.2 * life), P.twinkle, a);
        ring(px, py, r0 * (2 + 6 * life), P.twinkle, a * 0.4, 1);
      }
      unit(RS_CENTER.lat, RS_CENTER.lon, tmp, 0);
      proj(tmp, 0);
      if (pz > 0.15) {
        const vis = far * sstep(pz, 0.15, 0.45);
        for (let i = 0; i < 2; i++) {
          const u = (T / 1.9 + i * 0.5) % 1;
          ring(px, py, r * (0.07 + 0.2 * u), P.rs, (1 - u) * 0.7 * vis, 1.5);
        }
      }
    }

    /* 4. cidades, sinais e o caminho em destaque */
    const loop = slots(n);
    let active = -1;
    let tau = -1;
    let jIdx = -1;
    if (view.phase === "journey") {
      const k = Math.min(PER - 1, Math.floor((t - C) / TJ));
      tau = t - C - k * TJ;
      jIdx = loop[k];
      active = journeys[jIdx].city;
    }
    const pinsOn = view.phase === "reveal" || view.phase === "journey" ? 1 : view.phase === "rise" ? sstep(S, 3.5, 7) : 0;
    const labelsOn = sstep(S, 14, 17);
    const fsCity = clamp(r / 20, 11.5, 12.5);
    const awaySide = active >= 0 ? sideFor(jIdx, fsCity, unitPx) : "below";
    if (active >= 0) setBasis(cam); // sideFor mede com a câmera já parada na cidade

    // Onde o caminho passa: quem buscou, o pino e os três feixes. Os nomes das
    // outras cidades somem enquanto algum deles estiver por cima.
    let personX = 0, personY = 0, pinX = 0, pinY = 0;
    let nBusy = 0;
    nLbl = 0;
    const bend = L.mode === "side" ? "h" : "v";
    const yielding = active >= 0 ? sstep(tau, 0.1, 0.6) * (1 - sstep(tau, J.leave, TJ)) : 0;
    if (active >= 0) {
      const o = origins[active][0];
      projLL(o[0], o[1]);
      personX = px; personY = py;
      proj(cityV, active * 3);
      pinX = px; pinY = py;
      const trace = (x0: number, y0: number, x1: number, y1: number, kind: "h" | "v" | "arc") => {
        curve(x0, y0, x1, y1, kind);
        for (let i = 0; i <= 40; i++) {
          bez(i / 40);
          BUSY[nBusy++] = bx;
          BUSY[nBusy++] = by;
        }
      };
      trace(L.src[0], L.src[1], personX, personY, bend);
      trace(pinX, pinY, L.page[0], L.page[1], bend);
      trace(pinX, pinY, L.wa[0], L.wa[1], bend);
      trace(personX, personY, pinX, pinY, "arc");
      c.font = `700 ${fsCity}px ${font}`;
      const hw = c.measureText(cities[active].name).width / 2;
      spot(pinX, pinY, awaySide, 11 * unitPx, hw, fsCity);
      ACT[0] = sx - hw - 7; ACT[1] = sy - fsCity * 0.75 - 3; ACT[2] = sx + hw + 7; ACT[3] = sy + fsCity * 0.75 + 3;
    }

    if (pinsOn > 0.01) {
      // sinais soltos chegando nas outras cidades: a captação não para
      for (let i = 0; i < 3; i++) {
        const k = Math.floor(T / 0.46) - i;
        const u = (T - k * 0.46) / 1.05;
        if (u >= 1.3) continue;
        const ci = Math.floor(hash(k * 3.1) * cities.length);
        if (ci === active) continue;
        if (view.phase === "reveal" && t - B < 0.5 + rank[ci] * 0.12 + 0.3) continue;
        const o = origins[ci];
        const from = o[1 + Math.floor(hash(k * 5.7) * (o.length - 1))] || o[0];
        const col = P.src[hash(k * 9.3) < 0.56 ? "google" : hash(k * 9.3) < 0.8 ? "maps" : "instagram"];
        projLL(from[0], from[1]);
        const x0 = px, y0 = py;
        proj(cityV, ci * 3);
        if (!inDisk(px, py, 0) || !inDisk(x0, y0, 0)) continue;
        curve(x0, y0, px, py, "arc");
        dot(x0, y0, 1.7 * unitPx, col, pinsOn * 0.8 * (1 - sstep(u, 0.5, 1)));
        comet(u, col, pinsOn * 0.85, 1.25 * unitPx);
        if (u > 1) ring(px, py, (5 + 16 * (u - 1) / 0.3) * unitPx, P.pin, (1.3 - u) / 0.3 * 0.7 * pinsOn, 1.2);
      }
    }

    // quem mora perto da cidade em destaque
    if (active >= 0) {
      const o = origins[active];
      const show = sstep(tau, 0.2, 0.7) * (1 - sstep(tau, J.leave, TJ));
      for (let i = 1; i < o.length; i++) {
        projLL(o[i][0], o[i][1]);
        if (!inDisk(px, py, 0)) continue;
        const tw = 0.45 + 0.35 * Math.sin(T * 2.2 + i * 1.7);
        dot(px, py, 1.6 * unitPx, P.person, show * tw * 0.7);
      }
    }

    if (pinsOn > 0.01) {
      for (let q = 0; q < cities.length; q++) {
        const i = order[q];
        proj(cityV, i * 3);
        if (pz <= 0 || !inDisk(px, py, 4)) continue;
        let pop = 1;
        if (view.phase === "reveal") {
          const u = (t - B - 0.5 - q * 0.12) / 0.45;
          if (u <= 0) continue;
          pop = backOut(clamp01(u));
          const ru = (t - B - 0.5 - q * 0.12) / 0.85;
          if (ru < 1) ring(px, py, (5 + 26 * easeOut(ru)) * unitPx, P.pin, (1 - ru) * 0.8, 1.5);
        }
        const on = i === active;
        const grow = on ? 1 + 0.4 * sstep(tau, 0.1, 0.6) * (1 - sstep(tau, J.leave, TJ)) : 1;
        const sc = pop * grow * unitPx * pinsOn;
        // batida leve em todas: estão no ar
        const beat = (T / 2.6 + q * 0.19) % 1;
        ring(px, py, (5.5 + 7 * beat) * unitPx, P.pin, (1 - beat) * 0.34 * pinsOn, 1);
        dot(px, py, 6.4 * sc, P.pin, 0.24);
        dot(px, py, 3.5 * sc, P.pin, 1);
        dot(px, py, 1.25 * sc, on ? "#ffffff" : P.pinCore, 1);
        if (labelsOn > 0.01) {
          const gap = (on ? 11 : 9) * unitPx;
          const weight = on ? 700 : 500;
          c.font = `${weight} ${fsCity}px ${font}`;
          const half = c.measureText(cities[i].name).width / 2;
          const pinPx = px, pinPy = py;
          spot(pinPx, pinPy, cities[i].label, gap, half, fsCity);
          let lx = sx, ly = sy;
          if (on) {
            // O nome da cidade em destaque desliza para o lado em que nada passa por cima.
            spot(pinPx, pinPy, awaySide, gap, half, fsCity);
            lx = lerp(lx, sx, yielding);
            ly = lerp(ly, sy, yielding);
          }
          // Nome que a borda do disco cortaria some inteiro; o pino continua.
          const reach = Math.hypot(Math.abs(lx - cx) + half, Math.abs(ly - cy) + fsCity * 0.6);
          let fit = 1 - sstep(reach, r - 10, r - 2);
          if (!on && yielding > 0) {
            const x0 = lx - half - 4, x1 = lx + half + 4, y0 = ly - fsCity * 0.7, y1 = ly + fsCity * 0.7;
            let under = x0 < ACT[2] && x1 > ACT[0] && y0 < ACT[3] && y1 > ACT[1];
            for (let b = 0; b < nBusy && !under; b += 2) under = BUSY[b] > x0 && BUSY[b] < x1 && BUSY[b + 1] > y0 && BUSY[b + 1] < y1;
            if (under) fit *= 1 - yielding;
          }
          const la = labelsOn * pinsOn * fit * (on ? 1 : 0.9);
          if (la > 0.05) {
            const o = nLbl++ * 4;
            LBL[o] = lx - half - 2; LBL[o + 1] = ly - fsCity * 0.6; LBL[o + 2] = lx + half + 2; LBL[o + 3] = ly + fsCity * 0.6;
          }
          label(cities[i].name, lx, ly, fsCity, weight, on ? P.text : P.muted, la, "center");
        }
      }
    }

    /* 5. nomes para se localizar no mapa: saem de perto de qualquer nome de cidade */
    const names = sstep(S, 8.5, 11);
    if (names > 0.01) {
      const fs = clamp(r / 26, 8.5, 10.5);
      const na = names * 0.5;
      const put = (text: string, lat: number, lon: number) => {
        projLL(lat, lon);
        const hw = fs * text.length * 0.46;
        if (!inDisk(px, py, hw)) return;
        let room = 99;
        for (let k = 0; k < nLbl; k++) {
          const o = k * 4;
          const dx = Math.max(LBL[o] - (px + hw), px - hw - LBL[o + 2]);
          const dy = Math.max(LBL[o + 1] - (py + fs * 0.6), py - fs * 0.6 - LBL[o + 3]);
          room = Math.min(room, Math.max(dx, dy));
        }
        label(text, px, py, fs, 600, P.muted, na * sstep(room, -2, 7), "center", fs * 0.28);
      };
      put("ARGENTINA", -28.45, -57.45);
      put("URUGUAI", -32.05, -56.35);
      put("SANTA CATARINA", -26.95, -51.35);
      const big = names * (1 - sstep(S, 13.5, 16));
      if (big > 0.01) {
        // No miolo do estado, longe das cidades e das lagoas.
        const bs = clamp(r / 22, 9.5, 12);
        projLL(-30.5, -53.95);
        label("RIO GRANDE DO SUL", px, py, bs, 700, P.text, big * 0.92, "center", bs * 0.2);
      }
    }

    // o caminho: alguém por perto busca, o sinal chega na cidade
    let srcCol = P.beam;
    if (active >= 0) {
      srcCol = P.src[journeys[jIdx].source];
      const out = 1 - sstep(tau, J.leave, TJ);
      const pp = clamp01((tau - J.source) / 0.35);
      if (pp > 0) {
        const s = backOut(pp) * unitPx * out;
        if (tau < J.page + 0.3) {
          const u = ((tau - J.source) / 0.95) % 1;
          ring(personX, personY, (5 + 15 * u) * unitPx, srcCol, (1 - u) * 0.8 * out, 1.4);
        }
        dot(personX, personY, 6.5 * s, srcCol, 0.28);
        dot(personX, personY, 3.6 * s, srcCol, 1);
        dot(personX, personY, 1.5 * s, "#ffffff", 1);
      }
      curve(personX, personY, pinX, pinY, "arc");
      const su = (tau - J.signal) / (J.page - J.signal);
      if (su > 0) {
        stroke(0, Math.min(1, su), srcCol, 0.38 * out * (1 - sstep(tau, J.message, J.message + 0.8) * 0.6), 1.2 * unitPx);
        comet(su, srcCol, out, 1.7 * unitPx);
      }
      // a página abriu, depois a mensagem chegou
      const p1 = (tau - J.page) / 0.9;
      if (p1 > 0 && p1 < 1) ring(pinX, pinY, (6 + 30 * easeOut(p1)) * unitPx, P.pin, (1 - p1) * 0.9, 1.6);
      const p2 = (tau - J.message) / 1.1;
      if (p2 > 0 && p2 < 1) {
        ring(pinX, pinY, (6 + 46 * easeOut(p2)) * unitPx, P.pin, (1 - p2) * 0.95, 2);
        ring(pinX, pinY, (6 + 28 * easeOut(p2)) * unitPx, "#ffffff", (1 - p2) * 0.5, 1.2);
      }
    }

    c.restore();

    /* 6. feixes entre o mapa e a interface */
    if (active >= 0) {
      const out = 1 - sstep(tau, J.leave, TJ);
      const flow = (T * 0.9) % 1;
      // origem -> quem buscou
      const a1 = sstep(tau, J.source, J.source + 0.45);
      if (a1 > 0.01) {
        const fade = 1 - sstep(tau, J.page + 0.2, J.page + 0.9) * 0.7;
        curve(L.src[0], L.src[1], personX, personY, bend);
        stroke(0, easeOut(a1), srcCol, 0.85 * fade * out, 1.4 * unitPx);
        if (a1 >= 1 && tau < J.page) {
          bez(flow);
          dot(bx, by, 2.3 * unitPx, srcCol, 0.9 * Math.sin(Math.PI * flow));
        }
        dot(L.src[0], L.src[1], 3 * unitPx, srcCol, fade * out);
      }
      // cidade -> página
      const a2 = sstep(tau, J.page, J.page + 0.4);
      if (a2 > 0.01) {
        curve(pinX, pinY, L.page[0], L.page[1], bend);
        stroke(0, easeOut(a2), P.beam, 0.9 * out, 1.5 * unitPx);
        dot(L.page[0], L.page[1], 3 * unitPx * a2, P.beam, out);
        if (a2 >= 1 && tau < J.message) {
          bez(flow);
          dot(bx, by, 2.3 * unitPx, "#ffffff", 0.85 * Math.sin(Math.PI * flow) * out);
        }
      }
      // cidade -> WhatsApp
      const a3 = sstep(tau, J.message, J.message + 0.35);
      if (a3 > 0.01) {
        curve(pinX, pinY, L.wa[0], L.wa[1], bend);
        stroke(0, easeOut(a3), P.beam, 0.95 * out, 1.7 * unitPx);
        dot(L.wa[0], L.wa[1], 3.2 * unitPx * a3, P.beam, out);
        if (a3 >= 1) {
          bez(flow);
          dot(bx, by, 2.5 * unitPx, "#ffffff", 0.9 * Math.sin(Math.PI * flow) * out);
        }
      }
    }
    return view;
  }

  /*
   * De que lado fica o nome da cidade em destaque. Mede com a câmera já parada na
   * cidade e escolhe o lado que não encosta em quem buscou, nos feixes, nos outros
   * pinos nem nos outros nomes. O resultado vale para o caminho inteiro.
   */
  type Side = "left" | "right" | "below" | "above" | "bl" | "br" | "al" | "ar";
  const sideMemo: Record<string, Side> = {};
  const ACT = [0, 0, 0, 0];
  let sx = 0, sy = 0;
  /** Centro do nome (em sx, sy) para um pino em (x, y), conforme o lado. */
  function spot(x: number, y: number, side: Side, gap: number, half: number, fs: number) {
    const dy = gap + fs * 0.55;
    const diag = gap * 0.8 + half;
    sx = x;
    sy = y;
    if (side === "right") sx = x + gap + half;
    else if (side === "left") sx = x - gap - half;
    else if (side === "below") sy = y + dy;
    else if (side === "above") sy = y - dy;
    else {
      sx = side === "br" || side === "ar" ? x + diag : x - diag;
      sy = side === "br" || side === "bl" ? y + dy * 0.9 : y - dy * 0.9;
    }
  }
  function sideFor(jIdx: number, fs: number, unitPx: number): Side {
    const key = jIdx + "|" + L.mode + "|" + Math.round(L.r);
    if (sideMemo[key]) return sideMemo[key];
    const city = journeys[jIdx].city;
    setBasis(focusCam(city, 0.5));
    const c = ctx!;
    const at: number[][] = [];
    for (let i = 0; i < cities.length; i++) {
      proj(cityV, i * 3);
      at.push([px, py]);
    }
    const o = origins[city][0];
    projLL(o[0], o[1]);
    const who = [px, py];
    const pin = at[city];
    const gap = 11 * unitPx;
    const boxOf = (i: number, side: Side, weight: number, g: number) => {
      c.font = `${weight} ${fs}px ${font}`;
      const hw = c.measureText(cities[i].name).width / 2;
      spot(at[i][0], at[i][1], side, g, hw, fs);
      return [sx - hw - 5, sy - fs * 0.65 - 3, sx + hw + 5, sy + fs * 0.65 + 3];
    };
    const hits = (b: number[], x0: number, y0: number, x1: number, y1: number) => b[0] < x1 && b[2] > x0 && b[1] < y1 && b[3] > y0;
    const others: number[][] = [];
    for (let i = 0; i < cities.length; i++) if (i !== city) others.push(boxOf(i, cities[i].label, 500, 9 * unitPx));
    const side = L.mode === "side";
    const options: Side[] = side
      ? ["below", "above", "left", "bl", "al"]
      : [cities[city].label === "below" ? "left" : cities[city].label, "left", "right", "above", "br", "bl", "ar", "al"];
    let best: Side = options[0];
    let bestScore = 1e9;
    for (let k = 0; k < options.length; k++) {
      const b = boxOf(city, options[k], 700, gap);
      let score = k * 0.4;
      const rr = 10 * unitPx;
      if (hits(b, who[0] - rr, who[1] - rr, who[0] + rr, who[1] + rr)) score += 10;
      // feixe da origem até quem buscou
      if (side ? hits(b, who[0] - 150, who[1] - 8, who[0], who[1] + 8) : hits(b, who[0] - 8, who[1] - 150, who[0] + 8, who[1])) score += 6;
      // feixes da cidade até os cartões
      if (side ? hits(b, pin[0], pin[1] - 9, pin[0] + 160, pin[1] + 9) : hits(b, pin[0] - 9, pin[1], pin[0] + 9, pin[1] + 160)) score += 8;
      // arco do sinal entre quem buscou e a cidade
      const mx = (who[0] + pin[0]) / 2, my = Math.min(who[1], pin[1]) - 6;
      if (hits(b, mx - 8, my - 8, mx + 8, my + 8)) score += 3;
      for (let i = 0; i < cities.length; i++) {
        if (i === city) continue;
        if (hits(b, at[i][0] - 8, at[i][1] - 8, at[i][0] + 8, at[i][1] + 8)) score += 5;
      }
      for (let i = 0; i < others.length; i++) if (hits(b, others[i][0], others[i][1], others[i][2], others[i][3])) score += 5;
      if (score < bestScore) {
        bestScore = score;
        best = options[k];
      }
    }
    sideMemo[key] = best;
    return best;
  }

  function inDisk(x: number, y: number, margin: number) {
    const dx = x - L.cx, dy = y - L.cy;
    const m = L.r - margin;
    return m > 0 && dx * dx + dy * dy < m * m;
  }

  return {
    setLayout(l) {
      L = l;
      // Em tela estreita o disco é menor: chega mais perto e deixa a cidade no meio.
      sCity = l.r < 185 ? 24 : S_CITY;
      fx = l.mode === "side" ? -0.2 : -0.04;
      fy = l.mode === "side" ? 0.02 : 0.06;
    },
    setTheme(dark) {
      P = dark ? DARK : LIGHT;
    },
    setFont(family) {
      font = family;
    },
    draw,
    timeOf(j, T) {
      const n0 = Math.max(0, Math.floor(T / LOOP));
      for (let n = n0; n < n0 + NJ + 1; n++) {
        const k = slots(n).indexOf(j);
        if (k < 0) continue;
        const at = n * LOOP + C + k * TJ;
        if (at + TJ > T) return at;
      }
      return n0 * LOOP + C;
    },
    still(j) {
      for (let n = 0; n < NJ + 1; n++) {
        const k = slots(n).indexOf(j);
        if (k >= 0) return n * LOOP + C + k * TJ + 4.1;
      }
      return C + 4.1;
    },
  };
}
