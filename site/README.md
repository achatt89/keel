# site: Keel's React documentation site

Built on the TLA design system, consumed as a package (`@thelogicatelier/ui`), never copied source.
Content is read in place at build time from Keel's own files (owner: keel-mvvwe9nj):
`docs/site/*.md` (pages; frontmatter in `docs/site/README.md`), `release.json` (version, install, release notes;
internal releases collapsed), `plugins/keel/skills/keel/SKILL.md` (commands and skill), and the ADR templates in
`plugins/keel/skills/keel/references/templates/adr/`. Old `#anchor` links land on their page.

## Run locally

```sh
cd site
DS_TGZ=<path to achatt89-tla-ui-1.0.1.tgz> npm run ds:local   # until the package is published
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

Until `@achatt89/tla-ui` is published to GitHub Packages, the dependency is a local tarball in `.ds/` (gitignored).
After the first publish the line becomes `"@thelogicatelier/ui": "npm:@achatt89/tla-ui@1.0.1"` (with `.npmrc`),
and the imports do not change.
