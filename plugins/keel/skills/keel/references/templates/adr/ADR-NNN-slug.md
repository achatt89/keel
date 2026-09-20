<!--
  Keel template — docs/adr/ADR-NNN-<slug>.md (one decision record)
  WHAT: A single decision in table form: header, ≤2-sentence context, a Y-statement decision,
        the options weighed, and the consequences — including the ONE row where the build may
        record how it deviated. Immutable once Accepted apart from that row and the Status cell.
  FILE NAME: `ADR-{{NNN}}-{{kebab-slug}}.md` (zero-padded; slug from the Topic). The number is
        reserved in `docs/adr/README.md` first — by the phase script at scope time, or at
        Integrate for an unplanned decision. Never in a task worktree.
  WHAT DOES NOT GO HERE: deploy state (→ CHANGELOG.md / DEPLOYMENT.md deploy log), incidents and
        what went wrong later (→ RUNBOOK.md Postmortems, which may cite this ADR), client feedback
        (→ FEEDBACK_ROUNDS.md), a second decision (→ a new ADR that supersedes this one).
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# ADR-{{NNN}} — {{Topic}} — {{Chosen option}}

<!-- Keel guidance: Status carries the whole lifecycle with commit/date per transition:
     "Proposed 2026-09-01 (Phase 6 scope)" → "Accepted 2026-09-02" → "Built `abc1234` 2026-09-09"
     → "⚠️ Superseded by ADR-0XX 2026-10-01". Deciders: founder / engineering / legal.
     Bounded by: the IDs that constrain this (CON-xxx, NFR-xxx, RSK-xxx, prior ADRs). -->

| | |
|---|---|
| **Status** | {{Proposed {{date}} (Phase {{N}} scope) · Accepted {{date}} · Built `{{commit}}` {{date}}}} |
| **Deciders** | {{founder (call) · engineering (design)}} |
| **Bounded by** | {{CON-xxx, NFR-xxx, ADR-xxx}} |
| **Supersedes / superseded by** | {{— / ADR-xxx}} |
| **Phase** | {{Phase N / CHG-xxx}} |

## Context

<!-- Keel guidance: the forces in play — what is on the critical path, why now, why non-obvious.
     Reference requirement IDs, do not restate them. TWO sentences maximum. If it needs more, the
     background belongs in ARCHITECTURE/ENGINEERING_DESIGN and this cites it. -->

{{Sentence one: the situation and the constraint that bounds it.}} {{Sentence two: why the
obvious answer isn't enough.}}

## Decision

<!-- Keel guidance: ONE Y-statement row. "In the context of <situation>, facing <the real
     alternatives>, we chose <option> to achieve <the property that matters>, accepting <the
     cost>." If it doesn't fit one row, the decision isn't sharp enough yet. -->

| | |
|---|---|
| **Decision** | In the context of {{situation}}, facing {{the alternatives}}, we chose **{{option}}** to achieve {{property}}, accepting {{cost}}. |
| **Revisit trigger** | {{A single observable condition — "P95 breaches {{target}} after tuning", not "if it gets slow". If none exists: "next architecture review".}} |

## Options considered

<!-- Keel guidance: at least two real options. Terse, comparable cells. ✓ marks the choice;
     ✗ the rest. A "status quo" row is usually one of them. -->

| Option | Pros | Cons | |
|---|---|---|---|
| {{Option A (status quo)}} | {{…}} | {{…}} | ✗ |
| **{{Option B}}** | {{…}} | {{…}} | ✓ |
| {{Option C}} | {{…}} | {{…}} | ✗ |

## Consequences

<!-- Keel guidance: "Harder" and "Off the table" are the rows reviewers actually read — be
     honest. "Build deviation" is the ONLY row edited after acceptance: filled once, at Built,
     with what was built differently and why ("none — built as decided" is a valid value).
     Anything that doesn't fit that one row → new ADR that supersedes this one. -->

| Consequence | Detail |
|---|---|
| Easier | {{what this unlocks; the check that proves it (cite DEPLOYMENT post-deploy check if one exists)}} |
| Harder | {{the cost accepted; what now needs care}} |
| Off the table | {{what this forecloses}} |
| Build deviation | {{none — built as decided / what differed, why, commit}} |
