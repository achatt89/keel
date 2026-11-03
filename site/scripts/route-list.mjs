// Node side of the route list (the app derives the same slugs in src/content.js).
import fs from 'node:fs';
const dir = new URL('../../docs/site/', import.meta.url);
const slugOf = (file, text) => (text.match(/^slug:\s*"?([^"\n#]+?)"?\s*(#.*)?$/m)?.[1] ?? file.replace(/^\d+-|\.md$/g, '')).trim();
export const routes = () => [
  ...fs.readdirSync(dir).filter((f) => /^\d+-.*\.md$/.test(f)).map((f) => `docs/${slugOf(f, fs.readFileSync(new URL(f, dir), 'utf8'))}`),
  'commands', 'skills', 'adr', 'releases',
];
