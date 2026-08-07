/**
 * Perfil pessoal exibido na home e em /about.
 * Fonte: currículo de Matheus Mattos Chaves.
 */

export const profile = {
  fullName: "Matheus Mattos Chaves",
  headline: "Analista de TI Pleno & Desenvolvedor Full Stack",
  location: "São Borja – RS",
  email: "preparatorioinss197@gmail.com",
  phone: "(55) 99169-3698",
  image: {
    src: "/matheus.jpeg",
    alt: "Retrato de Matheus Mattos Chaves",
    width: 1183,
    height: 1479,
  },
  shortBio:
    "Bacharel em Ciência da Computação (URI) e Analista de TI Pleno no Hospital Ivan Goulart. Escrevo aplicações web em Laravel e React e administro a infraestrutura de servidores que as sustenta.",
  /** Parágrafos da biografia completa mostrada em /about. */
  fullBio: [
    "Trabalho na fronteira entre duas áreas que costumam ficar separadas: desenvolvimento web e infraestrutura de servidores. Quando escrevo uma aplicação, já penso em como ela vai se comportar em produção — e quando um sistema cai de madrugada, sei ler tanto o log da aplicação quanto o do servidor.",
    "Hoje sou Analista de TI Pleno no Hospital Ivan Goulart, onde administro servidores e bancos de dados de sistemas críticos e desenvolvo aplicações internas em Laravel. Em ambiente hospitalar, indisponibilidade não é métrica de negócio: é atendimento parado.",
    "Antes disso passei por desenvolvimento full stack na Método Ambiental, gestão de TI no Nosso Mercado, front-end na plataforma EAD da PUC-RS e um projeto da Vivo na Compass UOL. Também dei aulas de lógica de programação e fundamentos de TI no SENAC-RS.",
    "Nos projetos próprios criei o Avaliação Preventiva em Saúde e o Daily WOD, ambos rodando em produção.",
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
