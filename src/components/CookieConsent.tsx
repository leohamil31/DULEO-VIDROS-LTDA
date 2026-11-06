import { useEffect, useRef } from 'react';
import { salvarConsentimento, useConsent } from '../lib/consent';
import { HREF } from '../lib/routes';
import { Icon } from './Icon';

/**
 * Aviso LGPD não bloqueante. O site não cria cookies próprios; a escolha controla só conteúdo de
 * terceiros (mapa do Google). Aparece só no navegador, depois de ler a escolha salva.
 */
export function CookieConsent() {
  const { consent, painelAberto, pronto } = useConsent();
  const ref = useRef<HTMLElement>(null);
  const visivel = pronto && (!consent || painelAberto);

  // Reaberto pelo rodapé: leva o foco ao painel para quem navega por teclado.
  useEffect(() => { if (painelAberto) ref.current?.focus(); }, [painelAberto]);

  if (!visivel) return null;
  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby="cookies-titulo"
      className="glass anim-rise fixed inset-x-4 bottom-4 z-[60] rounded-2xl p-5 outline-none sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-md"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-500/15 text-brand-300"><Icon name="cookie" size={18} /></span>
        <div>
          <h2 id="cookies-titulo" className="font-display text-base font-semibold text-snow">Sua privacidade</h2>
          <p className="mt-1 text-sm leading-relaxed text-silver">
            Não usamos cookies de rastreamento nem de publicidade. O mapa do Google, que pode usar cookies próprios, só carrega se você permitir.{' '}
            <a href={HREF.privacidade} className="font-medium text-brand-300 underline underline-offset-4 hover:text-brand-400">Política de privacidade</a>
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => salvarConsentimento(false)}
          className="min-h-11 rounded-full border border-white/15 px-5 text-sm font-semibold text-snow hover:bg-white/5">
          Somente essenciais
        </button>
        <button type="button" onClick={() => salvarConsentimento(true)}
          className="min-h-11 rounded-full bg-brand-500 px-5 text-sm font-semibold text-brand-950 hover:bg-brand-400">
          Aceitar todos
        </button>
      </div>
    </section>
  );
}
