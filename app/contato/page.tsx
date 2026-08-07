import { Metadata } from "next";
import { BiMap, BiPhone } from "react-icons/bi";
import { Slide } from "../animation/Slide";
import { site, absoluteUrl } from "@/lib/site";
import { profile } from "@/app/data/profile";
import { socialLinks } from "@/app/data/social";

const title = `Contato | ${site.name}`;
const description =
  "Fale comigo sobre projetos, consultorias de TI e desenvolvimento de software.";

export const metadata: Metadata = {
  title,
  metadataBase: new URL(absoluteUrl("/contato")),
  description,
  openGraph: {
    title,
    url: absoluteUrl("/contato"),
    description,
    images: site.ogImage,
  },
};

export default function Contato() {
  return (
    <main className="max-w-7xl mx-auto md:px-16 px-6">
      <Slide>
        <header className="max-w-2xl mb-16">
          <h1 className="font-incognito font-semibold tracking-tight sm:text-5xl text-3xl lg:leading-tight mb-6">
            Vamos conversar.
          </h1>
          <p className="dark:text-zinc-400 text-zinc-600 leading-relaxed">
            Aberto a oportunidades, projetos e consultorias em desenvolvimento
            web e infraestrutura de TI. Respondo mais rápido por e-mail ou
            WhatsApp.
          </p>
        </header>
      </Slide>

      <Slide delay={0.1}>
        <ul className="grid sm:grid-cols-2 grid-cols-1 gap-4 max-w-3xl">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.id}>
                <a
                  href={link.url}
                  target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer noopener"
                  className="flex items-center gap-x-4 dark:bg-primary-bg bg-secondary-bg border dark:border-zinc-800 border-zinc-200 dark:hover:border-zinc-700 hover:border-zinc-300 rounded-md px-5 py-4 duration-300 group"
                >
                  <Icon className="text-3xl shrink-0 dark:text-zinc-400 text-zinc-600 group-hover:text-primary-color duration-300" />
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium">{link.name}</span>
                    <span className="text-sm dark:text-zinc-400 text-zinc-600 break-all">
                      {link.url
                        .replace("mailto:", "")
                        .replace("https://", "")
                        .replace("wa.me/", "WhatsApp: ")}
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </Slide>

      <Slide delay={0.14}>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-12 dark:text-zinc-400 text-zinc-600">
          <p className="flex items-center gap-x-2">
            <BiPhone className="text-lg" />
            {profile.phone}
          </p>
          <p className="flex items-center gap-x-2">
            <BiMap className="text-lg" />
            {profile.location}
          </p>
        </div>
      </Slide>
    </main>
  );
}
