// Lista simples de produtos. Linha, cor e modelo são combinados pelo WhatsApp.
(() => {
  const ic = {
    esquadrias: '<rect x="10" y="8" width="44" height="48" rx="2"/><path d="M32 8v48M10 32h44"/><g class="abre"><path d="M15 14h10M15 22h10"/></g>',
    fachada: '<rect x="12" y="6" width="40" height="52"/><path d="M12 19h40M12 32h40M12 45h40M25 6v52M38 6v52"/><g class="brilha"><path d="M14 8l8 8M26 21l8 8"/></g>',
    guarda: '<path d="M6 14h52M6 54h52"/><g class="flut"><path d="M14 14v40M26 14v40M38 14v40M50 14v40"/></g>',
    brises: '<path d="M8 10h48M8 22h48M8 34h48M8 46h48"/><g class="abre"><path d="M14 16v36"/></g>',
    temperado: '<rect x="14" y="8" width="36" height="48" rx="2"/><g class="brilha"><path d="M22 18l14 14M22 30l8 8"/></g>',
    box: '<path d="M10 8h44v48H10z"/><path d="M32 8v48"/><g class="abre"><path d="M36 28h8"/></g><path class="tick" d="M16 44l5 5 9-9"/>',
    sacada: '<path d="M8 54h48M12 54V10h40v44"/><g class="abre"><path d="M18 16h14v34H18z"/></g>',
    acm: '<rect x="8" y="12" width="48" height="40" rx="2"/><g class="brilha"><path d="M8 26h48M8 40h48M24 12v40M40 12v40"/></g>',
  };
  window.DULEO_PRODUTOS = [
    { id: 'esquadrias', nome: 'Esquadrias de alumínio', desc: 'Portas, janelas, maxim-ar e fixo em diversas linhas e cores.', icone: ic.esquadrias },
    { id: 'fachada', nome: 'Fachada glazing', desc: 'Pele de vidro e Structural Glazing para fachadas modernas.', icone: ic.fachada },
    { id: 'guarda', nome: 'Guarda-corpos', desc: 'Vidro e alumínio para escadas, varandas e terraços.', icone: ic.guarda },
    { id: 'brises', nome: 'Brises de alumínio', desc: 'Controle de luz e calor com estilo para a fachada.', icone: ic.brises },
    { id: 'temperado', nome: 'Vidros temperados', desc: 'Portas, janelas e divisórias em vidro temperado.', icone: ic.temperado },
    { id: 'box', nome: 'Box de banheiro', desc: 'Box em vidro temperado sob medida.', icone: ic.box },
    { id: 'sacada', nome: 'Fechamento de sacada', desc: 'Sistema que protege do vento e da chuva e mantém a vista.', icone: ic.sacada },
    { id: 'acm', nome: 'ACM', desc: 'Revestimento em painel composto de alumínio.', icone: ic.acm },
  ];

  const svg = (inner) => `<svg class="anim" viewBox="0 0 64 64" aria-hidden="true">${inner}</svg>`;
  window.DULEO_RENDER_PRODUTOS = (alvo, href) => {
    alvo.innerHTML = window.DULEO_PRODUTOS.map((p, i) =>
      `<a class="pcard reveal in" style="--d:${(i % 3) * 0.06}s" href="${href(p)}" data-produto="${p.id}">` +
      `<span class="pthumb"><img src="img/produtos/${p.id}.jpg" alt="${p.nome}" loading="lazy" width="800" height="533"></span><h3>${p.nome}</h3><p>${p.desc}</p><span class="pcta">Pedir orçamento →</span></a>`).join('');
  };
})();
