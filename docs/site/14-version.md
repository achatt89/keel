---
title: "Checking Your Version"
lead: "/keel version answers three questions in one line each: what version of the keel skill is installed, what version last touched this project's docs, and whether a newer keel is published."
group: "How It Works"
order: 14
slug: version
anchor: version
---

It's read-only — no permission prompt, no edits, nothing written. Run it any time you're unsure whether your docs are current, or before deciding whether to run `/keel upgrade`.

| Line | Source |
| --- | --- |
| Installed keel skill | Read straight from the running `SKILL.md`'s own frontmatter — always accurate, no I/O. |
| This project's docs | `.keel/meta.json`'s `keelVersion`, written at generation and updated by every `/keel upgrade` or `/keel archive`. Flagged as behind if older than the installed skill. |
| Latest published | Best-effort fetch of the plugin manifest from GitHub, when a fetch tool is available this session. Never blocks — skipped silently if it can't reach it. |
| Budgets | `node .keel/doc-size.mjs`: one verdict per doc with its reason (`ok`, `waived`, `archive`, `split` or `manual`), each split doc shown as its index plus parts (each file counted once), and any broken link between an index and its parts. |

> If your project's docs are behind the installed skill, `/keel version` tells you and points you straight at `/keel upgrade`.

## Automatic update check

From 2.1, every `/keel` invocation in a documented project prints at most one line when keel is out of date: *docs on X, installed Y, run `/keel upgrade`*, or *keel Z available*. The version stamp is `.keel/meta.json`'s `keelVersion`. The only network call is one read of keel's published `plugin.json`; nothing is sent and nothing is written. Offline, it says nothing.

Projects can also opt in to a session-start hook (`.claude/hooks/keel-update-check.mjs`) that does the same check without invoking keel. Turn both off with `KEEL_NO_UPDATE_CHECK=1` or `"updateCheck": false` in `.keel/meta.json`.

## Release notes and the release feed

Every release publishes two generated files at the root of the keel repo, both built from `CHANGELOG.md`:

- **RELEASE.md**: The latest release notes for people: version, date, summary, install and update commands, and the full entry.
- **release.json**: The same for machines: version, date, summary, highlights, tag and compare links, install commands, minimum requirements, and every past version with its notes in Markdown. Its format is `schemas/release-v1.schema.json` (schema version 1). Within version 1, fields are only ever added, so readers should ignore fields they don't know.

`node scripts/release.mjs --check` fails if either file is out of date or if any version stamp (plugin manifest, marketplace, skill, project template, this site's badge) disagrees with the changelog. A CI workflow runs it on every push, pull request and release tag, and also checks that the tag matches the version.
