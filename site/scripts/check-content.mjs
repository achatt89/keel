// Content checks run first in `npm run build`; any failure stops the build. A visitor never sees:
//  - a bare {{fill-in}}: page content has none, and Keel's template files render only with `fills` (labelled chips);
//  - the SKILL.md trigger description outside the collapsed "Exactly what Claude reads" block;
//  - an internal link to a page that does not exist, or an empty lead.
import fs from 'node:fs';
const root = '..';
const read = (f) => fs.readFileSync(`${root}/${f}`, 'utf8');
const bad = [];
const docs = fs.readdirSync(`${root}/docs/site`).filter((f) => /^\d.*\.md$/.test(f));
const examples = fs.readdirSync(`${root}/docs/site/adr-example`).map((f) => `docs/site/adr-example/${f}`);
const sources = [...docs.map((f) => `docs/site/${f}`), ...examples, 'docs/site/skill.md', 'docs/site/commands.json', 'release.json'];

// 1. {{ }} and trigger-list text only where they are labelled.
for (const f of sources) {
  const t = read(f);
  if (t.includes('{{')) bad.push(`${f}: contains {{`);
  if (/Use when the user|triggers?:\s*"/i.test(t)) bad.push(`${f}: contains a skill trigger list`);
}
const app = fs.readFileSync('src/App.jsx', 'utf8');
for (const m of app.matchAll(/<Md text=\{adr\.\w+\}[^/]*\/>/g)) if (!/\bfills\b/.test(m[0])) bad.push(`App.jsx: template rendered without fills: ${m[0]}`);
if (!app.includes('className="kd-template"')) bad.push('App.jsx: template section label missing');
const raw = app.match(/<details className="kd-raw">[\s\S]*?<\/details>/)?.[0] ?? '';
if ((app.match(/skill\.description/g) || []).length !== (raw.match(/skill\.description/g) || []).length)
  bad.push('App.jsx: skill.description rendered outside <details className="kd-raw">');

// 2. Leads and internal links.
const slugs = new Map(); // file -> slug
for (const f of docs) {
  const fm = read(`docs/site/${f}`).match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  slugs.set(f, fm.match(/^slug:\s*(\S+)/m)?.[1] ?? f.replace(/^\d+-|\.md$/g, ''));
  if (!/^lead:\s*"?[^"\s]/m.test(fm)) bad.push(`docs/site/${f}: empty lead`);
}
const known = new Set(['', 'commands', 'skills', 'adr', 'releases', ...[...slugs.values()].map((s) => `docs/${s}`)]);
for (const f of [...docs.map((d) => `docs/site/${d}`), 'docs/site/skill.md']) {
  for (const [, target] of read(f).matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const file = target.match(/^\.\/(\d+-[\w-]+\.md)(#.*)?$/)?.[1];
    const ok = file ? slugs.has(file) : known.has(target.replace(/^\//, '').replace(/[#?].*$/, '').replace(/\/$/, ''));
    if (!ok) bad.push(`${f}: link to ${target} resolves to no page`);
  }
}
if (bad.length) { console.error('check-content FAIL\n' + bad.join('\n')); process.exit(1); }
console.log(`check-content: ok (${sources.length} sources, ${docs.length} leads, links resolve, fill-ins and trigger text labelled)`);
