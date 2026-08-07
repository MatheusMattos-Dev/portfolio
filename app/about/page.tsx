import Image from "next/image";
import { Metadata } from "next";
import { BiEnvelope, BiMap } from "react-icons/bi";
import { Slide } from "../animation/Slide";
import { site, absoluteUrl } from "@/lib/site";
import { profile } from "@/app/data/profile";
import Usage from "../components/pages/Usage";

const title = `Sobre | ${site.name}`;
const description =
  "Trajetória, competências técnicas e experiência em desenvolvimento web e infraestrutura de servidores.";

export const metadata: Metadata = {
  title,
  metadataBase: new URL(absoluteUrl("/about")),
  description,
  openGraph: {
    title,
    url: absoluteUrl("/about"),
    description,
    images: site.ogImage,
  },
};

export default function About() {
  return (
    <main className="relative lg:max-w-7xl mx-auto max-w-3xl md:px-16 px-6">
      <section className="relative grid lg:grid-cols-custom grid-cols-1 gap-x-6 justify-items-center">
        <div className="order-2 lg:order-none">
          <Slide>
            <h1 className="font-incognito font-semibold tracking-tight sm:text-5xl text-3xl lg:leading-tight basis-1/2 mb-8">
              Sou {profile.fullName}. Escrevo o código e mantenho de pé o
              servidor onde ele roda.
            </h1>

            <div className="dark:text-zinc-400 text-zinc-600 leading-relaxed flex flex-col gap-y-4">
              {profile.fullBio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Slide>

        </div>

        <aside className="flex flex-col lg:justify-self-center justify-self-start gap-y-8 lg:order-1 order-none mb-12">
          <Slide delay={0.1}>
            <div className="sticky top-10">
              {/* 400x500 mantém a proporção 4:5 do arquivo original (1183x1479),
                  então o object-cover não corta nada. object-top ancora no
                  topo caso a proporção mude. */}
              <Image
                className="rounded-2xl mb-4 object-cover object-top w-full"
                src={profile.image.src}
                width={400}
                height={500}
                quality={90}
                alt={profile.image.alt}
                priority
              />

              <div className="flex flex-col gap-y-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-x-2 hover:text-primary-color"
                >
                  <BiEnvelope className="text-lg" />
                  {profile.email}
                </a>
                <p className="flex items-center gap-x-2 dark:text-zinc-400 text-zinc-600">
                  <BiMap className="text-lg" />
                  {profile.location}
                </p>
              </div>
            </div>
          </Slide>
        </aside>
      </section>

      <Slide delay={0.14}>
        <div className="mt-24">
          <Usage />
        </div>
      </Slide>
    </main>
  );
}
