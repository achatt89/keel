# site: Keel's React documentation site

Built on the TLA design system, consumed as a package (`@thelogicatelier/ui`), never copied source.
Content is read in place at build time from Keel's own files (owner: keel-mvvwe9nj):
`docs/site/*.md` (pages; frontmatter in `docs/site/README.md`), `release.json` (version, install, release notes;
internal releases collapsed), `plugins/keel/skills/keel/SKILL.md` (commands and skill), and the ADR templates in
`plugins/keel/skills/keel/references/templates/adr/`. Old `#anchor` links land on their page.

## Run locally

```sh
cd site
export NODE_AUTH_TOKEN=$(gh auth token)   # classic token with read:packages (gh auth refresh -s read:packages)
npm install
npm run dev        # http://127.0.0.1:4420/
```

## Build

`npm run build` writes `dist/` with one `index.html` per route and a `404.html`, so GitHub Pages serves deep links.
Default target: **keel.thelogicatelier.com** at base `/` — the build writes `CNAME`, per-route canonical and
Open Graph tags, `sitemap.xml` and `robots.txt` for that host. For achatt89.github.io/keel/ instead:
`DOCS_DOMAIN= BASE_PATH=/keel/ npm run build`.

Deploy: `deploy/pages.yml`, inactive until cutover. `docs/` stays the live site until then.

## The design-system package

`"@thelogicatelier/ui": "npm:@achatt89/tla-ui@1.0.1"`, a private package on GitHub Packages. `.npmrc` points the
`@achatt89` scope at `npm.pkg.github.com` and reads `NODE_AUTH_TOKEN`; no token is committed. Code imports
`@thelogicatelier/ui`. When the package moves to npm, only the dependency line changes.
