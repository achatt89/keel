# Keel Archive Guide — per-doc archive rules

Reference for Phase X2 (Identify) and Phase X4 (Archive) in the `/keel archive` command.
For each doc type, defines what's eligible to relocate to `PHASE_ARCHIVE.md`, the exact
before/after shape of the edit, and what must never be touched.

**The rule underneath every category: relocate, never delete.** Archiving trims what a *new*
session has to read, not what exists. Full original content always lands in `PHASE_ARCHIVE.md`
verbatim; the source doc keeps a one-line outcome and a link back.

---

## Candidate categories

| Category | Where it lives | Trigger |
|---|---|---|
| `PHASE_COMPLETE` | IMPLEMENTATION_PLAN.md | Phase marked ✅ in the phase-status table, full Goal/Scope/Deliverables/Exit-gates block still inline |
| `DEFERRED_RESOLVED` | IMPLEMENTATION_PLAN.md | Deferred-items table row marked ✅ resolved |
| `ADR_SUPERSEDED` | ADR.md | Entry marked ⚠️ Superseded by ADR-xxx, full Context/Options/Consequences prose still inline |
| `CLAUDE_DRIFT` | CLAUDE.md | Content beyond the keystone-index job: stale invariants no longer enforced, old status lines appended instead of overwritten, any section that's grown past a light skim |
| `STALE_SECTION` | Any doc | User names a specific section directly ("archive the old auth design notes in DESIGN.md") |

## Never archive

- A phase that is 🔄 in progress or ⬜ not started — only ✅ complete phases are eligible.
- A deferred item that is still open (no ✅) — only resolved rows.
- An ADR that is not superseded — accepted, active decisions stay in full; ADR.md is the
  authoritative "why" and gets read often.
- Anything carrying an unresolved `[NEEDS DECISION]` marker.
- An ID itself — Phase numbers, ADR numbers, requirement IDs never move or change; only the prose
  body around a *closed* record relocates.
- CLAUDE.md's Current status, Document map, or Git & working workflow sections — these are living
  and load-bearing on every session, not drift.

---

## How to archive (exact mechanics per category)

### `PHASE_COMPLETE` (IMPLEMENTATION_PLAN.md)

**Before:** the full `## Phase N — {{name}}` block (Goal, Scope, Deliverables, Exit gates,
Workflow line).

**After:** in the phase's place, leave:
```
## Phase N — {{name}} ✅

{{one-line outcome — what shipped, not the process}}. Full detail: `PHASE_ARCHIVE.md#phase-n-{{slug}}`.
```
The phase-status table row is untouched (it's the living summary; that's its job).

**Archive entry:** `## Phase N — {{name}}` under "Archived Phases", with "Archived: {{date}}" and
"Originally in: IMPLEMENTATION_PLAN.md", the moved block verbatim.

### `DEFERRED_RESOLVED` (IMPLEMENTATION_PLAN.md)

**Before:** resolved rows sit inline in the "Deferred items" table alongside open ones.

**After:** resolved rows are removed from the live table; if the table would otherwise be empty
of open rows, leave the header + `*(none open)*`. Add one line below the table:
`{{N}} resolved items archived — see PHASE_ARCHIVE.md#resolved-deferred-items.`

**Archive entry:** the full row(s) (Item, Deferred from, Reason, Target phase, Status, resolution
date) appended to the "Resolved Deferred Items" table in PHASE_ARCHIVE.md — this table is
append-only, matching the deferred-items table's own convention.

### `ADR_SUPERSEDED` (ADR.md)

**Before:** the full `### ADR-xxx: {{title}}` entry with Context, Options, Decision,
Consequences, Revisit trigger — marked `⚠️ Superseded by ADR-yyy`.

**After:** collapse to a stub, keep the ID and status where it is (never renumber, never move
out of ADR.md's sequence):
```
### ADR-xxx: {{title}} — ⚠️ Superseded by ADR-yyy

{{one-line: what it decided and why it no longer holds}}. Full record: `PHASE_ARCHIVE.md#adr-xxx`.
```

**Archive entry:** the full original entry verbatim under "Archived Decisions".

### `CLAUDE_DRIFT` (CLAUDE.md)

**Before:** any section that's grown past its light-file job — extra paragraphs under Current
status, invariants that reference a component since removed, old working-agreement bullets
superseded by newer ones left in place instead of replaced.

**After:** trim the section back to its template shape (see `references/templates/CLAUDE.md`);
if the removed content still has standing value, add one link: `(archived detail:
PHASE_ARCHIVE.md#claude-md-notes-{{date}})`. If it has none (genuinely stale — refers to a
removed component with no successor), it can be dropped without an archive entry; say so in the
Phase X3 report so the user can object before it happens.

**Archive entry (only when linked):** the removed text verbatim under "Archived CLAUDE.md Notes".

### `STALE_SECTION` (any doc, user-directed)

Same pattern as `CLAUDE_DRIFT`: trim in place, leave a one-line summary + link, move the full
text to a new heading under "Archived Notes" naming its source doc and section.

---

## Severity / eligibility reference

| Situation | Eligible? |
|---|---|
| Phase ✅ with full block still inline | Yes — `PHASE_COMPLETE` |
| Phase 🔄 or ⬜ | No |
| Deferred row ✅ resolved | Yes — `DEFERRED_RESOLVED` |
| Deferred row open | No |
| ADR ⚠️ Superseded, full prose inline | Yes — `ADR_SUPERSEDED` |
| ADR accepted and active | No |
| ADR with unresolved `[NEEDS DECISION]` elsewhere pointing at it | No |
| CLAUDE.md content beyond its template shape | Yes — `CLAUDE_DRIFT` |
| CLAUDE.md Current status / Document map / Git workflow | No |
| Any doc, user names a section directly | Yes — `STALE_SECTION` (confirm scope first) |

---

## After archiving

1. If `PHASE_ARCHIVE.md` didn't exist before this run, create it from
   `references/templates/PHASE_ARCHIVE.md` and add its row to CLAUDE.md's document map:
   `| docs/PHASE_ARCHIVE.md | Revisiting finished or superseded work |`.
2. Regenerate `PHASE_ARCHIVE.md`'s table of contents to include every entry (old and new).
3. Grep every doc touched for `PHASE_ARCHIVE.md#` links and confirm each resolves to a real
   heading in the archive file — a dangling archive link is worse than no link.
4. Update `.keel/meta.json`: `"lastArchived"`, `"archivedEntries"` (count moved this run).
