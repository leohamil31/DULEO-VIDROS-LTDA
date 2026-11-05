import { useEffect, useRef, useState } from 'react';
import { finePointer, prefersReducedMotion } from '../lib/motion';

/** Canvas do shader líquido. O código WebGL só é baixado no navegador, depois da página pronta. */
export function LiquidCanvas({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let stop: (() => void) | null = null;
    let cancelado = false;
    const iniciar = () =>
      import('../fx/liquid').then(({ startLiquid }) => {
        if (cancelado || !ref.current) return;
        stop = startLiquid(ref.current);
        if (stop) setAtivo(true);
      });
    // Não disputa a thread principal com a primeira pintura.
    const ocioso = 'requestIdleCallback' in window; // Safari antigo não tem
    const h = ocioso ? window.requestIdleCallback(iniciar) : window.setTimeout(iniciar, 200);
    return () => {
      cancelado = true;
      stop?.();
      if (ocioso) window.cancelIdleCallback(h); else window.clearTimeout(h);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`transition-opacity duration-[1.6s] ${ativo ? 'opacity-100' : 'opacity-0'} ${className}`} />;
}

/** Brilho etéreo que acompanha o cursor pela página (só mouse; nada em toque ou movimento reduzido). */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer() || prefersReducedMotion()) return;
    let f = 0, x = 0, y = 0;
    const paint = () => { f = 0; el.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`; el.style.opacity = '1'; };
    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; if (!f) f = requestAnimationFrame(paint); };
    const out = () => { el.style.opacity = '0'; };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', out);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', out);
      cancelAnimationFrame(f);
    };
  }, []);
  return <div ref={ref} aria-hidden="true" className="cursor-glow" />;
}

/** Parallax sutil: desloca o filho conforme a rolagem, só enquanto a seção está visível. */
export function useParallax<T extends HTMLElement>(fator = 0.18) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let f = 0, visivel = true;
    const paint = () => { f = 0; el.style.transform = `translate3d(0, ${(window.scrollY * fator).toFixed(1)}px, 0) scale(1.08)`; };
    const onScroll = () => { if (visivel && !f) f = requestAnimationFrame(paint); };
    const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; });
    io.observe(el.parentElement ?? el);
    window.addEventListener('scroll', onScroll, { passive: true });
    paint();
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(f); };
  }, [fator]);
  return ref;
}
