"use client";

import { useEffect, useRef, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { BiLogoWhatsapp, BiLinkExternal } from "react-icons/bi";
import type { Quote } from "@/app/data/local";

/**
 * Depoimento no formato da conversa de WhatsApp de onde ele veio.
 * Ao entrar na tela aparece "digitando…" e depois a mensagem.
 * O HTML do servidor já traz a mensagem visível: sem JS, ou com
 * "reduzir movimento", ela aparece direto.
 */
export default function ChatQuote({ q, delay = 0 }: { q: Quote; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"shown" | "typing">("shown");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;

    // Enquanto não aparece, o balão mostra "digitando…" (nunca fica vazio).
    setPhase("typing");
    let t = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        // Chegou de baixo para cima (já passou por ele): mostra na hora.
        const wait = entry.boundingClientRect.top < 0 ? 0 : delay + 1000;
        t = window.setTimeout(() => setPhase("shown"), wait);
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [delay]);

  return (
    <figure className="flex flex-col h-full overflow-hidden rounded-xl border dark:border-zinc-800 border-zinc-200 dark:bg-primary-bg bg-secondary-bg">
      <header className="flex items-center gap-x-3 px-5 py-4 border-b dark:border-zinc-800 border-zinc-200">
        <span
          aria-hidden
          className="grid place-items-center shrink-0 h-11 w-11 rounded-full text-[13px] font-semibold text-white tracking-tight"
          style={{ backgroundColor: q.color }}
        >
          {q.initials}
        </span>
        <div className="min-w-0">
          <p className="font-semibold leading-tight truncate dark:text-white text-zinc-900">{q.name}</p>
          <p className="text-xs text-zinc-500 truncate">
            {q.business} · {q.city}
          </p>
        </div>
        <span className="ml-auto inline-flex items-center gap-x-1 text-[11px] uppercase tracking-widest text-zinc-500 shrink-0">
          <BiLogoWhatsapp className="text-base text-[#25D366]" aria-hidden />
          <span className="sr-only">Mensagem de WhatsApp</span>
        </span>
      </header>

      <div
        ref={ref}
        className="relative flex-1 px-5 py-7 min-h-[150px] dark:bg-[#0b141a]/60 bg-[#efeae2]/70"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 0.6px, transparent 0.6px)",
          backgroundSize: "14px 14px",
          color: "rgba(127,127,127,0.18)",
        }}
      >
        {phase === "typing" && (
          <div className="inline-flex items-center gap-x-1 rounded-lg rounded-tl-none px-4 py-3 dark:bg-[#202c33] bg-white shadow-sm" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
        <blockquote
          className={`relative max-w-[94%] rounded-lg rounded-tl-none px-4 pt-3 pb-2 dark:bg-[#202c33] bg-white shadow-sm duration-500 ease-out origin-top-left ${
            phase === "shown" ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute pointer-events-none"
          }`}
        >
          <svg aria-hidden viewBox="0 0 8 13" className="absolute -left-2 top-0 h-[13px] w-2 dark:fill-[#202c33] fill-white">
            <path d="M8 0H0l8 13z" />
          </svg>
          <p className="font-incognito text-xl leading-snug dark:text-zinc-100 text-zinc-800">“{q.text}”</p>
          <span className="block text-right text-[11px] text-zinc-500 mt-1">{q.date}</span>
        </blockquote>
      </div>

      <footer className="flex items-center justify-between gap-x-3 px-5 py-3 border-t dark:border-zinc-800 border-zinc-200 text-xs">
        <span className="inline-flex items-center gap-x-1.5 text-zinc-500">
          <span className="inline-flex text-amber-400" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <AiFillStar key={i} />
            ))}
          </span>
          <span>
            <strong className="dark:text-zinc-200 text-zinc-800 font-semibold">{q.rating}</strong> no Google ({q.reviews})
          </span>
        </span>
        <a
          href={q.url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-x-1 font-medium dark:text-primary-color text-secondary-color hover:underline shrink-0"
        >
          Ver a página <BiLinkExternal aria-hidden />
        </a>
      </footer>
    </figure>
  );
}
