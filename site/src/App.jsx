import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import {
  TLABadge, TLAContainer, TLAHeader, TLALogo, TLAModeToggle, TLAPanel, TLASection, useTLAViewMode,
} from '@thelogicatelier/ui';
import { adr, adrExample, anchorToSlug, commands, groups, pages, release, skill, skillSummary } from './content.js';

const BASE = import.meta.env.BASE_URL; // '/keel/' or '/'
const href = (p = '') => BASE + p;
const here = () => location.pathname.slice(BASE.length).replace(/\/$/, '');

// Tiny router: internal links change history; the server (Pages) has an index.html per route.
const useRoute = () => {
  const [path, setPath] = useState(here);
  useEffect(() => {
    const onPop = () => setPath(here());
    const onClick = (e) => {
      const a = e.target.closest?.('a[href]');
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || a.origin !== location.origin || !a.pathname.startsWith(BASE)) return;
      e.preventDefault();
      history.pushState(null, '', a.href);
      setPath(here());
      scrollTo(0, 0);
    };
    addEventListener('popstate', onPop);
    document.addEventListener('click', onClick);
    return () => { removeEventListener('popstate', onPop); document.removeEventListener('click', onClick); };
  }, []);
  // Old single-page links (#upgrade, #getting-started) land on their page.
  useEffect(() => {
    const slug = path === '' && location.hash && anchorToSlug(location.hash);
    if (slug) { history.replaceState(null, '', href(`docs/${slug}/`)); setPath(here()); }
  }, [path]);
  return path;
};

// Wide tables scroll inside their own box; the page never scrolls sideways. In cells a hyphenated word
// ('doc-sync') stays whole: CSS can forbid breaks inside a word but not at its hyphen.
const wrapTables = (html) => {
  if (!html.includes('<table>')) return html;
  const t = document.createElement('template');
  t.innerHTML = html;
  for (const table of t.content.querySelectorAll('table')) {
    const box = document.createElement('div');
    box.className = 'kd-table';
    table.replaceWith(box);
    box.append(table);
    // Below 600px each row stacks as a card; every cell carries its column name for that layout.
    const heads = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    const firsts = [...table.querySelectorAll('tr > :first-child')].map((c) => c.textContent.trim().length);
    if (Math.max(...firsts) <= 24) table.classList.add('kd-short-first');
    for (const tr of table.querySelectorAll('tbody tr')) [...tr.children].forEach((td, i) => {
      if (heads[i]) td.setAttribute('data-label', heads[i]);
      const cell = document.createElement('span'); // one grid item per cell in the card layout
      cell.append(...td.childNodes);
      td.append(cell);
    });
    const walk = document.createTreeWalker(table, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walk.nextNode()) if (/\S-\S/.test(walk.currentNode.data)) nodes.push(walk.currentNode);
    for (const n of nodes) {
      const parts = n.data.split(/(\S*\S-\S\S*)/);
      n.replaceWith(...parts.map((p, i) => (i % 2 ? Object.assign(document.createElement('span'), { className: 'kd-nobr', textContent: p }) : p)));
    }
  }
  return t.innerHTML;
};
// Template text: each {{fill-in}} becomes one labelled chip, matched per block by brace depth, so a nested
// fill-in or one that wraps `code` ({{Built `{{commit}}` {{date}}}}) is still a single chip.
const BLOCKS = 'p, li, td, th, h1, h2, h3, h4, h5, h6, pre';
const markFills = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html;
  const blocks = [...t.content.querySelectorAll(BLOCKS)].filter((e) => e.textContent.includes('{{') && !e.querySelector(BLOCKS));
  for (const el of blocks) {
    const text = el.textContent, spans = [];
    for (let i = 0, depth = 0, start = 0; i < text.length - 1; i++) {
      if (text.startsWith('{{', i)) { if (depth++ === 0) start = i; i++; }
      else if (text.startsWith('}}', i) && depth) { if (--depth === 0) spans.push([start, i + 2]); i++; }
    }
    const nodes = []; // [text node, offset of its first char in el.textContent]
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let at = 0; walk.nextNode(); at += walk.currentNode.length) nodes.push([walk.currentNode, at]);
    const point = (pos) => { const [n, at] = nodes.findLast(([, a]) => a <= pos); return [n, pos - at]; };
    for (const [s, e] of spans.reverse()) { // last first: earlier offsets stay valid
      const r = document.createRange();
      r.setStart(...point(s)); r.setEnd(...point(e - 1)); r.setEnd(r.endContainer, r.endOffset + 1);
      const mark = Object.assign(document.createElement('mark'), { className: 'kd-fill', title: 'Fill-in: keel completes this' });
      mark.append(r.extractContents());
      r.insertNode(mark);
    }
  }
  return t.innerHTML;
};
// `file`: a whole document shown inside a page (ADR page): its headings sit two levels down, and its relative
// links (./ADR-001-….md) point at files that are not on this site, so they become plain text.
const asFile = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html;
  for (const h of t.content.querySelectorAll('h1, h2, h3, h4')) {
    const d = document.createElement(`h${Math.min(+h.tagName[1] + 2, 6)}`);
    d.append(...h.childNodes);
    h.replaceWith(d);
  }
  for (const a of t.content.querySelectorAll('a[href^="./"]')) a.replaceWith(...a.childNodes);
  return t.innerHTML;
};
// A docs page links another by its source file (./08-the-interview.md); on the site that is /docs/<slug>/.
const pageLinks = (html) => html.replace(/href="\.\/(\d+-[\w-]+\.md)(#[^"]*)?"/g, (m, f, hash = '') => {
  const p = pages.find((x) => x.file === f);
  return p ? `href="${href(`docs/${p.slug}/`)}${hash}"` : m;
});
// Leads come from frontmatter and may hold entities (&mdash;) or `code`: render them, never print them as text.
const Lead = ({ text }) => <p className="kd-lead" dangerouslySetInnerHTML={{ __html: marked.parseInline(text || '') }} />;
const Md = ({ text, fills, file }) => {
  const html = useMemo(() => {
    let h = pageLinks(marked.parse(text));
    if (file) h = asFile(h);
    if (fills) h = markFills(h); // before wrapTables: its nobr spans would split a {{…}}
    return wrapTables(h);
  }, [text, fills, file]);
  return <div className="kd-prose" dangerouslySetInnerHTML={{ __html: html }} />;
};

const NAV = [['docs/what-is-keel', 'Docs'], ['commands', 'Commands'], ['skills', 'Skills'], ['adr', 'ADRs'], ['releases', 'Releases']];

const Sidebar = ({ path }) => (
  <nav className="kd-side" aria-label="Docs pages">
    {groups.map((g) => (
      <div key={g.name}>
        <p className="kd-side__h">{g.name}</p>
        {g.pages.map((p) => (
          <a key={p.slug} href={href(`docs/${p.slug}/`)} aria-current={path === `docs/${p.slug}` ? 'page' : undefined}>{p.title}</a>
        ))}
      </div>
    ))}
  </nav>
);

// Every install method of the Claude Code entry in release.json install.tools; install.commands is the fallback.
const Install = () => {
  const tool = release.install.tools?.find((t) => t.id === 'claude-code');
  const methods = tool?.methods ?? [{ id: 'plugin', label: 'Plugin', shell: false, commands: release.install.commands }];
  return (
    <>
      {methods.map((m) => (
        <TLAPanel key={m.id} bar={`${tool?.name ?? 'Claude Code'} · ${m.label}`} barRight={m.shell ? 'terminal' : 'in Claude Code'}>
          <pre className="kd-code kd-wrap">{m.commands.map((c) => <span key={c} className="kd-cmd">{c.split(/(?<=\/)/).flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part]))}</span>)}</pre>
        </TLAPanel>
      ))}
      {tool?.start && <p className="kd-muted">Then run <code>{tool.start}</code>. {release.install.note}</p>}
    </>
  );
};

const Home = () => (
  <>
    <h1>Keel</h1>
    <Lead text={pages[0].lead} />
    <p><TLABadge>v{release.latest}</TLABadge> <span className="kd-muted">Latest release, {new Date(release.date + 'T00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}. {release.headline || release.summary}</span></p>
    <Install />
    <h2>Start here</h2>
    <ul className="kd-links">
      {groups.map((g) => <li key={g.name}><a href={href(`docs/${g.pages[0].slug}/`)}>{g.name}</a> <span className="kd-muted">{g.pages.length} {g.pages.length === 1 ? "page" : "pages"}</span></li>)}
    </ul>
  </>
);

const Doc = ({ page }) => {
  const i = pages.indexOf(page);
  return (
    <article>
      <p className="kd-muted">{page.group}</p>
      <h1>{page.title}</h1>
      <Lead text={page.lead} />
      <Md text={page.body} />
      <nav className="kd-pager" aria-label="Previous and next page">
        {pages[i - 1] ? <a href={href(`docs/${pages[i - 1].slug}/`)}>← {pages[i - 1].title}</a> : <span />}
        {pages[i + 1] && <a href={href(`docs/${pages[i + 1].slug}/`)}>{pages[i + 1].title} →</a>}
      </nav>
    </article>
  );
};

const Commands = () => (
  <>
    <h1>Commands</h1>
    <p className="kd-lead">Every mode of the keel skill. Run them in Claude Code.</p>
    {commands.map((c) => (
      <section key={c.name} className="kd-card">
        <h2>{c.name}</h2>
        <p>{c.usage.map((u) => <code key={u}>{u}</code>).reduce((a, b) => [a, ' · ', b])}</p>
        <p>{c.summary}</p>
      </section>
    ))}
  </>
);

const Skills = () => (
  <>
    <h1>Skills</h1>
    <p className="kd-lead">Keel ships one skill. This is what it does, and every mode it has.</p>
    <section className="kd-card">
      <h2>{skill.name} <TLABadge>v{skill.userVersion || skill.version}</TLABadge></h2>
      <Md text={skillSummary} />
      <details className="kd-raw">
        <summary>Exactly what Claude reads</summary>
        <p>The text below is the skill's own description: the words Claude Code matches your request against when it decides to run keel. It is written for the machine, which is why it reads like a list of phrases.</p>
        <p>{skill.description}</p>
      </details>
    </section>
  </>
);

const Adr = () => (
  <>
    <h1>Architecture decision records</h1>
    <p className="kd-lead">The decision record Keel writes into a project: a worked example first, then the blank it starts from.</p>
    <h2>Example: Larder</h2>
    <p>What keel writes for Larder, a made-up meal-planning app.</p>
    <p className="kd-file">The index · <code>docs/adr/README.md</code></p>
    <Md text={adrExample.index} file />
    <p className="kd-file">One record · <code>docs/adr/ADR-002-offline-storage.md</code></p>
    <Md text={adrExample.record} file />
    <section className="kd-template" aria-labelledby="adr-template">
      <h2 id="adr-template">Template</h2>
      <p>This is the file before your answers go in. Each highlighted blank is filled from your interview.</p>
      <p className="kd-file">The index · <code>docs/adr/README.md</code></p>
      <Md text={adr.index} file fills />
      <p className="kd-file">One record · <code>docs/adr/ADR-NNN-slug.md</code></p>
      <Md text={adr.record} file fills />
    </section>
  </>
);

const Release = ({ v }) => (
  <section className="kd-card">
    <h2>{v.version} <span className="kd-muted">{v.date}</span></h2>
    <Md text={v.notes || v.summary} />
  </section>
);
const Releases = () => {
  const user = release.versions.filter((v) => v.audience !== 'internal');
  const internal = release.versions.filter((v) => v.audience === 'internal');
  return (
    <>
      <h1>Releases</h1>
      <p className="kd-lead">Latest: v{release.latest}.</p>
      {user.map((v) => <Release key={v.version} v={v} />)}
      {internal.length > 0 && (
        <details className="kd-card">
          <summary>{internal.length} internal releases</summary>
          {internal.map((v) => <Release key={v.version} v={v} />)}
        </details>
      )}
    </>
  );
};

export const App = () => {
  const path = useRoute();
  useEffect(() => useTLAViewMode.getState().syncFromDocument(), []);
  const page = pages.find((p) => path === `docs/${p.slug}`);
  const known = path === '' || page || ['commands', 'skills', 'adr', 'releases'].includes(path);
  const title = page?.title ?? NAV.find(([p]) => p === path)?.[1];
  useEffect(() => { document.title = title ? `${title} · Keel docs` : 'Keel docs'; }, [title]);
  return (
    <>
      <TLAHeader
        page={path}
        logo={<TLALogo as="a" href={href()} label="Keel docs, home" />}
        sheetLogo={<TLALogo />}
        nav={NAV.map(([p, label]) => ({ label, href: href(`${p}/`), current: path === p || (label === 'Docs' && !!page) }))}
        toggle={<TLAModeToggle />}
      />
      <main id="main">
        <TLASection>
          <TLAContainer>
            <div className={page ? 'kd-docs' : 'kd-page'}>
              {page && <Sidebar path={path} />}
              <div className="kd-main">
                {path === '' && <Home />}
                {page && <Doc page={page} />}
                {path === 'commands' && <Commands />}
                {path === 'skills' && <Skills />}
                {path === 'adr' && <Adr />}
                {path === 'releases' && <Releases />}
                {!known && (<><h1>Page not found</h1><p><a href={href()}>Back to the docs home</a></p></>)}
              </div>
            </div>
          </TLAContainer>
        </TLASection>
      </main>
    </>
  );
};
