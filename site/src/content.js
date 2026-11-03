// Every page's content comes from Keel's own files, read at build time in place (owner: keel-mvvwe9nj).
import release from '../../release.json';
import skillRaw from '../../plugins/keel/skills/keel/SKILL.md?raw';
import adrIndexRaw from '../../plugins/keel/skills/keel/references/templates/adr/README.md?raw';
import adrRecordRaw from '../../plugins/keel/skills/keel/references/templates/adr/ADR-NNN-slug.md?raw';

const files = import.meta.glob('../../docs/site/[0-9]*.md', { query: '?raw', import: 'default', eager: true });

/** Flat `key: value` frontmatter (docs/site/README.md); quotes and trailing comments removed. */
const frontmatter = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta = {};
  for (const line of (m?.[1] ?? '').split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].replace(/\s+#.*$/, '').replace(/^"(.*)"$/, '$1').trim();
  }
  return { meta, body: m ? text.slice(m[0].length) : text };
};

export const pages = Object.entries(files)
  .map(([path, text]) => {
    const file = path.split('/').pop();
    const { meta, body } = frontmatter(text);
    return {
      slug: meta.slug || file.replace(/^\d+-|\.md$/g, ''),
      title: meta.title,
      lead: meta.lead,
      group: meta.group,
      order: Number(meta.order),
      anchor: meta.anchor,
      body,
    };
  })
  .sort((a, b) => a.order - b.order);

export const groups = [...new Set(pages.map((p) => p.group))].map((g) => ({ name: g, pages: pages.filter((p) => p.group === g) }));

/** Old single-page URLs (achatt89.github.io/keel/#upgrade): anchor, or a group hash, to a slug. */
export const anchorToSlug = (hash) => {
  const a = hash.replace(/^#/, '');
  const page = pages.find((p) => p.anchor === a);
  if (page) return page.slug;
  const group = { introduction: 'Introduction', 'getting-started': 'Getting Started', 'how-it-works': 'How It Works', 'document-reference': 'Document Reference' }[a];
  return group ? pages.find((p) => p.group === group)?.slug : null;
};

export { release };

// Skill: frontmatter name, folded description, metadata.version / userVersion.
const skillHead = skillRaw.match(/^---\n([\s\S]*?)\n---/)[1];
export const skill = {
  name: skillHead.match(/^name:\s*(.+)$/m)[1].trim(),
  description: skillHead.match(/^description:\s*>\n([\s\S]*?)\n\S/m)[1].replace(/\s+/g, ' ').trim(),
  version: skillHead.match(/^\s+version:\s*(.+)$/m)?.[1].trim(),
  userVersion: skillHead.match(/^\s+userVersion:\s*(.+)$/m)?.[1].trim(),
};

// Commands: written for users by keel-mvvwe9nj in docs/site/commands.json (name, usage[], summary).
import commandsFile from '../../docs/site/commands.json';
export const commands = commandsFile.commands;

// The record template's guidance quotes '<!-- Keel guidance -->' inside its own comment; drop that first.
const stripGuidance = (t) => t.replace(/<!-- Keel guidance -->/g, '').replace(/<!--[\s\S]*?-->\n*/g, '');
export const adr = { index: stripGuidance(adrIndexRaw), record: stripGuidance(adrRecordRaw) };
