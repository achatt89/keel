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
v2.0.0 — doc format 2, on branch `feat/keel-2.0` (not yet merged). Evidence ladder + deploy-state
ladder, per-file table-based ADRs (no addenda), AGENTS.md canonical keystone with byte budgets and
doc-sync auto-archive, Verify stage writing `.keel/evidence/`, ADR reservation at scope, two work
units (`/keel phase new`, `/keel change`) + `/keel closeout`, new DEPLOYMENT / CHANGELOG / SPIKE /
COST_ANALYSIS / AUDIT / FEEDBACK_ROUNDS templates, and a 1.x → 2.0 `FORMAT_MIGRATION` path in
`/keel upgrade`. Origin: retrospective across mysha, interview-strategist, ospraye, cortextOS.
