// Keel doc-sync workflow (doc format 2)
// Copy verbatim to .claude/workflows/doc-sync.js.
// Run: claude --workflow .claude/workflows/doc-sync.js   (or via the Workflow tool)
//
// Used standalone, by change scripts and by hand; phase scripts call
// this workflow from their Doc Sync step. Stages: Sync (delegate ⇄ review, ≤3 rounds) → Budget → Archive / Split (only on a breach) → Prune.
// Sync writes tables, not prose, and every claim carries an evidence level + artefact.
// Budget runs .keel/doc-size.mjs (every doc once, split parts separately, link check). Archive
// relocates (never deletes) closed detail per keel-archive-guide; whatever is still over budget
// is Split into docs/<name>/ parts behind a slim index (keystone excepted). A split-link error
// throws, so the merge after doc-sync cannot proceed. Each stage runs once; it never loops.

export const meta = {
  name: 'doc-sync',
  description: 'Mandatory pre-merge doc sync: status tables, exit-gate evidence, ADRs, deferred items, CHANGELOG; then byte-budget check + auto-archive',
  phases: [
    { title: 'Sync', detail: 'Delegate to the doc-sync role, review its report, feedback ≤3 rounds, then commit (gaps → deferred items)' },
    { title: 'Budget', detail: '.keel/doc-size.mjs: every doc + split parts against budgets; split-link check' },
    { title: 'Archive', detail: 'Breaches on archivable docs: relocate closed detail to PHASE_ARCHIVE.md, one commit per doc' },
    { title: 'Split', detail: 'Still over budget: split the doc into docs/<name>/ parts behind a slim index; link check must pass' },
    { title: 'Prune', detail: 'Evidence retention: drop old review runs (never gate records or the ledger)' },
  ],
}

// Defaults written into .keel/meta.json "budgets" the first time this runs on a project that
// has none. Bytes. Edit meta.json to tune per project; do not edit here.
const DEFAULT_BUDGETS = {
  'AGENTS.md': 12288,
  'CLAUDE.md': 12288,
  'docs/IMPLEMENTATION_PLAN.md': 65536,
  'docs/adr/README.md': 16384,
}

// The doc rules live HERE, once. The doc-sync subagent (.claude/agents/doc-sync.md) and any
// full-time doc agent follow them; phase and change scripts call this workflow, never a copy.
const SYNC_RULES = `
  Mandatory doc sync — MUST run before the commit that completes a piece of work.
  Docs never lag code. Tables, not prose. Every ✅ / "verified" carries an evidence LEVEL and
  an ARTEFACT.

  Wording rule: write deploy state as "on \`<current branch>\`" — never "not yet merged" /
  "pending merge" / "will be merged". The merge step flips it to [merged] mechanically, so
  nothing you write here should need re-wording after the merge.

  Step 1 — Gather context:
  - git branch --show-current ; git log --oneline main..HEAD ; git diff main --name-only
  - Read AGENTS.md (or CLAUDE.md if no AGENTS.md) Current status table.
  - Read docs/IMPLEMENTATION_PLAN.md: phase status table, Changes table, deferred items table.
  - Evidence: ls .keel/evidence/ — find the record for this work (phase-N.json or chg-NNN.json).
    Phase branch with no phase-N.json → STOP and report status "blocked" (Verify must run first).
    Change with none: you may cite ONLY what the commits themselves prove (level "code-read")
    or tests you can point at by path (level "unit"/"integration"). You do NOT run suites here.
  - grep -rn "NEEDS DECISION" --include="*.md" docs/ AGENTS.md CLAUDE.md

  Step 2 — Classify this work:
  - Part of a Phase (branch phase-N-*)? → update that phase's exit-gate table from its evidence
    JSON (| Gate | Evidence level | Artefact | Verified by | Status |), phase row status
    (✅ only if every gate met; else 🔄 "N/M gates met"), Deploy state "on \`<branch>\`".
    Next phase → 🔄 only if this one is ✅.
  - Otherwise it is a Change → IMPLEMENTATION_PLAN "## Changes" table gets/keeps one row:
    | CHG-NNN | date | branch | one-line summary | ADR (or —) | evidence (level · artefact) | deploy state |
    Allocate CHG-NNN = highest existing + 1 (zero-padded, 3 digits) if the row does not exist.

  Step 3 — AGENTS.md (or CLAUDE.md) Current status — replace the 2-row table, one line per cell:
    | Last completed | <Phase N / CHG-NNN — one line> · on \`<branch>\` · evidence: <path or "code-read: <sha>"> |
    | Now | <what's next per IMPLEMENTATION_PLAN, or the open gates> |
  Anything longer belongs in CHANGELOG.md / IMPLEMENTATION_PLAN.md. Do not append history here.

  Step 4 — Decisions (docs/adr/, per-file; legacy single docs/ADR.md → same rules, append there):
  - Any decision made during this work ("we chose X over Y because Z") → a table-form ADR
    (references/templates/adr shape): next free number = max across docs/adr/ADR-*.md and
    docs/ADR.md headings + 1. One Y-statement Decision row; Options table; Consequences table
    with a "Build deviation" row. If it needs more than one Decision row, it is two ADRs.
  - Reserved/Proposed stubs this work filled → Status "Accepted → Built (<sha>)" in
    docs/adr/README.md. Stubs still Proposed or holding {{TBD}} → Status "UNCLASSIFIED (review)".
    Never auto-accept, never invent, never delete.
  - Decision NOT made (needs founder / legal) → docs/adr/README.md Open decisions table, one row
    per QUESTION with Locations and a Decider tag (founder | engineering | legal). Never invent
    a decision to close a row.
  - [NEEDS DECISION] markers resolved → remove marker AND add the ADR. Never just delete.
  - No addenda. Post-decision events are: build deviation (one ADR row) · incident (RUNBOOK.md
    Postmortems table) · deploy state (CHANGELOG / DEPLOYMENT deploy log) · superseded (new ADR).

  Step 5 — Deferred items table (IMPLEMENTATION_PLAN.md):
    | Item | Deferred from | Reason | Owner (founder|engineering|legal) | Revisit trigger | Target | Status |
  WHY and WHEN, not just WHAT. Earlier rows now resolved → ✅ + note. Negative results
  ("re-checked, still deferred", "investigated — not a bug") get a note; never silence.

  Step 6 — CHANGELOG.md [Unreleased]: one line per user-visible change, tagged [on-branch],
  with refs (Phase N / CHG-NNN / ADR-xxx). An incident found and fixed → RUNBOOK.md Postmortems
  row (PM-xxx) as well; never an ADR addendum.

  Split-aware writing (applies to EVERY doc edit below — budgets: .keel/meta.json):
  - Before editing a doc NAME.md, check for a sibling folder <name in lower-kebab>/ (DESIGN.md →
    design/). If it exists, NAME.md is an INDEX: write the new content into the part that holds
    that section (its "## Parts" table says which). Never append content to the index; the index
    only gains a Parts row.
  - New content that fits no existing part, or would push a part over its budget: add a new part
    (next free NN-<slug>.md, header "# <Doc title> — <section>" + "> Part of [NAME.md](../NAME.md)
    · all parts listed there.") and its row in the index's Parts table — or, if a part ends up
    over budget anyway, run: node .keel/doc-size.mjs --split <that part>.
  - A plain doc that your edit pushes over its budget is split, not piled on:
    node .keel/doc-size.mjs --split <doc>   (never for AGENTS.md / CLAUDE.md — those archive).
  - After your edits: node .keel/doc-size.mjs must report no LINK ERROR and no "split" verdict
    on a doc you touched. "ok"/"waived" are fine; "archive"/"manual" go in your Report for the
    caller (never compress the keystone's wording to fit — archive, then move whole sections out
    to a linked doc). Never split a doc the checker calls archive, waived or manual.
    Put its non-ok lines in your Report.

  Step 7 — Other docs touched: COMMANDS.md (new command) · DEPLOYMENT.md (new env var /
  build-arg / gotcha) · RUNBOOK.md (new playbook / postmortem) · requirement coverage map ·
  FEEDBACK_ROUNDS.md (if this work closes a feedback item).

  Step 8 — Evidence-ladder lint (before committing): in every file you edited, grep for
  "✅", "verified", "live-verified", "confirmed", "proven". Each occurrence YOU wrote must be in a
  row/line that names a level (code-read | unit | integration | local-browser | staging |
  prod-live) and an artefact (sha, report path, CI URL, transcript path). Fix or downgrade any
  that don't. Never write "prod-live" from this step — only DEPLOYMENT.md's deploy procedure may.
`

const REPORT_FORMAT = `
  End with EXACTLY this block (the caller parses it; one item per line, "none" if empty):
  ## Report
  role: doc-sync
  caller: <who delegated this>
  scope: <branch> · <main..HEAD range>
  status: done | partial | blocked
  changed:
  - <file> — <what changed>
  checked: <what you compared against: commits, diff, evidence record>
  findings:
  - <anything the work did that you could NOT document, and why>
  evidence: <evidence record path cited, or none>
  not verified: <claims you left at a lower level or unmarked>
  needs from caller: <questions/decisions, or none>
`

phase('Sync')

// Delegate → review → feedback loop. The script is the caller; it never loops past MAX_ROUNDS.
// The doc-sync role edits files but never commits; the caller commits once, after the loop.
const MAX_ROUNDS = 3
let feedback = ''
let review = { complete: false, missing: [] }
for (let round = 1; round <= MAX_ROUNDS; round++) {
  const report = await agent(`
  Working directory: <project root>
  You are the doc-sync role for this project: follow .claude/agents/doc-sync.md, or the brief of
  the full-time doc agent named in .keel/meta.json "agents"."doc-sync". Round ${round} of ${MAX_ROUNDS}.
  ${feedback ? 'Your caller reviewed your last report. Fix exactly these gaps, nothing else:\n' + feedback : ''}
  ${SYNC_RULES}
  Do NOT commit, push, or message anyone. Leave edits in the working tree.
  ${REPORT_FORMAT}
`, { label: `doc-sync-r${round}` })

  review = await agent(`
  Working directory: <project root>
  You are the CALLER (supervisor) of the doc-sync role. Check its work; do not edit docs yourself.
  Its report:
  ${report}

  1. What the work did: git log --oneline main..HEAD ; git diff main --name-only (code, config,
     migrations, commands, env vars) ; the evidence record under .keel/evidence/ for this branch.
  2. What the docs now say: git diff (uncommitted doc edits) + the report's "changed" list.
  3. List every thing the work did that the docs do not capture, specifically (file, what is
     missing, which doc should hold it). Also any ✅ / "verified" without a level + artefact.
  4. Split integrity: run node .keel/doc-size.mjs. Each of these is a gap to list: a split doc's
     index that gained body content (anything beyond its intro and Parts table — check git diff
     on the index), any LINK ERROR (a part not linked from its index, or not linking back), any
     "split" verdict on a doc the role touched, any doc newly over budget with no verdict reason
     the caller accepts. A new waiver needs the caller's (human's) approval — never self-granted.
  complete = true only if that list is empty.
`, {
    label: `doc-sync-review-r${round}`,
    schema: {
      type: 'object',
      properties: {
        complete: { type: 'boolean' },
        missing: { type: 'array', items: { type: 'string' } },
      },
      required: ['complete', 'missing'],
    },
  })
  if (review.complete) break
  feedback = review.missing.map(m => '  - ' + m).join('\n')
}

await agent(`
  Working directory: <project root>
  Close the doc sync. ${review.complete ? 'The caller accepted the docs.' : `After ${MAX_ROUNDS} rounds these gaps remain:\n` + review.missing.map(m => '  - ' + m).join('\n') + `
  Add one row per gap to IMPLEMENTATION_PLAN.md's Deferred items table:
  | Doc sync incomplete: <gap> | <branch> | doc-sync hit its ${MAX_ROUNDS}-round cap | engineering | next doc-sync on this area | — | ⬜ |
  Do not attempt the gaps yourself.`}
  Last step before the commit — size + link check: node .keel/doc-size.mjs
    - verdict "split" → node .keel/doc-size.mjs --split <file>, then re-run the check.
      ("archive" is left for the Archive stage that follows; "ok"/"waived" need nothing; "manual"
      goes into the Report with its reason — do not hand-split it here.)
    - Any LINK ERROR → fix the link (add the Parts row, or the "> Part of" line); never delete a
      part. Re-run until no LINK ERROR. Do not commit with a LINK ERROR.
  Commit:
    git add -A docs AGENTS.md CLAUDE.md CHANGELOG.md 2>/dev/null; git add -u
    git commit -m "docs: sync — <what> | <n> ADRs | <n> deferred | evidence: <level>"
  Report the commit sha, files updated, and any deferred doc gaps.
`, { label: 'doc-sync-commit' })

phase('Budget')

// Deterministic: .keel/doc-size.mjs measures every doc once (split parents and their parts
// separately), gives one verdict per doc (ok/waived/archive/split/manual + reason), and checks
// split-doc links. Archives, waivers, generated files and ADR indexes are handled there. No judgement here.
const SIZE_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    breaches: { type: 'array', items: { type: 'object', properties: {
      file: { type: 'string' }, size: { type: 'number' }, budget: { type: 'number' },
      action: { type: 'string', enum: ['archive', 'split', 'manual'] }, reason: { type: 'string' } },
      required: ['file', 'size', 'budget', 'action', 'reason'] } },
    linkErrors: { type: 'array', items: { type: 'string' } },
  },
  required: ['ok', 'breaches', 'linkErrors'],
}
const sizeCheck = (label, after = false) => agent(`
  Working directory: <project root>
  Size + split-link check. Mechanical — run it and return its JSON fields; edit nothing.
  1. If .keel/meta.json has no "budgets", add exactly ${JSON.stringify(DEFAULT_BUDGETS)} and
     "defaultBudget": 32768, then commit: git add .keel/meta.json && git commit -m "chore: keel budgets"
  2. node .keel/doc-size.mjs --json${after ? ' --after-archive' : ''}  (exit 1 only means linkErrors is non-empty — still return it)
     Return ok, linkErrors, and breaches exactly as printed (each has action + reason).
     If .keel/doc-size.mjs is missing: return breaches [], linkErrors [], ok true, and say
     "doc-size.mjs missing — run /keel upgrade" (do not guess verdicts by hand).
`, { label, effort: 'low', schema: SIZE_SCHEMA })

let size = await sizeCheck('size-check')
log(size.breaches.length
  ? 'Budget breached: ' + size.breaches.map(b => `${b.file} ${b.size}B > ${b.budget}B → ${b.action}`).join(', ')
  : 'Budgets OK')

const toArchive = size.breaches.filter(b => b.action === 'archive')
if (toArchive.length) {
  phase('Archive')

  // One agent per breached file, each its own commit, so a bad relocation reverts alone.
  // No retry loop: one pass; whatever is still over goes to Split (keystone excepted).
  await pipeline(toArchive, (b) => agent(`
    Working directory: <project root>

    Auto-archive: ${b.file} is ${b.size} bytes, budget ${b.budget}. Bring it under budget by
    RELOCATING closed detail to docs/PHASE_ARCHIVE.md per references/keel-archive-guide.md.
    Relocate, never delete. Verbatim into the archive; a one-line outcome + link stays behind.

    Eligible (only these):
    - PHASE_COMPLETE: a ✅ phase block whose every exit gate is met → leave
      "## Phase N — <name> ✅  <one-line outcome>. Full detail: PHASE_ARCHIVE.md#phase-n-<slug>";
      the phase-status table row stays.
    - DEFERRED_RESOLVED: ✅ rows of the deferred table → PHASE_ARCHIVE "Resolved deferred items".
    - CHANGE_MERGED: Changes-table rows whose deploy state is [merged]/[deployed]/[live-verified]
      AND older than the last 10 rows → PHASE_ARCHIVE "Changes history".
    - ADR_SUPERSEDED: ⚠️ Superseded ADRs → body to PHASE_ARCHIVE, index row stays.
    - KEYSTONE_DRIFT: anything in AGENTS.md/CLAUDE.md beyond the 2-row status table, stacked old
      status entries, sections that duplicate a doc they point at → PHASE_ARCHIVE
      "#agents-md-current-status-history"; leave a one-line pointer.
    - CHANGELOG_OVERFLOW: CHANGELOG.md released sections older than the last 3 releases →
      PHASE_ARCHIVE "Changelog history" (only if CHANGELOG.md is the breached file).
    - POSTMORTEM_CLOSED: RUNBOOK Postmortems rows whose prevention has landed (commit cited) and
      are older than 90 days → PHASE_ARCHIVE (only if RUNBOOK.md is the breached file).

    NEVER touch: the 🔄 / ⬜ phases · open deferred rows · Proposed / Accepted / UNCLASSIFIED
    ADRs · DEPLOYMENT.md's environment matrix or build-time/runtime table · the Document map,
    Hard invariants, Git & working workflow, or the 2-row status table · any ID (Phase numbers,
    ADR/CHG/PM numbers, requirement IDs — bodies move, IDs stay) · anything holding an
    unresolved [NEEDS DECISION].

    Steps:
    1. Read ${b.file} and docs/PHASE_ARCHIVE.md (create from references/templates/PHASE_ARCHIVE.md
       if missing). Pick the eligible items, oldest first, until the projected size is under
       ${b.budget} bytes. Do not archive more than needed.
    2. Apply the relocations exactly as the archive guide's before/after shapes describe.
    3. Re-check: wc -c < ${b.file}
    4. Update .keel/meta.json: lastArchived = today (date +%F), archivedEntries += <count>.
    5. Commit this file's relocation on its own:
         git add ${b.file} docs/PHASE_ARCHIVE.md .keel/meta.json && \\
         git commit -m "docs: auto-archive — ${b.file} ${b.size}B > ${b.budget}B (<count> items relocated)"
    6. If nothing eligible exists: make NO edits (git checkout -- ${b.file} if you started) and
       report exactly "BUDGET_EXCEEDED: ${b.file} <size>B > ${b.budget}B — nothing archivable".
       If you relocated everything eligible and it is still over budget: keep and commit that
       progress (step 5), then report "STILL_OVER: ${b.file} <size>B > ${b.budget}B". Do not try
       again — the Split stage takes it from here. Keystone files (AGENTS.md / CLAUDE.md) are
       never split and never compressed to fit: if still over, MOVE whole sections out (detail a
       session does not need every time — e.g. long tables, Delegation detail) verbatim to
       docs/<agents|claude>/NN-<slug>.md, each starting "# <title> — <section>" then
       "> Part of [AGENTS.md](../../AGENTS.md) · all parts listed there.", and leave in the keystone
       a "## Parts" table linking each (docs/agents/NN-slug.md) with a one-line "read when".
       Hard rules (invariants, workflow steps) stay in the keystone. Commit as "docs: move
       <section> out of ${b.file}". Report "BUDGET_EXCEEDED" only if nothing can move.

    Report: items relocated by category, before/after sizes, commit sha — or the BUDGET_EXCEEDED line.
  `, { label: `archive:${b.file}`, phase: 'Archive' }))
  size = await sizeCheck('size-recheck', true)
}

const manual = size.breaches.filter(b => b.action === 'manual')
if (manual.length) log('Needs a human (no automatic fix): ' + manual.map(b => `${b.file} — ${b.reason}`).join('; '))
const toSplit = size.breaches.filter(b => b.action === 'split')
if (toSplit.length) {
  phase('Split')

  // A doc still over budget is split into a sub-folder, never just warned about.
  // Rules + exact shapes: references/keel-archive-guide.md "Splitting an oversize doc".
  await pipeline(toSplit, (b) => agent(`
    Working directory: <project root>

    Split: ${b.file} is ${b.size} bytes, budget ${b.budget}. Run the deterministic split first:
      node .keel/doc-size.mjs --split ${b.file}
    It implements keel-archive-guide.md "Splitting an oversize doc" exactly (below, for review
    and for the case it refuses: e.g. a single section with no lower heading — then split by hand
    to the same shape). Then add the IDs column to the index's Parts table and a one-line purpose
    if missing. Move, never delete or reword; IDs never change.
    - Parent docs/NAME.md → folder docs/<name in lower-kebab>/ (DESIGN.md → docs/design/,
      IMPLEMENTATION_PLAN.md → docs/implementation-plan/), parts NN-<section-slug>.md, one per
      top-level "## " section in original order (merge adjacent small sections; a section still
      over ${b.budget} bytes splits at "### "). Each part: H1 "<Doc title> — <section>", then
      "> Part of [NAME.md](../NAME.md) · all parts listed there.", then the content verbatim.
    - The parent becomes a slim index: H1, one-line purpose, the ID ranges it owns, and a
      "## Parts" table (| Part | Covers | IDs |) linking EVERY part as (<name>/NN-slug.md).
    - If ${b.file} is itself a part (inside a split folder): split it into more parts in the same
      folder with the next free NN numbers, and add them to the parent's Parts table.
    - Rewrite inbound anchor links repo-wide: grep -rn "NAME.md#" — point each at the part that
      now holds that heading. Links to NAME.md without an anchor stay (the index).
    - Check: node .keel/doc-size.mjs must show no LINK ERROR and no part over budget.
    - Commit on its own:
        git add -A <parent> <folder> && git add -u && \\
        git commit -m "docs: split ${b.file} into <folder>/ (<n> parts) — ${b.size}B > ${b.budget}B"
    Report: parts created (file · bytes), links rewritten, commit sha.
  `, { label: `split:${b.file}`, phase: 'Split' }))
  size = await sizeCheck('size-final')
}

// The split invariants are hard: a part the parent doesn't link, or a part with no link back,
// fails doc-sync (and so blocks the merge that follows it).
if (size.linkErrors.length) {
  throw new Error('doc-size link check failed:\n' + size.linkErrors.join('\n'))
}

// Evidence retention (conventions "Evidence retention"). Deterministic script, one commit, no loop.
phase('Prune')
await agent(`
  Working directory: <project root>
  If .keel/prune-evidence.mjs does not exist, report "no prune script" and stop.
  1. node .keel/prune-evidence.mjs            (dry run — read the list)
  2. If it lists anything: node .keel/prune-evidence.mjs --apply
     git add -A .keel/evidence && git commit -m "chore: prune review evidence (<count> folders)"
  Never delete anything by hand; the script never touches gate records, phase-N/ / chg-xxx/
  folders, or ledger/. Report the folders removed (or "nothing to prune").
`, { label: 'prune' })
