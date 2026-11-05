/**
 * Single source of truth for the site's identity.
 *
 * Everything that used to hardcode a name, URL or OG image across the
 * app/ tree now reads from here. Changing the domain is a one-line edit.
 */

// Endereço onde o site está no ar. TROCAR quando houver domínio próprio.
// (matheusmattos.vercel.app é o site de outra pessoa: não usar.)
export const siteUrl = "https://matheusdev-lovat.vercel.app";

export const site = {
  url: siteUrl,
  name: "Matheus Mattos Chaves",
  shortName: "matheusmattos.dev",
  locale: "pt_BR",
  lang: "pt-BR",
  role: "Sites para negócios locais · Desenvolvedor Full Stack",
  title: "Matheus Mattos Chaves | Sites para negócios locais e desenvolvimento web",
  description:
    "Páginas que levam o cliente do Google direto para o WhatsApp, feitas para negócios de São Borja e região. Desenvolvedor Full Stack e Analista de TI no Hospital Ivan Goulart.",
  // Gerada a partir da home (1200x630) e salva em public/og.jpg
  ogImage: `${siteUrl}/og.jpg`,
  /** Usuário do Buy Me a Coffee. Vazio = botão não aparece. */
  buyMeACoffee: "" as string,
  /**
   * Gráfico de contribuições. Não são segredos — usuário público e ano de
   * criação da conta — por isso ficam no código, e não em variável de
   * ambiente: assim funcionam em produção sem depender do painel do host.
   */
  github: {
    username: "MatheusMattos-Dev",
    joinYear: 2025,
  },
  author: {
    name: "Matheus Mattos Chaves",
    email: "matheusmcchaves@hotmail.com",
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
