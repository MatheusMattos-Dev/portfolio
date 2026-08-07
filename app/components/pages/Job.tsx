import { Slide } from "../../animation/Slide";
import { RiBriefcase3Fill, RiGraduationCapFill } from "react-icons/ri";
import { experience, education, type TimelineEntry } from "@/app/data/career";

function TimelineCard({ entry }: { entry: TimelineEntry }) {
  const Icon = entry.kind === "education" ? RiGraduationCapFill : RiBriefcase3Fill;

  return (
    <div className="flex items-start lg:gap-x-6 gap-x-4 max-w-2xl relative before:absolute before:bottom-0 before:top-[5rem] before:left-9 before:w-[1px] before:h-[calc(100%-70px)] dark:before:bg-zinc-800 before:bg-zinc-200">
      <div className="grid place-items-center dark:bg-primary-bg bg-secondary-bg border dark:border-zinc-800 border-zinc-200 min-h-[64px] min-w-[64px] p-2 rounded-md text-2xl text-sky-400">
        <Icon />
      </div>
      <div className="flex flex-col items-start">
        <h3 className="text-xl font-semibold">{entry.organization}</h3>
        <p className="text-sky-400 font-medium">{entry.title}</p>
        <time className="text-sm text-zinc-500 mt-1 tracking-widest uppercase">
          {entry.period}
        </time>
        <p className="tracking-tight dark:text-zinc-400 text-zinc-600 my-3">
          {entry.description}
        </p>
      </div>
    </div>
  );
}

export default function Job() {
  return (
    <section className="mt-32">
      <Slide delay={0.16}>
        <div className="mb-16">
          <h2 className="font-incognito text-4xl mb-4 font-bold tracking-tight">
            Experiência Profissional
          </h2>
        </div>
      </Slide>

      <Slide delay={0.18}>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-x-12 gap-y-10">
          {experience.map((entry) => (
            <TimelineCard key={entry.id} entry={entry} />
          ))}
        </div>
      </Slide>

      <Slide delay={0.2}>
        <div className="mb-16 mt-24">
          <h2 className="font-incognito text-4xl mb-4 font-bold tracking-tight">
            Formação Acadêmica
          </h2>
        </div>
      </Slide>

      <Slide delay={0.22}>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-x-12 gap-y-10">
          {education.map((entry) => (
            <TimelineCard key={entry.id} entry={entry} />
          ))}
        </div>
      </Slide>
    </section>
  );
}
