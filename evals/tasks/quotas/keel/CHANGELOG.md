# Changelog — filestore

All notable changes to filestore. Format follows [Keep a Changelog](https://keepachangelog.com/); versions: SemVer once a release exists `[ASSUMPTION]`.

**Deploy-state tags** (one per line, flipped in place): `[on-branch]` built and gated, not on `main` · `[merged]` on `main` · `[deployed vNN]` running in production · `[live-verified]` post-deploy checklist passed. Nothing is deployed before Phase 3, so only the first two apply for now.

---

## [Unreleased]

### Added
- Foundational documentation suite (BRD, PRD, ENGINEERING_DESIGN, ARCHITECTURE, LLD, NFR, ADR-001..006, IMPLEMENTATION_PLAN, COMMANDS) and workflow scripts — generation `[on-branch]`
- Phase 2 — Storage quotas scoped; ADR-006 reserved — `[on-branch]`

### Notes
- Phase 1 (core) is described by the founder as built; no code or evidence exists in this tree (`OD-07`). Its first CHANGELOG line is written when the code lands.

---

## Release stamping

A release heading is created only by a production deploy, never by a merge: add a `DEPLOYMENT.md` deploy-log row, rename `[Unreleased]` → `[vNN] — YYYY-MM-DD`, flip lines to `[deployed vNN]`, then `[live-verified]` after the post-deploy checklist. (No `DEPLOYMENT.md` until Phase 3.)

---

*Older releases: `docs/PHASE_ARCHIVE.md#changelog` (relocated by `/keel archive`, nothing deleted).*
