import { mapsBusca, mapsEmbed } from '../config';
import { salvarConsentimento, useConsent } from '../lib/consent';
import { Icon } from './Icon';

/** Mapa do Google só depois do consentimento (LGPD). Antes disso, um cartão leve com o atalho. */
export function MapEmbed() {
  const { consent } = useConsent();
  const base = 'aspect-[16/10] w-full overflow-hidden rounded-3xl border border-white/[0.08]';

  if (consent?.externos) {
    return (
      <iframe
        title="Mapa com a localização da Duleo Vidros"
        src={mapsEmbed}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className={`${base} bg-ink-800 [filter:grayscale(.35)_contrast(1.05)]`}
      />
    );
  }
  return (
    <div className={`${base} glass relative grid place-items-center p-6 text-center`}>
      <div className="map-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative max-w-xs space-y-3">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-500/15 text-brand-300"><Icon name="mapPin" size={22} /></span>
        <p className="text-sm text-silver">O mapa é fornecido pelo Google e pode usar cookies. Ele só carrega com a sua permissão.</p>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => salvarConsentimento(true)}
            className="min-h-11 rounded-full bg-brand-500 px-5 text-sm font-semibold text-brand-950 hover:bg-brand-400">
            Carregar mapa
          </button>
          <a href={mapsBusca} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-brand-300 hover:text-brand-400">
            Abrir no Google Maps <Icon name="external" size={15} /><span className="sr-only">(abre em nova aba)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
