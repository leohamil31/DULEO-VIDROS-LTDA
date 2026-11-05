import { useSyncExternalStore } from 'react';

// Consentimento LGPD guardado no localStorage do visitante (nenhum cookie é criado pelo site).
// "externos" = conteúdo de terceiros que pode usar cookies (mapa do Google).
export type Consent = { versao: 1; externos: boolean; data: string };
type State = { consent: Consent | null; painelAberto: boolean };

const KEY = 'duleo_consent';
const listeners = new Set<() => void>();
let state: State = { consent: null, painelAberto: false };
let loaded = false;

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as Consent) : null;
    state = { consent: v && v.versao === 1 ? v : null, painelAberto: false };
  } catch {
    state = { consent: null, painelAberto: false }; // storage bloqueado: pergunta de novo a cada visita
  }
}

function emit(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

export function salvarConsentimento(externos: boolean) {
  const consent: Consent = { versao: 1, externos, data: new Date().toISOString() };
  try { window.localStorage.setItem(KEY, JSON.stringify(consent)); } catch { /* segue só em memória */ }
  emit({ consent, painelAberto: false });
}

export const abrirPreferencias = () => emit({ ...state, painelAberto: true });

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const getSnapshot = () => { load(); return state; };
const SERVER: State = { consent: null, painelAberto: false };

/** `pronto` é false no HTML pré-renderizado e na hidratação: nada de terceiros carrega antes de ler a escolha. */
export function useConsent() {
  const s = useSyncExternalStore(subscribe, getSnapshot, () => SERVER);
  const pronto = useSyncExternalStore(subscribe, () => true, () => false);
  return { ...s, pronto };
}
