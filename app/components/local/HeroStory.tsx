"use client";

import Image from "next/image";
import { MotionConfig, animate, useMotionValue, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiCheckDouble, BiLockAlt, BiLogoWhatsapp, BiSearch } from "react-icons/bi";
import { MDiv } from "./motion";

/*
 * Abertura do topo: a busca no Google vira a página do cliente e a página vira
 * mensagem no WhatsApp. Um nicho por vez, só com clientes que fecharam.
 *
 * - O HTML do servidor já sai com a cena 1 montada (página + mensagem), então o
 *   primeiro paint tem conteúdo e funciona sem JS.
 * - "Reduzir movimento": não roda sozinho; os botões dos nichos trocam a cena.
 * - Pausa quando sai da tela ou a aba fica oculta.
 */

type Scene = {
  niche: string;
  query: string;
  title: string;
  host: string;
  snippet: string;
  shot: string;
  alt: string;
  /** Centro do botão principal no print 1440x900, em fração da largura e da altura. */
  cta: [number, number];
  brand: string;
  initials: string;
  short: string;
  message: string;
};

const scenes: Scene[] = [
  {
    niche: "Oficina",
    query: "oficina mecânica em alegrete",
    title: "TRN Autocar · Mecânica de confiança em Alegrete",
    host: "trn-autocar-demo.vercel.app",
    snippet: "Revisão completa, freios, suspensão e câmbio automático. Agende pelo WhatsApp.",
    shot: "/projects/locais/trn.jpg",
    alt: "Página da TRN Autocar",
    cta: [0.193, 0.716],
    brand: "#f97316",
    initials: "TRN",
    short: "TRN Autocar",
    message: "Oi! Vi a página de vocês e quero agendar uma revisão.",
  },
  {
    niche: "Mega hair",
    query: "mega hair em são borja",
    title: "Val Santos · Mega hair e cor em São Borja",
    host: "val-mega-hair-demo.vercel.app",
    snippet: "Mega hair e cor com acabamento natural. Tudo começa com uma avaliação do cabelo.",
    shot: "/projects/locais/val.jpg",
    alt: "Página da Val Santos Mega Hair",
    cta: [0.114, 0.749],
    brand: "#c9a56a",
    initials: "VS",
    short: "Val Santos",
    message: "Oi, Val! Vi as transformações e quero marcar uma avaliação.",
  },
  {
    niche: "Vazamentos",
    query: "caça vazamento alegrete",
    title: "Fagundes · Caça-vazamentos e elétrica em Alegrete",
    host: "fagundes-demo.vercel.app",
    snippet: "Acha o vazamento sem quebrar a parede e abre só o ponto certo. Peça um orçamento.",
    shot: "/projects/locais/fagundes.jpg",
    alt: "Página da Fagundes Manutenção",
    cta: [0.184, 0.773],
    brand: "#ea580c",
    initials: "F",
    short: "Fagundes",
    message: "Oi! Acho que tenho um vazamento em casa. Conseguem vir ver?",
  },
  {
    niche: "Contabilidade",
    query: "contabilidade rural são borja",
    title: "Eficaz Contabilidade · Rural e empresarial",
    host: "eficazcontabilidadesb.com.br",
    snippet: "Escritório no centro de São Borja: Lucro Real, Presumido, Simples e MEI.",
    shot: "/projects/locais/eficaz.jpg",
    alt: "Página da Eficaz Contabilidade",
    cta: [0.185, 0.773],
    brand: "#16a34a",
    initials: "E",
    short: "Eficaz",
    message: "Bom dia! Sou produtor rural e quero falar sobre a contabilidade.",
  },
];

type Stage = "typing" | "results" | "page" | "message";

const TYPE_MS = 62;
const spring = { type: "spring", stiffness: 120, damping: 20 };

/** Texto da busca sendo digitado. Fica num componente próprio para só ele renderizar a cada letra. */
function Typed({ text, active }: { text: string; active: boolean }) {
  const [n, setN] = useState(text.length);
  useEffect(() => {
    if (!active) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, TYPE_MS);
    return () => window.clearInterval(id);
  }, [text, active]);
  return (
    <span className="truncate">
      {text.slice(0, n)}
      <span className="ml-[0.1em] inline-block h-[1.05em] w-[0.08em] translate-y-[0.15em] bg-primary-color animate-blink" />
    </span>
  );
}

export default function HeroStory() {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);
  const [stage, setStage] = useState<Stage>("message");
  const [running, setRunning] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [ripple, setRipple] = useState(0);

  const box = useRef<HTMLDivElement>(null);
  const resultTitle = useRef<HTMLSpanElement>(null);
  const cta = useRef<HTMLDivElement>(null);

  // Cursor: posição em px dentro da caixa, fora do ciclo de render.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const ps = useMotionValue(1);
  const po = useMotionValue(0);

  const hidePointer = useCallback(() => {
    animate(po, 0, { duration: 0.25 });
  }, [po]);

  const pointTo = useCallback(
    (el: HTMLElement | null, duration: number, fx = 0.5, fy = 0.5) => {
      const b = box.current;
      if (!el || !b) return;
      const r = el.getBoundingClientRect();
      const o = b.getBoundingClientRect();
      if (po.get() < 0.05) {
        px.set(o.width * 0.9);
        py.set(o.height * 0.96);
        animate(po, 1, { duration: 0.2 });
      }
      const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
      animate(px, r.left - o.left + r.width * fx, { duration, ease });
      animate(py, r.top - o.top + r.height * fy, { duration, ease });
    },
    [po, px, py]
  );

  const click = useCallback(() => {
    animate(ps, [1, 0.8, 1], { duration: 0.28 });
  }, [ps]);

  // Começa a rodar um pouco depois do primeiro paint, a não ser com "reduzir movimento".
  useEffect(() => {
    if (reduce) return;
    const id = window.setTimeout(() => {
      setRunning(true);
      setStage("typing");
      setScene(1);
    }, 2600);
    return () => window.clearTimeout(id);
  }, [reduce]);

  // Pausa fora da tela e com a aba oculta.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let seen = true;
    const sync = () => setOnScreen(seen && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      sync();
    }, { threshold: 0.2 });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // Roteiro de uma cena.
  useEffect(() => {
    if (!running || !onScreen || reduce) return;
    const s = scenes[scene];
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    setStage("typing");
    hidePointer();
    const typed = s.query.length * TYPE_MS + 420;
    at(typed, () => setStage("results"));
    at(typed + 450, () => pointTo(resultTitle.current, 0.7, 0.3));
    at(typed + 1250, click);
    at(typed + 1420, () => setStage("page"));
    at(typed + 2350, () => pointTo(cta.current, 0.75));
    at(typed + 3180, () => {
      click();
      setRipple((r) => r + 1);
    });
    at(typed + 3420, () => setStage("message"));
    at(typed + 3600, hidePointer);
    // Cena e etapa mudam juntas: assim nunca existe um quadro com o cliente novo na etapa antiga.
    at(typed + 6900, () => {
      setStage("typing");
      setScene((i) => (i + 1) % scenes.length);
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [scene, running, onScreen, reduce, pointTo, click, hidePointer]);

  const pick = (i: number) => {
    if (reduce) {
      setStage("message");
      setScene(i);
      return;
    }
    setStage("typing");
    setScene(i);
    setRunning(true);
  };

  const s = scenes[scene];
  const showResults = stage !== "typing";
  const showPage = stage === "page" || stage === "message";
  const showMsg = stage === "message";

  // Página e mensagem só trocam de cliente quando a cena nova chega nelas;
  // enquanto somem, continuam mostrando o cliente anterior.
  const shownRef = useRef(0);
  if (showPage) shownRef.current = scene;
  const shown = shownRef.current;
  const v = scenes[shown];

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full max-w-[560px] mx-auto">
        <div
          ref={box}
          role="img"
          aria-label={`Exemplo: quem busca "${s.query}" no Google cai na página de ${s.short} e chama no WhatsApp.`}
          className="relative w-full aspect-[5/4] [container-type:inline-size] select-none"
        >
          <div
            aria-hidden
            className="absolute inset-[10%] rounded-full blur-3xl opacity-30 dark:bg-primary-color/30 bg-secondary-color/25"
          />

          {/* 1. A busca */}
          <MDiv
            aria-hidden
            initial={false}
            animate={showPage ? { opacity: 0.32, scale: 0.94, y: -4 } : { opacity: 1, scale: 1, y: 0 }}
            transition={spring}
            style={{ transformOrigin: "0% 0%" }}
            className="absolute left-0 top-0 w-[80%] rounded-[3.2cqw] border dark:border-zinc-700 border-zinc-200 dark:bg-zinc-800 bg-white p-[2.6cqw] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center gap-[1.8cqw] rounded-full border dark:border-zinc-600 border-zinc-300 px-[2.6cqw] py-[1.7cqw] text-[3.5cqw] leading-none dark:text-zinc-100 text-zinc-800">
              <BiSearch className="shrink-0 text-[4cqw] dark:text-zinc-400 text-zinc-500" />
              <Typed key={scene} text={s.query} active={stage === "typing"} />
            </div>
            <MDiv
              initial={false}
              animate={showResults ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.35 }}
              className="pt-[2.6cqw] px-[1cqw]"
            >
              <div className="flex items-center gap-[1.6cqw]">
                <span
                  className="grid h-[5.4cqw] w-[5.4cqw] shrink-0 place-items-center rounded-full text-[2cqw] font-semibold text-white"
                  style={{ background: s.brand }}
                >
                  {s.initials}
                </span>
                <span className="truncate text-[2.4cqw] dark:text-zinc-400 text-zinc-500">{s.host}</span>
              </div>
              <span
                ref={resultTitle}
                className="mt-[1.2cqw] block truncate text-[3.3cqw] font-medium leading-tight dark:text-primary-color text-tertiary-color"
              >
                {s.title}
              </span>
              <p className="mt-[0.8cqw] line-clamp-2 text-[2.5cqw] leading-snug dark:text-zinc-400 text-zinc-600">
                {s.snippet}
              </p>
              <div className="mt-[2.4cqw] space-y-[1cqw] opacity-60">
                <div className="h-[1.4cqw] w-[46%] rounded-full dark:bg-zinc-700 bg-zinc-200" />
                <div className="h-[1.4cqw] w-[70%] rounded-full dark:bg-zinc-700 bg-zinc-200" />
              </div>
            </MDiv>
          </MDiv>

          {/* 2. A página do cliente (os 4 prints ficam montados, então trocam sem piscar) */}
          <MDiv
            aria-hidden
            initial={false}
            animate={showPage ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 26, scale: 0.96 }}
            transition={spring}
            className="absolute left-[7%] top-[21%] w-[90%] overflow-hidden rounded-[2.4cqw] border dark:border-zinc-700 border-zinc-300 dark:bg-zinc-800 bg-zinc-100 shadow-[0_40px_70px_-30px_rgba(0,0,0,0.7)]"
          >
            <div className="flex h-[4.6cqw] items-center gap-[1.2cqw] px-[2cqw]">
              <span className="h-[1.3cqw] w-[1.3cqw] rounded-full bg-zinc-500/50" />
              <span className="h-[1.3cqw] w-[1.3cqw] rounded-full bg-zinc-500/50" />
              <span className="h-[1.3cqw] w-[1.3cqw] rounded-full bg-zinc-500/50" />
              <span className="ml-[2cqw] flex min-w-0 flex-1 items-center gap-[0.8cqw] rounded-full dark:bg-zinc-900/70 bg-white px-[2cqw] py-[0.6cqw] text-[2.2cqw] leading-none dark:text-zinc-300 text-zinc-600">
                <BiLockAlt className="shrink-0" />
                <span className="truncate">{v.host}</span>
              </span>
            </div>
            <div className="relative aspect-[16/10]">
              {scenes.map((sc, i) => (
                <Image
                  key={sc.shot}
                  src={sc.shot}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1280px) 90vw, 510px"
                  className={`object-cover object-top ${i === shown ? "opacity-100" : "opacity-0"}`}
                />
              ))}
              <div
                ref={cta}
                className="absolute h-0 w-0"
                style={{ left: `${v.cta[0] * 100}%`, top: `${v.cta[1] * 100}%` }}
              >
                {ripple > 0 && (
                  <MDiv
                    key={ripple}
                    initial={{ opacity: 0.75, scale: 0.2 }}
                    animate={{ opacity: 0, scale: 2.4 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="absolute -left-[4cqw] -top-[4cqw] h-[8cqw] w-[8cqw] rounded-full border-[0.5cqw] border-primary-color"
                  />
                )}
              </div>
            </div>
          </MDiv>

          {/* 3. A mensagem que chega no WhatsApp do dono */}
          <MDiv
            aria-hidden
            initial={false}
            animate={showMsg ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
            transition={showMsg ? { type: "spring", stiffness: 260, damping: 17 } : { duration: 0.25 }}
            style={{ transformOrigin: "100% 100%" }}
            className="absolute bottom-0 right-0 w-[56%] rounded-[3cqw] border dark:border-zinc-700 border-zinc-200 dark:bg-zinc-800/95 bg-white/95 p-[2.4cqw] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65)] backdrop-blur"
          >
            <div className="flex items-center gap-[1.4cqw] text-[2.3cqw] leading-none">
              <span className="grid h-[4.4cqw] w-[4.4cqw] place-items-center rounded-full bg-primary-color text-zinc-900">
                <BiLogoWhatsapp className="text-[3cqw]" />
              </span>
              <span className="font-semibold dark:text-zinc-100 text-zinc-800">WhatsApp</span>
              <span className="ml-auto dark:text-zinc-500 text-zinc-400">agora</span>
            </div>
            <p className="mt-[1.6cqw] text-[2.5cqw] leading-none dark:text-zinc-400 text-zinc-500">
              Mensagem nova para <span className="dark:text-zinc-200 text-zinc-700">{v.short}</span>
            </p>
            <p className="mt-[1.2cqw] rounded-[1.8cqw] rounded-tl-[0.4cqw] bg-primary-color/15 px-[2cqw] py-[1.4cqw] text-[2.9cqw] leading-snug dark:text-zinc-100 text-zinc-800">
              {v.message}
            </p>
            <p className="mt-[1.2cqw] flex items-center gap-[0.8cqw] text-[2.2cqw] leading-none dark:text-zinc-500 text-zinc-500">
              <BiCheckDouble className="text-[3cqw] text-primary-color" />
              veio pela página
            </p>
          </MDiv>

          {/* Cursor */}
          <MDiv
            aria-hidden
            style={{ x: px, y: py, scale: ps, opacity: po }}
            className="pointer-events-none absolute left-0 top-0 w-[5cqw] -ml-[0.6cqw] -mt-[0.4cqw]"
          >
            <svg viewBox="0 0 24 24" className="h-auto w-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]">
              <path
                d="M3 2l15.5 9.6-6.7 1.3 3.7 7.5-2.9 1.4-3.7-7.5L3 18.8z"
                fill="#fafafa"
                stroke="#18181b"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          </MDiv>
        </div>

        {/* Nichos: mostram onde está a história e deixam trocar na mão */}
        <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Escolher o exemplo">
          {scenes.map((sc, i) => (
            <button
              key={sc.niche}
              type="button"
              onClick={() => pick(i)}
              aria-pressed={i === scene}
              className={`rounded-full border px-3 py-1.5 text-xs tracking-wide duration-200 active:scale-[0.97] ${
                i === scene
                  ? "border-primary-color/60 dark:bg-primary-color/10 bg-secondary-color/10 dark:text-primary-color text-tertiary-color"
                  : "dark:border-zinc-700 border-zinc-300 dark:text-zinc-400 text-zinc-600 hover:dark:text-zinc-200 hover:text-zinc-900"
              }`}
            >
              {sc.niche}
            </button>
          ))}
        </div>
      </div>
    </MotionConfig>
  );
}
