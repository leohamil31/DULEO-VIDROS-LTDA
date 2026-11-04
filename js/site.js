// Script único do site (todas as páginas).
(() => {
  document.documentElement.classList.add('js');
  const C = window.DULEO_CONFIG;
  const PRODUTOS = window.DULEO_PRODUTOS || [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ico = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="img/icons.svg#${id}"/></svg>`;
  const wa = (texto) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(texto)}`;
  const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const temFormulario = !!$('#form-contato');

  // ---------- toast ----------
  let toastTimer;
  function toast(msg, erro = false) {
    const t = $('#toast');
    if (!t) return;
    t.innerHTML = `${ico(erro ? 'clock' : 'check-circle')}<span></span>`;
    t.lastChild.textContent = msg;
    t.classList.toggle('err', erro);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 4200);
  }

  // ---------- menu mobile ----------
  const menu = $('#menu'), burger = $('#burger');
  function setMenu(open, devolverFoco = true) {
    if (!menu.classList.contains('open') && !open) return;
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open && devolverFoco && matchMedia('(max-width: 899px)').matches) burger.focus({ preventScroll: true });
  }
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false, false); });
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !burger.contains(e.target)) setMenu(false, false);
    if (!e.target.closest('.drop')) $$('.drop.open').forEach(fecharDrop);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    $$('.drop.open').forEach(fecharDrop);
    setMenu(false);
  });
  matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) setMenu(false, false); });

  // ---------- dropdown de produtos ----------
  const dropLista = $('#drop-list > div');
  if (dropLista) {
    dropLista.innerHTML = PRODUTOS.map((p) => `<a href="produtos.html#p-${p.id}">${p.nome}</a>`).join('')
      + `<a href="produtos.html" class="link-arrow" style="margin-top:4px">Ver todos ${ico('arrow-right')}</a>`;
  }
  function fecharDrop(d) { d.classList.remove('open'); $('.drop-toggle', d).setAttribute('aria-expanded', 'false'); }
  $$('.drop-toggle').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const d = b.closest('.drop'), abrir = !d.classList.contains('open');
    d.classList.toggle('open', abrir);
    b.setAttribute('aria-expanded', String(abrir));
  }));

  // ---------- cabeçalho ao rolar ----------
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- links e textos vindos da configuração ----------
  $$('[data-wa]').forEach((a) => { a.href = wa(a.dataset.wa || 'Olá! Gostaria de um orçamento na Duleo Vidros.'); });
  $$('[data-ano]').forEach((n) => { n.textContent = new Date().getFullYear(); });

  // ---------- grade de produtos ----------
  const lista = $('#lista-produtos');
  if (lista) {
    lista.innerHTML = PRODUTOS.map((p) => `
      <article class="pcard reveal" id="p-${p.id}">
        <div class="pthumb"><img src="img/produtos/${p.id}.jpg" alt="${p.nome}" loading="lazy" decoding="async" width="800" height="533"></div>
        <div class="pbody">
          <h3>${p.nome}</h3>
          <p>${p.desc}</p>
          <a class="link-arrow stretched" href="${temFormulario ? '#contato' : `index.html?produto=${p.id}#contato`}" data-produto="${p.id}">Pedir orçamento ${ico('arrow-right')}</a>
        </div>
      </article>`).join('');
    $$('.pthumb img', lista).forEach((img) => {
      const ok = () => img.parentElement.classList.add('loaded');
      if (img.complete && img.naturalWidth) ok(); else { img.addEventListener('load', ok); img.addEventListener('error', ok); }
    });
    // destaca o produto vindo do menu (produtos.html#p-id)
    if (location.hash.startsWith('#p-')) {
      const alvo = $(location.hash);
      if (alvo) { alvo.classList.add('in'); setTimeout(() => alvo.scrollIntoView({ block: 'center', behavior: reduzMovimento ? 'auto' : 'smooth' }), 100); }
    }
  }

  // ---------- aparecer ao rolar (uma vez, com cascata automática) ----------
  const reveals = $$('.reveal');
  reveals.forEach((n) => {
    if (n.style.getPropertyValue('--d')) return;
    const irmaos = [...n.parentElement.children].filter((c) => c.classList.contains('reveal'));
    n.style.setProperty('--d', `${(irmaos.indexOf(n) % 4) * 0.07}s`);
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((n) => io.observe(n));
  } else reveals.forEach((n) => n.classList.add('in'));

  // ---------- formulário de orçamento ----------
  const form = $('#form-contato');
  if (!form) return;
  const sel = form.produto, tel = form.telefone, btn = $('button[type=submit]', form), msg = $('#contato-msg');
  sel.append(new Option('Selecione o produto', ''));
  PRODUTOS.forEach((p) => sel.append(new Option(p.nome, p.id)));
  sel.append(new Option('Outro / ainda não sei', 'outro'));

  function escolherProduto(id, rolar) {
    if (!PRODUTOS.some((p) => p.id === id)) return;
    sel.value = id;
    const panel = form.closest('.panel');
    panel.classList.remove('flash'); void panel.offsetWidth; panel.classList.add('flash');
    setTimeout(() => panel.classList.remove('flash'), 1600);
    if (rolar) {
      $('#contato').scrollIntoView({ behavior: reduzMovimento ? 'auto' : 'smooth' });
      setTimeout(() => form.nome.focus({ preventScroll: true }), reduzMovimento ? 0 : 650);
    }
  }
  // clique em "Pedir orçamento" de um produto: já deixa o produto escolhido
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-produto]');
    if (!a) return;
    e.preventDefault();
    history.replaceState(null, '', `?produto=${a.dataset.produto}#contato`);
    escolherProduto(a.dataset.produto, true);
  });
  const veio = new URLSearchParams(location.search).get('produto');
  if (veio) escolherProduto(veio, false);

  // máscara de telefone (41) 99999-9999
  tel.addEventListener('input', () => {
    const d = tel.value.replace(/\D/g, '').slice(0, 11);
    tel.value = d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
      : d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
      : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}`
      : d.length ? `(${d}` : '';
  });

  const regras = {
    nome: (v) => (v.trim().length >= 2 ? '' : 'Informe seu nome.'),
    telefone: (v) => (v.replace(/\D/g, '').length >= 10 ? '' : 'Informe o telefone com DDD. Ex.: (41) 99999-9999'),
    email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Confira o e-mail ou deixe em branco.'),
  };
  let tentou = false;
  function validar(campo) {
    const erro = regras[campo.name](campo.value);
    campo.setAttribute('aria-invalid', String(!!erro));
    $(`#err-${campo.name}`).textContent = erro;
    return !erro;
  }
  Object.keys(regras).forEach((n) => {
    form[n].addEventListener('blur', () => { if (tentou || form[n].value) validar(form[n]); });
    form[n].addEventListener('input', () => { if (form[n].getAttribute('aria-invalid') === 'true') validar(form[n]); });
  });

  function textoWhatsApp(d) {
    const prod = PRODUTOS.find((p) => p.id === d.produto);
    return [
      'Olá! Gostaria de um orçamento na Duleo Vidros.',
      `*Nome:* ${d.nome.trim()}`,
      `*Telefone:* ${d.telefone}`,
      d.email && `*E-mail:* ${d.email}`,
      `*Produto:* ${prod ? prod.nome : 'Ainda não sei'}`,
      d.mensagem.trim() && `*Mensagem:* ${d.mensagem.trim()}`,
    ].filter(Boolean).join('\n');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    tentou = true;
    msg.textContent = ''; msg.className = 'form-msg';
    const validos = Object.keys(regras).map((n) => validar(form[n]));
    if (validos.includes(false)) { $('[aria-invalid="true"]', form).focus(); return; }
    const d = Object.fromEntries(new FormData(form));

    // site estático (GitHub Pages): envia direto pelo WhatsApp
    if (!C.api) {
      const janela = window.open(wa(textoWhatsApp(d)), '_blank');
      if (janela) janela.opener = null; else location.href = wa(textoWhatsApp(d)); // bloqueador de pop-up: abre na mesma aba
      toast('Abrimos o WhatsApp com o seu pedido. É só tocar em enviar.');
      form.reset(); tentou = false;
      return;
    }

    // com o backend: grava o pedido para o atendente retornar
    const prod = PRODUTOS.find((p) => p.id === d.produto);
    const corpo = {
      nome: d.nome, telefone: d.telefone, email: d.email,
      assunto: prod ? `Orçamento: ${prod.nome}` : 'Pedido de orçamento',
      mensagem: d.mensagem.trim().length >= 3 ? d.mensagem.trim() : 'Gostaria de receber um orçamento. Aguardo o contato do atendente.',
    };
    btn.classList.add('is-loading'); btn.disabled = true; btn.setAttribute('aria-busy', 'true');
    try {
      const r = await fetch(`${C.api}/contatos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.erro || 'Não foi possível enviar agora.');
      toast('Pedido enviado! Um atendente vai falar com você em breve.');
      msg.textContent = 'Recebemos seu pedido. Retornamos pelo telefone informado.';
      form.reset(); tentou = false;
    } catch (err) {
      msg.className = 'form-msg err';
      msg.innerHTML = '';
      msg.append(`${err.message} `, Object.assign(document.createElement('a'), { href: wa(textoWhatsApp(d)), target: '_blank', rel: 'noopener', textContent: 'Enviar pelo WhatsApp' }));
    } finally {
      btn.classList.remove('is-loading'); btn.disabled = false; btn.removeAttribute('aria-busy');
    }
  });
})();
