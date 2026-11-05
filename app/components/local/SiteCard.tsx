import Image from "next/image";
import { BiLinkExternal, BiMap } from "react-icons/bi";
import type { LocalSite } from "@/app/data/local";
import PhoneFrame from "./PhoneFrame";

/** Print do computador com o celular por cima e o selo. */
export function SiteMedia({ site, badge, bordered = true }: { site: LocalSite; badge: "Cliente" | "Exemplo"; bordered?: boolean }) {
  return (
      <div className={`relative aspect-[16/10] overflow-hidden ${bordered ? "border-b dark:border-zinc-800 border-zinc-200" : ""}`}>
        <Image
          src={`/projects/locais/${site.slug}.jpg`}
          alt={`Página ${site.name} no computador`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute right-4 w-[23%] -bottom-[36%] group-hover:bottom-3 group-hover:-rotate-2 duration-500 ease-out">
          <PhoneFrame src={`/projects/locais/${site.slug}-m.jpg`} alt={`Página ${site.name} no celular`} sizes="130px" mini />
        </div>
        <span
          className={`absolute left-3 top-3 text-[11px] uppercase tracking-widest font-medium px-2 py-1 rounded backdrop-blur ${
            badge === "Cliente"
              ? "bg-primary-color text-zinc-900"
              : "dark:bg-zinc-900/80 bg-white/85 dark:text-zinc-300 text-zinc-700"
          }`}
        >
          {badge}
        </span>
      </div>
  );
}

/**
 * Card de uma página: print do computador e o celular por cima.
 * No mouse, o celular sobe e o print aproxima. No toque, o celular já
 * aparece pela metade, então nada depende de hover.
 */
export default function SiteCard({ site, badge }: { site: LocalSite; badge: "Cliente" | "Exemplo" }) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex flex-col h-full overflow-hidden dark:bg-primary-bg bg-secondary-bg border dark:border-zinc-800 border-zinc-200 dark:hover:border-zinc-600 hover:border-zinc-300 rounded-lg duration-300"
    >
      <SiteMedia site={site} badge={badge} />

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-x-2 text-xs uppercase tracking-widest text-zinc-500 mb-2">
          <span>{site.niche}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-x-1">
            <BiMap aria-hidden /> {site.city}
          </span>
        </div>
        <h3 className="font-incognito text-xl font-semibold tracking-tight mb-2">{site.name}</h3>
        <p className="text-sm dark:text-zinc-400 text-zinc-600 leading-relaxed mb-4">{site.summary}</p>
        <ul className="flex flex-wrap gap-2 mb-5">
          {site.highlights.map((h) => (
            <li key={h} className="dark:bg-zinc-800 bg-zinc-100 rounded px-2.5 py-1 text-xs">
              {h}
            </li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-x-2 text-sm font-medium dark:text-primary-color text-secondary-color group-hover:underline">
          Ver a página <BiLinkExternal aria-hidden />
        </span>
      </div>
    </a>
  );
}
