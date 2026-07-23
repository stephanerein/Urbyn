// Runs after the client + SSR builds (see package.json "build" script).
// For each indexable route, renders the app server-side and writes a static
// HTML file with the real per-page <title>/<meta>/JSON-LD baked in, so any
// crawler that doesn't execute JavaScript (some AI/LLM crawlers, some link
// preview bots) still sees correct, page-specific content — not just the
// generic index.html shell.
//
// Keep this list in sync with public/sitemap.xml / SEO_GOVERNANCE.md: only
// routes marked indexable there belong here. Transactional/session pages
// (cart, checkout, results, login) stay client-rendered on purpose.
import fs from 'node:fs';
import path from 'node:path';
import { render } from './dist-server/entry-server.js';

const ROUTES = [
  '/',
  '/a-propos',
  '/contact',
  '/definir-besoin',
  '/totem/acquisition',
  '/totem/location',
  '/totem/sign-iz/acquisition',
  '/totem/sign-iz/location',
  '/totem/caisson-bois/format',
  '/totem/caisson-bois-120/location',
  '/palissade',
  '/massif/selection',
  '/bet',
  '/mentions-legales',
  '/confidentialite',
  '/cgv',
];

const distDir = path.resolve('dist');
const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

for (const url of ROUTES) {
  const { html, helmet } = render(url);

  let page = template.replace('<!--app-html-->', html);

  if (helmet) {
    const headTags = [
      helmet.title?.toString() ?? '',
      helmet.meta?.toString() ?? '',
      helmet.link?.toString() ?? '',
      helmet.script?.toString() ?? '',
    ]
      .filter(Boolean)
      .join('\n      ');

    page = page.replace(
      /<!--seo-head-start-->[\s\S]*?<!--seo-head-end-->/,
      headTags,
    );
  }

  const outDir = url === '/' ? distDir : path.join(distDir, url);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), page);
  console.log(`Prerendered ${url} -> ${path.relative(process.cwd(), path.join(outDir, 'index.html'))}`);
}
