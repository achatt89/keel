---
title: "Checking Your Version"
lead: "/keel version answers three questions in one line each: what version of the keel skill is installed, what version last touched this project's docs, and whether a newer keel is published."
group: "How It Works"
order: 14
slug: version
anchor: version
---

It is read-only: no permission prompt, no edits, nothing written. Run it any time you are unsure whether your docs are current, or before deciding whether to run `/keel upgrade`.

| Line | Source |
| --- | --- |
| Installed keel skill | Read straight from the running `SKILL.md`'s own frontmatter: always accurate, no I/O. |
| This project's docs | `.keel/meta.json`'s `keelVersion`, written at generation and updated by every `/keel upgrade` or `/keel archive`. Flagged as behind if older than the installed skill. |
| Latest published | Best-effort fetch of the plugin manifest from GitHub, when a fetch tool is available this session. Never blocks; skipped silently if it cannot reach it. |
| Budgets | `node .keel/doc-size.mjs`: one verdict per doc with its reason (`ok`, `waived`, `archive`, `split` or `manual`), each split doc shown as its index plus parts (each file counted once), and any broken link between an index and its parts. |

> If your project's docs are behind the installed skill, `/keel version` tells you and points you straight at `/keel upgrade`.

## Drift check

`/keel check` asks a different question: do the docs still match the repo? A script (`.keel/check.mjs`, installed by generation and by every `/keel upgrade`) compares them first, with no model call:

- keel files every project needs (`AGENTS.md`, `CLAUDE.md`, `.keel/meta.json`, `.keel/doc-size.mjs`);
- relative links and `#heading` anchors that lead nowhere;
- the ADR index against the ADR files: a row with no file, a file with no row, a status that differs, or a supersession by an ADR that does not exist;
- the header on a new ADR (an id or status that disagrees with the file), and area rules in `.claude/rules/` with no paths or naming a record that does not exist;
- the plan: a finished phase with an open gate, or whose evidence, artefact or deliverable path is gone, and an unfinished phase with no workflow script;
- a decision record that still says *not built* for phases the plan shows done, or is still *Accepted* when its phase is done (2.6.2);
- a README code example or error table with no marker naming the file that tests it (2.6.3);
- a status line in `AGENTS.md` or `CLAUDE.md` that still says a phase is on its branch after the plan shows it merged, or a README that still says no phase is built, and a business-requirements assumption with no source, in projects whose Assumptions table has a Source column (2.6.4);
- a row in the `AGENTS.md` or `CLAUDE.md` tables (such as the hard-invariants Gap cell) that says *not built* for a phase the plan shows built, a README or keystone line that calls an Accepted or Built decision record *reserved* or *proposed*, and an unticked deliverable in a finished phase whose files exist (2.6.5);
- runtime dependencies in `package.json`, `requirements.txt`, `go.mod` or `Cargo.toml` that no design or decision doc names.

When the script finds nothing, keel prints its summary line and stops. Only when there are findings does Claude read the cited lines, say which are real, and name the mode that fixes each one. Nothing is written, ever: fixes happen in doc-sync, `/keel upgrade` or `/keel archive`. An ADR's decision text is never edited (only its Status cell and Build deviation row change, in doc-sync), so a dead link inside one is fixed at its target. Run `node .keel/check.mjs` yourself, or in CI: it exits 1 when there are findings.

## Automatic update check

From 2.1, every `/keel` invocation in a documented project prints at most one line when keel is out of date: *docs on X, installed Y, run `/keel upgrade`*, or *keel Z available*. The version stamp is `.keel/meta.json`'s `keelVersion`. The only network call is one read of the published keel `plugin.json`; nothing is sent and nothing is written. Offline, it says nothing.

Projects can also opt in to a session-start hook (`.claude/hooks/keel-update-check.mjs`) that does the same check without invoking keel. Turn both off with `KEEL_NO_UPDATE_CHECK=1` or `"updateCheck": false` in `.keel/meta.json`.

## Release notes and the release feed

Every release publishes two generated files at the root of the keel repo, both built from `CHANGELOG.md`:

- **RELEASE.md**: The latest release notes for people: version, date, summary, install and update commands, and the full entry.
- **release.json**: The same for machines: version, date, summary, highlights, tag and compare links, install commands, minimum requirements, and every past version with its notes in Markdown. Its format is `schemas/release-v1.schema.json` (schema version 1). Within version 1, fields are only ever added, so readers should ignore fields they do not know.

`node scripts/release.mjs --check` fails if either file is out of date or if any version stamp (plugin manifest, marketplace, skill, project template) disagrees with the changelog. A CI workflow runs it on every push, pull request and release tag, and also checks that the tag matches the version.
