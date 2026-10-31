---
title: "Building On: Phases & Changes"
lead: "Keel 2.0 is shaped by what four production projects taught over ~2,000 commits: docs stay trustworthy only when every claim carries evidence, and they stay readable only when the journal lives somewhere other than the keystone file."
group: "How It Works"
order: 12
slug: building-on
anchor: building-on
---

## Two units of work

- **Phase**: A gated milestone. `/keel phase new <slug>` scopes it: a plan block with an exit-gate table, reserved ADR stubs (so parallel worktrees never collide on numbers), a workflow script, and a CHANGELOG line. Insert with `--after N`, split with `--split N`; existing numbers never change.
- **Change**: Hotfix-weight work. `/keel change <slug>` gives it a `chg/` branch, a `CHG-xxx` row, and a CHANGELOG line — no phase block, no fan-out script. Phases stop being the unit for one-line fixes.
- **Closeout**: `/keel closeout` generates a phase whose scope is exactly the open deferred items, once the table grows past a threshold or every N phases.

## Claims carry evidence

A ✅ is never bare. Every exit gate records its evidence level — `code-read` \< `unit` \< `integration` \< `local-browser` \< `staging` \< `prod-live` — and the artefact behind it (commit, test report, CI run, browser transcript). Deploy state is tracked separately, in one place: `on-branch → merged → deployed vNN → live-verified`, flipped by the merge step and the deploy procedure, never by prose. A gate whose evidence falls short of what the gate demands stays *partial*; the phase stays open.

## Where things live now

- **AGENTS.md**: The canonical keystone (cross-tool standard); `CLAUDE.md` is `@AGENTS.md` plus Claude-specific sections. Status is a two-row table. Hard budget: 12 KB — doc-sync auto-archives past it.
- **docs/adr/**: One table-based file per decision. Lifecycle `Proposed → Accepted → Built → Superseded`; a single *Build deviation* row is the only post-acceptance edit. No addenda — incidents are postmortems, deploys are log rows.
- **DEPLOYMENT.md**: One doc for every environment: the env matrix, promotion path, build-time vs runtime config table, pre/post-deploy checklists, rollback per component, and the deploy log.
- **CHANGELOG.md**: What shipped and in what deploy state, one line per Phase or Change. The journal that used to bloat the keystone.
- **docs/\<name>/**: Where a doc goes once it outgrows its size budget: `docs/DESIGN.md` becomes a slim index and its sections move to `docs/design/01-….md`, each linking back. See [Archiving & Trimming](./16-archive.md).
- **.claude/agents/**: Repo-local subagents for the doc-sync, security and design roles, written only where the project has no full-time agent for that role. Each returns a fixed Report to its caller.
- **RUNBOOK.md postmortems**: Incidents get a `PM-xxx` row: trigger, root cause, fix, and where the prevention landed. Playbooks are *Symptom · Check · Fix · Escalate* tables.
