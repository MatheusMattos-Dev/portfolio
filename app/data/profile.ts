/**
 * Perfil pessoal exibido na home e em /about.
 * Fonte: currículo de Matheus Mattos Chaves.
 */

export const profile = {
  fullName: "Matheus Mattos Chaves",
  headline: "Analista de TI & Desenvolvedor Full Stack",
  location: "São Borja – RS",
  email: "matheusmcchaves@hotmail.com",
  phone: "(55) 99169-3698",
  image: {
    src: "/matheus.jpeg",
    alt: "Retrato de Matheus Mattos Chaves",
    width: 1183,
    height: 1479,
  },
  shortBio:
    "Bacharel em Ciência da Computação (URI) e Analista de TI no Hospital Ivan Goulart. Atuo no desenvolvimento de aplicações web em Laravel e React e integro a equipe que administra os servidores e bancos de dados que as sustentam.",
  /** Parágrafos da biografia completa mostrada em /about. */
  fullBio: [
    "Hoje também faço páginas para negócios de São Borja e região: oficinas, salões, contabilidade, comércio. Cada página usa as fotos reais do negócio, ganha domínio próprio, é configurada no Google e leva o cliente direto para o WhatsApp. Já são 21 páginas publicadas em quatro cidades, e 30 projetos meus no ar ao todo.",
    "Desenvolvo aplicações web full stack com foco em back-end. No servidor trabalho principalmente com PHP e Laravel — arquitetura MVC, ORM Eloquent, APIs REST e integração entre camadas — e uso Node.js com Express ou NestJS quando o projeto pede JavaScript no back-end. Na camada de dados, modelagem relacional em MySQL e PostgreSQL.",
    "No front-end construo interfaces com React e TypeScript, com Redux quando o estado cresce a ponto de justificar, e estilização em Tailwind ou Sass. Levo o ciclo inteiro: levantamento de requisitos, modelagem de dados, implementação, implantação e a manutenção corretiva e evolutiva depois que entra no ar.",
    "Hoje sou Analista de TI no Hospital Ivan Goulart, onde faço parte do desenvolvimento dos sistemas internos e da equipe que administra os servidores e bancos de dados onde essas aplicações rodam.",
    "Antes disso: desenvolvimento full stack em Laravel na Método Ambiental, front-end na plataforma EAD da PUC-RS e interfaces para o projeto Vivo na Compass UOL. Nos projetos próprios, o Avaliação Preventiva em Saúde é uma aplicação Laravel com Inertia.js e MySQL que cruza o perfil do paciente com regras clínicas para gerar recomendações; o Daily WOD é uma SPA em React. Os dois estão no ar.",
  ],
  skills: {
    Desenvolvimento: ["HTML", "CSS", "JavaScript", "React", "PHP", "Laravel"],
    Infraestrutura: [
      "Administração de servidores",
      "Monitoramento",
      "Redes",
      "Suporte técnico",
    ],
    Ferramentas: ["Git", "Linux", "Windows"],
  },
} as const;
