# Keel — Project CLAUDE.md

## What this is
keel is a Claude Code plugin/skill that interviews founders about a greenfield idea and generates a tailored, cross-referenced suite of foundational documents to build from.

## Quick orientation

| Path | What |
|------|------|
| plugins/keel/.claude-plugin/plugin.json | Plugin manifest |
| plugins/keel/skills/keel/SKILL.md | Skill definition (the agent brain) |
| plugins/keel/skills/keel/references/ | Interview personas, document catalog, conventions, templates (`templates/adr/`, `templates/workflows/`), upgrade + archive guides |
| .agents/skills/modern-web-guidance/ | Modern web guidance skill (auto-pulled) |
| .claude/skills/impeccable/ | Impeccable FE quality skill |
| docs/ | GitHub Pages documentation site |
| skills-lock.json | Installed skills manifest |

## Active skills in this project

**impeccable** (FE quality): PostToolUse hook fires after Edit/Write on UI files in docs/.
Invoke: /impeccable audit docs/
Key commands: audit, critique, polish, typeset, adapt, harden

**modern-web-guidance**: PostToolUse reminder fires when HTML/CSS/JS files are edited.
Invoke: npx -y modern-web-guidance@latest search "<query>"
Trigger: any HTML/CSS/JS/TS edit in docs/

## Working agreements
- Branch per feature off main
- Parallel work in separate git worktrees: git worktree add -b feat/name ../keel-feat-name
- Commit messages: conventional commits (feat:, fix:, docs:, chore:)
- FE changes in docs/: consult modern-web-guidance first, impeccable audit after
- After each significant change: update CHANGELOG.md

## Document locations
keel documents projects using the templates in references/templates/. The document it generates for this REPO (what you're reading) is itself a usage of the keel convention.

## Current status
v2.4.2 — one verdict per doc from `doc-size.mjs` (ok/waived/archive/split/manual + reason);
archives never budgeted/split; ADR folder no longer mistaken for a split; ADR index budget scales;
waivers in meta.json (reason + reviewed); keystone moves sections out, never compresses;
idempotent `--split`. Fixes cortextOS 2.4.1 upgrade conflicts. Merged to main.

v2.4.1 — split-aware doc sync: `doc-size.mjs --split` (deterministic, verbatim, fence-safe, repoints
anchored links; self-test appends to an over-limit doc and asserts the split); doc-sync rules +
subagent write into parts not the index; caller review checks index/links/size; size+link check is
the last step before commit. Docs site covers split layout everywhere. Merged to main.

v2.4.0 — oversize docs are split, not just warned about: archive closed detail first, then split
into `docs/<name>/NN-<slug>.md` behind a slim index (keystone never split). `keel-doc-size.mjs`
measures each file once and fails on missing parent↔part links; wired into doc-sync (Split stage),
generation, `/keel version`, upgrade (propose, apply on approval) and archive. Merged to main.

v2.3.0 — doc-sync role (`.claude/agents/doc-sync.md` unless a full-time doc agent exists): the
caller delegates doc sync before the completing commit, reviews the `## Report`, ≤3 feedback rounds,
leftovers → deferred items (`doc-sync.js` Sync stage; phase scripts call it). Report-back delegation
model (AGENTS.md "Delegation"); all three subagent templates carry a fixed Report block. Merged to main.

v2.2.0 — review roles are repo-local subagents (`.claude/agents/security.md`, `design.md`) unless a
full-time agent for the role exists (then it gets the skill); no orchestrator hire/spawn requests.
AGENTS.md step 9 "Review before done", evidence retention (`keel-evidence-prune.mjs`, doc-sync Prune),
`/keel upgrade` migrates 2.1 agent requests. Merged to main.

v2.1.0 — security-audit skill offer (global, ask-first, source + sha shown), permanent security and
design agents (hand to an existing one, else orchestrator request or `.claude/agents/<role>.md`),
Verify stage calls them, per-invocation update check + opt-in SessionStart hook. Merged to main.

v2.0.0 — doc format 2 (merged). Evidence ladder + deploy-state
ladder, per-file table-based ADRs (no addenda), AGENTS.md canonical keystone with byte budgets and
doc-sync auto-archive, Verify stage writing `.keel/evidence/`, ADR reservation at scope, two work
units (`/keel phase new`, `/keel change`) + `/keel closeout`, new DEPLOYMENT / CHANGELOG / SPIKE /
COST_ANALYSIS / AUDIT / FEEDBACK_ROUNDS templates, and a 1.x → 2.0 `FORMAT_MIGRATION` path in
`/keel upgrade`. Origin: retrospective across mysha, interview-strategist, ospraye, cortextOS.
