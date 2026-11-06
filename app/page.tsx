import Job from "./components/pages/Job";
import Social from "./components/shared/Social";
import { Slide } from "./animation/Slide";
import ContributionGraph from "./components/pages/GithubCalendarComponent";
import HeroStory from "./components/local/HeroStory";
import LocalWork, { NicheMarquee, Stats, WhatsAppButton } from "./components/local/LocalWork";
import { BiDownArrowAlt } from "react-icons/bi";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto md:px-16 px-6 lg:mt-16 mt-10">
      <section className="grid xl:grid-cols-[1.1fr_1fr] grid-cols-1 items-center gap-x-12 gap-y-10">
        {/* Sem Slide: conteúdo acima da dobra precisa aparecer no primeiro
            paint, sem esperar hidratação. */}
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] dark:text-primary-color text-secondary-color mb-5">
            Matheus Mattos · São Borja, RS
          </p>
          <h1 className="font-incognito font-semibold tracking-tight text-[2.15rem] sm:text-5xl lg:text-6xl mb-5 sm:mb-6 leading-[1.08]">
            Páginas que levam o cliente do Google direto para o WhatsApp do seu negócio.
          </h1>
          <p className="text-base sm:text-lg dark:text-zinc-400 text-zinc-700 leading-relaxed mb-8">
            Faço sites para negócios da região, com as fotos reais do negócio, domínio próprio e tudo configurado no
            Google. Por trás deles, desenvolvimento web desde 2020 e a TI do Hospital Ivan Goulart, onde sou Analista.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <WhatsAppButton />
            <a href="#clientes" className="inline-flex items-center gap-x-2 font-medium hover:underline">
              Ver clientes e exemplos <BiDownArrowAlt aria-hidden />
            </a>
          </div>
          <div className="hidden xl:block">
            <Social type="social" />
          </div>
        </div>
        <HeroStory />
        <div className="xl:hidden -mt-6">
          <Social type="social" />
        </div>
      </section>

      <NicheMarquee />
      <Stats />
      <LocalWork />

      <section className="mt-32 pt-16 border-t dark:border-zinc-800 border-zinc-200">
        <Slide>
          <div className="mb-14 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] dark:text-primary-color text-secondary-color mb-3">
              Desenvolvimento e TI
            </p>
            <h2 className="font-incognito text-4xl font-bold tracking-tight mb-4">Por trás das páginas</h2>
            <p className="dark:text-zinc-400 text-zinc-600 leading-relaxed">
              Sou bacharel em Ciência da Computação e trabalho com desenvolvimento web desde 2020: PUC-RS, Compass UOL
              no projeto da Vivo e sistemas em Laravel. Hoje sou Analista de TI no Hospital Ivan Goulart, onde
              desenvolvo os sistemas internos e cuido dos servidores onde eles rodam.
            </p>
          </div>
        </Slide>
        <ContributionGraph />
        <Job />
      </section>
    </main>
  );
}
