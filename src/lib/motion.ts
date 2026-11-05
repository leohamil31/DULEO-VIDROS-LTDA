import { useEffect, type RefObject } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Mouse/trackpad de verdade: efeitos de cursor ficam desligados em toque. */
export const finePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Revela [data-reveal] ao entrar na tela. Um único observer para a página toda. */
export function useRevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)');
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

type FxOptions = { tilt?: number; magnetic?: number };

/**
 * Efeitos de cursor sem re-render do React: escreve variáveis CSS no elemento dentro de um rAF.
 *  --mx/--my  posição do cursor (brilho reativo)    --rx/--ry  inclinação 3D    --tx/--ty  deslocamento magnético
 * Só usa transform/opacity no CSS, então roda no compositor (60fps).
 */
export function usePointerFx<T extends HTMLElement>(ref: RefObject<T | null>, { tilt = 0, magnetic = 0 }: FxOptions = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer() || prefersReducedMotion()) return;
    let rect: DOMRect | null = null;
    let frame = 0;
    let px = 0, py = 0;

    const paint = () => {
      frame = 0;
      if (!rect) return;
      const x = px - rect.left, y = py - rect.top;
      const nx = x / rect.width - 0.5, ny = y / rect.height - 0.5; // -0.5..0.5
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
      if (tilt) { el.style.setProperty('--rx', `${(-ny * tilt).toFixed(2)}deg`); el.style.setProperty('--ry', `${(nx * tilt).toFixed(2)}deg`); }
      if (magnetic) { el.style.setProperty('--tx', `${(nx * magnetic).toFixed(1)}px`); el.style.setProperty('--ty', `${(ny * magnetic).toFixed(1)}px`); }
    };
    const enter = () => { rect = el.getBoundingClientRect(); el.dataset.active = ''; };
    const move = (e: PointerEvent) => {
      if (!rect) rect = el.getBoundingClientRect();
      px = e.clientX; py = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leave = () => {
      rect = null; delete el.dataset.active;
      cancelAnimationFrame(frame); frame = 0;
      for (const v of ['--rx', '--ry', '--tx', '--ty']) el.style.removeProperty(v);
    };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(frame);
    };
  }, [ref, tilt, magnetic]);
}
