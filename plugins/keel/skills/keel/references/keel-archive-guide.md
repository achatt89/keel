# Keel Archive Guide — per-doc archive rules

Reference for Phase X2 (Identify) and Phase X4 (Archive) in the `/keel archive` command, **and
for the conditional Archive phase of `.claude/workflows/doc-sync.js`**, which applies the same
mechanics non-interactively when a byte budget is breached. For each doc type, defines what's
eligible to relocate to `PHASE_ARCHIVE.md`, the exact before/after shape of the edit, and what
must never be touched.

**The rule underneath every category: relocate, never delete.** Archiving trims what a *new*
session has to read, not what exists. Full original content always lands in `PHASE_ARCHIVE.md`
verbatim; the source doc keeps a one-line outcome and a link back.

---

## Budgets and the automatic trigger

Every living doc has a byte budget in `.keel/meta.json` `budgets` (path → bytes). Defaults when
the key is absent (also in `references/templates/keel-meta.json`):

| File | Default budget | Why this number |
|---|---|---|
| `AGENTS.md` | 12288 | ~3K tokens — read at the start of every session by every agent |
| `CLAUDE.md` | 12288 | same; in format 2 it is a few hundred bytes (`@AGENTS.md` + Claude-only sections) |
| `docs/IMPLEMENTATION_PLAN.md` | 65536 | read at the start of every phase; the current phase block + tables fit comfortably |
| `docs/adr/README.md` | 16384 | the index is read; individual ADR files are opened on demand and are unbudgeted |

Every other top-level `docs/*.md` (RUNBOOK, DESIGN, ARCHITECTURE, PRD, …) gets `defaultBudget`
(32768) unless listed. Root `CHANGELOG.md` and individual ADR files are unbudgeted unless listed.
A split doc's parts each get the parent's budget.

**How the automatic trigger works** — no hook, no daemon, no pre-commit guard:

1. `doc-sync.js` finishes its writes, then runs a deterministic Budget step:
   `node .keel/doc-size.mjs --json` (each file once; split parents and parts separately).
2. A breach on the keystone or an archivable doc → the script's conditional Archive phase runs Phase X2 + X4 of Archive Mode with
   "everything eligible", using exactly the mechanics in this guide, and commits on its own:
   `docs: auto-archive — <file> <bytes> > <budget>`. Separate commit, so it reverts alone.
3. Still over budget after archiving, or a doc with nothing archivable → the Split phase splits
   it ("Splitting an oversize doc" below) and re-runs the check; a split-link error fails
   doc-sync. The keystone is never split and never compressed: still over after archiving, whole
   sections move out to `docs/agents/NN-<slug>.md` behind a `## Parts` table (each part links back);
   only if nothing can move does it end as `BUDGET_EXCEEDED: <file> <bytes> > <budget>`. Docs the
   checker calls `ok` (archives), `waived` or `manual` are never archived or split by doc-sync. It never loops, never lowers eligibility, never touches the never-archive list, and
   never edits the budget.
4. `/keel version` reports size vs budget read-only, so a breach is visible before the doc-sync
   that would act on it. Manual edits that breach a budget are caught at the next doc-sync,
   which every merge requires.

When `BUDGET_EXCEEDED` persists on the keystone, the cause is nearly always an in-progress phase block or the
open deferred rows — work that only *closing* shrinks (`/keel closeout` exists for the second).
Raising a budget is a legitimate project decision, recorded in meta.json, but it is not the first
answer.

---

## Candidate categories

| Category | Where it lives | Trigger |
|---|---|---|
| `PHASE_COMPLETE` | IMPLEMENTATION_PLAN.md | Phase marked ✅ in the phase-status table, full Goal/Scope/Deliverables/Exit-gate-table block still inline |
| `DEFERRED_RESOLVED` | IMPLEMENTATION_PLAN.md | Deferred-items table row marked ✅ resolved |
| `CHANGE_MERGED` | IMPLEMENTATION_PLAN.md `## Changes` | `CHG-xxx` rows whose Deploy state is `live-verified` (or `merged` for projects with no remote environment) and older than the last 10 rows |
| `ADR_SUPERSEDED` | `docs/adr/ADR-NNN-*.md` (legacy: ADR.md) | Status ⚠️ Superseded by ADR-xxx, Options/Consequences tables (and any remaining prose) still in the file |
| `KEYSTONE_DRIFT` | AGENTS.md (legacy: CLAUDE.md) | Content beyond the keystone-index job: stale invariants no longer enforced, old status lines appended instead of overwritten, any section that's grown past a light skim |
| `CHANGELOG_OVERFLOW` | CHANGELOG.md | Entries older than the last two released/deployed versions, once the file is over budget or named by the user; `[Unreleased]` and the newest two versions always stay |
| `POSTMORTEM_CLOSED` | RUNBOOK.md `## Postmortems` | A `PM-xxx` row whose prevention has landed (the named DEPLOYMENT gotcha / test / lint rule exists on disk) and whose `### PM-xxx` narrative is still inline |
| `STALE_SECTION` | Any doc | User names a specific section directly ("archive the old auth design notes in DESIGN.md") |

## Never archive

- A phase that is 🔄 in progress or ⬜ not started — only ✅ complete phases are eligible.
- A deferred item that is still open (no ✅) — only resolved rows.
- A `CHG-xxx` row that is `on-branch` / `merged` (when a remote environment exists) / `deployed`
  but not yet `live-verified`.
- An ADR that is not superseded — accepted, active decisions stay in full; the ADR set is the
  authoritative "why" and gets read often.
- Anything carrying an unresolved `[NEEDS DECISION]` marker.
- An ID itself — Phase numbers, ADR numbers, `CHG`/`PM`/`FR` numbers, requirement IDs never move
  or change; only the body around a *closed* record relocates.
- The keystone's Current status table, Document map, Hard invariants table, Pre-PR checklist, or
  Git & working workflow sections — these are living and load-bearing on every session, not drift.
- `DEPLOYMENT.md` — the environment matrix, promotion path, config table, checklists, rollback and
  gotchas are never archived; of the deploy log, the last N rows (default 10, `.keel/meta.json`
  `deployLogKeep`) always stay. An operator reads this file mid-incident.
- `CHANGELOG.md`'s `[Unreleased]` section and its two newest versions.
- A `PM-xxx` row whose prevention column names something that does not yet exist on disk.
- `.keel/evidence/*.json` — evidence files are never archived or deleted; they are what the exit-gate
  tables cite. (Review-run folders under `.keel/evidence/{security,design}/` are pruned by their own
  rule — conventions "Evidence retention" — never by archive.)

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

### `CHANGE_MERGED` (IMPLEMENTATION_PLAN.md `## Changes`)

**Before:** `CHG-xxx` rows at `live-verified` accumulate above the last 10.

**After:** rows older than the newest 10 are removed from the live table; one line below it:
`{{N}} shipped changes archived — see PHASE_ARCHIVE.md#archived-changes.`

**Archive entry:** the full rows appended to the "Archived Changes" table in PHASE_ARCHIVE.md
(append-only, same columns).

### `ADR_SUPERSEDED` (`docs/adr/ADR-NNN-<slug>.md`; legacy single `ADR.md`)

**Before (format 2):** the full file — header table, Context, Decision row, Options table,
Consequences table, Revisit trigger — with Status `⚠️ Superseded by ADR-yyy`.

**After:** the file stays at the same path with the same index row; its body collapses to the
header table (Status, Deciders, Bounded by, Supersedes / superseded by) plus one line:
```
{{one-line: what it decided and why it no longer holds}}. Full record: `../PHASE_ARCHIVE.md#adr-xxx`.
```
Never delete the file or its index row — inbound `ADR-xxx` links must keep resolving.

**Before/after (legacy format 1 `ADR.md`):** collapse the `### ADR-xxx: {{title}}` entry to a
stub in place, keep the ID and status where it is (never renumber, never move out of sequence):
```
### ADR-xxx: {{title}} — ⚠️ Superseded by ADR-yyy

{{one-line: what it decided and why it no longer holds}}. Full record: `PHASE_ARCHIVE.md#adr-xxx`.
```

**Archive entry:** the full original entry / file body verbatim under "Archived Decisions".

### `CHANGELOG_OVERFLOW` (CHANGELOG.md)

**Before:** versions older than the newest two released/deployed versions sit inline below them.

**After:** those version sections are removed; one line at the bottom of the file:
`Older entries ({{oldest}}–{{newest archived}}): PHASE_ARCHIVE.md#archived-changelog.`
`[Unreleased]` and the two newest versions are untouched.

**Archive entry:** the version sections verbatim, newest first, under "Archived CHANGELOG".

### `POSTMORTEM_CLOSED` (RUNBOOK.md `## Postmortems`)

**Before:** the `PM-xxx` table row plus its `### PM-xxx — {{title}}` narrative section.

**After:** the table row stays (it is the index; its prevention column is what future readers
scan); the narrative section is replaced by one line:
`### PM-xxx — {{title}}` / `{{one-line root cause → prevention}}. Full narrative: `PHASE_ARCHIVE.md#pm-xxx`.`
Eligible only once the prevention named in the row exists on disk (check the path / test /
lint rule; if it cannot be found, the row is not closed and is not archived).

**Archive entry:** the narrative verbatim under "Archived Postmortems".

### `KEYSTONE_DRIFT` (AGENTS.md — legacy: CLAUDE.md)

**Before:** any section that's grown past its light-file job — extra paragraphs under Current
status, invariants that reference a component since removed, old working-agreement bullets
superseded by newer ones left in place instead of replaced.

**After:** trim the section back to its template shape (see `references/templates/AGENTS.md`;
legacy projects: `templates/CLAUDE.md`); if the removed content still has standing value, add one
link: `(archived detail: PHASE_ARCHIVE.md#claude-md-notes-{{date}})`. A prose status history
(format 1's stacked "Last completed" entries) goes under "Archived CLAUDE.md Notes" as one dated
entry per status line, oldest first — the two-row status table that replaces it links to the
CHANGELOG, not to the archive. If it has none (genuinely stale — refers to a
removed component with no successor), it can be dropped without an archive entry; say so in the
Phase X3 report so the user can object before it happens.

**Archive entry (only when linked):** the removed text verbatim under "Archived CLAUDE.md Notes".

### `STALE_SECTION` (any doc, user-directed)

Same pattern as `KEYSTONE_DRIFT`: trim in place, leave a one-line summary + link, move the full
text to a new heading under "Archived Notes" naming its source doc and section.

---

## Splitting an oversize doc

Archive moves *closed* detail out. When a doc is over budget and has nothing (more) closed to
move — DESIGN, ARCHITECTURE, PRD, LLD, NFR … are mostly live content — it is **split**, never just
warned about. Doc-sync's Split stage does this automatically; `/keel upgrade` proposes it.

**Which docs:** only those the checker gives the verdict `split` (conventions "One verdict per
doc"). Never: the keystone (archive, then move sections out), archives (`PHASE_ARCHIVE.md`,
`LEGACY_*`, `archive/` — append-only, never budgeted), the ADR index (its budget scales with the
ADR count), generated files, waived docs, or docs with no headings (`manual`). Archivable docs
(IMPLEMENTATION_PLAN, CHANGELOG, RUNBOOK, DEPLOYMENT) are archived first and split only if the
re-check after archiving (`--after-archive`) still says `split`.

**Layout** — the folder sits next to its parent, named in lower-kebab case:

| Parent | Folder | Parts |
|---|---|---|
| `docs/DESIGN.md` | `docs/design/` | `01-foundations.md`, `02-components.md`, … |
| `docs/IMPLEMENTATION_PLAN.md` | `docs/implementation-plan/` | `01-standing-rules.md`, `02-phases-0-4.md`, … |

- One part per top-level `## ` section, in original order, `NN-<section-slug>.md`. Merge adjacent
  small sections (a part under ~2 KB is noise); a single section over budget splits at `### `.
- Content moves **verbatim**. IDs never change. No rewording, no summarising.
- A part that later breaches splits into more parts with the next free `NN` (never renumber —
  numbers are link targets).

**Parent = slim index** (shape):

```markdown
# DESIGN — {{project}}

{{One-line purpose.}} Owns: `TOK-*`, `CMP-*`. Split {{date}} at {{size}} B > {{budget}} B.

## Parts

| Part | Covers | IDs |
|---|---|---|
| [01 Foundations](design/01-foundations.md) | Principles, tokens, type, colour | TOK-001…040 |
| [02 Components](design/02-components.md) | Component specs | CMP-001…025 |
```

**Each part** starts with:

```markdown
# DESIGN — Components
> Part of [DESIGN.md](../DESIGN.md) · all parts listed there.
```

**Inbound links:** `grep -rn "DESIGN.md#"` across the repo; repoint each anchored link at the part
that now holds the heading. Bare `DESIGN.md` links stay valid (they reach the index). The
keystone's Document map keeps one row for the parent.

**Check (hard):** `node .keel/doc-size.mjs` — each file is measured once (the index and every part
against the parent's budget; the family total is reported, not judged). It **fails** if any part
is not linked from the parent's Parts table or has no link back to the parent. Doc-sync stops on
that failure; fix the link, never delete the part.

**Tool:** `node .keel/doc-size.mjs --split <doc>` does all of the above deterministically (plain
doc or an oversize part; verbatim; skips headings inside code fences; repoints inbound anchored
links) and refuses (exit 2, with the reason) the keystone, archives, waived and `manual` docs.
It cuts recursively in one run (sub-parts `07a`, `07b` keep order; a table splits by rows) and never
rewrites an ADR file (conventions "Cutting"). Archives are never split, so archive appends always
land in the archive file itself; if a pre-2.4.2 trial split an archive, write via `--where`.
Re-running it on an index with nothing new refuses and changes nothing; if new sections were
written into the index, only those move and the existing Parts table gains rows. Then add the IDs column and purpose line to the index by hand.

**Writing to a split doc later** (doc-sync and any role that edits docs): new content goes into
the part that holds its section, never the index; a part about to breach gets a new part (or
`--split`); a plain doc an edit would push over budget is split first. The caller's doc-sync
review checks it and the size/link check is the last step before the commit.

**Commit:** one per doc — `docs: split DESIGN.md into design/ (N parts) — <size>B > <budget>B`.

## Severity / eligibility reference

| Situation | Eligible? |
|---|---|
| Phase ✅ with full block still inline | Yes — `PHASE_COMPLETE` |
| Phase 🔄 or ⬜ | No |
| Deferred row ✅ resolved | Yes — `DEFERRED_RESOLVED` |
| Deferred row open | No |
| `CHG-xxx` row `live-verified`, older than the newest 10 | Yes — `CHANGE_MERGED` |
| `CHG-xxx` row not yet `live-verified` (or within the newest 10) | No |
| ADR ⚠️ Superseded, body still in the file | Yes — `ADR_SUPERSEDED` |
| ADR accepted and active | No |
| ADR with unresolved `[NEEDS DECISION]` elsewhere pointing at it | No |
| Keystone content beyond its template shape | Yes — `KEYSTONE_DRIFT` |
| Keystone Current status / Document map / Invariants / Pre-PR checklist / Git workflow | No |
| CHANGELOG version older than the newest two | Yes — `CHANGELOG_OVERFLOW` |
| CHANGELOG `[Unreleased]` or newest two versions | No |
| `PM-xxx` narrative whose prevention exists on disk | Yes — `POSTMORTEM_CLOSED` |
| `PM-xxx` whose prevention cannot be found on disk | No |
| DEPLOYMENT.md anything except deploy-log rows beyond the newest N | No |
| `.keel/evidence/*.json` | No — never |
| Any doc, user names a section directly | Yes — `STALE_SECTION` (confirm scope first) |

---

## After archiving

1. If `PHASE_ARCHIVE.md` didn't exist before this run, create it from
   `references/templates/PHASE_ARCHIVE.md` and add its row to the keystone's document map:
   `| docs/PHASE_ARCHIVE.md | Revisiting finished or superseded work |`.
2. Regenerate `PHASE_ARCHIVE.md`'s table of contents to include every entry (old and new).
3. Grep every doc touched for `PHASE_ARCHIVE.md#` links and confirm each resolves to a real
   heading in the archive file — a dangling archive link is worse than no link.
4. Re-run `wc -c` on every budgeted file; report before/after against budget. In the automatic
   (doc-sync) path, any file still over budget produces `BUDGET_EXCEEDED: nothing archivable`.
5. Update `.keel/meta.json`: `"lastArchived"`, `"archivedEntries"` (count moved this run), and
   `"lastArchiveTrigger": "manual" | "doc-sync"`.
