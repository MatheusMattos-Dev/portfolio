"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  BiCheckDouble,
  BiLockAlt,
  BiLogoGoogle,
  BiLogoInstagram,
  BiLogoWhatsapp,
  BiMap,
  BiPause,
  BiPlay,
  BiSearch,
} from "react-icons/bi";
import { Slide } from "@/app/animation/Slide";
import { stats } from "@/app/data/local";
import { cities, journeys, scenes, sources, type Source } from "@/app/data/story";
import type { Globe, GlobeView } from "./globe/engine";

/*
 * Seção "Captação": o planeta gira, a câmera desce até o Rio Grande do Sul e
 * mostra, nas 8 cidades com página no ar, o caminho do cliente: de onde ele vem
 * (Google, Maps ou Instagram), a página que abre e a mensagem no WhatsApp.
 *
 * - O desenho é do motor em ./globe/engine (canvas 2D). Aqui ficam a interface,
 *   o relógio e a medição de onde os feixes encostam. O motor e os pontos do
 *   mapa carregam à parte, só quando a seção chega perto da tela.
 * - O HTML do servidor já sai com um caminho completo, então há conteúdo sem JS.
 * - "Reduzir movimento": quadro parado; os botões de origem trocam o caminho.
 * - Pausa fora da tela, com a aba oculta ou pelo botão.
 * - ?gt=<segundos> na URL congela um instante exato, para conferir um quadro.
 */

const TYPE_MS = 30;

type Shown = { journey: number; step: number; dim: boolean; pins: boolean };

const icons: Record<Source, IconType> = { google: BiLogoGoogle, maps: BiMap, instagram: BiLogoInstagram };
const actionIcons: Record<Source, IconType> = { google: BiSearch, maps: BiMap, instagram: BiLogoInstagram };

/** Cor de cada origem, igual à do sinal que corre no mapa. */
const tone: Record<Source, { text: string; bg: string; border: string }> = {
  google: {
    text: "dark:text-[#8ab4f8] text-[#1a73e8]",
    bg: "dark:bg-[#8ab4f8]/10 bg-[#1a73e8]/[0.07]",
    border: "dark:border-[#8ab4f8]/60 border-[#1a73e8]/50",
  },
  maps: {
    text: "dark:text-[#fbbf24] text-[#d97706]",
    bg: "dark:bg-[#fbbf24]/10 bg-[#d97706]/[0.07]",
    border: "dark:border-[#fbbf24]/60 border-[#d97706]/50",
  },
  instagram: {
    text: "dark:text-[#f472b6] text-[#db2777]",
    bg: "dark:bg-[#f472b6]/10 bg-[#db2777]/[0.07]",
    border: "dark:border-[#f472b6]/60 border-[#db2777]/50",
  },
};

const card = "relative rounded-xl border transition duration-500 dark:bg-zinc-900/95 bg-white/95";
const lit = "dark:border-primary-color/50 border-secondary-color/60 shadow-[0_18px_50px_-22px_rgba(51,224,146,0.6)]";
const held = "dark:border-zinc-800 border-zinc-200 opacity-50 saturate-50";
const waiting = "dark:border-zinc-800 border-zinc-200 opacity-80";

/** O que o cliente fez, digitado. "empty" espera, "type" digita, "full" mostra pronto. */
function Typed({ text, mode }: { text: string; mode: "empty" | "type" | "full" }) {
  const [n, setN] = useState(text.length);
  useEffect(() => {
    if (mode === "full") {
      setN(text.length);
      return;
    }
    setN(0);
    if (mode === "empty") return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, TYPE_MS);
    return () => window.clearInterval(id);
  }, [text, mode]);
  return (
    <>
      {text.slice(0, n)}
      {mode !== "full" && (
        <span className="ml-[0.1em] inline-block h-[1.05em] w-[0.08em] translate-y-[0.18em] bg-current animate-blink" />
      )}
    </>
  );
}

const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
function dms(deg: number, pos: string, neg: string) {
  const a = Math.abs(deg);
  const d = Math.floor(a);
  return `${pad(d)}°${pad(Math.floor((a - d) * 60))}′${deg >= 0 ? pos : neg}`;
}
const wrapLon = (lon: number) => ((((lon + 180) % 360) + 360) % 360) - 180;

export default function LeadGlobe() {
  // Começa falso, como no servidor, e só depois lê a preferência: ler já no primeiro
  // render mudaria o HTML (o botão de pausa some) e quebraria a hidratação da página.
  const [reduce, setReduce] = useState(false);
  const [view, setView] = useState<Shown>({ journey: 0, step: 3, dim: false, pins: true });
  const [ready, setReady] = useState(false);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [onScreen, setOnScreen] = useState(false);

  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const disk = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const cardsBox = useRef<HTMLDivElement>(null);
  const pageCard = useRef<HTMLDivElement>(null);
  const waCard = useRef<HTMLDivElement>(null);
  const placeEl = useRef<HTMLSpanElement>(null);
  const coordEl = useRef<HTMLSpanElement>(null);

  const globe = useRef<Globe | null>(null);
  const clock = useRef(0);
  const shown = useRef<Shown>(view);
  const frozen = useRef(false);
  /** Densidade do canvas. Começa na da tela (até 2) e cai se o aparelho não acompanhar. */
  const quality = useRef(2);

  const sync = useCallback((v: GlobeView) => {
    const p = shown.current;
    if (v.journey !== p.journey || v.step !== p.step || v.dim !== p.dim || v.pins !== p.pins) {
      shown.current = { journey: v.journey, step: v.step, dim: v.dim, pins: v.pins };
      setView(shown.current);
    }
    const place = placeEl.current;
    if (place && place.textContent !== v.place) place.textContent = v.place;
    const coord = coordEl.current;
    if (coord) {
      const s = `${dms(v.lat, "N", "S")} ${dms(wrapLon(v.lon), "L", "O")} · ${Math.round(v.zoom)}×`;
      if (coord.textContent !== s) coord.textContent = s;
    }
  }, []);

  const paint = useCallback(() => {
    const g = globe.current;
    if (g) sync(g.draw(clock.current));
  }, [sync]);

  /** Tamanho do canvas, posição do disco e os pontos onde os feixes encostam. */
  const measure = useCallback(() => {
    const g = globe.current;
    const st = stage.current;
    const dk = lens.current;
    const cv = canvas.current;
    if (!g || !st || !dk || !cv) return;
    const s = cv.getBoundingClientRect();
    const d = dk.getBoundingClientRect();
    const dpr = Math.min(quality.current, window.devicePixelRatio || 1);
    const w = Math.round(s.width);
    const h = Math.round(s.height);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const side = window.matchMedia("(min-width: 1024px)").matches;
    const at = (el: HTMLElement | null, fx: number, fy: number): [number, number] => {
      if (!el) return [0, 0];
      const r = el.getBoundingClientRect();
      return [r.left - s.left + r.width * fx, r.top - s.top + r.height * fy];
    };
    g.setLayout({
      w,
      h,
      dpr,
      cx: d.left - s.left + d.width / 2,
      cy: d.top - s.top + d.height / 2,
      r: d.width / 2,
      mode: side ? "side" : "stack",
      src: side ? at(bar.current, 1, 0.5) : at(bar.current, 0.5, 1),
      // Empilhado, o feixe desce entre o selo das cidades e o botão de pausa.
      page: side ? at(pageCard.current, 0, 0.5) : at(cardsBox.current, 0.76, 0),
      wa: side ? at(waCard.current, 0, 0.5) : at(cardsBox.current, 0.76, 0),
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // O motor e os pontos do mapa só são baixados quando a seção chega perto da tela.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "900px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Monta o motor, acompanha o tamanho, o tema e a fonte.
  useEffect(() => {
    const cv = canvas.current;
    const st = stage.current;
    if (!near || !cv || !st) return;
    let alive = true;
    let stop = () => {};
    import("./globe/engine").then((engine) => {
      if (!alive) return;
      const g = engine.createGlobe(cv, cities, journeys);
      if (!g) return;
      globe.current = g;
      const root = document.documentElement;
      const family = () => getComputedStyle(document.body).fontFamily;
      g.setTheme(root.classList.contains("dark"));
      g.setFont(family());

      const gt = parseFloat(new URLSearchParams(window.location.search).get("gt") || "");
      if (!isNaN(gt)) {
        frozen.current = true;
        clock.current = gt;
      } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        clock.current = g.still(0);
      } else {
        clock.current = engine.START;
      }
      measure();
      paint();
      setReady(true);

      const ro = new ResizeObserver(() => {
        measure();
        paint();
      });
      ro.observe(st);
      const mo = new MutationObserver(() => {
        g.setTheme(root.classList.contains("dark"));
        paint();
      });
      mo.observe(root, { attributes: true, attributeFilter: ["class"] });
      if (document.fonts) {
        document.fonts.ready.then(() => {
          if (!alive) return;
          g.setFont(family());
          measure();
          paint();
        });
      }
      stop = () => {
        ro.disconnect();
        mo.disconnect();
      };
    });
    return () => {
      alive = false;
      stop();
      globe.current = null;
    };
  }, [near, measure, paint]);

  // Só roda com a seção na tela e a aba visível.
  useEffect(() => {
    const el = disk.current;
    if (!el) return;
    let seen = false;
    const update = () => setOnScreen(seen && !document.hidden);
    const io = new IntersectionObserver(
      ([e]) => {
        seen = e.isIntersecting;
        update();
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Os cartões têm altura reservada, mas se um texto quebrar diferente os feixes acompanham.
  useEffect(() => {
    measure();
  }, [view.journey, measure]);

  // "Reduzir movimento": mostra o caminho atual já completo, parado.
  useEffect(() => {
    const g = globe.current;
    if (!reduce || !g || frozen.current) return;
    clock.current = g.still(shown.current.journey);
    paint();
  }, [reduce, ready, paint]);

  const running = ready && playing && onScreen && !reduce;

  useEffect(() => {
    if (!running || frozen.current) return;
    let raf = 0;
    let prev = performance.now();
    let slow = 0;
    const tick = (now: number) => {
      const dt = now - prev;
      prev = now;
      // Um quadro atrasado não vira salto: o relógio anda no máximo 50 ms por vez.
      clock.current += Math.min(0.05, dt / 1000);
      // Aparelho que não acompanha: desenha com menos pixels em vez de engasgar.
      slow = dt > 30 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 40 && quality.current > 1) {
        quality.current = Math.max(1, quality.current - 0.5);
        slow = 0;
        measure();
      }
      paint();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, paint, measure]);

  /** Pula para o próximo caminho que chega por essa origem. */
  const pick = (src: Source) => {
    const g = globe.current;
    if (!g) return;
    const list: number[] = [];
    journeys.forEach((x, i) => {
      if (x.source === src) list.push(i);
    });
    const next = list[(list.indexOf(shown.current.journey) + 1) % list.length];
    clock.current = running && !frozen.current ? g.timeOf(next, clock.current) : g.still(next);
    const cv = canvas.current;
    if (cv && cv.animate && !reduce) cv.animate([{ opacity: 0.15 }, { opacity: 1 }], { duration: 380, easing: "ease-out" });
    paint();
  };

  const j = journeys[view.journey];
  const sc = scenes[j.scene];
  const live = !view.dim;
  const srcOn = live && view.step >= 1;
  const pageOn = live && view.step >= 2;
  const waOn = live && view.step >= 3;
  const ActionIcon = actionIcons[j.source];
  const pages = stats[1].value;

  return (
    <section id="captacao" className="mt-24 scroll-mt-24">
      <Slide>
        <div className="mb-10 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] dark:text-primary-color text-secondary-color mb-3">
            Captação de clientes
          </p>
          <h2 className="font-incognito text-4xl font-bold tracking-tight mb-4">
            O mundo inteiro está na internet. O seu cliente está na sua cidade.
          </h2>
          <p className="dark:text-zinc-400 text-zinc-600 leading-relaxed max-w-2xl">
            Cada página é feita para ser achada por quem mora perto: na busca do Google, no perfil do Google Maps e no
            link do Instagram. Os três caminhos terminam no mesmo lugar, uma conversa no WhatsApp do negócio.
          </p>
        </div>
      </Slide>

      <p className="sr-only">
        Animação: o globo gira, a câmera desce até o Rio Grande do Sul e mostra as {cities.length} cidades com página
        no ar: {cities.map((c) => c.name).join(", ")}. Em cada exemplo, um cliente chega pela busca do Google, pelo
        Google Maps ou pelo Instagram, abre a página do negócio e manda mensagem no WhatsApp.
      </p>

      <div
        ref={stage}
        data-globe={ready ? "on" : "off"}
        className="relative isolate lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)_minmax(0,1.05fr)] lg:items-center lg:gap-x-3"
      >
        <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />

        {/* De onde o cliente vem */}
        <div className="mx-auto mb-3 w-full max-w-[440px] lg:mx-0 lg:mb-0 lg:max-w-none">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">De onde o cliente vem</p>
          <ul className="flex gap-1.5 min-[360px]:gap-2 lg:grid lg:grid-cols-1">
            {sources.map((s) => {
              const on = srcOn && j.source === s.id;
              const Icon = icons[s.id];
              return (
                <li key={s.id} className="flex-auto">
                  <button
                    type="button"
                    onClick={() => pick(s.id)}
                    aria-pressed={on}
                    className={`flex min-h-[44px] w-full items-center gap-1.5 rounded-lg border px-2 text-left duration-300 active:scale-[0.98] min-[360px]:gap-2 min-[360px]:px-2.5 lg:gap-2.5 lg:px-3 lg:py-2.5 ${
                      on
                        ? `${tone[s.id].border} ${tone[s.id].bg}`
                        : "dark:border-zinc-800 border-zinc-200 dark:bg-zinc-900/60 bg-white/60 hover:dark:border-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    <Icon aria-hidden className={`shrink-0 text-lg duration-300 ${on ? tone[s.id].text : "text-zinc-500"}`} />
                    <span className="min-w-0">
                      <span
                        className={`block whitespace-nowrap text-xs font-medium leading-tight duration-300 min-[360px]:text-[13px] lg:whitespace-normal lg:text-sm ${
                          on ? "dark:text-white text-zinc-900" : "dark:text-zinc-300 text-zinc-700"
                        }`}
                      >
                        <span className="lg:hidden">{s.short}</span>
                        <span className="hidden lg:inline">{s.name}</span>
                      </span>
                      <span className="mt-0.5 hidden text-xs leading-snug text-zinc-500 lg:block">{s.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div
            ref={bar}
            aria-hidden
            className={`mt-2 flex min-h-[44px] items-center gap-2 rounded-lg border px-3 text-[13px] leading-snug duration-300 lg:min-h-[58px] ${
              srcOn
                ? `${tone[j.source].border} dark:bg-zinc-900 bg-white`
                : "dark:border-zinc-800 border-zinc-200 dark:bg-zinc-900/60 bg-white/60"
            }`}
          >
            <ActionIcon className={`shrink-0 text-base duration-300 ${srcOn ? tone[j.source].text : "text-zinc-500"}`} />
            <span className={`min-w-0 duration-300 ${srcOn ? "dark:text-zinc-100 text-zinc-800" : "text-zinc-500"}`}>
              <Typed key={view.journey} text={j.action} mode={view.dim ? "full" : view.step >= 1 ? "type" : "empty"} />
            </span>
          </div>
        </div>

        {/* O globo: o canvas desenha o disco aqui dentro */}
        <div ref={disk} className="relative mx-auto aspect-square w-full max-w-[440px] lg:max-w-[560px]">
          {/* O disco: corpo e brilho atrás do canvas, sombra e aro na frente. O motor lê o tamanho daqui. */}
          <div ref={lens} aria-hidden className="globe-body absolute inset-[6.5%] -z-20 rounded-full lg:inset-[14px]" />
          <div aria-hidden className="globe-shade pointer-events-none absolute inset-[6.5%] rounded-full lg:inset-[14px]" />
          <span
            ref={placeEl}
            aria-hidden
            className="absolute left-0 top-0 text-[11px] font-medium uppercase leading-none tracking-[0.18em] dark:text-primary-color text-tertiary-color"
          >
            Planeta Terra
          </span>
          <span
            ref={coordEl}
            aria-hidden
            style={{ fontFamily: "var(--gitlabmono), ui-monospace, monospace" }}
            className="absolute right-0 top-0 whitespace-nowrap text-[11px] leading-none tabular-nums text-zinc-500 max-[349px]:hidden lg:right-8"
          >
            08°00′N 042°24′L · 1×
          </span>
          <span
            aria-hidden
            className={`absolute bottom-0 left-0 inline-flex items-center gap-x-2 text-[11px] font-medium uppercase leading-none tracking-[0.14em] duration-500 dark:text-zinc-300 text-zinc-700 ${
              view.pins ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary-color opacity-60 animate-ping motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-color" />
            </span>
            {cities.length} cidades · {pages} páginas<span className="hidden sm:inline"> no ar</span>
          </span>
          {!reduce && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pausar a animação" : "Continuar a animação"}
              className="absolute -bottom-1 right-0 z-10 grid h-10 w-10 place-items-center rounded-full border text-lg duration-200 lg:bottom-7 lg:left-0 lg:right-auto dark:border-zinc-700 border-zinc-300 dark:bg-zinc-900/80 bg-white/80 dark:text-zinc-300 text-zinc-600 hover:dark:text-white hover:text-zinc-900"
            >
              {playing ? <BiPause aria-hidden /> : <BiPlay aria-hidden />}
            </button>
          )}
        </div>

        {/* O que acontece depois */}
        <div ref={cardsBox} aria-hidden className="relative z-10 mx-auto mt-3 w-full max-w-[440px] space-y-3 lg:-ml-6 lg:mt-0 lg:max-w-none">
          <div
            ref={pageCard}
            className={`${card} ${pageOn ? lit : view.dim ? held : waiting} flex items-center gap-3 overflow-hidden p-2.5 lg:block lg:p-0`}
          >
            <div className="relative w-[42%] shrink-0 overflow-hidden rounded-md dark:bg-zinc-800 bg-zinc-100 lg:w-full lg:rounded-none">
              <div className="hidden h-7 items-center gap-1.5 border-b px-3 dark:border-zinc-700/70 border-zinc-200 lg:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/50 max-xl:hidden" />
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/50 max-xl:hidden" />
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/50 max-xl:hidden" />
                <span className="flex min-w-0 flex-1 items-center gap-1 rounded-full px-2 py-1 text-[10px] leading-none dark:bg-zinc-900/70 bg-white dark:text-zinc-400 text-zinc-500 xl:ml-2">
                  <BiLockAlt className="shrink-0" />
                  <span className={`truncate duration-300 ${pageOn || view.dim ? "opacity-100" : "opacity-0"}`}>{sc.host}</span>
                </span>
              </div>
              <div className="relative aspect-[16/10]">
                {scenes.map((s, i) => (
                  <Image
                    key={s.shot}
                    src={s.shot}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 320px, 45vw"
                    className={`object-cover object-top transition-opacity duration-500 ${
                      i === j.scene && (pageOn || view.dim) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                {pageOn && (
                  <span
                    key={view.journey}
                    className="pointer-events-none absolute h-0 w-0"
                    style={{ left: `${sc.cta[0] * 100}%`, top: `${sc.cta[1] * 100}%` }}
                  >
                    <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border-2 border-primary-color opacity-0 animate-tap" />
                  </span>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1 lg:px-3.5 lg:py-3">
              <p className="mb-1 text-xs uppercase leading-none tracking-[0.16em] text-zinc-500">A página abre</p>
              <p
                className={`truncate font-incognito text-base font-semibold leading-tight tracking-tight duration-300 dark:text-white text-zinc-900 ${
                  pageOn || view.dim ? "opacity-100" : "opacity-0"
                }`}
              >
                {sc.short}
              </p>
              <p
                className={`mt-1 flex min-h-[2.75em] items-start gap-1 text-xs leading-snug text-zinc-500 duration-300 lg:hidden ${
                  pageOn || view.dim ? "opacity-100" : "opacity-0"
                }`}
              >
                <BiLockAlt className="mt-[0.2em] shrink-0" />
                <span className="[overflow-wrap:anywhere]">{sc.host}</span>
              </p>
            </div>
          </div>

          <div ref={waCard} className={`${card} ${waOn ? lit : view.dim ? held : waiting} p-3.5`}>
            <div className="flex items-center gap-2 text-xs leading-none">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-color text-zinc-900">
                <BiLogoWhatsapp className="text-base" />
              </span>
              <span className="font-semibold dark:text-zinc-100 text-zinc-800">WhatsApp</span>
              <span className={`ml-auto text-zinc-500 duration-300 ${waOn || view.dim ? "opacity-100" : "opacity-0"}`}>agora</span>
            </div>
            <div className={`duration-300 ${waOn || view.dim ? "opacity-100" : "opacity-0"}`}>
              <p className="mt-2.5 text-[13px] leading-snug dark:text-zinc-400 text-zinc-500 lg:max-xl:min-h-[2.75em]">
                Mensagem nova para <span className="dark:text-zinc-200 text-zinc-700">{sc.short}</span>
              </p>
              <p
                className={`mt-2 min-h-[3.9em] lg:max-xl:min-h-[5.3em] origin-top-left rounded-xl rounded-tl-sm bg-primary-color/15 px-3 py-2 text-sm leading-snug transition duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:text-zinc-100 text-zinc-800 ${
                  waOn || view.dim ? "scale-100" : "scale-90"
                }`}
              >
                {j.message}
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs leading-none text-zinc-500">
                <BiCheckDouble className="text-base text-primary-color" />
                veio pela página
              </p>
            </div>
          </div>
        </div>

      </div>

      <p className="mt-6 text-xs leading-relaxed text-zinc-500">
        Animação ilustrativa. As cidades, as páginas e os endereços são reais; as buscas e as mensagens são exemplos do
        caminho.
      </p>
    </section>
  );
}
