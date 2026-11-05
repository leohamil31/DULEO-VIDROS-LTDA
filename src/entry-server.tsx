// Usado só no build (Node): gera o HTML estático de cada página para SEO e primeira pintura rápida.
import { renderToString } from 'react-dom/server';
import { App } from './App';
import type { PageId } from './lib/routes';

export { PAGINAS, SITEMAP_PAGINAS, canonical, head } from './seo';

export const render = (page: PageId) => renderToString(<App page={page} />);
