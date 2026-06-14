# Changelog

All notable changes to Keel are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions follow [SemVer](https://semver.org/).

## [0.1.0] — 2026-06-14

Initial release.

### Added
- `keel` skill: a multi-persona interview → adaptive documentation generator for greenfield
  software projects.
- Orchestrator (`SKILL.md`) defining the four-phase workflow: intake → multi-persona interview →
  adaptive doc-set proposal → generation & handoff.
- Reference library: `interview-personas.md` (six-persona panel + question banks),
  `document-catalog.md` (adaptive selection + dependency order), `conventions.md` (house style, ID
  schemes, cross-reference syntax, immutability rules), `almanac-guide.md`.
- 18 reusable document templates (BRD, PRD, ENGINEERING_DESIGN, ARCHITECTURE, HLD, LLD, ADR, NFR,
  DESIGN, COMPLIANCE, THREAT_MODEL, CONNECTOR_SPEC, IMPLEMENTATION_PLAN, COMMANDS, RUNBOOK,
  CLAUDE.md, docs/README, almanac/README).
- **Ways-of-working interview + generation:** the Delivery/Ops round always covers git-from-commit-
  one, branch-per-feature, parallel agents in isolated `git worktree`s, and per-chunk/phase doc
  sync; these answers populate the git/working-workflow in the generated `CLAUDE.md` and the
  `IMPLEMENTATION_PLAN` standing rules.
- **Threat-model & harden pass (Phase 4, opt-in):** adversarially threat-models the generated docs
  and fixes weaknesses *directly in the spec* (controls, `NFR-SEC`, ADRs, exit gates), recording
  threats in `THREAT_MODEL.md`/risk register only for traceability — never as a substitute for the
  fix.
- Claude Code plugin packaging (`plugin.json`) and marketplace manifest (`marketplace.json`) for
  first-class `/plugin install`.
