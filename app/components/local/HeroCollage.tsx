"use client";

import Image from "next/image";
import { useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { MDiv } from "./motion";
import PhoneFrame from "./PhoneFrame";
import { useEffect } from "react";

type Layer = {
  src: string;
  alt: string;
  phone?: boolean;
  className: string;
  /** Quanto a camada se mexe com o mouse (px). Camadas da frente mexem mais. */
  depth: number;
  /** Inclinação em graus (vai no style, junto do parallax, para não ser sobrescrita). */
  rotate: number;
};

const layers: Layer[] = [
  {
    src: "/projects/locais/trn.jpg",
    alt: "Página da TRN Autocar no computador",
    className: "left-0 top-0 w-[74%]",
    rotate: -4,
    depth: 10,
  },
  {
    src: "/projects/locais/eficaz.jpg",
    alt: "Página da Eficaz Contabilidade no computador",
    className: "right-0 top-[22%] w-[76%]",
    rotate: 2,
    depth: 18,
  },
  {
    src: "/projects/locais/fagundes-m.jpg",
    alt: "Página da Fagundes Manutenção no celular",
    phone: true,
    className: "left-[4%] -bottom-[2%] w-[27%]",
    rotate: -5,
    depth: 30,
  },
  {
    src: "/projects/locais/optica-m.jpg",
    alt: "Página da Óptica Líder no celular",
    phone: true,
    className: "right-[3%] -bottom-[6%] w-[24%]",
    rotate: 6,
    depth: 26,
  },
];

function LayerImg({ layer, mx, my, index }: { layer: Layer; mx: any; my: any; index: number }) {
  const x = useTransform(mx, (v: number) => v * layer.depth);
  const y = useTransform(my, (v: number) => v * layer.depth);
  return (
    <MDiv style={{ x, y, rotate: layer.rotate }} className={`absolute ${layer.className}`}>
      {/* Entrada em sequência ao abrir a página: CSS puro, funciona sem JS e
          respeita "reduzir movimento" (globals.css zera a duração). */}
      <div className="animate-rise" style={{ animationDelay: `${0.12 + index * 0.14}s` }}>
        {layer.phone ? (
          <PhoneFrame src={layer.src} alt={layer.alt} sizes="180px" priority />
        ) : (
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg border dark:border-zinc-700 border-zinc-300 shadow-2xl shadow-black/40">
            <Image
              src={layer.src}
              alt={layer.alt}
              fill
              priority
              sizes="(max-width: 1280px) 70vw, 460px"
              className="object-cover object-top"
            />
          </div>
        )}
      </div>
    </MDiv>
  );
}

/** Colagem de páginas reais no topo, com parallax leve no mouse. */
export default function HeroCollage() {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 18 });
  const my = useSpring(rawY, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * -1);
      rawY.set((e.clientY / window.innerHeight - 0.5) * -1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, rawX, rawY]);

  return (
    <div className="relative w-full max-w-[560px] aspect-[5/4] mx-auto" aria-label="Algumas páginas no ar">
      <div
        aria-hidden
        className="absolute inset-[8%] rounded-full blur-3xl opacity-40 dark:bg-primary-color/30 bg-secondary-color/25"
      />
      {layers.map((layer, i) => (
        <LayerImg key={layer.src} layer={layer} mx={mx} my={my} index={i} />
      ))}
    </div>
  );
}
