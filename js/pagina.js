(() => {
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const burger = document.getElementById('burger');
  const setMenu = (open) => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 8), { passive: true });
  document.getElementById('ano').textContent = new Date().getFullYear();

  const destino = (p) => (p ? `index.html?produto=${p.id}#contato` : 'index.html#contato');
  const lista = document.getElementById('lista-produtos');
  if (lista) window.DULEO_RENDER_PRODUTOS(lista, destino);
  const drop = document.getElementById('drop-list');
  window.DULEO_PRODUTOS.forEach((p) => {
    const a = document.createElement('a');
    a.href = destino(p);
    a.textContent = p.nome;
    drop.append(a);
  });

  document.documentElement.classList.add('js');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((n) => io.observe(n));
})();
