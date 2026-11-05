import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { apiBase, waLink } from '../config';
import { PRODUTOS } from '../produtos';
import { EVENTO_PRODUTO, HREF } from '../lib/routes';

type Campos = { nome: string; telefone: string; email: string; assunto: string; mensagem: string };
type Erros = Partial<Record<keyof Campos, string>>;
type Status = { tipo: 'ok' | 'erro' | 'enviando'; texto: string } | null;

const VAZIO: Campos = { nome: '', telefone: '', email: '', assunto: '', mensagem: '' };

/** (41) 99999-9999 enquanto digita. */
const mascaraTelefone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length > 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return d;
};

// Validação aqui é só para a experiência do usuário: o backend valida e sanitiza tudo de novo.
function validar(c: Campos): Erros {
  const e: Erros = {};
  if (c.nome.trim().length < 2) e.nome = 'Informe seu nome.';
  if (c.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Informe um telefone com DDD.';
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) e.email = 'Confira o e-mail.';
  return e;
}

export function QuoteForm() {
  const [c, setC] = useState<Campos>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const [status, setStatus] = useState<Status>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;

  // Produto pré-escolhido: ?produto=<id> na URL ou clique num card da mesma página.
  useEffect(() => {
    const porId = (pid: string | null) => PRODUTOS.find((p) => p.id === pid)?.nome;
    const inicial = porId(new URLSearchParams(location.search).get('produto'));
    if (inicial) setC((v) => ({ ...v, assunto: inicial }));
    const onEscolha = (e: Event) => {
      const nome = porId((e as CustomEvent<string>).detail);
      if (!nome) return;
      setC((v) => ({ ...v, assunto: nome }));
      window.setTimeout(() => formRef.current?.querySelector<HTMLInputElement>('input[name=nome]')?.focus({ preventScroll: true }), 650);
    };
    window.addEventListener(EVENTO_PRODUTO, onEscolha);
    return () => window.removeEventListener(EVENTO_PRODUTO, onEscolha);
  }, []);

  const mudar = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setC((v) => ({ ...v, [name]: name === 'telefone' ? mascaraTelefone(value) : value }));
    if (erros[name as keyof Campos]) setErros((er) => ({ ...er, [name]: undefined }));
  };

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const err = validar(c);
    setErros(err);
    const primeiro = Object.keys(err)[0];
    if (primeiro) {
      form.querySelector<HTMLElement>(`[name=${primeiro}]`)?.focus();
      setStatus({ tipo: 'erro', texto: 'Confira os campos destacados.' });
      return;
    }
    const empresa = (form.elements.namedItem('empresa') as HTMLInputElement | null)?.value ?? '';
    const api = apiBase();

    // GitHub Pages (sem servidor): abre o WhatsApp com o pedido já escrito.
    if (!api) {
      const texto = [
        'Olá! Gostaria de um orçamento na Duleo Vidros.',
        `*Nome:* ${c.nome.trim()}`,
        `*Telefone:* ${c.telefone}`,
        c.email && `*E-mail:* ${c.email.trim()}`,
        `*Produto:* ${c.assunto || 'Ainda não sei'}`,
        c.mensagem.trim() && `*Mensagem:* ${c.mensagem.trim()}`,
      ].filter(Boolean).join('\n');
      const janela = window.open(waLink(texto), '_blank');
      if (janela) janela.opener = null; else location.href = waLink(texto);
      setStatus({ tipo: 'ok', texto: 'Abrimos o WhatsApp com o seu pedido. É só tocar em enviar.' });
      setC(VAZIO);
      return;
    }

    setStatus({ tipo: 'enviando', texto: 'Enviando…' });
    try {
      const r = await fetch(`${api}/contatos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: c.nome, telefone: c.telefone, email: c.email, empresa,
          assunto: c.assunto ? `Orçamento: ${c.assunto}` : 'Pedido de orçamento',
          mensagem: c.mensagem.trim().length >= 3 ? c.mensagem : 'Gostaria de receber um orçamento. Aguardo o contato do atendente.',
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.erro || 'Não foi possível enviar. Tente novamente.');
      setStatus({ tipo: 'ok', texto: 'Pedido enviado! Um atendente entrará em contato em breve.' });
      setC(VAZIO);
    } catch (er) {
      setStatus({ tipo: 'erro', texto: er instanceof Error ? er.message : 'Não foi possível enviar.' });
    }
  }

  const campo = 'w-full rounded-xl border bg-ink-950/60 px-4 py-3 text-snow placeholder:text-mist/60 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/20';
  const borda = (k: keyof Campos) => (erros[k] ? 'border-red-400/70 focus:border-red-400' : 'border-white/10 focus:border-brand-400');
  const ajuda = (k: keyof Campos) => erros[k] && <p id={id(`${k}-erro`)} className="mt-1.5 text-sm text-red-300">{erros[k]}</p>;
  const aria = (k: keyof Campos) => ({ 'aria-invalid': !!erros[k] || undefined, 'aria-describedby': erros[k] ? id(`${k}-erro`) : undefined });
  const label = 'mb-1.5 block text-sm font-medium text-silver';

  return (
    <form ref={formRef} onSubmit={enviar} noValidate aria-labelledby={id('titulo')} className="glass relative space-y-4 rounded-3xl p-6 sm:p-8">
      <div>
        <h3 id={id('titulo')} className="font-display text-2xl font-semibold text-snow">Peça seu orçamento</h3>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          Deixe seus dados e o produto de interesse. Um atendente entra em contato para combinar medidas, linha, cor e modelo.
        </p>
      </div>

      <div>
        <label htmlFor={id('nome')} className={label}>Nome <span aria-hidden="true" className="text-brand-400">*</span></label>
        <input id={id('nome')} name="nome" value={c.nome} onChange={mudar} required maxLength={120} autoComplete="name" className={`${campo} ${borda('nome')}`} {...aria('nome')} />
        {ajuda('nome')}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={id('telefone')} className={label}>Telefone / WhatsApp <span aria-hidden="true" className="text-brand-400">*</span></label>
          <input id={id('telefone')} name="telefone" value={c.telefone} onChange={mudar} required maxLength={16} inputMode="tel" autoComplete="tel-national"
            placeholder="(41) 99999-9999" className={`${campo} ${borda('telefone')}`} {...aria('telefone')} />
          {ajuda('telefone')}
        </div>
        <div>
          <label htmlFor={id('email')} className={label}>E-mail <span className="font-normal text-mist">(opcional)</span></label>
          <input id={id('email')} name="email" type="email" value={c.email} onChange={mudar} maxLength={160} autoComplete="email" className={`${campo} ${borda('email')}`} {...aria('email')} />
          {ajuda('email')}
        </div>
      </div>

      <div>
        <label htmlFor={id('assunto')} className={label}>Produto de interesse</label>
        <select id={id('assunto')} name="assunto" value={c.assunto} onChange={mudar} className={`${campo} ${borda('assunto')} appearance-none bg-[length:18px] bg-[right_1rem_center] bg-no-repeat select-chevron`}>
          <option value="">Ainda não sei / outro</option>
          {PRODUTOS.map((p) => <option key={p.id} value={p.nome}>{p.nome}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor={id('mensagem')} className={label}>Mensagem <span className="font-normal text-mist">(opcional)</span></label>
        <textarea id={id('mensagem')} name="mensagem" value={c.mensagem} onChange={mudar} rows={3} maxLength={2000}
          placeholder="Conte rapidamente o que você precisa" className={`${campo} ${borda('mensagem')} resize-y`} />
      </div>

      {/* Armadilha para robôs: invisível para pessoas e leitores de tela. */}
      <div className="absolute -left-[9999px] size-px overflow-hidden" aria-hidden="true">
        <label>Empresa<input name="empresa" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>

      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${status?.tipo === 'erro' ? 'text-red-300' : 'text-brand-300'}`}>
        {status?.texto}
      </p>

      <button type="submit" disabled={status?.tipo === 'enviando'}
        className="liquid-btn relative inline-flex min-h-13 w-full items-center justify-center rounded-full bg-brand-500 px-6 font-semibold text-brand-950 [--blob:var(--color-brand-300)] disabled:cursor-not-allowed disabled:opacity-60">
        <span className="liquid-blob" aria-hidden="true" />
        Solicitar contato
      </button>
      <p className="text-xs leading-relaxed text-mist">
        Usamos seus dados só para responder a este pedido. Veja a <a href={HREF.privacidade} className="text-brand-300 underline underline-offset-4">política de privacidade</a>.
      </p>
    </form>
  );
}
