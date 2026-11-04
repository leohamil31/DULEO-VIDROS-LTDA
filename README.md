# Duleo Vidros · Site institucional

Site da Duleo Vidros: esquadrias de alumínio, vidros temperados e fabricação sob medida em Curitiba e região.

**Site no ar (GitHub Pages):** https://leohamil31.github.io/DULEO-VIDROS-LTDA/

```
index.html, produtos.html, sobre.html   páginas do site (estático, HTML/CSS/JS puro)
css/style.css                           design system (tokens, componentes, estados)
js/config.js                            WhatsApp, endereço, horário, modo do formulário
js/produtos.js                          lista de produtos (fotos em img/produtos/<id>.jpg)
js/site.js                              menu, dropdown, animações, formulário
img/icons.svg                           set único de ícones (24px, traço 1.75)
backend/                                API opcional + painel admin (Node 22.13+, SQLite)
```

## Dois modos de funcionamento

| | GitHub Pages (estático) | Servidor Node (`backend/`) |
|---|---|---|
| Páginas | ✅ | ✅ |
| Formulário de orçamento | abre o WhatsApp com o pedido já preenchido | grava o pedido no banco para o atendente retornar |
| Painel admin | ❌ (não existe no Pages) | ✅ em `/admin` |

O modo é escolhido sozinho em `js/config.js` (`api`): em `*.github.io` o formulário usa o WhatsApp; no servidor usa a API.

## Rodar com o backend

Requer **Node 22.13+** (usa `node:sqlite`, sem `npm install`).

```powershell
cd backend
copy .env.example .env      # defina ADMIN_PASSWORD (sem ela o login fica desativado)
node --disable-warning=ExperimentalWarning server.js
```
- Site: http://localhost:3000
- Painel: http://localhost:3000/admin

O servidor só entrega páginas `.html` da raiz e as pastas `css/`, `js/` e `img/`. `backend/`, `.env`, `.git` e o banco nunca são servidos.

## Editar conteúdo

1. **Contato:** `js/config.js` (WhatsApp) e os blocos de contato/rodapé nos HTML.
2. **Produtos:** `js/produtos.js`. Para trocar a foto, substitua `img/produtos/<id>.jpg` (800×533).
3. **Cache:** ao editar CSS/JS, aumente o `?v=N` nos HTML.

## Fluxo do cliente

- Todo "Pedir orçamento" de um produto leva ao formulário **já com o produto escolhido** (`index.html?produto=<id>#contato`).
- O formulário valida nome e telefone (com máscara) e mostra os erros no campo, além de estado de carregamento e confirmação.
- O site não exibe preços. Linha, cor, modelo e medidas são combinados pelo atendente.

## API (backend)

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/contatos`, `/api/orcamentos` | público |
| POST | `/api/admin/login` | senha |
| GET | `/api/admin/orcamentos`, `/contatos`, `/clientes` | token |
| PATCH | `/api/admin/orcamentos/:id` (status), `/contatos/:id` (lido) | token |
