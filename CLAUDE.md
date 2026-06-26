# Keel — Project CLAUDE.md

## What this is
keel is a Claude Code plugin/skill that interviews founders about a greenfield idea and generates a tailored, cross-referenced suite of foundational documents to build from.

## Quick orientation

| Path | What |
|------|------|
| plugins/keel/.claude-plugin/plugin.json | Plugin manifest |
| plugins/keel/skills/keel/SKILL.md | Skill definition (the agent brain) |
| plugins/keel/skills/keel/references/ | Interview personas, document catalog, conventions, templates |
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
v0.2.0 — stable. GitHub Pages docs site added. Impeccable + modern-web-guidance hooks active.
