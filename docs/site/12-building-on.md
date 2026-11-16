---
title: "Phases and Changes"
lead: "Keel 2.0 is shaped by what four real projects taught: docs stay trustworthy only when every claim carries evidence, and they stay readable only when the running history lives in the changelog instead of the one file every session reads."
group: "How It Works"
order: 12
slug: building-on
anchor: building-on
---

## Two units of work

- **Phase**: A gated milestone. `/keel phase new <slug>` scopes it: a plan block with an exit-gate table, reserved ADR stubs (so parallel worktrees never collide on numbers), a workflow script, and a CHANGELOG line. Insert with `--after N`, split with `--split N`; existing numbers never change.
- **Change**: Hotfix-weight work. `/keel change <slug>` gives it a `chg/` branch, a `CHG-xxx` row, and a CHANGELOG line. No phase block, no fan-out script. Phases stop being the unit for one-line fixes.
- **Closeout**: `/keel closeout` generates a phase whose scope is exactly the open deferred items, once the table grows past a threshold or every N phases. It is numbered N.5 after the current phase, or the next free number if N.5 is taken; existing phases are never renumbered.

## Claims carry evidence

README examples are tested too: each lives in `examples/` and runs in a test, and each documented error code has a test that triggers it, so a wrong example fails Verify. A ✅ is never bare. Every exit gate records its evidence level (`code-read` \< `unit` \< `integration` \< `local-browser` \< `staging` \< `prod-live`) and the artefact behind it (commit, test report, CI run, browser transcript). Deploy state is tracked separately, in one place: `on-branch → merged → deployed vNN → live-verified`, flipped by the merge step and the deploy procedure, never by prose. A gate whose evidence falls short of what the gate demands stays *partial*; the phase stays open. Verify runs a real check before calling anything done, and a check counts only once it has been seen to fail on broken code: the record says how in `failSeen`. `node .keel/doc-size.mjs --evidence` rejects a Verify record that claims `prod-live` or a met gate with no proof the check can fail.

## Where things live now

- **AGENTS.md**: The canonical keystone (cross-tool standard); `CLAUDE.md` is `@AGENTS.md` plus a few Claude-specific lines. Each workflow step is one line; the detail lives in the plan's standing rules and the workflow README, so a fresh project loads about 8 KB at session start. Status is a two-row table. Hard budget: 12 KB; doc-sync auto-archives past it.
- **docs/adr/**: One table-based file per decision. Lifecycle `Proposed → Accepted → Built → Superseded`; a single *Build deviation* row is the only post-acceptance edit. No addenda: incidents are postmortems, deploys are log rows. From 2.6 a new record opens with a short header (id, status, the code paths it governs, and the check that proves it holds); older records keep their text and get no header.
- **.claude/rules/**: Area rules, one file per area of the code, each with the paths it covers. Claude Code loads a file only when you touch matching files. Each rule is a line or two that names the decision record or NFR to read; it never copies the record. `/keel check` reports a rules file without paths and any rule that names a record that does not exist.
- **DEPLOYMENT.md**: One doc for every environment: the env matrix, promotion path, build-time vs runtime config table, pre/post-deploy checklists, rollback per component, and the deploy log.
- **CHANGELOG.md**: What shipped and in what deploy state, one line per Phase or Change. The journal that used to bloat the keystone.
- **docs/\<name>/**: Where a doc goes once it outgrows its size budget: `docs/DESIGN.md` becomes a slim index and its sections move to `docs/design/01-….md`, each linking back. See [Archiving and Trimming](./16-archive.md).
- **.claude/agents/**: Repo-local subagents for the doc-sync, security and design roles, written only where the project has no full-time agent for that role. Each returns a fixed Report to its caller.
- **RUNBOOK.md postmortems**: Incidents get a `PM-xxx` row: trigger, root cause, fix, and where the prevention landed. Playbooks are *Symptom · Check · Fix · Escalate* tables.
