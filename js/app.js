(() => {
  document.documentElement.classList.add('js');

  const C = window.DULEO_CONFIG;

  const $ = (s) => document.querySelector(s);
  const el = (tag, props = {}, ...kids) => {
    const e = Object.assign(document.createElement(tag), props);
    kids.forEach((k) => e.append(k));
    return e;
  };
  const num = (n) => String(n).replace('.', ',');

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // ---------- navegação ----------
  const menu = $('#menu'), burger = $('#burger');
  const setMenu = (open) => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', (e) => { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  $('#ano').textContent = new Date().getFullYear();
  $('#float-wa').href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de um orçamento na Duleo Vidros.')}`;

  // ---------- cabeçalho ao rolar ----------
  function atualizarScroll() {
    $('#nav').classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', atualizarScroll, { passive: true });
  atualizarScroll();

  // ---------- aparecer ao rolar ----------
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((n) => reveal.observe(n));

  // ---------- produtos: o orçamento é feito na seção de contato, pelo atendente ----------
  const PRODUTOS = window.DULEO_PRODUTOS;
  const wa = (texto) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(texto)}`;
  const irContato = () => '#contato';
  window.DULEO_RENDER_PRODUTOS($('#lista-produtos'), irContato);
  PRODUTOS.forEach((p) => {
    const a = el('a', { href: '#contato', textContent: p.nome });
    a.dataset.produto = p.id;
    $('#drop-list').append(a);
  });
  $('#wa-orc').href = wa('Olá! Gostaria de um orçamento na Duleo Vidros.');
  const selProduto = $('#f-produto');
  selProduto.append(new Option('Escolha o produto', ''));
  PRODUTOS.forEach((p) => selProduto.append(new Option(p.nome, p.nome)));

  // "Pedir orçamento" de um produto: chega no formulário com o produto já escolhido
  const escolher = (id, rolar) => {
    const p = PRODUTOS.find((x) => x.id === id);
    if (!p) return;
    selProduto.value = p.nome;
    if (rolar) {
      $('#contato').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => $('#form-contato [name=nome]').focus({ preventScroll: true }), 600);
    }
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-produto]');
    if (!a) return;
    e.preventDefault();
    setMenu(false);
    escolher(a.dataset.produto, true);
  });
  escolher(new URLSearchParams(location.search).get('produto'), false);

  // máscara de telefone: (41) 99999-9999
  const tel = $('#form-contato [name=telefone]');
  tel.addEventListener('input', () => {
    const d = tel.value.replace(/\D/g, '').slice(0, 11);
    tel.value = d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
      : d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
      : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  });

  $('#form-contato').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target, msg = $('#contato-msg'), btn = form.querySelector('button');
    const d = Object.fromEntries(new FormData(form));
    msg.className = 'form-msg err';
    if (!d.nome.trim() || d.telefone.replace(/\D/g, '').length < 10) { msg.textContent = 'Informe seu nome e telefone com DDD.'; return; }

    // GitHub Pages (sem servidor): abre o WhatsApp com o pedido já escrito
    if (!C.api) {
      const texto = ['Olá! Gostaria de um orçamento na Duleo Vidros.', `*Nome:* ${d.nome.trim()}`, `*Telefone:* ${d.telefone}`,
        d.email && `*E-mail:* ${d.email}`, `*Produto:* ${d.assunto || 'Ainda não sei'}`, d.mensagem.trim() && `*Mensagem:* ${d.mensagem.trim()}`]
        .filter(Boolean).join('\n');
      const janela = window.open(wa(texto), '_blank');
      if (janela) janela.opener = null; else location.href = wa(texto);
      msg.className = 'form-msg';
      msg.textContent = 'Abrimos o WhatsApp com o seu pedido. É só tocar em enviar.';
      form.reset();
      return;
    }

    d.assunto = d.assunto ? `Orçamento: ${d.assunto}` : 'Pedido de orçamento';
    if (d.mensagem.trim().length < 3) d.mensagem = 'Gostaria de receber um orçamento. Aguardo o contato do atendente.';
    msg.className = 'form-msg'; btn.disabled = true;
    try {
      const r = await fetch(`${C.api}/contatos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.erro || 'Não foi possível enviar. Tente novamente.');
      msg.textContent = 'Pedido enviado! Um atendente entrará em contato em breve.';
      form.reset();
    } catch (err) { msg.className = 'form-msg err'; msg.textContent = err.message; }
    finally { btn.disabled = false; }
  });
  const info = $('#info');
  const ICO = {
    wa: '<svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11 19.9L3 29l6.3-1.9A13 13 0 1 0 16 3zm0 2.4a10.6 10.6 0 1 1-5.5 19.7l-.4-.2-3.7 1.1 1.2-3.6-.3-.4A10.6 10.6 0 0 1 16 5.4zm-4 5.2c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.8c.2.3 2.6 4.1 6.4 5.6 3.1 1.2 3.7 1 4.4.9.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.2-.4-.3-.8-.5s-2.2-1.1-2.5-1.2c-.3-.1-.6-.2-.8.2-.2.3-.9 1.2-1.1 1.4-.2.3-.4.3-.8.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.3-2.1-2.7-.2-.4 0-.6.2-.8l.5-.6c.2-.2.2-.4.4-.6.1-.3.1-.5 0-.7l-1.1-2.7c-.3-.6-.6-.6-.8-.6z"/></svg>',
    mapa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 1.8C8 1.8 4.8 5 4.8 9c0 5.4 7.2 13.2 7.2 13.2S19.2 14.4 19.2 9c0-4-3.2-7.2-7.2-7.2z"/><circle cx="12" cy="9" r="2.7" fill="#B31412"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/></svg>',
    hora: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  };
  [['Endereço', C.endereco, 'mapa'], ['Telefone / WhatsApp', C.telefoneExibicao, 'wa'], ['E-mail', C.email, 'mail'], ['Atendimento', C.horario, 'hora']]
    .filter(([, v]) => v)
    .forEach(([k, v, i]) => {
      const ic = el('span', { className: `info-ico ${i}` }); ic.innerHTML = ICO[i];
      info.append(el('li', {}, ic, el('div', {}, el('b', { textContent: k }), v)));
    });

})();
