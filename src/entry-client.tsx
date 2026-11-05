import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import type { PageId } from './lib/routes';

const root = document.getElementById('app')!;
hydrateRoot(root, <App page={root.dataset.page as PageId} />);
