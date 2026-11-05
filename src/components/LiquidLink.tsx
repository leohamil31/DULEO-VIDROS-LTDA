import { useRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { usePointerFx } from '../lib/motion';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variante?: 'primario' | 'vidro' | 'whatsapp';
  tamanho?: 'md' | 'lg';
};

const VARIANTES = {
  primario: 'bg-brand-500 text-brand-950 [--blob:var(--color-brand-300)]',
  vidro: 'glass text-snow [--blob:rgb(98_187_142/.35)]',
  whatsapp: 'bg-wa text-[#052e16] [--blob:#7cf0a8]',
};

/**
 * CTA com atração magnética e preenchimento "líquido": uma gota orgânica se expande a partir do cursor.
 * Tudo em transform (translate/scale/rotate), sem layout nem repaint pesado.
 */
export function LiquidLink({ children, variante = 'primario', tamanho = 'md', className = '', ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  usePointerFx(ref, { magnetic: 14 });
  const size = tamanho === 'lg' ? 'min-h-14 px-8 text-base' : 'min-h-12 px-6 text-[0.95rem]';
  return (
    <a ref={ref} className={`liquid-btn inline-flex items-center justify-center gap-2 rounded-full font-semibold ${size} ${VARIANTES[variante]} ${className}`} {...rest}>
      <span className="liquid-blob" aria-hidden="true" />
      {children}
    </a>
  );
}
