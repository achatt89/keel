// Node side of the route list (the app derives the same slugs in src/content.js).
import fs from 'node:fs';

// The docs domain (founder, 3 Nov). DOCS_DOMAIN='' builds for achatt89.github.io/keel/ instead (set BASE_PATH=/keel/ too).
export const DOMAIN = process.env.DOCS_DOMAIN ?? 'keel.thelogicatelier.com';

const dir = new URL('../../docs/site/', import.meta.url);
const field = (text, k) => text.match(new RegExp(`^${k}:\\s*"?([^"\\n#]+?)"?\\s*(#.*)?$`, 'm'))?.[1].trim();
const SITE = 'Keel: the foundational documentation suite for a new software project, from one guided interview.';
// { path, title, description } per route; '' is home.
export const routes = () => [
  { path: '', title: 'Keel docs', description: SITE },
  ...fs.readdirSync(dir).filter((f) => /^\d+-.*\.md$/.test(f)).sort().map((f) => {
    const t = fs.readFileSync(new URL(f, dir), 'utf8');
    return { path: `docs/${field(t, 'slug') ?? f.replace(/^\d+-|\.md$/g, '')}`, title: field(t, 'title'), description: field(t, 'lead') ?? SITE };
  }),
  { path: 'commands', title: 'Commands', description: 'Every /keel command and what it does.' },
  { path: 'skills', title: 'Skills', description: 'The keel skill: name, version and what it does.' },
  { path: 'adr', title: 'Architecture decision records', description: 'The ADR format keel writes into a project.' },
  { path: 'releases', title: 'Releases', description: 'Keel release notes.' },
];
