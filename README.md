# Duleo Vidros · Site institucional

Site da Duleo Vidros: esquadrias de alumínio, vidros temperados e fabricação sob medida em Curitiba e região.

**Site no ar (GitHub Pages):** https://leohamil31.github.io/DULEO-VIDROS-LTDA/

React 19 + TypeScript (strict) + Tailwind CSS v4. As páginas são **pré-renderizadas no build** (HTML completo para o Google) e
hidratadas no navegador. Sem framework pesado: o build é um script de ~100 linhas com esbuild.

```
src/config.ts            dados da empresa (WhatsApp, endereço, horário, coordenadas, CNPJ): edite aqui
src/produtos.tsx         lista de produtos (fotos em public/img/produtos/<id>.webp|jpg)
src/seo.ts               title, description, canonical, Open Graph, Twitter Card, GEO e JSON-LD (Schema.org)
src/styles.css           design tokens (@theme), vidro, efeitos e animações
src/pages/               Home, Produtos, Sobre, Política de privacidade
src/components/          cabeçalho, rodapé, formulário, cards 3D, banner LGPD, mapa com consentimento
src/fx/liquid.ts         shader WebGL do hero (carregado sob demanda)
public/                  imagens e fontes (Inter, hospedada no próprio site)
scripts/build.mjs        build: bundle + CSS + pré-renderização + sitemap/robots → dist/
backend/                 API opcional + painel admin (Node 22.13+, SQLite)
```

## Desenvolvimento

```powershell
npm install
npm run build        # gera dist/
npm run typecheck    # TypeScript strict
npm start            # serve dist/ + API em http://localhost:3000 (veja "Backend" abaixo)
```

O GitHub Actions (`.github/workflows/pages.yml`) roda typecheck + build e publica `dist/` a cada push na `main`.

## Dois modos de funcionamento

| | GitHub Pages (estático) | Servidor Node (`backend/`) |
|---|---|---|
| Páginas | ✅ | ✅ |
| Formulário de orçamento | abre o WhatsApp com o pedido já preenchido | grava o pedido no banco para o atendente retornar |
| Painel admin | ❌ (não existe no Pages) | ✅ em `/admin` |

O modo é escolhido sozinho (`apiBase()` em `src/config.ts`): em `*.github.io` o formulário usa o WhatsApp; no servidor usa a API.

## Backend

Requer **Node 22.13+** (usa `node:sqlite`). Rode `npm run build` antes: o servidor entrega a pasta `dist/`.

```powershell
cd backend
copy .env.example .env
node gerar-hash.js          # digite a senha do painel (mín. 16 caracteres) e cole o resultado em ADMIN_PASSWORD_HASH
node --disable-warning=ExperimentalWarning server.js
```
- Site: http://localhost:3000
- Painel: http://localhost:3000/admin

Em produção, publique atrás de um proxy com HTTPS (nginx, Caddy) e defina `TRUST_PROXY=1` no `.env`.

O servidor só entrega páginas `.html`, `robots.txt`, `sitemap.xml` e as pastas `assets/`, `img/` e `fonts/` de `dist/`.
`backend/`, `src/`, `.env`, `.git` e o banco nunca são servidos.

## Editar conteúdo

1. **Contato, endereço, horário:** `src/config.ts`. Preencha também `geo` (coordenadas do pino no Google Maps) e `cnpj` para o SEO local.
2. **Produtos:** `src/produtos.tsx`. Para trocar a foto, substitua `public/img/produtos/<id>.jpg` e `<id>.webp` / `<id>-480.webp` (800×533).
3. **Cache:** os arquivos de `dist/assets/` têm hash no nome; não é preciso versionar à mão.

## Acessibilidade, desempenho e privacidade

- HTML semântico (header/nav/main/footer), link "Pular para o conteúdo", foco visível, menus operáveis por teclado (Tab/Escape),
  formulário com `label`, `aria-invalid` e mensagens ligadas por `aria-describedby`. Contraste ≥ 6:1 em todos os textos.
- `prefers-reduced-motion` desliga revelações, shader, inclinação 3D e brilho do cursor.
- Animações só com `transform`/`opacity`; efeitos de cursor via variáveis CSS em `requestAnimationFrame` (sem re-render do React).
  O shader roda em meia resolução e pausa fora da tela ou com a aba oculta.
- LGPD: sem cookies próprios nem rastreadores; o mapa do Google só carrega com consentimento (guardado no `localStorage`).
  Fontes hospedadas no próprio site (sem Google Fonts). Política em `privacidade.html`.

## Fluxo do cliente

- Todo "Pedir orçamento" de um produto leva ao formulário **já com o produto escolhido** (`./?produto=<id>#contato`).
- O telefone é formatado enquanto o cliente digita: (41) 99999-9999.
- O site não exibe preços. Linha, cor, modelo e medidas são combinados pelo atendente.

## API (backend)

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/contatos` (5 por 10 min por IP, só `application/json`, campo-armadilha contra robôs) | público |
| POST | `/api/admin/login` (bloqueio progressivo) | senha |
| POST | `/api/admin/logout` | token |
| GET | `/api/admin/orcamentos`, `/contatos`, `/clientes` | token (expira em 2h, ou 30 min sem uso) |
| PATCH | `/api/admin/orcamentos/:id` (status), `/contatos/:id` (lido) | token |
