/**
 * O Sanity é opcional: o conteúdo principal do site vem de app/data/.
 * Sem estas variáveis o CMS simplesmente fica desligado e as seções que
 * dependem dele mostram estado vazio — o site continua subindo.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const token = process.env.NEXT_PUBLIC_SANITY_ACCESS_TOKEN || "";

/** true quando há credenciais suficientes para consultar o Sanity. */
export const sanityEnabled = Boolean(projectId);

export const hookSecret = process.env.NEXT_PUBLIC_SANITY_HOOK_SECRET;
export const mode = process.env.NODE_ENV;

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2023-07-21";

// Giscus (comentários) e Umami (analytics) são opcionais: sem eles o site
// roda normalmente, só perde o recurso. Por isso não usam checkValue —
// ele lança na avaliação do módulo e derrubaria o build inteiro.
export const giscusRepo = process.env.NEXT_PUBLIC_GISCUS_REPO || "";
export const giscusRepoId = process.env.NEXT_PUBLIC_GISCUS_REPOID || "";
export const giscusCategoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORYID || "";
export const umamiSiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "";

