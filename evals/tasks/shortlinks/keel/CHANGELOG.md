# Changelog — shortlinks

All notable changes to shortlinks. Format follows [Keep a Changelog](https://keepachangelog.com/); versions are date-based (`YYYY.MM.DD`) once anything ships.

**Deploy-state tags** (one per line, flipped in place as the work moves):

| Tag | Meaning | Flipped by |
|---|---|---|
| `[on-branch]` | built and gated, not yet on trunk | doc-sync (initial write) |
| `[merged]` | on `main` | the Merge step |
| `[deployed vNN]` | running as release `vNN` | the deployer |
| `[live-verified]` | post-run `curl` checklist passed on the real host | the deployer, same day |

---

## [Unreleased]

### Added
- Foundational documentation suite (BRD, PRD, ARCHITECTURE, ADR-001..004, IMPLEMENTATION_PLAN, COMMANDS, keel tooling) — generation, no application code `[on-branch]`
