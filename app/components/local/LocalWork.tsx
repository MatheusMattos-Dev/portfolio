import Image from "next/image";
import { BiCheck, BiLogoWhatsapp, BiDownArrowAlt, BiLinkExternal } from "react-icons/bi";
import { Slide } from "@/app/animation/Slide";
import SiteCard, { SiteMedia } from "./SiteCard";
import Steps from "./Steps";
import Counter from "./Counter";
import ChatQuote from "./ChatQuote";
import PhoneFrame from "./PhoneFrame";
import { clients, examples, quotes, stats, whatsappLink } from "@/app/data/local";

const niches = [
  "Contabilidade",
  "Oficina mecânica",
  "Ótica",
  "Unhas",
  "Salão de beleza",
  "Pet shop",
  "Energia solar",
  "Vidraçaria",
  "Advocacia",
  "Seguros",
  "Peças agrícolas",
  "Elétrica e hidráulica",
  "Alinhamento e pneus",
];

function SectionTitle({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="text-xs uppercase tracking-[0.2em] dark:text-primary-color text-secondary-color mb-3">{kicker}</p>
      <h2 className="font-incognito text-4xl font-bold tracking-tight mb-4">{title}</h2>
      {text && <p className="dark:text-zinc-400 text-zinc-600 leading-relaxed">{text}</p>}
    </div>
  );
}

export function NicheMarquee() {
  const row = [...niches, ...niches];
  return (
    <div
      className="relative overflow-hidden border-y dark:border-zinc-800 border-zinc-200 py-4 my-16 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
      aria-label={`Nichos atendidos: ${niches.join(", ")}`}
    >
      <ul className="flex w-max gap-x-10 animate-marquee motion-reduce:animate-none" aria-hidden>
        {row.map((n, i) => (
          <li key={i} className="flex items-center gap-x-10 font-incognito text-xl whitespace-nowrap dark:text-zinc-400 text-zinc-500">
            {n}
            <span className="h-1.5 w-1.5 rounded-full dark:bg-primary-color bg-secondary-color" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Stats() {
  return (
    <dl className="grid lg:grid-cols-4 grid-cols-2 gap-px rounded-xl overflow-hidden border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-800 bg-zinc-200">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`relative flex flex-col-reverse justify-end p-5 sm:p-7 dark:bg-zinc-900 bg-white ${
            s.live ? "bg-[linear-gradient(140deg,rgba(51,224,146,0.14),transparent_65%)]" : ""
          }`}
        >
          <dt className="text-sm dark:text-zinc-400 text-zinc-600 leading-snug mt-3 max-w-[24ch]">{s.label}</dt>
          <dd className="flex items-baseline font-semibold tracking-tighter text-5xl sm:text-6xl leading-none dark:text-white text-zinc-900">
            {s.prefix && <span className="dark:text-primary-color text-secondary-color">{s.prefix}</span>}
            <Counter value={s.value} />
          </dd>
          {s.live && (
            <span className="absolute right-4 top-4 sm:right-5 sm:top-5 inline-flex items-center gap-x-2 text-[10px] sm:text-[11px] font-medium uppercase tracking-widest dark:text-primary-color text-secondary-color">
              <span className="relative flex h-2.5 w-2.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary-color opacity-60 animate-ping motion-reduce:animate-none" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-color" />
              </span>
              No ar
            </span>
          )}
        </div>
      ))}
    </dl>
  );
}

function PhoneFan() {
  const phones = [
    { slug: "aline", alt: "Página da Aline Nail Designer no celular", pos: "left-0 top-[9%] -rotate-[10deg] group-hover:-translate-x-5 group-hover:-rotate-[14deg]", float: "0s" },
    { slug: "mundopet", alt: "Página do Mundo Pet no celular", pos: "right-0 top-[9%] rotate-[10deg] group-hover:translate-x-5 group-hover:rotate-[14deg]", float: "-2.4s" },
    { slug: "trn", alt: "Página da TRN Autocar no celular", pos: "left-1/2 -translate-x-1/2 top-0 z-10 group-hover:-translate-y-3", float: "-1.2s" },
  ];
  return (
    <div className="group relative mx-auto w-full max-w-[420px] aspect-[100/106]" aria-hidden>
      <div className="absolute inset-x-[12%] bottom-[2%] h-[10%] rounded-[50%] bg-black/50 blur-2xl" />
      {phones.map((ph) => (
        <div key={ph.slug} className={`absolute w-[45%] duration-500 ease-out ${ph.pos}`}>
          <div className="animate-float motion-reduce:animate-none" style={{ animationDelay: ph.float }}>
            <PhoneFrame src={`/projects/locais/${ph.slug}-m.jpg`} alt={ph.alt} sizes="200px" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientBlock({ index }: { index: number }) {
  const c = clients[index];
  const flip = index % 2 === 1;
  return (
    <article className="grid lg:grid-cols-[1.25fr_1fr] grid-cols-1 gap-8 items-center">
      <a
        href={c.url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Abrir a página ${c.name}`}
        className={`group block overflow-hidden rounded-lg border dark:border-zinc-800 border-zinc-200 dark:hover:border-zinc-600 hover:border-zinc-300 duration-300 ${flip ? "lg:order-2" : ""}`}
      >
        <SiteMedia site={c} badge="Cliente" bordered={false} />
      </a>
      <div className={flip ? "lg:order-1" : ""}>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
          {c.niche} · {c.city}
        </p>
        <h3 className="font-incognito text-3xl font-semibold tracking-tight mb-4">{c.name}</h3>
        <p className="dark:text-zinc-400 text-zinc-600 leading-relaxed mb-5">{c.summary}</p>
        <ul className="space-y-2 mb-6">
          {c.delivered.map((d) => (
            <li key={d} className="flex items-start gap-x-2 text-sm">
              <BiCheck className="text-lg shrink-0 dark:text-primary-color text-secondary-color" aria-hidden />
              {d}
            </li>
          ))}
        </ul>
        {c.quote && (
          <blockquote className="border-l-2 dark:border-primary-color border-secondary-color pl-4 mb-6">
            <p className="font-incognito text-lg leading-snug">“{c.quote.text}”</p>
            <footer className="text-xs text-zinc-500 mt-2 uppercase tracking-widest">{c.quote.author}</footer>
          </blockquote>
        )}
        <a
          href={c.url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-x-2 text-sm font-medium dark:text-primary-color text-secondary-color hover:underline"
        >
          Ver a página <BiLinkExternal aria-hidden />
        </a>
      </div>
    </article>
  );
}

export function WhatsAppButton({ label = "Quero uma página assim" }: { label?: string }) {
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-x-2 rounded-md px-5 py-3 font-medium bg-primary-color text-zinc-900 hover:brightness-110 duration-200"
    >
      <BiLogoWhatsapp className="text-xl" aria-hidden />
      {label}
    </a>
  );
}

export default function LocalWork() {
  return (
    <>
      <section id="clientes" className="mt-24 scroll-mt-24">
        <Slide>
          <SectionTitle
            kicker="Clientes"
            title="Negócios que já fecharam comigo"
            text="O pacote inclui a página com as fotos reais do negócio, o domínio próprio, a configuração no Google e os botões que levam direto ao WhatsApp."
          />
        </Slide>
        <div className="space-y-20">
          <Slide>
            <ClientBlock index={0} />
          </Slide>
          {clients.slice(1).map((c, i) => (
            <Slide key={c.slug}>
              <ClientBlock index={i + 1} />
            </Slide>
          ))}
        </div>
      </section>

      <section id="exemplos" className="mt-32 scroll-mt-24">
        <Slide>
          <SectionTitle
            kicker="Páginas de exemplo"
            title="Uma página diferente para cada negócio"
            text="Montei cada uma para mostrar a ideia ao dono, com as fotos e as informações reais do negócio dele. É assim que começa: um exemplo sem compromisso."
          />
        </Slide>
        <Slide>
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
            {examples.map((site) => (
              <SiteCard key={site.slug} site={site} badge="Exemplo" />
            ))}
          </div>
        </Slide>
      </section>

      <section id="como-funciona" className="mt-32 scroll-mt-24">
        <Slide>
          <SectionTitle kicker="Como funciona" title="Do exemplo ao Google, em quatro passos" />
        </Slide>
        <Steps />
      </section>

      <section className="mt-32">
        <Slide>
          <SectionTitle
            kicker="Depoimentos"
            title="O que eles me mandaram no WhatsApp"
            text="Mensagens de quem recebeu a página, com a nota de cada negócio no Google."
          />
        </Slide>
        <div className="grid lg:grid-cols-3 grid-cols-1 gap-5">
          {quotes.map((q, i) => (
            <ChatQuote key={q.name} q={q} delay={i * 450} />
          ))}
        </div>
      </section>

      <section className="mt-32">
        <Slide>
          <div className="relative overflow-hidden rounded-2xl border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-900 bg-white">
            <div aria-hidden className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl dark:bg-primary-color/20 bg-secondary-color/20" />
            <div aria-hidden className="absolute -left-40 -bottom-40 h-96 w-96 rounded-full blur-3xl dark:bg-primary-color/10 bg-secondary-color/10" />
            <div className="relative grid lg:grid-cols-[1.25fr_1fr] grid-cols-1 items-center gap-10 p-8 sm:p-12">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] dark:text-primary-color text-secondary-color mb-4">
                  Sem compromisso
                </p>
                <h2 className="font-incognito text-3xl sm:text-5xl font-bold tracking-tight mb-5 leading-[1.1]">
                  Quer ver como ficaria a página do seu negócio?
                </h2>
                <p className="dark:text-zinc-400 text-zinc-600 mb-6 max-w-xl leading-relaxed">
                  Eu monto um exemplo com as fotos reais do seu negócio e te mando pelo WhatsApp. Se gostar, a gente segue; se não,
                  fica a ideia.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    "Exemplo montado com as fotos e as informações do seu negócio",
                    "Você só decide depois de ver a página pronta",
                    "Cada botão leva o cliente direto para o seu WhatsApp",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-x-2.5 text-sm sm:text-base">
                      <span className="mt-0.5 grid place-items-center h-5 w-5 shrink-0 rounded-full bg-primary-color text-zinc-900">
                        <BiCheck aria-hidden />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-4">
                  <WhatsAppButton label="Pedir meu exemplo" />
                  <a href="#exemplos" className="inline-flex items-center gap-x-2 font-medium hover:underline">
                    Ver os exemplos <BiDownArrowAlt aria-hidden />
                  </a>
                </div>
              </div>
              <PhoneFan />
            </div>
          </div>
        </Slide>
      </section>
    </>
  );
}
