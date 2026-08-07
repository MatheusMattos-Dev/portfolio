import Link from "next/link";
import Image from "next/image";
import duckImage from "@/public/searching-duck.gif";

type props = {
  title: string;
  description: string;
};

const links = [
  { href: "/", label: "Início" },
  { href: "/about", label: "Sobre" },
  { href: "/projects", label: "Projetos" },
  { href: "/contato", label: "Contato" },
];

export default function NotFoundComponent({ title, description }: props) {
  return (
    <main className="min-h-[60vh] max-w-7xl mx-auto md:px-16 px-6">
      <header className="max-w-4xl">
        <Image
          width={80}
          height={80}
          src={duckImage}
          alt="Pato amarelo procurando"
        />
        <h1 className="font-incognito font-black tracking-tight sm:text-6xl text-3xl lg:leading-[3.7rem] leading-tight mt-6 mb-3">
          {title}
        </h1>
        <p className="max-w-2xl text-base dark:text-zinc-400 text-zinc-600 leading-relaxed">
          {description}
        </p>
      </header>

      <nav className="max-w-4xl flex flex-wrap gap-3 mt-12">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="dark:bg-primary-bg bg-secondary-bg border dark:border-zinc-800 border-zinc-200 dark:hover:border-zinc-700 hover:border-zinc-300 rounded-md px-5 py-3 duration-300"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
