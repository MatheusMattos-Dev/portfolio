import type { IconType } from "react-icons";
import {
  SiNodedotjs,
  SiExpress,
  SiPhp,
  SiLaravel,
  SiNestjs,
  SiReact,
  SiNextdotjs,
  SiRedux,
  SiMongodb,
  SiPostgresql,
  SiTailwindcss,
  SiTypescript,
  SiSass,
  SiVite,
  SiPython,
  SiVisualstudiocode,
  SiPycharm,
  SiIntellijidea,
  SiPostman,
  SiGooglechrome,
  SiFigma,
  SiGnubash,
  SiNotion,
  SiMicrosoft,
  SiOpenai,
  SiGithub,
  SiGitlab,
  SiVercel,
  SiNetlify,
} from "react-icons/si";
import { BiTerminal } from "react-icons/bi";

export type StackItem = {
  name: string;
  description: string;
  icon: IconType;
  /** Cor oficial da marca, usada no ícone. */
  color: string;
};

export type StackGroup = {
  title: string;
  items: StackItem[];
};

export const stack: StackGroup[] = [
  {
    title: "Tecnologias",
    items: [
      { name: "PHP", description: "Linguagem de programação", icon: SiPhp, color: "#777BB4" },
      { name: "Laravel", description: "Framework full-stack", icon: SiLaravel, color: "#FF2D20" },
      { name: "Node.js", description: "Back-end", icon: SiNodedotjs, color: "#5FA04E" },
      { name: "Express", description: "Framework de back-end", icon: SiExpress, color: "#7F7F7F" },
      { name: "NestJS", description: "Framework de back-end", icon: SiNestjs, color: "#E0234E" },
      { name: "React", description: "Biblioteca de interface", icon: SiReact, color: "#61DAFB" },
      { name: "Next.js", description: "Framework React", icon: SiNextdotjs, color: "#8B8B8B" },
      { name: "Redux", description: "Gerenciamento de estado", icon: SiRedux, color: "#764ABC" },
      { name: "TypeScript", description: "Superset tipado de JavaScript", icon: SiTypescript, color: "#3178C6" },
      { name: "Python", description: "Linguagem de programação", icon: SiPython, color: "#3776AB" },
      { name: "PostgreSQL", description: "Banco de dados", icon: SiPostgresql, color: "#4169E1" },
      { name: "MongoDB", description: "Banco de dados", icon: SiMongodb, color: "#47A248" },
      { name: "Tailwind CSS", description: "Biblioteca de estilos", icon: SiTailwindcss, color: "#06B6D4" },
      { name: "Sass", description: "Pré-processador CSS", icon: SiSass, color: "#CC6699" },
      { name: "VitePress", description: "Gerador de sites estáticos", icon: SiVite, color: "#646CFF" },
    ],
  },
  {
    title: "Ferramentas",
    items: [
      { name: "Visual Studio Code", description: "Editor de código", icon: SiVisualstudiocode, color: "#007ACC" },
      { name: "PyCharm", description: "IDE Python", icon: SiPycharm, color: "#21D789" },
      { name: "IntelliJ IDEA", description: "IDE Java", icon: SiIntellijidea, color: "#FE315D" },
      { name: "Git Bash", description: "Terminal Git", icon: SiGnubash, color: "#4EAA25" },
      { name: "Postman", description: "Testes de API", icon: SiPostman, color: "#FF6C37" },
      { name: "Google Chrome", description: "Navegador", icon: SiGooglechrome, color: "#4285F4" },
      { name: "Figma", description: "Ferramenta de design", icon: SiFigma, color: "#F24E1E" },
      { name: "Notion", description: "Notas e organização", icon: SiNotion, color: "#8D8D8D" },
      { name: "Microsoft To Do", description: "Gestão de tarefas", icon: SiMicrosoft, color: "#2564CF" },
      { name: "Claude Code", description: "Assistente de programação", icon: BiTerminal, color: "#D97757" },
      { name: "ChatGPT", description: "Assistente de programação", icon: SiOpenai, color: "#10A37F" },
    ],
  },
  {
    title: "Plataformas",
    items: [
      { name: "GitHub", description: "Versionamento e hospedagem", icon: SiGithub, color: "#8B8B8B" },
      { name: "GitLab", description: "Versionamento e hospedagem", icon: SiGitlab, color: "#FC6D26" },
      { name: "Vercel", description: "Hospedagem e banco de dados", icon: SiVercel, color: "#8B8B8B" },
      { name: "Netlify", description: "Hospedagem JAMstack", icon: SiNetlify, color: "#00C7B7" },
    ],
  },
];
