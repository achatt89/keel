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
- Claude Code plugin packaging (`plugin.json`) and marketplace manifest (`marketplace.json`) for
  first-class `/plugin install`.
