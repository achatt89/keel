# Keel mode: archive

Loaded by the router (`SKILL.md`, "Modes"). The router's Operating principles, Update check and
"Writing into split docs" apply here. Upgrade Mode is in `upgrade.md`; generation Phase 5 is in `generation.md`.

## Archive Mode — `/keel archive`

**Trigger:** user says "keel archive", "archive completed phases", "trim my docs", "shrink
CLAUDE.md", "archive finished work", "clean up my keel docs for context", "my docs are getting
too big", or any equivalent phrasing in a project with existing keel-generated docs.

**Why this exists:** Keel's living docs (`AGENTS.md`, `IMPLEMENTATION_PLAN.md`, `docs/adr/README.md`,
`CHANGELOG.md`) accumulate real detail as a project ages — completed phase write-ups, resolved
deferred items, superseded decisions, closed postmortems, old changelog entries. That detail
matters and is often revisited, but it costs context on every new session. `/keel archive`
relocates it to `PHASE_ARCHIVE.md` — **never deletes it** — and leaves a one-line summary + link
in its place.

**Two ways it runs:**
- **On demand** — this mode, interactive (report → permission → archive), at natural checkpoints.
- **Automatically from doc-sync** — `.claude/workflows/doc-sync.js` ends with a deterministic
  Budget check (`.keel/doc-size.mjs`); a breach triggers a conditional Archive step that applies
  exactly the mechanics of Phase X4 below, non-interactively, "everything eligible", and commits
  separately (`docs: auto-archive — <file> <size> > <budget>`). Anything still over (other than the
  keystone) is then **split** into `docs/<name>/` parts (`docs: split …`); the keystone reports
  `BUDGET_EXCEEDED`. It never loops, never forces, never touches the never-archive list. `/keel version` shows size vs budget
  so a breach is visible before the next doc-sync. There is no hook, daemon, or pre-commit guard;
  manual edits that breach a budget are caught at the next doc-sync, which every merge requires.

**Prerequisite — detect existing keel project:** same detection as Upgrade Mode. If not detected,
respond:
> "I don't see keel-generated docs here. Run `/keel` in this project first to generate your
> foundational documents, then come back to archive finished work."

**References:**
- `references/keel-archive-guide.md` — candidate categories, the "never archive" list, and the
  exact before/after edit for each
- `references/templates/PHASE_ARCHIVE.md` — the archive document skeleton
- `references/templates/ARCHIVE_REPORT.md` — the pre-archive report format

---

### Phase X1 — Discover & measure

1. Inventory the living docs: `AGENTS.md` (or legacy `CLAUDE.md`), `IMPLEMENTATION_PLAN.md`,
   `docs/adr/README.md` (or legacy `ADR.md`), `CHANGELOG.md`, `RUNBOOK.md` (postmortems),
   `DESIGN.md` (if present), and any doc the user names directly. Read each in full.
2. Measure with `node .keel/doc-size.mjs` (or this skill's `references/templates/keel-doc-size.mjs`,
   run from the project root, if the project has none). Report size / budget / over-by for every
   budgeted file; flag unbudgeted docs that have grown noticeably beyond what a cold read at
   session start needs.
3. Check whether `PHASE_ARCHIVE.md` already exists. If yes, read it — new entries append; the
   file is never recreated from scratch.

### Phase X2 — Identify archive candidates

Using `references/keel-archive-guide.md`, scan for each category (consult its "never archive"
list before proposing anything — an item with an open dependency, an active ADR, or an
in-progress phase is never eligible):

- `PHASE_COMPLETE` — IMPLEMENTATION_PLAN phases marked ✅ whose full Goal/Scope/Deliverables/
  Exit-gates block is still inline.
- `DEFERRED_RESOLVED` — deferred-items table rows marked ✅ resolved.
- `ADR_SUPERSEDED` — ADR entries marked ⚠️ Superseded by ADR-xxx, still carrying full
  Context/Options/Consequences content (per-file: the file body collapses to its header table;
  the file and its index row stay).
- `KEYSTONE_DRIFT` — keystone (AGENTS.md / CLAUDE.md) content beyond its index job: stale
  invariants no longer enforced, old status lines appended instead of overwritten, anything past
  the byte budget.
- `CHANGELOG_OVERFLOW` — CHANGELOG entries older than the last two released/deployed versions
  once the file is over budget (the newest entries and `[Unreleased]` always stay).
- `POSTMORTEM_CLOSED` — RUNBOOK `## Postmortems` rows whose prevention landed (a DEPLOYMENT
  gotcha, test, or lint rule now exists) and whose narrative is still inline.
- `STALE_SECTION` — anything else the user points at directly.

### Phase X3 — Report + Permission

1. Present the archive plan using `references/templates/ARCHIVE_REPORT.md`: candidates grouped
   by category, current vs. projected line count per doc, and the total volume moving to
   `PHASE_ARCHIVE.md`.
2. **Ask permission to archive** (use `AskUserQuestion`):
   - "Archive everything eligible (recommended)"
   - "Let me select which candidates to archive"
   - "Skip — I only wanted the report"

### Phase X4 — Archive

Apply only what the user approved. These rules are non-negotiable:

1. **Move, never delete.** Every archived block's full original content lands in
   `PHASE_ARCHIVE.md` verbatim, under a heading naming its source (doc + section/phase/ADR-id)
   and the date archived.
2. **Leave a live pointer.** The source doc keeps a one-line summary (the outcome, not the
   process) plus a link, e.g. `→ full detail: PHASE_ARCHIVE.md#phase-2-ingestion`.
3. **Never touch an ID.** Phase numbers, ADR numbers, requirement IDs stay exactly where they
   are and mean exactly what they meant — archiving relocates prose, not the record. A superseded
   ADR keeps its file and its header table (id, title, status, superseded-by, one-line why) in
   `docs/adr/`; only the Options/Consequences tables and any remaining prose move. The
   DEPLOYMENT.md environment matrix and the last N deploy-log rows (default 10) are never
   archived — they are what an operator reads mid-incident.
4. **Surgical edits only** (same discipline as Upgrade Mode) — never rewrite a whole doc; replace
   exactly the archived block, nothing else.
5. **Per-category mechanics:** follow `references/keel-archive-guide.md` "How to archive"
   exactly — it defines the precise before/after shape for each candidate category.
6. If `PHASE_ARCHIVE.md` didn't exist before this run, create it from
   `references/templates/PHASE_ARCHIVE.md` and add its row to the keystone's document map:
   `| docs/PHASE_ARCHIVE.md | Revisiting finished or superseded work |`. Regenerate its table of
   contents to include every entry, old and new.
7. **Update `.keel/meta.json`:** `"lastArchived": "{{ISO_DATE}}"`, `"archivedEntries": {{N moved
   this run}}`.

### Phase X5 — Verify & report

1. Run the same consistency pass as generation Phase 5: every cross-reference resolves
   (including every new `PHASE_ARCHIVE.md#` link), every ID still unique, the keystone's document
   map still matches disk.
2. Report before/after bytes per doc against budget and the total relocated to
   `PHASE_ARCHIVE.md`. If a budgeted file is still over budget with nothing left eligible, say
   so plainly and offer the split (keel-archive-guide "Splitting an oversize doc"; keystone
   excepted: `BUDGET_EXCEEDED`), naming what is keeping it large — usually
   an in-progress phase block or open deferred rows that only closing the work will shrink; never
   suggest raising the budget as the first answer.
3. Remind the user of the cadence: doc-sync auto-archives at budget breach; running this mode by
   hand is for checkpoints (end of a phase, before a long session) when a doc feels heavy but is
   still under budget.
