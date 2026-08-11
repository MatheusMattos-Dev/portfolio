"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/public/logo.png";
import Theme from "./Theme";
import UnmountStudio from "./Unmount";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const pathname = usePathname();

  const data = [
    {
      title: "Início",
      href: "/",
    },
    {
      title: "Sobre",
      href: "/about",
    },
    {
      title: "Projetos",
      href: "/projects",
    },
    {
      title: "Contato",
      href: "/contato",
    },
  ];

  return (
    <UnmountStudio>
      <header className="text-sm py-6 md:px-16 px-6 border-b dark:border-zinc-800 border-zinc-200 z-30 md:mb-28 mb-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image
              src={Logo}
              width={96}
              height={96}
              quality={95}
              style={{ width: 48, height: 48 }}
              alt="Logo de Matheus Mattos Chaves"
              className="rounded-full"
            />
          </Link>

          <nav className="md:block hidden">
            <ul className="flex items-center gap-x-8">
              {data.map((link, id) => {
                // "/" só é ativo na home; as demais também cobrem sub-rotas.
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <li key={id}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`font-incognito duration-300 text-base ${
                        isActive
                          ? "dark:text-primary-color text-secondary-color font-semibold"
                          : "dark:text-white text-zinc-600 dark:hover:text-primary-color hover:text-zinc-900"
                      }`}
                    >
                      {link.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-x-4">
            <Theme />
            <MobileMenu />
          </div>
        </div>
      </header>
    </UnmountStudio>
  );
}
