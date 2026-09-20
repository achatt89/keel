<!--
  Keel template — PHASE_ARCHIVE.md (relocated detail for finished/superseded work)
  WHAT: The overflow tank for the living docs. Nothing here is deleted from the project —
        it's detail moved OUT of AGENTS.md / IMPLEMENTATION_PLAN.md / docs/adr/ / CHANGELOG.md /
        RUNBOOK.md to keep those light for a new session, while staying one link away.
  INCLUDE WHEN: Created on the first archive — by `/keel archive`, or automatically by
        doc-sync when a budgeted file breaches `.keel/meta.json` "budgets". Never part of
        initial generation. Appended to on every subsequent run.
  DEPENDS ON: The doc each entry was moved from.
  OWNS: No new IDs. Every entry keeps the ID it had in its source doc (Phase N, ADR-xxx) —
        archiving relocates prose, not the record.
  KEY RULE: Every entry names its source (doc + section/phase/ADR-id) and the date archived,
        and the source doc keeps a one-line summary + link back here. Entries are append-only;
        never edit an archived entry's content, only add new ones.
  Delete this comment block when creating the file for the first time; the sections below
  stay as headers even when empty until an entry lands under them.
-->

# {{PROJECT_NAME}} — Phase Archive

Full detail relocated from the living docs by `/keel archive`, to keep those light for a new
session. Nothing here is deleted — every entry is one link away from where its summary now
lives. There's a real chance this work gets revisited; that's exactly why it's kept, not cut.

## Contents

<!-- Keel guidance: regenerate this list on every archive run — one row per entry, newest last
     within each section (append-only). -->

- **Archived Phases:** {{list of `Phase N — {{name}}` entries, or "none yet"}}
- **Resolved Deferred Items:** {{count}} rows
- **Archived Decisions:** {{list of `ADR-xxx` entries, or "none yet"}}
- **Archived Changes:** {{count}} rows
- **CHANGELOG overflow:** {{version range, or "none yet"}}
- **Closed Postmortems:** {{list of `PM-xxx`, or "none yet"}}
- **Archived Notes:** {{list of source doc + section, or "none yet"}}

---

## Archived Phases

<!-- Keel guidance: one `## Phase N — {{name}}` heading per entry, in phase order. Each carries
     the full original Goal/Scope/Deliverables/Exit-gates block verbatim, plus the two metadata
     lines below. -->

*(none yet — populated by `/keel archive` when a ✅ phase's full block is relocated)*

---

## Resolved Deferred Items

<!-- Keel guidance: one append-only table, same columns as IMPLEMENTATION_PLAN's deferred-items
     table plus a resolution date. Rows are never removed once here. -->

| Item | Deferred from | Reason | Target phase | Resolved | Resolution date |
|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — |

---

## Archived Decisions

<!-- Keel guidance: one `### ADR-xxx — {{title}}` heading per entry. Each carries the full
     original file body verbatim. The file `docs/adr/ADR-xxx-<slug>.md` is reduced to its
     header table + a link here; its index row keeps the ID. -->

*(none yet — populated when a superseded ADR's full body is relocated)*

---

## Archived Changes

<!-- Keel guidance: rows relocated from IMPLEMENTATION_PLAN.md "Changes" once `live-verified`
     (or closed without deploy). Same columns plus the archive date. Append-only. -->

| CHG | Date | Branch | Summary | ADR | Evidence | Deploy state | Archived |
|---|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — | — |

---

## CHANGELOG overflow

<!-- Keel guidance: whole released sections of CHANGELOG.md (`## [x.y.z] — date` … next heading)
     moved here verbatim once older than the project's retention window; CHANGELOG.md keeps a
     one-line `[x.y.z] — see PHASE_ARCHIVE.md#changelog-overflow` pointer. Newest last. -->

*(none yet)*

---

## Closed Postmortems

<!-- Keel guidance: `PM-xxx` rows/sections from RUNBOOK.md whose prevention item is ✅ and whose
     monitoring has held for the project's retention window. Verbatim; RUNBOOK keeps the ID +
     one-line cause + link. -->

*(none yet)*

---

## Archived Notes

<!-- Keel guidance: catch-all for KEYSTONE_DRIFT / BUDGET_BREACH and STALE_SECTION entries —
     anything trimmed from a doc that isn't covered above. One heading per entry naming its
     source doc + section, and the budget that triggered it if auto-archived. -->

*(none yet)*

---

*Every entry below carries: **Archived:** {{date}} · **Originally in:** {{doc}}. Entries are
append-only — this file only grows. If it grows large enough to need its own index, that's
expected; it exists so the other docs don't have to carry the weight.*

*End of PHASE_ARCHIVE.md — {{PROJECT_NAME}}*
