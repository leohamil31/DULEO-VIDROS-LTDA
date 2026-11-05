import type { CSSProperties, ReactNode } from 'react';
import { waLink } from '../config';
import { contatoHref, type PageId } from '../lib/routes';
import { Icon, type IconName } from './Icon';
import { LiquidLink } from './LiquidLink';

export const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-400">
      <span className="h-px w-6 bg-brand-400/70" aria-hidden="true" />{children}
    </p>
  );
}

export function SectionHead({ eyebrow, titulo, id, children, centro }: { eyebrow?: string; titulo: ReactNode; id?: string; children?: ReactNode; centro?: boolean }) {
  return (
    <header data-reveal className={`mb-12 max-w-2xl ${centro ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 id={id} className="text-balance font-display text-3xl font-semibold tracking-tight text-snow sm:text-4xl lg:text-5xl">{titulo}</h2>
      {children && <p className="mt-4 text-pretty text-base leading-relaxed text-mist sm:text-lg">{children}</p>}
    </header>
  );
}

/** Cartão de ícone minimalista (benefícios, aplicações, diferenciais). */
export function FeatureCard({ icon, titulo, children, i = 0, as: Tag = 'li' }: { icon: IconName; titulo: string; children: ReactNode; i?: number; as?: 'li' | 'article' }) {
  return (
    <Tag data-reveal style={delay(i * 80)} className="spotlight-static group relative rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 transition-colors duration-500 hover:border-brand-400/25 hover:bg-white/[0.035]">
      <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-linear-to-br from-brand-400/20 to-brand-500/5 text-brand-300 ring-1 ring-brand-400/20 transition-transform duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:rotate-[-4deg]">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="font-display text-lg font-semibold text-snow">{titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-mist">{children}</p>
    </Tag>
  );
}

export function CtaBand({ page, titulo }: { page: PageId; titulo: string }) {
  return (
    <section aria-label="Pedir orçamento" className="container-x py-20 sm:py-24">
      <div data-reveal className="aurora relative overflow-hidden rounded-[2rem] border border-white/[0.08] px-6 py-14 text-center sm:px-12 sm:py-20">
        <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight text-snow sm:text-5xl">{titulo}</h2>
        <p className="mx-auto mt-4 max-w-lg text-mist">Medição no local sem custo. Respondemos pelo WhatsApp.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LiquidLink href={contatoHref(page)} tamanho="lg">Faça um orçamento <Icon name="arrowRight" size={18} /></LiquidLink>
          <LiquidLink href={waLink()} target="_blank" rel="noopener noreferrer" variante="vidro" tamanho="lg">
            <Icon name="whatsapp" size={20} /> Chamar no WhatsApp<span className="sr-only"> (abre em nova aba)</span>
          </LiquidLink>
        </div>
      </div>
    </section>
  );
}

export function PageBanner({ eyebrow, titulo, children }: { eyebrow: string; titulo: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden pb-14 pt-32 sm:pb-20 sm:pt-40">
      <div className="aurora pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="container-x relative">
        <div className="anim-rise"><Eyebrow>{eyebrow}</Eyebrow></div>
        <h1 className="anim-rise max-w-3xl text-balance font-display text-4xl font-semibold tracking-tight text-snow [animation-delay:80ms] sm:text-6xl">{titulo}</h1>
        {children && <p className="anim-rise mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-mist [animation-delay:160ms]">{children}</p>}
      </div>
    </section>
  );
}

export function WhatsAppFab() {
  return (
    <a href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp (abre em nova aba)"
      className="wa-fab fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-wa text-[#052e16] shadow-[0_12px_30px_-8px_rgb(37_211_102/.55)] transition-transform duration-300 hover:scale-105 sm:bottom-6 sm:right-6">
      <Icon name="whatsapp" size={28} />
    </a>
  );
}
