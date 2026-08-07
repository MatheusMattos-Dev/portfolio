<div align="center">
<h1>matheusmattos.dev</h1>
<p>Portfólio de Matheus Mattos Chaves — Analista de TI Pleno & Desenvolvedor Full Stack</p>
</div>

## Stack

- [Next.js](https://nextjs.org) — framework
- [Sanity.io](https://sanity.io) — CMS headless e content lake
- [TailwindCSS](https://tailwindcss.com) — estilos
- [Vercel](https://vercel.com) — hospedagem e deploy
- [next-themes](https://github.com/pacocoursey/next-themes) — tema claro/escuro

## Rodando localmente

```bash
git clone https://github.com/MatheusMattos-Dev/portfolio.git
cd portfolio
npm install
```

Copie o `.env.example` para `.env.local` e preencha as variáveis:

```bash
cp .env.example .env.local
```

| Variável | Obrigatória | Onde conseguir |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | sim | [sanity.io/manage](https://sanity.io/manage) |
| `NEXT_PUBLIC_SANITY_DATASET` | sim | normalmente `production` |
| `NEXT_PUBLIC_SANITY_ACCESS_TOKEN` | sim | Sanity → API → Tokens |
| `NEXT_PUBLIC_SANITY_HOOK_SECRET` | não | revalidação via webhook |
| `NEXT_PUBLIC_GITHUB_USERNAME` | não | gráfico de contribuições |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | não | analytics; vazio = script não carrega |
| `NEXT_PUBLIC_GISCUS_*` | não | comentários; vazio = seção não aparece |

Só as três primeiras são obrigatórias — sem elas o build falha. As demais desligam o recurso quando ausentes.

```bash
npm run dev
```

O site sobe em `localhost:3000` e o Sanity Studio em `localhost:3000/studio`.

## Configuração do site

Nome, URL, descrição, imagem de Open Graph e links sociais ficam centralizados em [`lib/site.ts`](lib/site.ts). Ao publicar em domínio próprio, basta trocar `siteUrl` — todas as tags canônicas e de Open Graph derivam dali.

## Conteúdo

Perfil, experiências, projetos e posts vêm do Sanity, não do repositório. Depois de configurar o projeto no Sanity, o conteúdo é cadastrado pelo Studio em `/studio`.

## Créditos

Este site parte do portfólio open source de [Victor Eke](https://victoreke.com) ([repositório original](https://github.com/Evavic44/victoreke.com)), publicado sob licença MIT. Todo o conteúdo, textos e identidade aqui são de Matheus Mattos Chaves; a atribuição ao autor original é mantida no rodapé do site e em [`LICENSE`](LICENSE).

## Licença

MIT — veja [`LICENSE`](LICENSE).
