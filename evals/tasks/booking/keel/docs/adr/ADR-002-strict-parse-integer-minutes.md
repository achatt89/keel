# ADR-002 — Time handling — strict regex parse to integer minutes

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | engineering |
| **Bounded by** | CON-004, BKG-003, BKG-004, RSK-002 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 0 |

## Context

The spec fixes one exact timestamp format and demands real dates and quarter-hour minutes. `Date.parse` accepts many other formats and silently rolls invalid dates over (`2026-02-30`).

## Decision

| | |
|---|---|
| **Decision** | In the context of strict `YYYY-MM-DDTHH:MMZ` input, facing `Date.parse`, a hand-rolled parser, or a date library, we chose **an anchored regex plus manual range and calendar validation (leap-year aware), converting to integer minutes since the epoch (UTC)** to achieve exact acceptance and cheap, exact interval arithmetic, accepting that the library owns a small piece of calendar logic. |
| **Revisit trigger** | A test finds any accepted non-real date or rejected real date. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| `Date.parse` / `new Date(str)` | short | accepts other formats; rolls over invalid days; year 0–99 quirk | ✗ |
| **Regex + manual validation → integer minutes** | exact, testable table-driven, no rollover | ~40 lines of calendar code | ✓ |
| Library (e.g. date-fns) | proven | forbidden (CON-002) | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Overlap/length/hours checks are integer comparisons; formatting back is deterministic |
| Harder | Leap years and days-per-month must be tested (Phase 0 table); weekday via a days-from-civil computation or `Date.UTC` only after validation |
| Off the table | Accepting seconds, offsets (`+00:00`), lowercase `z`, or lax separators |
| Build deviation | — |
