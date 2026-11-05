import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { PRODUTOS } from '../produtos';
import { HREF, contatoHref, escolherProduto, type PageId } from '../lib/routes';
import { Icon } from './Icon';
import { LiquidLink } from './LiquidLink';

export function Logo() {
  return (
    <span className="inline-flex items-center gap-3">
      <picture>
        <source srcSet="img/logo-mark.webp" type="image/webp" />
        <img src="img/logo-mark.png" alt="" width={52} height={37} className="h-8 w-auto sm:h-9" />
      </picture>
      <b className="font-display text-lg font-bold tracking-[0.08em] text-brand-400 sm:text-xl">
        DULEO<span className="ml-1 font-light text-mist">VIDROS</span>
      </b>
    </span>
  );
}

export function Header({ page }: { page: PageId }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [dropAberto, setDropAberto] = useState(false);
  const dropId = useId();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const dropBtnRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let f = 0;
    const onScroll = () => { if (!f) f = requestAnimationFrame(() => { f = 0; setScrolled(window.scrollY > 8); }); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(f); };
  }, []);

  // Menu móvel: trava a rolagem do fundo, foca o 1º link e devolve o foco ao botão ao fechar.
  useEffect(() => {
    if (!menuAberto) return;
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    painelRef.current?.querySelector<HTMLElement>('a,button')?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') fecharMenu(); };
    document.addEventListener('keydown', onKey);
    return () => { html.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  }, [menuAberto]);

  const fecharMenu = () => { setMenuAberto(false); burgerRef.current?.focus(); };

  // Mantém o Tab dentro do painel móvel aberto.
  const prenderFoco = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !painelRef.current) return;
    const itens = [...painelRef.current.querySelectorAll<HTMLElement>('a,button'), burgerRef.current!];
    const i = itens.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); itens[itens.length - 1].focus(); }
    else if (!e.shiftKey && i === itens.length - 1) { e.preventDefault(); itens[0].focus(); }
  };

  const atual = (p: PageId) => (page === p ? 'page' : undefined);
  const linkCls = 'rounded-full px-3.5 py-2 text-[0.92rem] font-medium text-silver transition-colors hover:text-snow aria-[current=page]:text-brand-300';
  const produtoHref = (id: string) => (page === 'home' ? '#contato' : contatoHref(page, id));
  const aoEscolher = (id: string) => () => { if (page === 'home') escolherProduto(id); setDropAberto(false); setMenuAberto(false); };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
        scrolled || menuAberto ? 'border-b border-white/[0.06] bg-ink-900/70 shadow-[0_10px_40px_-20px_rgb(0_0_0/.8)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="container-x flex h-16 items-center gap-4 sm:h-18">
        <a href={HREF.home} className="mr-auto rounded-lg" aria-label="Duleo Vidros, página inicial">
          <Logo />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          <a href={HREF.home} className={linkCls} aria-current={atual('home')}>Início</a>
          <a href={HREF.sobre} className={linkCls} aria-current={atual('sobre')}>Sobre nós</a>
          <div
            className="relative"
            onMouseEnter={() => setDropAberto(true)}
            onMouseLeave={() => setDropAberto(false)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropAberto(false); }}
            onKeyDown={(e) => { if (e.key === 'Escape' && dropAberto) { setDropAberto(false); dropBtnRef.current?.focus(); } }}
          >
            <button
              ref={dropBtnRef}
              type="button"
              className={`${linkCls} inline-flex items-center gap-1`}
              aria-expanded={dropAberto}
              aria-controls={dropId}
              aria-current={atual('produtos')}
              onClick={() => setDropAberto((v) => !v)}
            >
              Produtos <Icon name="chevronDown" size={16} className={`transition-transform duration-300 ${dropAberto ? 'rotate-180' : ''}`} />
            </button>
            <div
              id={dropId}
              className={`absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3 transition-[opacity,translate] duration-300 ${
                dropAberto ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
              }`}
            >
              <ul className="glass rounded-2xl p-2">
                <li>
                  <a href={HREF.produtos} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-300 hover:bg-white/5">
                    Todos os produtos <Icon name="arrowRight" size={16} />
                  </a>
                </li>
                {PRODUTOS.map((p) => (
                  <li key={p.id}>
                    <a href={produtoHref(p.id)} onClick={aoEscolher(p.id)} className="block rounded-xl px-3 py-2 text-sm text-silver hover:bg-white/5 hover:text-snow">
                      {p.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <a href={contatoHref(page)} className={linkCls}>Contato</a>
        </nav>

        <div className="hidden sm:block">
          <LiquidLink href={contatoHref(page)} tamanho="md">Pedir orçamento</LiquidLink>
        </div>

        <button
          ref={burgerRef}
          type="button"
          className="grid size-11 place-items-center rounded-full text-snow hover:bg-white/5 lg:hidden"
          aria-expanded={menuAberto}
          aria-controls="menu-movel"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => (menuAberto ? fecharMenu() : setMenuAberto(true))}
        >
          <Icon name={menuAberto ? 'x' : 'menu'} size={24} />
        </button>
      </div>

      <div
        id="menu-movel"
        ref={painelRef}
        onKeyDown={prenderFoco}
        hidden={!menuAberto}
        className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/[0.06] lg:hidden"
      >
        <nav aria-label="Menu" className="container-x flex flex-col gap-1 py-6">
          {([['home', 'Início'], ['sobre', 'Sobre nós'], ['produtos', 'Todos os produtos']] as const).map(([p, label]) => (
            <a key={p} href={HREF[p]} aria-current={atual(p)} className="rounded-xl px-3 py-3 font-display text-2xl font-semibold text-snow aria-[current=page]:text-brand-300">
              {label}
            </a>
          ))}
          <ul className="my-3 grid grid-cols-1 gap-1 border-y border-white/[0.06] py-3 sm:grid-cols-2">
            {PRODUTOS.map((p) => (
              <li key={p.id}>
                <a href={produtoHref(p.id)} onClick={aoEscolher(p.id)} className="block rounded-lg px-3 py-2 text-silver hover:text-snow">{p.nome}</a>
              </li>
            ))}
          </ul>
          <a href={contatoHref(page)} onClick={() => setMenuAberto(false)} className="mt-2 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-500 px-6 font-semibold text-brand-950">
            Pedir orçamento
          </a>
        </nav>
      </div>
    </header>
  );
}
