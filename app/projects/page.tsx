import Image from "next/image";
import { Metadata } from "next";
import { BiLinkExternal, BiLogoGithub } from "react-icons/bi";
import { Slide } from "../animation/Slide";
import PageHeading from "../components/shared/PageHeading";
import { site, absoluteUrl } from "@/lib/site";
import { projects, repos } from "@/app/data/projects";
import { clients, examples } from "@/app/data/local";
import SiteCard from "../components/local/SiteCard";
import { WhatsAppButton } from "../components/local/LocalWork";

const title = `Projetos | ${site.name}`;
const description =
  "Páginas para negócios locais e sistemas que coloquei no ar, todos rodando com clientes e usuários reais.";

export const metadata: Metadata = {
  title,
  metadataBase: new URL(absoluteUrl("/projects")),
  description,
  openGraph: {
    title,
    url: absoluteUrl("/projects"),
    description,
    images: site.ogImage,
  },
};

export default function Projects() {
  return (
    <main className="max-w-7xl mx-auto md:px-16 px-6">
      <PageHeading
        title="Projetos"
        description="Páginas que levam o cliente do Google direto para o WhatsApp de negócios da região, e os sistemas que coloquei no ar. Tudo rodando com clientes e usuários reais."
      >
        <div className="mt-8">
          <WhatsAppButton />
        </div>
      </PageHeading>

      <section className="mb-20">
        <h2 className="font-incognito text-4xl mb-4 font-bold tracking-tight">Sites para negócios locais</h2>
        <p className="dark:text-zinc-400 text-zinc-600 max-w-2xl mb-10">
          Clientes com a página no ar e páginas de exemplo que montei para apresentar a ideia a cada negócio, com as
          fotos e as informações reais dele.
        </p>
        <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
          {clients.map((site) => (
            <SiteCard key={site.slug} site={site} badge="Cliente" />
          ))}
          {examples.map((site) => (
            <SiteCard key={site.slug} site={site} badge="Exemplo" />
          ))}
        </div>
      </section>

      <Slide delay={0.1}>
        <h2 className="font-incognito text-4xl mb-10 font-bold tracking-tight">Sistemas e produtos</h2>
        <section className="grid lg:grid-cols-2 grid-cols-1 gap-5 mb-16">
          {projects.map((project) => (
            <article
              key={project.slug}
              className="flex flex-col justify-between overflow-hidden dark:bg-primary-bg bg-secondary-bg border dark:border-zinc-800 border-zinc-200 dark:hover:border-zinc-700 hover:border-zinc-300 rounded-lg duration-300"
            >
              {project.cover && (
                <div className="relative aspect-[16/10] border-b dark:border-zinc-800 border-zinc-200 overflow-hidden">
                  <Image
                    src={project.cover}
                    alt={`Print do projeto ${project.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={85}
                    className="object-cover object-top"
                  />
                </div>
              )}

              <div className="px-6 pt-6">
                <div className="flex items-center justify-between gap-x-3 mb-3">
                  <span className="text-xs uppercase tracking-widest text-zinc-500">
                    {project.category}
                  </span>
                  {project.live && (
                    <span className="flex items-center gap-x-2 text-xs text-emerald-500 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      No ar
                    </span>
                  )}
                </div>

                <h2 className="font-incognito text-2xl font-semibold tracking-tight mb-2">
                  {project.name}
                </h2>
                <p className="dark:text-zinc-400 text-zinc-600 leading-relaxed mb-5">
                  {project.description}
                </p>
              </div>

              <div className="px-6 pb-6">
                <ul className="flex flex-wrap gap-2 mb-5">
                  {project.tech.map((item) => (
                    <li
                      key={item}
                      className="dark:bg-zinc-800 bg-zinc-100 rounded px-2.5 py-1 text-xs"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-x-2 dark:text-primary-color text-secondary-color hover:underline font-medium"
                  >
                    {project.cta}
                    <BiLinkExternal />
                  </a>
                ) : (
                  <span className="text-sm text-zinc-500">
                    Sistema interno — sem acesso público
                  </span>
                )}
              </div>
            </article>
          ))}
        </section>
      </Slide>

      <Slide delay={0.14}>
        <section className="mb-12">
          <div className="mb-8">
            <h2 className="font-incognito text-4xl mb-4 font-bold tracking-tight">
              Código aberto
            </h2>
            <p className="dark:text-zinc-400 text-zinc-600 max-w-xl">
              Repositórios públicos no meu GitHub — experimentos, side projects
              e ferramentas que uso no dia a dia.
            </p>
          </div>

          <ul className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
            {repos.map((repo) => (
              <li key={repo.name}>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex flex-col gap-y-3 h-full dark:bg-primary-bg bg-secondary-bg border dark:border-zinc-800 border-zinc-200 dark:hover:border-zinc-700 hover:border-zinc-300 rounded-lg p-5 duration-300"
                >
                  <span className="flex items-center gap-x-2 font-medium break-all">
                    <BiLogoGithub className="text-xl shrink-0 text-zinc-500" />
                    {repo.name}
                  </span>
                  <span className="flex items-center gap-x-2 text-sm dark:text-zinc-400 text-zinc-600 mt-auto">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: repo.color }}
                    />
                    {repo.language}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <a
            href={site.author.github}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-x-2 mt-8 dark:text-primary-color text-secondary-color hover:underline font-medium"
          >
            Ver todos os repositórios
            <BiLinkExternal />
          </a>
        </section>
      </Slide>
    </main>
  );
}
