// Build do site: bundle (esbuild) + CSS (Tailwind v4) + pré-renderização (React SSR) → dist/
// Uso: npm run build
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import { compile } from 'tailwindcss';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const TMP = path.join(ROOT, '.build');
const require = createRequire(import.meta.url);
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);
const t0 = performance.now();

await rm(DIST, { recursive: true, force: true });
await rm(TMP, { recursive: true, force: true });
await mkdir(path.join(DIST, 'assets'), { recursive: true });

// 1) Arquivos públicos (imagens, fontes)
await cp(path.join(ROOT, 'public'), DIST, { recursive: true });

// 2) JavaScript do navegador (com divisão de código: o shader WebGL vira um chunk carregado sob demanda)
const client = await esbuild.build({
  entryPoints: { app: path.join(SRC, 'entry-client.tsx') },
  bundle: true, splitting: true, format: 'esm', minify: true, target: ['es2020', 'safari15'],
  outdir: path.join(DIST, 'assets'), entryNames: '[name]-[hash]', chunkNames: 'chunk-[hash]',
  jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'none', metafile: true,
});
const jsOut = Object.entries(client.metafile.outputs).find(([, o]) => o.entryPoint?.endsWith('entry-client.tsx'))[0];
const jsFile = path.relative(DIST, path.resolve(ROOT, jsOut)).split(path.sep).join('/');

// 3) CSS: Tailwind v4 (API do compilador) com as classes encontradas no código-fonte
async function arquivos(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await arquivos(p)));
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}
const candidatos = new Set();
for (const f of await arquivos(SRC)) {
  for (const tok of (await readFile(f, 'utf8')).split(/[\s"'`{}()<>;,]+/)) if (tok) candidatos.add(tok);
}
const tailwindDir = path.dirname(require.resolve('tailwindcss/package.json'));
const tw = await compile(await readFile(path.join(SRC, 'styles.css'), 'utf8'), {
  base: SRC,
  loadStylesheet: async (id, base) => {
    const file = id === 'tailwindcss' ? path.join(tailwindDir, 'index.css')
      : id.startsWith('tailwindcss/') ? path.join(tailwindDir, id.slice('tailwindcss/'.length))
      : path.resolve(base, id);
    return { path: file, base: path.dirname(file), content: await readFile(file, 'utf8') };
  },
});
const { code: css } = await esbuild.transform(tw.build([...candidatos]), { loader: 'css', minify: true, target: ['chrome100', 'safari15', 'firefox100'] });
const cssFile = `assets/site-${hash(css)}.css`;
await writeFile(path.join(DIST, cssFile), css);

// 4) Pré-renderização: cada página vira HTML estático completo (SEO), hidratado depois no navegador
await esbuild.build({
  entryPoints: [path.join(SRC, 'entry-server.tsx')], bundle: true, platform: 'node', format: 'esm',
  outfile: path.join(TMP, 'server.mjs'), jsx: 'automatic', packages: 'external',
  define: { 'process.env.NODE_ENV': '"production"' },
});
const ssr = await import(pathToFileURL(path.join(TMP, 'server.mjs')).href);
const assets = { css: cssFile, js: jsFile, preload: ['fonts/inter-400.woff', 'fonts/inter-display-600.woff'] };

for (const page of ssr.SITEMAP_PAGINAS) {
  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    ${ssr.head(page, assets)}
  </head>
  <body>
    <div id="app" data-page="${page}">${ssr.render(page)}</div>
  </body>
</html>
`;
  await writeFile(path.join(DIST, ssr.PAGINAS[page].arquivo), html);
}

// 5) sitemap.xml, robots.txt e 404 do GitHub Pages
const hoje = new Date().toISOString().slice(0, 10);
const urls = ssr.SITEMAP_PAGINAS.map((p) => `  <url><loc>${ssr.canonical(p)}</loc><lastmod>${hoje}</lastmod><priority>${p === 'home' ? '1.0' : '0.7'}</priority></url>`);
await writeFile(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${ssr.canonical('home')}sitemap.xml\n`);
await writeFile(path.join(DIST, '.nojekyll'), '');

await rm(TMP, { recursive: true, force: true });
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(`dist/ pronto em ${Math.round(performance.now() - t0)} ms`);
for (const [f, o] of Object.entries(client.metafile.outputs)) console.log(`  ${path.basename(f).padEnd(28)} ${kb(o.bytes)}`);
console.log(`  ${path.basename(cssFile).padEnd(28)} ${kb(Buffer.byteLength(css))}`);
