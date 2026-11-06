import type { ComponentType } from 'react';
import { CookieConsent } from './components/CookieConsent';
import { CursorGlow } from './components/Fx';
import { WhatsAppFab } from './components/Blocks';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { useAncorasLimpas, useRevealOnScroll } from './lib/motion';
import type { PageId } from './lib/routes';
import { Home } from './pages/Home';
import { Privacidade, Produtos, Sobre } from './pages/Inner';

const PAGINAS: Record<PageId, ComponentType> = { home: Home, produtos: Produtos, sobre: Sobre, privacidade: Privacidade };

export function App({ page }: { page: PageId }) {
  useRevealOnScroll();
  useAncorasLimpas();
  const Pagina = PAGINAS[page];
  return (
    <>
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <Header page={page} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Pagina />
      </main>
      <Footer page={page} />
      <WhatsAppFab />
      <CookieConsent />
      <CursorGlow />
    </>
  );
}
