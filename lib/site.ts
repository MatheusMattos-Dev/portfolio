/**
 * Single source of truth for the site's identity.
 *
 * Everything that used to hardcode a name, URL or OG image across the
 * app/ tree now reads from here. Changing the domain is a one-line edit.
 */

// TROCAR quando o domínio definitivo estiver no ar (ex: "https://matheusmattos.dev")
export const siteUrl = "https://matheusmattos.vercel.app";

export const site = {
  url: siteUrl,
  name: "Matheus Mattos Chaves",
  shortName: "matheusmattos.dev",
  locale: "pt_BR",
  lang: "pt-BR",
  role: "Analista de TI Pleno & Desenvolvedor Full Stack",
  title: "Matheus Mattos Chaves | Analista de TI Pleno & Desenvolvedor Full Stack",
  description:
    "Escrevo o código e mantenho de pé o servidor onde ele roda. Desenvolvedor Full Stack (Laravel, React, PHP) e Analista de TI Pleno em ambiente hospitalar de missão crítica.",
  // Gerar a partir do site depois do primeiro deploy e salvar em public/og.png
  ogImage: `${siteUrl}/og.png`,
  /** Usuário do Buy Me a Coffee. Vazio = botão não aparece. */
  buyMeACoffee: "" as string,
  author: {
    name: "Matheus Mattos Chaves",
    email: "preparatorioinss197@gmail.com",
    github: "https://github.com/MatheusMattos-Dev",
    linkedin: "https://linkedin.com/in/matheusmattoschaves",
    location: "São Borja – RS, Brasil",
  },
  /**
   * Este site parte do portfólio open source de Victor Eke (MIT).
   * O autor original pede atribuição com link no rodapé — mantida em Footer.tsx.
   */
  template: {
    author: "Victor Eke",
    url: "https://victoreke.com",
    repo: "https://github.com/Evavic44/victoreke.com",
  },
} as const;

/** Monta a URL absoluta de uma rota, para metadata/canonical. */
export const absoluteUrl = (path = "") =>
  `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
