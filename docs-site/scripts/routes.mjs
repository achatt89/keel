// GitHub Pages serves files, not routes: give every route its own index.html (and a 404.html) so a deep link
// loads, and write CNAME only when DOCS_DOMAIN is set (empty until the founder gives the domain).
import fs from 'node:fs';
import path from 'node:path';
import { routes } from './route-list.mjs';

const dist = 'dist';
const shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
for (const r of routes()) {
  fs.mkdirSync(path.join(dist, r), { recursive: true });
  fs.writeFileSync(path.join(dist, r, 'index.html'), shell);
}
fs.writeFileSync(path.join(dist, '404.html'), shell);
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
if (process.env.DOCS_DOMAIN) fs.writeFileSync(path.join(dist, 'CNAME'), process.env.DOCS_DOMAIN + '\n');
console.log(`routes: ${routes().length} pages + 404${process.env.DOCS_DOMAIN ? ', CNAME ' + process.env.DOCS_DOMAIN : ''}`);
