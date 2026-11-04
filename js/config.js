window.DULEO_CONFIG = {
  // Número da empresa para o WhatsApp, formato internacional sem símbolos (ALTERE para o real)
  whatsapp: '5541997953549',
  telefoneExibicao: '(41) 99795-3549',
  email: '',
  endereco: 'R. Carlos Kusma - Campestre da Faxina, São José dos Pinhais - PR, 83323-140',
  horario: 'Segunda a sexta: 8h às 18h | Sábado e domingo: fechado',
  instagram: 'https://www.instagram.com/duleo_vidros/',
  facebook: 'https://www.facebook.com/duleovidros.duleo',
  // No GitHub Pages não há servidor: o formulário envia o pedido pelo WhatsApp.
  // No servidor Node (backend/) o pedido é gravado no banco.
  api: /github\.io$/.test(location.hostname) || location.protocol === 'file:' ? null : '/api',
};
