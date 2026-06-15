# Changelog

All notable changes to Keel are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions follow [SemVer](https://semver.org/).

## [0.2.0] — 2026-06-15

Improvements distilled from the first real Keel run (the Ospraye interview). Each change addresses
a specific observation from that session.

### Changed
- **Load references, don't work from memory.** SKILL.md now instructs reading the `references/`
  files (persona banks, catalog, conventions) with the Read tool at each phase, with a fallback to
  locate the skill directory by filename if a relative path doesn't resolve.
- **Confirm the ambition tier** with `AskUserQuestion` instead of asserting it (it scopes the suite).
- **Named rounds, not inferred.** Designer and Delivery/Ops must each run as their own announced
  round; the Designer brand/experience question moves to the *front* of that round.
- **Deeper Security/Compliance:** added data-residency / cross-border-transfer probing, recordings
  & biometrics, and the specific-regime prompt (GDPR / UK-GDPR / UAE-KSA PDPL / CCPA / HIPAA …).
- **Product Manager opens with "where does the data/supply come from on day 1?"** plus an explicit
  adoption-friction question (the MVP-fails-on-human-laziness check).
- **Riskiest-assumption question reframed** to offer 2–3 candidate assumptions via `AskUserQuestion`
  rather than asking cold (which yields "not sure").
- New interview rules: **recommend inline** rather than punting, and **stress-test against real-world
  constraints** (platform ToS/API limits, adoption friction, data-flow feasibility) early.
- COMPLIANCE template gains a **Data residency & cross-border transfer** section.

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
