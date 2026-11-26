/**
 * O caminho do cliente até o WhatsApp, usado nas duas animações da home:
 * a abertura (HeroStory) e o globo da seção "Captação" (LeadGlobe).
 *
 * Regra: as páginas, os endereços e as cidades são reais. As buscas e as
 * mensagens são exemplos do caminho, e a página diz isso. Só entram clientes
 * que fecharam.
 */

export type Scene = {
  niche: string;
  query: string;
  title: string;
  host: string;
  snippet: string;
  shot: string;
  alt: string;
  /** Centro do botão principal no print 1440x900, em fração da largura e da altura. */
  cta: [number, number];
  brand: string;
  initials: string;
  short: string;
  message: string;
};

export const scenes: Scene[] = [
  {
    niche: "Oficina",
    query: "oficina mecânica em alegrete",
    title: "TRN Autocar · Mecânica de confiança em Alegrete",
    host: "trnautocar.com.br",
    snippet: "Revisão completa, freios, suspensão e troca de óleo do câmbio automático. Agende pelo WhatsApp.",
    shot: "/projects/locais/trn.jpg",
    alt: "Página da TRN Autocar",
    cta: [0.193, 0.716],
    brand: "#f97316",
    initials: "TRN",
    short: "TRN Autocar",
    message: "Oi! Vi a página de vocês e quero agendar uma revisão.",
  },
  {
    niche: "Mega hair",
    query: "mega hair em são borja",
    title: "Val Santos · Mega hair e cor em São Borja",
    host: "val-mega-hair-demo.vercel.app",
    snippet: "Mega hair e cor com acabamento natural. Tudo começa com uma avaliação do cabelo.",
    shot: "/projects/locais/val.jpg",
    alt: "Página da Val Santos Mega Hair",
    cta: [0.114, 0.749],
    brand: "#c9a56a",
    initials: "VS",
    short: "Val Santos",
    message: "Oi, Val! Vi as transformações e quero marcar uma avaliação.",
  },
  {
    niche: "Vazamentos",
    query: "caça vazamento alegrete",
    title: "Fagundes · Caça-vazamentos e elétrica em Alegrete",
    host: "fagundesmanutencao.com.br",
    snippet: "Acha o vazamento sem quebrar a parede e abre só o ponto certo. Peça um orçamento.",
    shot: "/projects/locais/fagundes.jpg",
    alt: "Página da Fagundes Manutenção",
    cta: [0.184, 0.773],
    brand: "#ea580c",
    initials: "F",
    short: "Fagundes",
    message: "Oi! Acho que tenho um vazamento em casa. Conseguem vir ver?",
  },
  {
    niche: "Contabilidade",
    query: "contabilidade rural são borja",
    title: "Eficaz Contabilidade · Rural e empresarial",
    host: "eficazcontabilidadesb.com.br",
    snippet: "Escritório no centro de São Borja: Lucro Real, Presumido, Simples e MEI.",
    shot: "/projects/locais/eficaz.jpg",
    alt: "Página da Eficaz Contabilidade",
    cta: [0.185, 0.773],
    brand: "#16a34a",
    initials: "E",
    short: "Eficaz",
    message: "Bom dia! Sou produtor rural e quero falar sobre a contabilidade.",
  },
  {
    niche: "Energia solar",
    query: "energia solar são luiz gonzaga",
    title: "Eco Engenharia Solar · Energia solar nas Missões",
    host: "ecoengenhariasolar-rs.com.br",
    snippet: "Projeto, instalação e pós-venda para casas, empresas e propriedades rurais. Peça sua análise grátis.",
    shot: "/projects/locais/ecosolar.jpg",
    alt: "Página da Eco Engenharia Solar",
    cta: [0.197, 0.89],
    brand: "#67bc47",
    initials: "ECO",
    short: "Eco Engenharia",
    message: "Oi! Vi a página e quero uma análise grátis da minha conta de luz.",
  },
];

/* ------------------------------------------------------------------ globo */

export type City = {
  name: string;
  lat: number;
  lon: number;
  /** Lado do rótulo no mapa, escolhido para um nome não cair em cima do vizinho. */
  label: "left" | "right" | "below";
};

/**
 * As 8 cidades com página no ar (as mesmas do número em local.ts).
 * Coordenadas da sede de cada município, conferidas contra a malha do IBGE.
 */
export const cities: City[] = [
  { name: "São Borja", lat: -28.6606, lon: -56.0044, label: "left" },
  { name: "Alegrete", lat: -29.7831, lon: -55.7919, label: "right" },
  { name: "Uruguaiana", lat: -29.7547, lon: -57.0883, label: "below" },
  { name: "São Luiz Gonzaga", lat: -28.4083, lon: -54.9606, label: "below" },
  { name: "Itaqui", lat: -29.1253, lon: -56.5531, label: "left" },
  { name: "Santo Ângelo", lat: -28.2992, lon: -54.2631, label: "right" },
  { name: "Santa Maria", lat: -29.6842, lon: -53.8069, label: "right" },
  { name: "Santa Rosa", lat: -27.8711, lon: -54.4814, label: "right" },
];

export type Source = "google" | "maps" | "instagram";

export const sources: { id: Source; name: string; short: string; hint: string }[] = [
  { id: "google", name: "Busca no Google", short: "Google", hint: "quem procura o serviço na cidade" },
  { id: "maps", name: "Google Maps", short: "Maps", hint: "o botão Site do perfil" },
  { id: "instagram", name: "Instagram", short: "Instagram", hint: "o link da bio" },
];

export type Journey = {
  /** Índice em scenes. */
  scene: number;
  /** Índice em cities. */
  city: number;
  source: Source;
  /** O que o cliente fez para chegar: a busca, o toque no perfil ou o link. */
  action: string;
  /** Mensagem de exemplo que chega no WhatsApp do negócio. */
  message: string;
};

/**
 * Um caminho por cliente. A origem segue o que foi entregue a cada um:
 * a Val tem a página na bio do Instagram, a Eco tem o site no perfil do Google.
 */
export const journeys: Journey[] = [
  {
    scene: 0,
    city: 1,
    source: "google",
    action: scenes[0].query,
    message: "Bom dia! Quero agendar a revisão da correia dentada.",
  },
  {
    scene: 1,
    city: 0,
    source: "instagram",
    action: "perfil da Val → link na bio",
    message: "Oi, Val! Vi teu link no Instagram. Como funciona a avaliação?",
  },
  {
    scene: 4,
    city: 3,
    source: "maps",
    action: "perfil da Eco → botão Site",
    message: "Oi! Achei vocês no Google Maps. Fazem projeto para casa?",
  },
  {
    scene: 2,
    city: 1,
    source: "google",
    action: scenes[2].query,
    message: "Boa tarde! Apareceu umidade na parede. Fazem orçamento?",
  },
  {
    scene: 3,
    city: 0,
    source: "google",
    action: scenes[3].query,
    message: "Olá! Tenho um MEI e preciso de contador.",
  },
];
