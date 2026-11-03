# docs/site — docs source for keel.thelogicatelier.com

The site at keel.thelogicatelier.com is built from these files by `site/` in this repo (layout and
the TLA design system: Andy; content: Keel). Until the founder approves the new site, the live
docs stay at `docs/index.html` (GitHub Pages).

## One file per page

`NN-<slug>.md`, where `NN` is the page's order across the whole site. Body: GitHub-flavoured
Markdown. Callouts are written as `> **Note:** text`. No raw HTML.

## Frontmatter (all fields required except slug)

```yaml
---
title: Upgrading Existing Projects    # page and sidebar title
lead: Audit and bring older keel docs up to the current standard.   # one-line intro
group: Using keel                      # sidebar heading
order: 15                              # position across the whole site (same as NN)
slug: upgrade                          # URL /docs/<slug>/; default: file name without NN-
anchor: upgrade                        # the hash in old URLs (achatt89.github.io/keel/#upgrade), without '#'
---
```

Old URLs also use four group hashes with no page of their own — `#introduction`,
`#getting-started`, `#how-it-works`, `#document-reference` — which go to the first page of that group.

**Until cutover both are live:** a docs change edits the page here AND `docs/index.html`.

Release notes are not pages here: the site reads `release.json` (schema
`schemas/release-v1.schema.json`).
