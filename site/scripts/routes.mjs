// GitHub Pages serves files, not routes: give every route its own index.html (and a 404.html) so a deep link
// loads. With a domain: per-route canonical + Open Graph tags, CNAME, sitemap.xml and robots.txt for that host.
import fs from 'node:fs';
import path from 'node:path';
import { DOMAIN, routes } from './route-list.mjs';

const dist = 'dist';
const shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const url = (p) => `https://${DOMAIN}/${p ? p + '/' : ''}`;
const page = (r) => {
  if (!DOMAIN) return shell;
  const title = r.path ? `${r.title} · Keel docs` : r.title;
  const head = [
    `<link rel="canonical" href="${url(r.path)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Keel docs" />`,
    `<meta property="og:url" content="${url(r.path)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
  ].join('\n    ');
  return shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(r.description)}" />`)
    .replace('</head>', `    ${head}\n  </head>`);
};

const all = routes();
for (const r of all) {
  fs.mkdirSync(path.join(dist, r.path), { recursive: true });
  fs.writeFileSync(path.join(dist, r.path, 'index.html'), page(r));
}
fs.writeFileSync(path.join(dist, '404.html'), shell);
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
if (DOMAIN) {
  fs.writeFileSync(path.join(dist, 'CNAME'), DOMAIN + '\n');
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    all.map((r) => `  <url><loc>${url(r.path)}</loc></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: https://${DOMAIN}/sitemap.xml\n`);
}
console.log(`routes: ${all.length} pages + 404${DOMAIN ? `, CNAME/sitemap/robots for ${DOMAIN}` : ''}`);
