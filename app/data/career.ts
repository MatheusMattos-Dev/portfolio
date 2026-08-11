/**
 * Trajetória profissional e formação.
 *
 * Fonte: currículo de Matheus Mattos Chaves. Ao atualizar o CV, atualize aqui
 * também — este arquivo é o que aparece na home.
 */

export type TimelineEntry = {
  id: string;
  organization: string;
  title: string;
  period: string;
  description: string;
  kind: "work" | "education";
  /** Logo da instituição em public/. Sem ele, cai no ícone genérico. */
  logo?: string;
};

export const experience: TimelineEntry[] = [
  {
    id: "hospital-ivan-goulart",
    logo: "/icon_hospital.jpg",
    organization: "Hospital Ivan Goulart",
    title: "Analista de TI",
    period: "Mar/2025 – Atual",
    description:
      "Atuação no desenvolvimento de aplicações web internas, do levantamento de requisitos à implantação, além de automações nos processos de TI. Integro a equipe responsável pela administração e monitoramento de servidores e bancos de dados, garantindo alta disponibilidade e segurança dos sistemas críticos do hospital.",
    kind: "work",
  },
  {
    id: "senac-rs",
    logo: "/senac_rs_logo.jpg",
    organization: "SENAC-RS",
    title: "Professor de Noções Básicas de TI e Programação",
    period: "Mai/2026 – Ago/2026",
    description:
      "Aulas de fundamentos de TI e programação, com planejamento de conteúdos, atividades práticas e avaliações. Ensino de lógica de programação, algoritmos e fundamentos de desenvolvimento de software, orientando alunos em projetos com metodologias ativas.",
    kind: "work",
  },
  {
    id: "metodo-ambiental",
    logo: "/icon_metodo.jpg",
    organization: "Método Ambiental",
    title: "Desenvolvedor Full Stack",
    period: "Set/2024 – Mar/2025",
    description:
      "Desenvolvimento back-end e front-end em Laravel para sistema corporativo de gestão ambiental, com integração entre camadas da aplicação e suporte técnico em ambiente de produção.",
    kind: "work",
  },
  {
    id: "nosso-mercado",
    logo: "/nosso_mercado.jpg",
    organization: "Nosso Mercado",
    title: "Gerente de TI",
    period: "Fev/2024 – Jul/2024",
    description:
      "Gestão da infraestrutura tecnológica da empresa: manutenção de servidores, redes e equipamentos, com melhorias voltadas à estabilidade e ao desempenho dos sistemas.",
    kind: "work",
  },
  {
    id: "puc-rs",
    logo: "/puc_rs.jpg",
    organization: "PUC-RS",
    title: "Programador Júnior Front-End",
    period: "Abr/2021 – Mar/2023",
    description:
      "Desenvolvimento e manutenção da plataforma de Ensino a Distância da universidade, além de onboarding e acompanhamento de novos desenvolvedores no time.",
    kind: "work",
  },
  {
    id: "compass-uol",
    logo: "/compass_uol_logo.jpg",
    organization: "Compass UOL",
    title: "Desenvolvedor Front-End (Estágio)",
    period: "Dez/2020 – Mar/2021",
    description:
      "Atuação em projeto da Vivo com foco em UX/UI, desenvolvendo interfaces web performáticas em ambiente ágil e colaborativo.",
    kind: "work",
  },
];

export const education: TimelineEntry[] = [
  {
    id: "uri",
    logo: "/universidade_regional_integrada_do_alto_uruguai_e_das_missoes_logo.jpg",
    organization: "URI — Universidade Regional Integrada",
    title: "Bacharelado em Ciência da Computação",
    period: "Jul/2019 – Jul/2023",
    description:
      "Formação em engenharia de software, estrutura de dados, redes de computadores e arquitetura de sistemas operacionais.",
    kind: "education",
  },
  {
    id: "tecnico-informatica",
    logo: "/isais_logo.jpg",
    organization: "Inst. Estadual de Educação Prof. Isaías",
    title: "Técnico em Informática",
    period: "Jan/2018 – Jan/2020",
    description:
      "Formação técnica em suporte, montagem e manutenção de computadores, redes locais e fundamentos de programação.",
    kind: "education",
  },
];
