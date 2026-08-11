type HeadingType = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

/**
 * Cabeçalho de página. Propositalmente SEM animação de entrada: é o conteúdo
 * acima da dobra, precisa estar visível no primeiro paint, sem depender de JS.
 */
export default function PageHeading({
  title,
  description,
  children,
}: HeadingType) {
  return (
    <header className="mb-10">
      <h1 className="max-w-3xl font-incognito font-semibold tracking-tight sm:text-5xl text-3xl mb-6 lg:leading-[3.7rem]">
        {title}
      </h1>
      <p className="max-w-2xl text-base dark:text-zinc-400 text-zinc-700 leading-relaxed">
        {description}
      </p>
      {children}
    </header>
  );
}
