// Gera o valor de ADMIN_PASSWORD_HASH para o .env (scrypt + salt aleatório).
// Uso: node gerar-hash.js        (a senha é digitada sem aparecer na tela nem no histórico)
const crypto = require('node:crypto');

const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const PROIBIDAS = ['troque-esta-senha', 'admin', 'senha', '123456', 'duleo', 'duleovidros'];

function lerSenha(prompt) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    stdout.write(prompt);
    if (!stdin.isTTY) { // permite: echo "senha" | node gerar-hash.js
      let s = ''; stdin.setEncoding('utf8');
      stdin.on('data', (c) => { s += c; }).on('end', () => resolve(s.replace(/\r?\n$/, '')));
      return;
    }
    let s = '';
    stdin.setRawMode(true); stdin.resume(); stdin.setEncoding('utf8');
    const onData = (ch) => {
      if (ch === '\r' || ch === '\n' || ch === '\u0004') {
        stdin.setRawMode(false); stdin.pause(); stdin.off('data', onData); stdout.write('\n'); resolve(s);
      } else if (ch === '\u0003') { process.exit(130); }
      else if (ch === '\u007f' || ch === '\b') { s = s.slice(0, -1); }
      else { s += ch; }
    };
    stdin.on('data', onData);
  });
}

(async () => {
  const senha = await lerSenha('Nova senha do painel (mín. 16 caracteres): ');
  if (senha.length < 16) { console.error('Senha muito curta: use pelo menos 16 caracteres.'); process.exit(1); }
  if (PROIBIDAS.some((p) => senha.toLowerCase().includes(p))) { console.error('Senha fraca ou padrão: escolha outra.'); process.exit(1); }
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(senha, salt, 64, SCRYPT);
  console.log('\nCole no backend/.env:\n');
  console.log(`ADMIN_PASSWORD_HASH=${salt.toString('hex')}:${hash.toString('hex')}`);
})();
