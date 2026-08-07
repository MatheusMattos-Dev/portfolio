import { stack } from "@/app/data/stack";

export default function Usage() {
  return (
    <section className="max-w-4xl">
      <div className="mb-8">
        <h2 className="font-incognito text-4xl mb-4 font-bold tracking-tight">
          Stack & Ferramentas
        </h2>
        <p className="dark:text-zinc-400 text-zinc-600 max-w-xl">
          Tecnologias, ferramentas e plataformas que uso no dia a dia.
        </p>
      </div>

      <div className="flex flex-col gap-y-12">
        {stack.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-5">
              {group.title}
            </h3>

            <ul className="grid sm:grid-cols-2 grid-cols-1 gap-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.name}
                    className="flex items-center gap-x-3 dark:bg-primary-bg bg-secondary-bg border dark:border-zinc-800 border-zinc-200 rounded-md px-4 py-3"
                  >
                    <Icon
                      className="text-2xl shrink-0"
                      style={{ color: item.color }}
                      aria-hidden="true"
                    />
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm dark:text-zinc-400 text-zinc-600">
                        {item.description}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
