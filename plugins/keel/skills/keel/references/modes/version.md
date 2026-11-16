# Keel mode: version

Loaded by the router (`SKILL.md`, "Modes"). The router's Operating principles, Update check and
"Writing into split docs" apply here. Upgrade Mode is in `upgrade.md`.

## Version Mode — `/keel version`

**Trigger:** user says "keel version", "what version of keel is this", "check keel version", "is
my keel up to date", "which keel version generated these docs", "check for keel updates", or any
equivalent phrasing.

**Purpose:** two different questions get conflated as "what version is this" — *the skill version
actually running* vs. *the version that last touched this project's docs* — plus, best-effort,
*whether a newer keel exists to update to*. Answer all three, distinctly.

**Read-only. No permission gate, no edits, no report file.** Reply inline and stop.

### What to check

1. **Installed skill version** — this SKILL.md's own frontmatter `metadata.version`. This is the
   version actually executing this command right now; no file I/O needed, always accurate.
   `metadata.userVersion` is the newest **user-facing** release it contains (later releases were
   internal: no visible change). Compare project docs against `userVersion`, so a project behind
   only by internal releases is reported as current.
2. **Project doc version** — only if run inside a project with keel-generated docs (same ≥3-doc
   detection as Upgrade Mode):
   - If `.keel/meta.json` exists, read `keelVersion` (the version that generated or last touched
     the docs), `docFormat` (absent = format 1), plus `lastUpgraded` / `lastArchived` if present.
   - If keel docs are present but `.keel/meta.json` is absent, the project predates version
     tracking (pre-v0.3, or generated before this file existed) — say so; don't guess a version.
   - Compare the project's `keelVersion` to the installed skill version from step 1:
     - Older → flag it: *"This project's docs were last touched by v{{X}}; the installed skill is
       v{{Y}} — run `/keel upgrade` to pick up what's new."*
     - Equal → *"Docs are current with the installed skill."*
     - `docFormat` missing or `< 2` → add: *"Doc format 1 (single ADR.md, prose status) — `/keel
       upgrade` will offer the format-2 migration."*
   - **Budgets.** Run `node .keel/doc-size.mjs` from the project root (read-only; if the project
     has no copy, run this skill's own `references/templates/keel-doc-size.mjs` the same way) and report size vs budget per file, split
     families (index + N parts = total), each doc's verdict (ok / waived / archive / split /
     manual) with its reason, and any
     LINK ERROR — the same check doc-sync runs, so a session can see what the next doc-sync will do.
   - If not run inside a keel project at all, skip this step and say so (nothing to compare).
3. **Latest published version** — best-effort only, never blocking:
   - If a fetch-capable tool is available this session, fetch
     `https://raw.githubusercontent.com/achatt89/keel/main/release.json` and read `version` (what
     an install gives) and `latest` (newest user-facing release; absent in old feeds = `version`).
   - `latest` newer than the installed skill → say so, naming `version` as what they will get and give the update path exactly as documented (the
     docs site's own "Update" instructions): `/plugin marketplace update thelogicatelier` then
     `/plugin install keel@thelogicatelier`, then restart Claude Code. (`plugin install` alone
     reads the local cache and will reinstall the version already known — `marketplace update`
     must run first.)
   - `latest` not newer (even if `version` is: only internal releases since) → "you're on the
     latest" — never advertise an internal-only release.
   - No fetch tool, offline, or the fetch fails → skip this step silently. The two local checks
     above already answer the question that matters most for someone mid-session.

### Output format

A compact status block, not a report document:
```
Installed keel skill: v{{X}}
This project's docs: v{{Y}}, format {{1|2}} (last touched {{date}}) — {{behind, run /keel upgrade | current}}
Latest published: v{{Z}} — {{update available, see below | you're on it | couldn't check}}
Budgets: AGENTS.md {{9.8KB}}/12KB ✅ · CLAUDE.md {{1.2KB}}/12KB ✅ · docs/IMPLEMENTATION_PLAN.md {{71KB}}/64KB ⚠️ over — next doc-sync will auto-archive
```

