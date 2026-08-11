"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface SlideProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

// useLayoutEffect avisa no SSR; no servidor cai para useEffect (que nem roda).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Revela o conteúdo ao entrar na viewport.
 *
 * Regra central: o HTML servido sai VISÍVEL. Só escondemos depois que o JS
 * assumiu o controle — assim, se o script falhar, demorar ou estiver
 * desligado, o conteúdo continua na tela em vez de sumir.
 *
 * Quem já está na viewport no primeiro paint não é escondido nem animado:
 * evita o piscar de conteúdo acima da dobra.
 */
export const Slide = ({ children, className, delay = 0 }: SlideProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) return;

    setArmed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden = armed && !revealed;

  return (
    <div
      ref={ref}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(10px)" : "none",
        transition: `opacity 0.4s ease-out ${delay}s, transform 0.4s ease-out ${delay}s`,
      }}
    >
      <div className={className}>{children}</div>
    </div>
  );
};
