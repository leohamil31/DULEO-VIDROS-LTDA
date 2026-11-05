(() => {
  const $ = (s) => document.querySelector(s);
  const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); kids.forEach((k) => e.append(k)); return e; };
  const STATUS = { novo: 'Novo', em_analise: 'Em análise', respondido: 'Respondido', fechado: 'Fechado', cancelado: 'Cancelado' };

  let token = sessionStorage.getItem('duleo_token');
  let aba = 'orcamentos';

  async function api(url, opts = {}) {
    const r = await fetch(url, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const data = await r.json().catch(() => ({}));
    if (r.status === 401 && token) { sair(); throw new Error('Sessão expirada.'); }
    if (!r.ok) throw new Error(data.erro || 'Erro na requisição.');
    return data;
  }

  function sair() {
    // Revoga o token também no servidor (não basta apagar do navegador).
    if (token) fetch('/api/admin/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: '{}' }).catch(() => {});
    token = null; sessionStorage.removeItem('duleo_token');
    $('#painel').classList.add('hidden'); $('#login').classList.remove('hidden');
  }

  function mostrarPainel() {
    $('#login').classList.add('hidden'); $('#painel').classList.remove('hidden');
    carregar();
  }

  $('#form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha: $('#senha').value }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro);
      token = d.token; sessionStorage.setItem('duleo_token', token);
      $('#senha').value = ''; $('#login-msg').textContent = '';
      mostrarPainel();
    } catch (err) { $('#login-msg').textContent = err.message || 'Falha no login.'; }
  });

  $('#sair').addEventListener('click', sair);
  $('#tabs').addEventListener('click', (e) => {
    if (!e.target.dataset.tab) return;
    aba = e.target.dataset.tab;
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b === e.target));
    carregar();
  });

  const head = (...cols) => el('thead', {}, el('tr', {}, ...cols.map((c) => el('th', { textContent: c }))));
  const cell = (v) => el('td', { textContent: v ?? '' });
  const contato = (r) => el('td', {}, r.nome, el('br'), r.telefone, el('br'), r.email || '');

  async function carregar() {
    const t = $('#tabela');
    t.replaceChildren();
    try {
      const rows = await api(`/api/admin/${aba}`);
      const body = el('tbody');
      if (aba === 'orcamentos') {
        t.append(head('#', 'Data', 'Cliente', 'Itens', 'Origem', 'Status'));
        rows.forEach((r) => {
          const sel = el('select');
          Object.entries(STATUS).forEach(([k, v]) => sel.append(new Option(v, k, false, k === r.status)));
          sel.addEventListener('change', () => api(`/api/admin/orcamentos/${r.id}`, { method: 'PATCH', body: JSON.stringify({ status: sel.value }) }).catch((e) => alert(e.message)));
          const itens = el('td');
          r.itens.forEach((i) => itens.append(`${i.quantidade}x ${i.produto} (${i.largura}x${i.altura} m${[i.vidro, i.cor, i.obs].filter(Boolean).map((v) => `, ${v}`).join('')})`, el('br')));
          if (r.observacoes) itens.append(el('em', { textContent: `Obs.: ${r.observacoes}` }));
          body.append(el('tr', {}, cell(r.id), cell(r.criado_em), contato(r), itens, cell(r.origem), el('td', {}, sel)));
        });
      } else if (aba === 'contatos') {
        t.append(head('#', 'Data', 'Cliente', 'Assunto', 'Mensagem', 'Lido'));
        rows.forEach((r) => {
          const chk = el('input', { type: 'checkbox', checked: !!r.lido });
          chk.style.width = 'auto';
          chk.addEventListener('change', () => api(`/api/admin/contatos/${r.id}`, { method: 'PATCH', body: JSON.stringify({ lido: chk.checked }) }).catch((e) => alert(e.message)));
          body.append(el('tr', {}, cell(r.id), cell(r.criado_em), contato(r), cell(r.assunto), cell(r.mensagem), el('td', {}, chk)));
        });
      } else {
        t.append(head('#', 'Cadastro', 'Nome', 'Telefone', 'E-mail'));
        rows.forEach((r) => body.append(el('tr', {}, cell(r.id), cell(r.criado_em), cell(r.nome), cell(r.telefone), cell(r.email))));
      }
      if (!rows.length) body.append(el('tr', {}, el('td', { colSpan: 7, textContent: 'Nenhum registro ainda.' })));
      t.append(body);
    } catch (err) { t.append(el('caption', { textContent: err.message })); }
  }

  if (token) mostrarPainel();
})();
