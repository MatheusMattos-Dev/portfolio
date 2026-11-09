export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  tech: string[];
  /** Link público. Ausente quando o sistema é interno. */
  url?: string;
  /** Texto do botão, quando há link. */
  cta?: string;
  /** Sistema no ar e em uso hoje. */
  live?: boolean;
  category: string;
  /** Print do sistema em public/projects/. Sem ele, o card não mostra imagem. */
  cover?: string;
};

export const projects: Project[] = [
  {
    slug: "solved-scale",
    name: "Solved Scale",
    tagline: "Agência de aceleração comercial",
    description:
      "Agência que fundei com dois sócios para ajudar empresas a vender mais: site, automação e tráfego. Fiz o site, com a marca e a animação do logo.",
    tech: ["HTML", "CSS", "JavaScript", "GSAP", "Vercel"],
    url: "https://solved-scale.vercel.app/",
    cta: "Ver o site",
    live: true,
    category: "Agência",
    cover: "/projects/locais/solvedscale.jpg",
  },
  {
    slug: "avaliacao-preventiva",
    name: "Avaliação Preventiva em Saúde",
    tagline: "Plataforma de saúde preventiva em produção",
    description:
      "Plataforma que criei do zero: analisa o perfil do paciente e gera recomendações personalizadas de exames, vacinas e hábitos, com base em diretrizes clínicas oficiais.",
    tech: ["Laravel", "Inertia.js", "PHP", "MySQL"],
    url: "https://avaliacaopreventiva.com.br/login",
    cta: "Acessar projeto",
    live: true,
    category: "Saúde & Prevenção",
    cover: "/projects/avaliacao-preventiva.jpg",
  },
  {
    slug: "daily-wod",
    name: "Daily WOD",
    tagline: "Aplicação React para atletas de CrossFit",
    description:
      "App responsivo para acompanhar os WODs do dia, controlar marcas pessoais, usar temporizadores esportivos e registrar a evolução física.",
    tech: ["React", "JavaScript", "SPA", "Netlify"],
    url: "https://dailywod.netlify.app/",
    cta: "Acessar app",
    live: true,
    category: "Fitness & Performance",
    cover: "/projects/daily-wod.jpg",
  },
  {
    slug: "prospect-ai",
    name: "Prospect.ai",
    tagline: "Da conversa no WhatsApp à página pronta",
    description:
      "Plataforma que estou construindo: lê as conversas do WhatsApp Business, classifica o interesse com IA e monta uma página personalizada, testada no celular e no computador. Nada sai sem aprovação humana, e as regras de conselhos como OAB, CFO e CFN são validadas no código.",
    tech: ["TypeScript", "Next.js", "Fastify", "BullMQ", "Claude API", "Playwright"],
    category: "Automação com IA · Em desenvolvimento",
    cover: "/projects/prospect-ai.jpg",
  },
  {
    slug: "puc-rs-ead",
    name: "Plataforma EAD PUC-RS",
    tagline: "Interfaces para ensino a distância",
    description:
      "Interfaces que desenvolvi para o ecossistema de Ensino a Distância da PUC-RS, com foco em performance e acessibilidade para milhares de estudantes.",
    tech: ["JavaScript", "Front-End", "UX/UI"],
    url: "https://online.pucrs.br/cursos/pos-graduacao",
    cta: "Ver plataforma",
    category: "Plataforma Educacional",
    cover: "/projects/puc-rs-ead.jpg",
  },
  {
    slug: "vivo-compass-uol",
    name: "Interfaces Vivo — Compass UOL",
    tagline: "Front-end em escala de operadora nacional",
    description:
      "Front-end para o projeto Vivo na Compass UOL, em time ágil. Foi onde aprendi a lidar com usabilidade e performance sob volume real de tráfego.",
    tech: ["React", "Front-End", "Scrum"],
    url: "https://www.vivo.com.br/para-voce/produtos-e-servicos/para-o-celular/pre-pago/pacotes-pre",
    cta: "Ver projeto no ar",
    category: "Telecom & Front-End",
    cover: "/projects/vivo-compass.jpg",
  },
];

export type Repo = {
  name: string;
  language: string;
  /** Cor da linguagem, no padrão do GitHub. */
  color: string;
  url: string;
};

export const repos: Repo[] = [
  {
    name: "equilibra-kids-app",
    language: "TypeScript",
    color: "#3178C6",
    url: "https://github.com/MatheusMattos-Dev/equilibra-kids-app",
  },
  {
    name: "bet-checker",
    language: "JavaScript",
    color: "#F1E05A",
    url: "https://github.com/MatheusMattos-Dev/bet-checker",
  },
  {
    name: "api-bet-checker",
    language: "Python",
    color: "#3572A5",
    url: "https://github.com/MatheusMattos-Dev/api-bet-checker",
  },
  {
    name: "master-office-new",
    language: "JavaScript",
    color: "#F1E05A",
    url: "https://github.com/MatheusMattos-Dev/master-office-new",
  },
  {
    name: "take-um",
    language: "TypeScript",
    color: "#3178C6",
    url: "https://github.com/MatheusMattos-Dev/take-um",
  },
  {
    name: "portfolio",
    language: "TypeScript",
    color: "#3178C6",
    url: "https://github.com/MatheusMattos-Dev/portfolio",
  },
];
