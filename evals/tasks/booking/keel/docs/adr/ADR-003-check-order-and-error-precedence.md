# ADR-003 — Error precedence — fixed check order, overlap before person_busy

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation); overlap-over-person_busy is founder-specified, the rest is an `[ASSUMPTION]` awaiting founder confirmation |
| **Deciders** | founder (overlap > person_busy) · engineering (remaining order, input edge cases) |
| **Bounded by** | BKG-002..BKG-008, SEC-001, RSK-001, A-03..A-07, A-09 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

An input can break several rules at once; the spec fixes only `overlap` over `person_busy`. Consumers and tests need one deterministic answer.

## Decision

| | |
|---|---|
| **Decision** | In the context of multi-violation inputs, facing alternatives such as collecting all errors, spec-list order, or cheapest-check-first, we chose **the fixed sequence `invalid_input` → `invalid_time` → `outside_hours` → `too_long` → `overlap` → `person_busy` (first failure throws)** to achieve a deterministic, documentable contract, accepting that an input with both a bad time and an empty name reports `invalid_input`. |
| **Revisit trigger** | The founder specifies a different order, or a consumer needs all violations at once. |

Edge-case defaults taken with it (all `[ASSUMPTION]`, BRD §8): `room`/`who` literal non-empty, no trim (A-04); non-object `book` argument → `invalid_input` (A-06); missing/non-string `start`/`end` → `invalid_time` (A-05); `list`/`free` bad `room` → `invalid_input`, bad `day` → `invalid_time` (A-07); non-string `cancel` id → `not_found` (A-09).

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Collect and throw all errors | complete feedback | spec says one `code` | ✗ |
| Spec-list order with `invalid_input` last | mirrors the text | validating times of a nameless booking first is arbitrary | ✗ |
| **Input → time → hours → length → overlap → person_busy** | cheap structural checks first, state-dependent last; matches the spec's rule order | one assumption (input first) | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | One pipeline function; each rule testable in isolation by making all earlier rules pass |
| Harder | Precedence tests must pair rules (e.g. 08:00–14:00 is `outside_hours`, not `too_long`) |
| Off the table | Reporting multiple codes |
| Build deviation | — |
