import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import type { PageId } from './lib/routes';

// O site sempre abre no topo. O navegador não restaura a rolagem da visita anterior
// (comum no celular e nos navegadores do WhatsApp/Instagram). Links com #secao continuam funcionando.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

const root = document.getElementById('app')!;
hydrateRoot(root, <App page={root.dataset.page as PageId} />);
