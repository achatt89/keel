import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import {
  TLABadge, TLAContainer, TLAHeader, TLALogo, TLAModeToggle, TLAPanel, TLASection, useTLAViewMode,
} from '@thelogicatelier/ui';
import { adr, anchorToSlug, commands, groups, pages, release, skill } from './content.js';

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

const Md = ({ text }) => <div className="kd-prose" dangerouslySetInnerHTML={{ __html: useMemo(() => marked.parse(text), [text]) }} />;

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
          <pre className="kd-code">{m.commands.join('\n')}</pre>
        </TLAPanel>
      ))}
      {tool?.start && <p className="kd-muted">Then run <code>{tool.start}</code>. {release.install.note}</p>}
    </>
  );
};

const Home = () => (
  <>
    <h1>Keel</h1>
    <p className="kd-lead">{pages[0].lead}</p>
    <p><TLABadge>v{release.latest}</TLABadge> <span className="kd-muted">{release.summary}</span></p>
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
      <p className="kd-lead">{page.lead}</p>
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
    <p className="kd-lead">Keel ships one skill.</p>
    <section className="kd-card">
      <h2>{skill.name} <TLABadge>v{skill.userVersion || skill.version}</TLABadge></h2>
      <p>{skill.description}</p>
    </section>
  </>
);

const Adr = () => (
  <>
    <h1>Architecture decision records</h1>
    <p className="kd-lead">The ADR format keel writes into a project: the index, and one record.</p>
    <h2>The index (docs/adr/README.md)</h2>
    <Md text={adr.index} />
    <h2>One record (docs/adr/ADR-NNN-slug.md)</h2>
    <Md text={adr.record} />
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
