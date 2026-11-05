export type PageId = 'home' | 'produtos' | 'sobre' | 'privacidade';

// Links relativos: funcionam tanto em /DULEO-VIDROS-LTDA/ (GitHub Pages) quanto na raiz (backend Node).
export const HREF: Record<PageId, string> = {
  home: './',
  produtos: 'produtos.html',
  sobre: 'sobre.html',
  privacidade: 'privacidade.html',
};

export const contatoHref = (page: PageId, produto?: string) =>
  page === 'home' && !produto ? '#contato' : `./${produto ? `?produto=${encodeURIComponent(produto)}` : ''}#contato`;

/** Avisa o formulário (mesma página) qual produto foi escolhido. */
export const EVENTO_PRODUTO = 'duleo:produto';
export const escolherProduto = (id: string) => window.dispatchEvent(new CustomEvent(EVENTO_PRODUTO, { detail: id }));
