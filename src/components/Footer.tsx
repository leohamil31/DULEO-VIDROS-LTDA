import { SITE, enderecoCompleto, mapsBusca, waLink } from '../config';
import { abrirPreferencias } from '../lib/consent';
import { HREF, contatoHref, type PageId } from '../lib/routes';
import { Logo } from './Header';
import { Icon } from './Icon';

export function Social({ className = '' }: { className?: string }) {
  const itens = [
    { href: SITE.instagram, label: 'Instagram da Duleo Vidros', icon: 'instagram' as const },
    { href: SITE.facebook, label: 'Facebook da Duleo Vidros', icon: 'facebook' as const },
    { href: waLink(), label: 'WhatsApp da Duleo Vidros', icon: 'whatsapp' as const },
    { href: mapsBusca, label: 'Como chegar (Google Maps)', icon: 'mapPin' as const },
  ];
  return (
    <ul className={`flex gap-2 ${className}`}>
      {itens.map((i) => (
        <li key={i.icon}>
          <a href={i.href} target="_blank" rel="noopener noreferrer" aria-label={`${i.label} (abre em nova aba)`}
            className="glass grid size-11 place-items-center rounded-full text-silver transition-[color,translate] duration-300 hover:-translate-y-0.5 hover:text-brand-300">
            <Icon name={i.icon} size={20} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer({ page }: { page: PageId }) {
  return (
    <footer className="relative border-t border-white/[0.06] bg-ink-950/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] lg:py-16">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-mist">
            Esquadrias de alumínio e vidros sob medida, com fabricação própria desde {SITE.fundacao}. Atendemos Curitiba e região.
          </p>
          <Social />
        </div>
        <nav aria-label="Rodapé">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Navegação</h2>
          <ul className="space-y-2 text-sm text-silver">
            <li><a className="hover:text-snow" href={HREF.home}>Início</a></li>
            <li><a className="hover:text-snow" href={HREF.sobre}>Sobre nós</a></li>
            <li><a className="hover:text-snow" href={HREF.produtos}>Produtos</a></li>
            <li><a className="hover:text-snow" href={contatoHref(page)}>Pedir orçamento</a></li>
            <li><a className="hover:text-snow" href={HREF.privacidade}>Política de privacidade</a></li>
            <li><button type="button" className="hover:text-snow" onClick={abrirPreferencias}>Preferências de cookies</button></li>
          </ul>
        </nav>
        <address className="not-italic">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Atendimento</h2>
          <ul className="space-y-3 text-sm text-silver">
            <li className="flex gap-2.5"><Icon name="mapPin" size={18} className="mt-0.5 shrink-0 text-brand-400" />{enderecoCompleto}</li>
            <li className="flex gap-2.5"><Icon name="phone" size={18} className="mt-0.5 shrink-0 text-brand-400" />
              <a className="hover:text-snow" href={`tel:+${SITE.whatsapp}`}>{SITE.telefoneExibicao}</a></li>
            {SITE.horario.map((h) => (
              <li key={h.dias} className="flex gap-2.5"><Icon name="clock" size={18} className="mt-0.5 shrink-0 text-brand-400" />{h.dias}: {h.horas}</li>
            ))}
          </ul>
        </address>
      </div>
      <div className="border-t border-white/[0.06]">
        <p className="container-x flex flex-col gap-1 py-6 text-xs text-mist sm:flex-row sm:justify-between">
          <span>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {SITE.razaoSocial}. Todos os direitos reservados.
            {SITE.cnpj && <> CNPJ {SITE.cnpj}.</>}
          </span>
          <span>{SITE.endereco.cidade} · {SITE.endereco.uf}</span>
        </p>
      </div>
    </footer>
  );
}
