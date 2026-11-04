window.DULEO_CONFIG = {
  // WhatsApp da empresa: formato internacional, só números
  whatsapp: '5541997953549',
  telefoneExibicao: '(41) 99795-3549',
  email: '',
  endereco: 'R. Carlos Kusma, Campestre da Faxina, São José dos Pinhais - PR, 83323-140',
  mapa: 'https://www.google.com/maps/search/?api=1&query=R.+Carlos+Kusma+Campestre+da+Faxina+S%C3%A3o+Jos%C3%A9+dos+Pinhais+PR',
  horario: 'Seg. a sex., 8h às 18h',
  instagram: 'https://www.instagram.com/duleo_vidros/',
  facebook: 'https://www.facebook.com/duleovidros.duleo',

  // Para onde vai o formulário:
  // - no servidor Node (backend/) o pedido é gravado no banco pela API;
  // - no GitHub Pages (site estático) não há API, então o pedido abre no WhatsApp já preenchido.
  api: /github\.io$/.test(location.hostname) || location.protocol === 'file:' ? null : '/api',
};
