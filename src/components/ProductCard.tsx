import { useRef, type CSSProperties } from 'react';
import type { Produto } from '../produtos';
import { usePointerFx } from '../lib/motion';
import { contatoHref, escolherProduto, type PageId } from '../lib/routes';
import { Icon } from './Icon';

/** Cartão de vidro com inclinação 3D, brilho que segue o cursor e borda luminosa reativa. */
export function ProductCard({ p, page, index }: { p: Produto; page: PageId; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  usePointerFx(ref, { tilt: 7 });
  const naHome = page === 'home';

  return (
    <li data-reveal style={{ '--d': `${(index % 4) * 70}ms` } as CSSProperties}>
      <a
        ref={ref}
        href={naHome ? '#contato' : contatoHref(page, p.id)}
        onClick={naHome ? () => escolherProduto(p.id) : undefined}
        className="tilt-card glow-edge spotlight group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025]"
      >
        <div className="relative aspect-[3/2] overflow-hidden">
          <picture>
            <source type="image/webp" srcSet={`img/produtos/${p.id}-480.webp 480w, img/produtos/${p.id}.webp 800w`}
              sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw" />
            <img src={`img/produtos/${p.id}.jpg`} alt="" width={800} height={533} loading="lazy" decoding="async"
              className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.06]" />
          </picture>
          <span className="absolute inset-0 bg-linear-to-t from-ink-900 via-ink-900/20 to-transparent" aria-hidden="true" />
          <svg viewBox="0 0 64 64" aria-hidden="true"
            className="produto-ico absolute bottom-3 right-3 size-11 rounded-xl bg-ink-900/60 p-2 text-brand-300 backdrop-blur-md">
            {p.icone}
          </svg>
        </div>
        <div className="relative flex flex-1 flex-col gap-2 p-5 [transform:translateZ(24px)]">
          <h3 className="font-display text-lg font-semibold text-snow">{p.nome}</h3>
          <p className="text-sm leading-relaxed text-mist">{p.desc}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-brand-300">
            Pedir orçamento
            <Icon name="arrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </a>
    </li>
  );
}

export function ProductGrid({ itens, page }: { itens: Produto[]; page: PageId }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {itens.map((p, i) => <ProductCard key={p.id} p={p} page={page} index={i} />)}
    </ul>
  );
}
