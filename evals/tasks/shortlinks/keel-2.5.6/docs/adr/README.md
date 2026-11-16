# Architecture Decision Records — shortlinks

All decisions derive from constraints and requirements in `../BRD.md`; ADRs record technical
reasoning, they do not relitigate product choices. One file per decision; this file is the index.

> Lifecycle: `Proposed` → `Accepted` → `Built` → `⚠️ Superseded by ADR-xxx`. No addenda — a
> deviation that doesn't fit the one `Build deviation` row is a new ADR.

## Index

| ADR | Title | Status | Deciders | Date |
|---|---|---|---|---|
| [ADR-001](./ADR-001-runtime-and-storage-stdlib-commonjs-in-memory.md) | Runtime & storage — Node 20 stdlib, CommonJS, in-memory Map | Accepted | founder · engineering | 2026-11-16 |
| [ADR-002](./ADR-002-rate-limiter-sliding-window-log-per-ip.md) | Rate limiter — sliding-window log per IP, successful creations only | Proposed | founder · engineering | 2026-11-16 |
| [ADR-003](./ADR-003-client-identity-socket-address-no-forwarded-headers.md) | Client identity — socket peer address, forwarded headers ignored | Proposed | engineering | 2026-11-16 |
| [ADR-004](./ADR-004-post-links-validation-order-and-strictness.md) | `POST /links` validation — fixed order, strict URL charset, 16 KiB cap | Proposed | founder · engineering | 2026-11-16 |
| [ADR-005](./ADR-005-routing-by-path-shape-and-reserved-code-links.md) | Routing — path shape decides 404 vs 405; `links` reserved | Proposed | engineering | 2026-11-16 |

ADR-002..005 are `[ASSUMPTION]` defaults for gaps in the founder's spec. They are built as written
unless the founder overrides; the build flips them to `Built` (or a superseding ADR replaces them).

## Open decisions

| # | Question | Locations | Decider | Options surfaced | Status |
|---|---|---|---|---|---|
| OD-01 | Reject non-printable-ASCII URLs (incl. un-encoded IRIs like `http://münchen.de`) as `invalid_url`? | `PRD.md` §5 · ADR-004 | founder | reject (default) / accept and percent-encode for `Location` | Open |
| OD-02 | Do only *successful* creations consume rate-limit slots, and does the limit check come after validation (400 before 429) and before `code_taken`? | `PRD.md` §6 · ADR-002 · ADR-004 · BRD A-04 | founder | successful-only + validate-first (default) / count every attempt / limit-first | Open |
| OD-03 | Add `413 payload_too_large` (outside the listed error codes) for bodies > 16 KiB, or fold oversize into 400 `invalid_json`? | `PRD.md` §3, §7 · ADR-004 | founder | 413 (default) / 400 `invalid_json` | Open |
| OD-04 | Bind to all interfaces (Node default) or add a `HOST` env var defaulting to loopback? | `COMMANDS.md` · `IMPLEMENTATION_PLAN.md` Phase 0 | engineering | all interfaces, no `HOST` (default; VPN-only) / `HOST` var | Open |

---

*Index of `docs/adr/` — shortlinks.*
