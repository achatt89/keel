// No page shows an unlabelled {{fill-in}}: page content must have none, and Keel's template files may only be
// rendered with `fills` (each {{…}} becomes a labelled chip inside the "Template" section). Runs in `npm run build`.
import fs from 'node:fs';
const root = '..';
const bad = [];
const docs = fs.readdirSync(`${root}/docs/site`).filter((f) => /^\d.*\.md$/.test(f)).map((f) => `docs/site/${f}`);
const examples = fs.readdirSync(`${root}/docs/site/adr-example`).map((f) => `docs/site/adr-example/${f}`);
for (const f of [...docs, ...examples, 'docs/site/commands.json', 'release.json'])
  if (fs.readFileSync(`${root}/${f}`, 'utf8').includes('{{')) bad.push(`${f} contains {{`);
const skillHead = fs.readFileSync(`${root}/plugins/keel/skills/keel/SKILL.md`, 'utf8').split('\n---')[0];
if (skillHead.includes('{{')) bad.push('SKILL.md frontmatter contains {{');
const app = fs.readFileSync('src/App.jsx', 'utf8');
for (const m of app.matchAll(/<Md text=\{adr\.\w+\}[^/]*\/>/g)) if (!/\bfills\b/.test(m[0])) bad.push(`App.jsx renders a template without fills: ${m[0]}`);
if (!/className="kd-template"/.test(app)) bad.push('App.jsx: template section label missing');
if (bad.length) { console.error('check-fills FAIL\n' + bad.join('\n')); process.exit(1); }
console.log(`check-fills: ok (${docs.length + examples.length + 2} sources clean, templates labelled)`);
