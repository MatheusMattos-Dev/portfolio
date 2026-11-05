import Image from "next/image";

/**
 * Celular desenhado em CSS em volta de um print de página (390x844).
 * Tudo em porcentagem da largura, então serve do card pequeno ao topo.
 * `mini` tira a barra de status e os botões laterais, que somem em tamanho pequeno.
 */
export default function PhoneFrame({
  src,
  alt,
  sizes = "200px",
  priority = false,
  mini = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  mini?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[390/844] [container-type:inline-size] rounded-[16%/7.4%] p-[3.4%] bg-[linear-gradient(145deg,#4a4a52_0%,#1b1b1f_38%,#0c0c0e_62%,#3a3a40_100%)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08)_inset] ${className}`}
    >
      {!mini && (
        <>
          {/* Botões laterais */}
          <span aria-hidden className="absolute -left-[1.6%] top-[17%] h-[6%] w-[1.8%] rounded-l bg-[#2b2b30]" />
          <span aria-hidden className="absolute -left-[1.6%] top-[25%] h-[9%] w-[1.8%] rounded-l bg-[#2b2b30]" />
          <span aria-hidden className="absolute -right-[1.6%] top-[22%] h-[12%] w-[1.8%] rounded-r bg-[#2b2b30]" />
        </>
      )}
      <div className="relative h-full w-full overflow-hidden rounded-[13%/6%] bg-black">
        {!mini && (
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 z-10 flex h-[5.2%] items-center justify-between bg-black px-[9%] text-white"
          >
            <span className="text-[clamp(5px,4.2cqw,13px)] font-semibold tracking-tight leading-none">9:41</span>
            <span className="flex h-full items-center gap-[6%] w-[24%] justify-end">
              <svg viewBox="0 0 18 12" className="w-auto fill-white" style={{ height: "38%" }}>
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                <rect x="10" y="3" width="3" height="9" rx="1" />
                <rect x="15" y="0" width="3" height="12" rx="1" />
              </svg>
              <svg viewBox="0 0 26 12" className="w-auto" style={{ height: "38%" }}>
                <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="white" strokeOpacity="0.5" />
                <rect x="2.5" y="2.5" width="16" height="7" rx="1.5" fill="white" />
                <rect x="24" y="4" width="1.5" height="4" rx="0.75" fill="white" fillOpacity="0.5" />
              </svg>
            </span>
          </div>
        )}
        {/* Ilha no topo */}
        <span
          aria-hidden
          className={`absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-black ${
            mini ? "top-[1.6%] h-[2.6%] w-[26%]" : "top-[1.3%] h-[3%] w-[30%] ring-1 ring-white/5"
          }`}
        />
        <div className={`absolute inset-x-0 bottom-0 ${mini ? "top-0" : "top-[5.2%]"}`}>
          <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />
        </div>
        {/* Reflexo do vidro */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(115deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.04)_28%,transparent_42%)]"
        />
      </div>
    </div>
  );
}
