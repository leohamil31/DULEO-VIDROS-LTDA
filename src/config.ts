// Dados da empresa: edite aqui. Tudo no site (páginas, SEO, JSON-LD) lê deste arquivo.
export const SITE = {
  url: 'https://leohamil31.github.io/DULEO-VIDROS-LTDA/', // URL pública, com barra no final (canonical, Open Graph, sitemap)
  nome: 'Duleo Vidros',
  razaoSocial: 'Duleo Vidros Ltda',
  cnpj: '', // ex.: '00.000.000/0001-00' (aparece na política de privacidade e no rodapé quando preenchido)
  fundacao: '2012',
  whatsapp: '5541997953549', // formato internacional, só dígitos
  telefoneExibicao: '(41) 99795-3549',
  telefoneSchema: '+55-41-99795-3549',
  email: '', // opcional
  endereco: {
    rua: 'R. Carlos Kusma',
    bairro: 'Campestre da Faxina',
    cidade: 'São José dos Pinhais',
    uf: 'PR',
    cep: '83323-140',
  },
  // Coordenadas do pino da empresa no Google Maps (clique com o botão direito no pino > copie os números).
  // Deixe null até ter o valor exato: coordenada errada prejudica a busca local.
  geo: null as null | { lat: number; lng: number },
  horario: [
    { dias: 'Segunda a sexta', horas: '8h às 18h', schema: { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' } },
    { dias: 'Sábado e domingo', horas: 'fechado', schema: null },
  ],
  // Cidades atendidas (usadas no JSON-LD "areaServed"). Acrescente as que a empresa atende.
  areaAtendida: ['Curitiba', 'São José dos Pinhais'],
  regiao: 'Região Metropolitana de Curitiba',
  // Google Search Console > Adicionar propriedade > Prefixo do URL > Tag HTML: cole só o valor de content="..."
  googleVerificacao: '',
  instagram: 'https://www.instagram.com/duleo_vidros/',
  facebook: 'https://www.facebook.com/duleovidros.duleo',
} as const;

export const enderecoCompleto = `${SITE.endereco.rua} - ${SITE.endereco.bairro}, ${SITE.endereco.cidade} - ${SITE.endereco.uf}, ${SITE.endereco.cep}`;
export const mapsBusca = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
export const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed`;
export const waLink = (texto = 'Olá! Gostaria de um orçamento na Duleo Vidros.') =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;

/** No GitHub Pages não há servidor: o formulário abre o WhatsApp. No backend Node, grava pela API. */
export const apiBase = (): string | null =>
  /github\.io$/.test(location.hostname) || location.protocol === 'file:' ? null : '/api';
