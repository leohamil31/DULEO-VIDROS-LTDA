import { SITE, mapsBusca } from './config';
import { PRODUTOS } from './produtos';
import type { PageId } from './lib/routes';

type Meta = { arquivo: string; titulo: string; descricao: string; trilha?: string };

export const PAGINAS: Record<PageId, Meta> = {
  home: {
    arquivo: 'index.html',
    titulo: 'Duleo Vidros | Esquadrias de alumínio e vidros temperados em Curitiba e São José dos Pinhais',
    descricao: 'Esquadrias de alumínio, vidros temperados, box, guarda-corpos, fachadas e fechamento de sacada sob medida em Curitiba, São José dos Pinhais e região. Fabricação própria desde 2012. Peça seu orçamento.',
  },
  produtos: {
    arquivo: 'produtos.html', trilha: 'Produtos',
    titulo: 'Produtos | Esquadrias, fachadas, box e guarda-corpos — Duleo Vidros',
    descricao: 'Esquadrias de alumínio, fachada glazing, guarda-corpos, brises, vidros temperados, box, fechamento de sacada e ACM sob medida em Curitiba e São José dos Pinhais.',
  },
  sobre: {
    arquivo: 'sobre.html', trilha: 'Sobre nós',
    titulo: 'Sobre nós | Duleo Vidros — fabricação própria desde 2012',
    descricao: 'Conheça a Duleo Vidros: vidraçaria de Curitiba e região com fabricação própria, medição no local, instalação e garantia em esquadrias de alumínio e vidros.',
  },
  privacidade: {
    arquivo: 'privacidade.html', trilha: 'Política de privacidade',
    titulo: 'Política de privacidade | Duleo Vidros',
    descricao: 'Como a Duleo Vidros trata dados pessoais, cookies e armazenamento local, de acordo com a LGPD.',
  },
};

const abs = (p: string) => new URL(p, SITE.url).href;
export const canonical = (page: PageId) => abs(page === 'home' ? '' : PAGINAS[page].arquivo);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// JSON dentro de <script>: impede que "</script>" ou "<!--" em algum texto feche a tag.
const json = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

function negocioLocal() {
  const id = `${SITE.url}#empresa`;
  return {
    '@type': 'HomeAndConstructionBusiness',
    '@id': id,
    name: SITE.nome,
    legalName: SITE.razaoSocial,
    ...(SITE.cnpj ? { taxID: SITE.cnpj } : {}),
    description: PAGINAS.home.descricao,
    url: SITE.url,
    logo: abs('img/logo-mark.png'),
    image: [abs('img/og.jpg'), abs('img/hero.jpg')],
    telephone: SITE.telefoneSchema,
    ...(SITE.email ? { email: SITE.email } : {}),
    foundingDate: SITE.fundacao,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${SITE.endereco.rua} - ${SITE.endereco.bairro}`,
      addressLocality: SITE.endereco.cidade,
      addressRegion: SITE.endereco.uf,
      postalCode: SITE.endereco.cep,
      addressCountry: 'BR',
    },
    ...(SITE.geo ? { geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng } } : {}),
    hasMap: mapsBusca,
    openingHoursSpecification: SITE.horario.filter((h) => h.schema).map((h) => ({ '@type': 'OpeningHoursSpecification', ...h.schema })),
    areaServed: [
      ...SITE.areaAtendida.map((c) => ({ '@type': 'City', name: `${c}, PR` })),
      { '@type': 'AdministrativeArea', name: SITE.regiao },
    ],
    sameAs: [SITE.instagram, SITE.facebook],
    contactPoint: {
      '@type': 'ContactPoint', telephone: SITE.telefoneSchema, contactType: 'customer service',
      areaServed: 'BR', availableLanguage: 'Portuguese',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Produtos e serviços',
      itemListElement: PRODUTOS.map((p) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: p.nome, description: p.desc, areaServed: SITE.regiao, provider: { '@id': id } },
      })),
    },
  };
}

export function jsonLd(page: PageId) {
  const grafo: unknown[] = [
    negocioLocal(),
    { '@type': 'WebSite', '@id': `${SITE.url}#site`, url: SITE.url, name: SITE.nome, inLanguage: 'pt-BR', publisher: { '@id': `${SITE.url}#empresa` } },
    {
      '@type': 'WebPage', '@id': `${canonical(page)}#pagina`, url: canonical(page), name: PAGINAS[page].titulo,
      description: PAGINAS[page].descricao, inLanguage: 'pt-BR', isPartOf: { '@id': `${SITE.url}#site` }, about: { '@id': `${SITE.url}#empresa` },
    },
  ];
  if (PAGINAS[page].trilha) {
    grafo.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE.url },
        { '@type': 'ListItem', position: 2, name: PAGINAS[page].trilha, item: canonical(page) },
      ],
    });
  }
  return { '@context': 'https://schema.org', '@graph': grafo };
}

/** <head> completo de cada página: SEO técnico, Open Graph, Twitter Card, GEO e JSON-LD. */
export function head(page: PageId, assets: { css: string; js: string; preload: string[] }) {
  const m = PAGINAS[page];
  const url = canonical(page);
  const og = abs('img/og.jpg');
  const csp = [
    "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "font-src 'self'", "img-src 'self' data:",
    "connect-src 'self'", 'frame-src https://maps.google.com https://www.google.com', "object-src 'none'", "base-uri 'none'", "form-action 'self'",
  ].join('; ');
  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    `<meta http-equiv="Content-Security-Policy" content="${csp}">`,
    '<meta name="referrer" content="strict-origin-when-cross-origin">',
    `<title>${esc(m.titulo)}</title>`,
    `<meta name="description" content="${esc(m.descricao)}">`,
    `<link rel="canonical" href="${url}">`,
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    '<meta name="theme-color" content="#050a07">',
    '<meta name="color-scheme" content="dark">',
    // GEO
    `<meta name="geo.region" content="BR-${SITE.endereco.uf}">`,
    `<meta name="geo.placename" content="${esc(SITE.endereco.cidade)}">`,
    ...(SITE.geo ? [`<meta name="geo.position" content="${SITE.geo.lat};${SITE.geo.lng}">`, `<meta name="ICBM" content="${SITE.geo.lat}, ${SITE.geo.lng}">`] : []),
    // Open Graph / Twitter
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="pt_BR">',
    `<meta property="og:site_name" content="${esc(SITE.nome)}">`,
    `<meta property="og:title" content="${esc(m.titulo)}">`,
    `<meta property="og:description" content="${esc(m.descricao)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${og}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${esc(`${SITE.nome}: vidros e esquadrias de alumínio sob medida`)}">`,
    `<meta property="business:contact_data:street_address" content="${esc(SITE.endereco.rua)}">`,
    `<meta property="business:contact_data:locality" content="${esc(SITE.endereco.cidade)}">`,
    `<meta property="business:contact_data:region" content="${SITE.endereco.uf}">`,
    `<meta property="business:contact_data:postal_code" content="${SITE.endereco.cep}">`,
    '<meta property="business:contact_data:country_name" content="Brasil">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(m.titulo)}">`,
    `<meta name="twitter:description" content="${esc(m.descricao)}">`,
    `<meta name="twitter:image" content="${og}">`,
    // Ícones e recursos
    '<link rel="icon" href="img/logo-mark.png" type="image/png">',
    '<link rel="apple-touch-icon" href="img/apple-touch-icon.png">',
    ...assets.preload.map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff" crossorigin>`),
    ...(page === 'home' ? ['<link rel="preload" href="img/hero.webp" as="image" type="image/webp" fetchpriority="high">'] : []),
    `<link rel="stylesheet" href="${assets.css}">`,
    `<script type="module" src="${assets.js}"></script>`,
    `<script type="application/ld+json">${json(jsonLd(page))}</script>`,
  ].join('\n    ');
}

export const SITEMAP_PAGINAS: PageId[] = ['home', 'produtos', 'sobre', 'privacidade'];
