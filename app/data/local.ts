/**
 * Páginas para negócios locais: clientes, exemplos, números e depoimentos.
 *
 * Regra: só entra o que é verdade e foi conferido. Clientes são quem pagou.
 * Exemplos são páginas montadas para apresentar a ideia ao negócio, ainda sem
 * contrato — por isso aparecem com o selo "Exemplo", nunca como cliente.
 * Capturas em public/projects/locais/<slug>.jpg (1440x900) e <slug>-m.jpg
 * (celular, 390x844 em 2x), geradas a partir das páginas no ar.
 */

export type LocalSite = {
  slug: string;
  name: string;
  niche: string;
  city: string;
  url: string;
  /** Uma frase sobre o que a página faz de diferente. */
  summary: string;
  /** Recursos que o dono de negócio entende de cara. */
  highlights: string[];
};

export type Client = LocalSite & {
  /** O que o pacote entregou além da página. */
  delivered: string[];
  quote?: { text: string; author: string };
};

/** WhatsApp do Matheus, com mensagem pronta para quem chega pelo portfólio. */
export const whatsappLink =
  "https://wa.me/5555991693698?text=" +
  encodeURIComponent(
    "Oi, Matheus! Vi teu portfólio e quero uma página pro meu negócio."
  );

export const clients: Client[] = [
  {
    slug: "eficaz",
    name: "Eficaz Contabilidade",
    niche: "Contabilidade",
    city: "São Borja",
    url: "https://www.eficazcontabilidadesb.com.br/",
    summary:
      "Contabilidade rural e empresarial: a página separa produtor rural, Lucro Real, Lucro Presumido, Simples Nacional e MEI, e cada caminho termina numa conversa no WhatsApp.",
    highlights: ["Domínio próprio", "Já aparece no Google", "Botões por perfil de cliente"],
    delivered: [
      "Domínio .com.br próprio",
      "Google Search Console e sitemap",
      "Google Analytics contando cada clique no WhatsApp",
      "Link de avaliação no Google",
    ],
  },
  {
    slug: "ecosolar",
    name: "Eco Engenharia Solar",
    niche: "Energia solar",
    city: "São Luiz Gonzaga",
    url: "https://www.ecoengenhariasolar-rs.com.br/",
    summary:
      "Energia solar para casa, empresa e propriedade rural nas Missões. Fotos de drone das obras, mapa das cidades atendidas e um pedido de análise que já leva o valor da conta de luz para o WhatsApp.",
    highlights: ["Domínio próprio", "Mapa das obras nas Missões", "Análise da conta de luz"],
    delivered: [
      "Domínio .com.br próprio",
      "Google Search Console e sitemap",
      "Google Analytics contando cada clique no WhatsApp",
      "Site no perfil do Google e botão de avaliação",
    ],
  },
  {
    slug: "trn",
    name: "TRN Autocar",
    niche: "Oficina mecânica",
    city: "Alegrete",
    url: "https://www.trnautocar.com.br/",
    summary:
      "Oficina multimarcas especialista em Nissan, Renault e Peugeot. O cliente marca o que o carro está fazendo e já chega no WhatsApp com o recado pronto.",
    highlights: ["Domínio próprio", "\"O que o meu carro tem?\"", "Contador da correia dentada"],
    delivered: [
      "Domínio .com.br próprio",
      "Google Search Console e sitemap",
      "Google Analytics contando cada clique no WhatsApp",
      "Página com fotos e vídeos reais da oficina",
      "Artes de divulgação para Instagram e status",
    ],
    quote: {
      text: "O restante tá excelente, bem transparente e limpo. Menos é mais.",
      author: "TRN Autocar, Alegrete",
    },
  },
  {
    slug: "fagundes",
    name: "Fagundes Manutenção",
    niche: "Elétrica e caça-vazamentos",
    city: "Alegrete",
    url: "https://www.fagundesmanutencao.com.br/",
    summary:
      "Acha vazamento dentro da parede sem quebra-quebra. A página mostra a foto real da câmera térmica e monta o pedido de orçamento com o serviço e a urgência.",
    highlights: ["Domínio próprio", "Imagem térmica real", "Checklist de sinais de vazamento"],
    delivered: [
      "Domínio .com.br próprio",
      "Google Search Console e sitemap",
      "Google Analytics contando cada clique no WhatsApp",
      "Página com as fotos reais dos serviços",
      "Pedido de orçamento direto no WhatsApp",
    ],
    quote: {
      text: "Seu serviço ficou excelente.",
      author: "Fagundes Manutenção, Alegrete",
    },
  },
  {
    slug: "val",
    name: "Val Mega Hair",
    niche: "Salão de beleza",
    city: "São Borja",
    url: "https://val-mega-hair-demo.vercel.app/",
    summary:
      "Especialista em mega hair e cor. As transformações reais das clientes aparecem numa galeria interativa, e a avaliação do cabelo é marcada direto no WhatsApp.",
    highlights: ["Galeria de transformações", "Avaliação pelo WhatsApp"],
    delivered: [
      "Página com as transformações reais do salão",
      "Avaliação marcada direto no WhatsApp",
      "Link na bio do Instagram e arte para o story",
    ],
    quote: {
      text: "Que lindo que ficou!",
      author: "Val Santos, São Borja",
    },
  },
];

export const examples: LocalSite[] = [
  {
    slug: "thais",
    name: "Studio Thais Soares",
    niche: "Sobrancelhas",
    city: "Uruguaiana",
    url: "https://thais-soares-demo.vercel.app/",
    summary: "Antes e depois para arrastar em cada técnica de sobrancelha e lábios, e o horário montado com o serviço escolhido, direto no WhatsApp.",
    highlights: ["Antes e depois", "Monte seu horário"],
  },
  {
    slug: "optica",
    name: "Óptica Líder",
    niche: "Ótica",
    city: "São Borja",
    url: "https://optica-lider-demo-one.vercel.app/",
    summary: "Vitrine de óculos com filtros por estilo e o botão \"Quero esse\" que leva o modelo direto ao WhatsApp.",
    highlights: ["Vitrine", "Filtros por estilo"],
  },
  {
    slug: "aline",
    name: "Espaço AS — Aline Nail Designer",
    niche: "Unhas",
    city: "São Borja",
    url: "https://aline-nail-demo.vercel.app/",
    summary: "\"Monte suas unhas\": a cliente escolhe formato e acabamento, vê a prévia e manda o pedido com o dia e o período.",
    highlights: ["Prévia da unha", "Antes e depois"],
  },
  {
    slug: "mundopet",
    name: "Mundo Pet",
    niche: "Pet shop e veterinária",
    city: "Alegrete",
    url: "https://mundo-pet-demo.vercel.app/",
    summary: "Banho e tosa com comparativo de antes e depois e a ficha do pet que já chega preenchida no WhatsApp.",
    highlights: ["Antes e depois", "Ficha do pet"],
  },
  {
    slug: "koltermann",
    name: "Koltermann Peças Agrícolas",
    niche: "Peças agrícolas",
    city: "São Borja",
    url: "https://koltermann-demo.vercel.app/",
    summary: "Tour 360° pela loja, montado com as fotos do próprio Google, e catálogo filtrado por lavoura, oficina e dia a dia.",
    highlights: ["Tour 360°", "Catálogo com filtros"],
  },
  {
    slug: "danubia",
    name: "Studio Danúbia Gonçalves",
    niche: "Estética e depilação a laser",
    city: "Itaqui",
    url: "https://danubia-goncalves-demo.vercel.app/",
    summary: "Mapa do corpo para montar a avaliação de depilação a laser: a cliente toca nas áreas e a mensagem chega pronta no WhatsApp.",
    highlights: ["Mapa do corpo", "Laser Hakon 4D"],
  },
  {
    slug: "simao",
    name: "Simão Vidros e Esquadrias",
    niche: "Vidraçaria",
    city: "São Borja",
    url: "https://simao-vidros-demo.vercel.app/",
    summary: "Destaque Melhor Vidraçaria de São Borja: obras reais em galeria e o status de aberto ou fechado na hora.",
    highlights: ["Galeria de obras", "Aberto agora"],
  },
  {
    slug: "maise",
    name: "Maíse Rodrigues Coelho",
    niche: "Advocacia trabalhista",
    city: "Alegrete",
    url: "https://maise-advocacia-demo.vercel.app/",
    summary: "Página dentro das regras da OAB, com um verificador do WhatsApp oficial para o cliente não cair em golpe.",
    highlights: ["Regras da OAB", "Anti-golpe"],
  },
  {
    slug: "cesar",
    name: "Cesar Auto Center",
    niche: "Alinhamento e pneus",
    city: "Uruguaiana",
    url: "https://cesar-auto-center-demo.vercel.app/",
    summary: "Alinhamento 3D, pneus e suspensão, em português e em espanhol para os clientes argentinos.",
    highlights: ["Português e espanhol", "Agendamento"],
  },
];

/**
 * Números conferidos em 07/11/2026 (curl 200 em cada endereço); em 10/11 somada a Renovare
 * (curl 200) e o Fagundes passou para domínio próprio. Atualize quando mudarem.
 * 35 projetos no ar = 26 páginas para negócios (22 exemplos e clientes na Vercel + os
 * domínios da Eficaz, da Eco, da TRN e do Fagundes) + 9 projetos próprios: Solved Scale, Avaliação Preventiva,
 * App Master Class (HYROX), HYROX app, oferta HYROX Início de Mês, Take Um,
 * IA no Balcão, Heróis de Crochê e TikTok Shop Studio. O portfólio não conta.
 * Cidades das 26 páginas: São Borja, Alegrete, Uruguaiana, São Luiz Gonzaga, Itaqui e Santo Ângelo.
 */
export const stats: { value: number; prefix?: string; label: string; live?: boolean }[] = [
  { value: 35, label: "projetos no ar hoje: sites, apps e páginas de venda", live: true },
  { value: 26, label: "páginas feitas para negócios locais" },
  { value: 6, label: "cidades: São Borja, Alegrete, Uruguaiana, São Luiz Gonzaga, Itaqui e Santo Ângelo" },
  { value: 5, prefix: "+", label: "anos desenvolvendo para a web" },
];

export const steps = [
  {
    title: "Exemplo sem compromisso",
    text: "Eu monto uma página de exemplo com as fotos reais do seu negócio, tiradas do Google e do Instagram, para você ver como fica antes de decidir.",
  },
  {
    title: "Ajustes do teu jeito",
    text: "Você me diz o que trocar: texto, foto, serviço. Eu ajusto até ficar do jeito que você quer mostrar.",
  },
  {
    title: "Domínio próprio e no ar",
    text: "A página ganha o endereço .com.br do seu negócio, e cada botão leva o cliente direto para o seu WhatsApp com a mensagem pronta.",
  },
  {
    title: "No Google",
    text: "Cadastro a página no Google, ligo ao seu perfil no Maps e no Instagram e acompanho os cliques. Ajustes nos 30 primeiros dias por minha conta.",
  },
];

export type Quote = {
  text: string;
  name: string;
  business: string;
  city: string;
  /** Nota e número de avaliações do negócio no Google, na data da pesquisa do lead. */
  rating: string;
  reviews: number;
  /** Dia em que a mensagem chegou no WhatsApp. */
  date: string;
  initials: string;
  color: string;
  url: string;
};

/** Frases que os clientes mandaram no WhatsApp (uso autorizado pelo Matheus). */
export const quotes: Quote[] = [
  {
    text: "O restante tá excelente, bem transparente e limpo. Menos é mais.",
    name: "TRN Autocar",
    business: "Oficina mecânica",
    city: "Alegrete",
    rating: "5,0",
    reviews: 30,
    date: "05/11/2026",
    initials: "TRN",
    color: "#F07028",
    url: "https://www.trnautocar.com.br/",
  },
  {
    text: "Seu serviço ficou excelente.",
    name: "Fagundes Manutenção",
    business: "Elétrica e caça-vazamentos",
    city: "Alegrete",
    rating: "5,0",
    reviews: 75,
    date: "30/10/2026",
    initials: "F",
    color: "#E8622C",
    url: "https://www.fagundesmanutencao.com.br/",
  },
  {
    text: "Que lindo que ficou!",
    name: "Val Santos",
    business: "Val Mega Hair",
    city: "São Borja",
    rating: "5,0",
    reviews: 21,
    date: "05/11/2026",
    initials: "VS",
    color: "#B8925A",
    url: "https://val-mega-hair-demo.vercel.app/",
  },
];
