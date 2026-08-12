<!--
  Keel template — PHASE_ARCHIVE.md (relocated detail for finished/superseded work)
  WHAT: The overflow tank for the living docs. Nothing here is deleted from the project —
        it's detail moved OUT of CLAUDE.md / IMPLEMENTATION_PLAN.md / ADR.md to keep those
        light for a new session, while staying one link away for whoever revisits it.
  INCLUDE WHEN: Created on the first `/keel archive` run — never part of initial generation
        (there's nothing to archive yet). Appended to on every subsequent run.
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

<!-- Keel guidance: one `### ADR-xxx: {{title}}` heading per entry. Each carries the full
     original Context/Options/Decision/Consequences/Revisit-trigger prose verbatim. The stub
     left behind in ADR.md keeps the same ID and links here. -->

*(none yet — populated by `/keel archive` when a superseded ADR's full body is relocated)*

---

## Archived Notes

<!-- Keel guidance: catch-all for CLAUDE_DRIFT and STALE_SECTION entries — anything trimmed
     from a doc that isn't a phase or ADR. One heading per entry naming its source doc + section. -->

*(none yet)*

---

*Every entry below carries: **Archived:** {{date}} · **Originally in:** {{doc}}. Entries are
append-only — this file only grows. If it grows large enough to need its own index, that's
expected; it exists so the other docs don't have to carry the weight.*

*End of PHASE_ARCHIVE.md — {{PROJECT_NAME}}*
