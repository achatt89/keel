<!--
  Keel template — CHANGELOG.md (what shipped, in what state)
  WHAT: The project's release history in Keep-a-Changelog form. Every merged unit of work
        (Phase, Change, hotfix) gets a line under [Unreleased], written by doc-sync. Each
        line carries its DEPLOY STATE, which flips as the work travels through
        DEPLOYMENT.md §2's promotion path.
  INCLUDE WHEN: always. It is the journal that keeps CLAUDE.md/AGENTS.md's status to
        two rows and keeps ADRs free of "merged / deployed / live-verified" addenda.
  DEPENDS ON: doc-sync (writes [Unreleased]); DEPLOYMENT.md §7 (the deploy log that
        justifies a state flip); IMPLEMENTATION_PLAN.md (Phase / CHG-xxx refs);
        docs/adr/ (ADR-xxx refs).
  OWNS: release version numbers. Nothing else — every line references an ID owned
        elsewhere.
  KEY RULE: one line per unit of work, one state tag per line, refs on every line. Prose
        about HOW it was built belongs in the phase's evidence table or PHASE_ARCHIVE.md,
        not here. Overflow (releases older than {{N}}) is relocated by `/keel archive`.
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# Changelog — {{PROJECT_NAME}}

All notable changes to {{PROJECT_NAME}}. Format follows [Keep a Changelog](https://keepachangelog.com/);
versions follow {{SemVer / date-based `YYYY.MM.DD` / platform release numbers `vNN`}}.

**Deploy-state tags** (from `conventions.md`; one per line, flipped in place as the work moves):

| Tag | Meaning | Flipped by |
|---|---|---|
| `[on-branch]` | built and gated, not yet on trunk | doc-sync (initial write) |
| `[merged]` | on `main` | the Merge step |
| `[deployed vNN]` | running in production as release `vNN` | the deploy — with a DEPLOYMENT.md §7 row |
| `[live-verified]` | DEPLOYMENT.md §5 checklist passed on the real domain | the deployer, same day |

<!-- Keel guidance: lines are `- <what> — <refs> <state>`. Refs are IDs, not prose:
     `Phase 3`, `CHG-012`, `ADR-041`, `PM-003`, `FR-02`. Group under Added / Changed / Fixed /
     Removed / Security as Keep-a-Changelog does. Never delete a line; a reverted change gets
     a new line under Removed with the reverting commit. -->

---

## [Unreleased]

<!-- Keel guidance: doc-sync appends here on every merge. Release stamping (below) moves
     the block under a version heading; lines keep their state tags. -->

### Added
- {{Feature — one line}} — Phase {{N}}, ADR-{{xxx}} `[merged]`

### Changed
- {{Behaviour change — one line}} — CHG-{{xxx}} `[on-branch]`

### Fixed
- {{Bug — one line}} — CHG-{{xxx}}, PM-{{xxx}} `[merged]`

### Security
- {{Control added / gap closed}} — {{SEC-xxx}}, ADR-{{xxx}} `[merged]`

---

## Release stamping

<!-- Keel guidance: when a deploy lands, the deployer (or the deploy script) does exactly this:
     1. Add a DEPLOYMENT.md §7 row for the deploy.
     2. Rename `## [Unreleased]` → `## [vNN] — YYYY-MM-DD` and open a fresh `## [Unreleased]`.
     3. Flip every line in the new block from `[merged]` → `[deployed vNN]`.
     4. After the §5 checklist passes, flip to `[live-verified]`.
     Lines still `[on-branch]` at stamp time were not in the deploy — leave them under
     [Unreleased]. -->

A release heading is created only by a production deploy, never by a merge.

```
## [{{vNN}}] — {{YYYY-MM-DD}}   ← commit {{abc1234}} · DEPLOYMENT.md §7 row
```

---

## [{{v1}}] — {{YYYY-MM-DD}}

### Added
- {{First shipped capability}} — Phase 0–{{N}} `[live-verified]`

---

*Older releases: `docs/PHASE_ARCHIVE.md#changelog` (relocated by `/keel archive`, nothing deleted).*
