"use client";

import { useReducedMotion } from "framer-motion";
import { MSpan, MLi } from "./motion";
import { steps } from "@/app/data/local";

/** Passos do serviço com uma linha que se desenha ao rolar. */
export default function Steps() {
  const reduce = useReducedMotion();

  return (
    <ol className="relative grid lg:grid-cols-4 grid-cols-1 lg:gap-x-8 gap-y-10">
      {/* Linha: horizontal no desktop, vertical no celular. */}
      <MSpan
        aria-hidden
        className="hidden lg:block absolute left-0 right-0 top-5 h-px dark:bg-primary-color/50 bg-secondary-color/50 origin-left"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <MSpan
        aria-hidden
        className="lg:hidden absolute left-5 top-0 bottom-0 w-px dark:bg-primary-color/50 bg-secondary-color/50 origin-top"
        initial={reduce ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {steps.map((step, i) => (
        <MLi
          key={step.title}
          className="relative lg:pl-0 pl-16"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.25 + i * 0.18 }}
        >
          <span className="lg:relative absolute left-0 top-0 grid place-items-center h-10 w-10 rounded-full border dark:border-primary-color border-secondary-color dark:bg-zinc-900 bg-white font-incognito text-lg dark:text-primary-color text-secondary-color mb-5">
            {i + 1}
          </span>
          <h3 className="font-incognito text-xl font-semibold tracking-tight mb-2">{step.title}</h3>
          <p className="text-sm dark:text-zinc-400 text-zinc-600 leading-relaxed">{step.text}</p>
        </MLi>
      ))}
    </ol>
  );
}
