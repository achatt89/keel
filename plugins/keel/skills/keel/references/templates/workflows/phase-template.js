// Keel phase workflow template (doc format 2)
// Copy this file to .claude/workflows/phase-N-<slug>.js and fill in the {{PLACEHOLDERS}}.
// Run: claude --workflow .claude/workflows/phase-N-<slug>.js
// Or invoke via the Workflow tool in a Claude Code session.
//
// Stages: Setup → Build → Integrate → Verify → Doc Sync → Merge.
// Verify is the ONLY stage that runs test suites for evidence; Doc Sync cites its output
// (.keel/evidence/phase-N.json) and never re-runs them. Merge flips deploy state to [merged].

export const meta = {
  name: 'phase-{{N}}-{{SLUG}}',
  description: 'Phase {{N}}: {{PHASE_NAME}} — {{PHASE_GOAL_ONE_SENTENCE}}',
  phases: [
    { title: 'Setup', detail: 'Create/checkout phase-{{N}}-{{SLUG}} off main; reserve ADR IDs' },
    { title: 'Build', detail: '{{TASKS_SUMMARY — comma-separated list of parallel tasks}}' },
    { title: 'Integrate', detail: 'Merge each task branch into phase-{{N}}-{{SLUG}}; renumber pending ADRs' },
    { title: 'Verify', detail: 'Run every exit gate once; write .keel/evidence/phase-{{N}}.json' },
    { title: 'Doc Sync', detail: 'Fill exit-gate table from evidence; status, ADRs, deferred, CHANGELOG' },
    { title: 'Merge', detail: 'Merge phase-{{N}}-{{SLUG}} into main; flip deploy state to [merged]' },
  ],
}

// ── PHASE {{N}}: {{PHASE_NAME}} ─────────────────────────────────────────────
//
// Replace each {{TASK_N}} with the actual scope items from IMPLEMENTATION_PLAN Phase {{N}}.
// Each task becomes one worktree agent. Keep tasks independent (different files/modules).
// If tasks are not divisible, run them sequentially inside a single agent instead.
//
// Branch structure: one phase branch (phase-{{N}}-{{SLUG}}) is the integration point for
// every task in this phase. Task worktrees branch off it, merge back into it, and only the
// phase branch — carrying every task's code plus the doc-sync commit — ever merges to main.
// Never merge a task branch directly to main.
//
// Parallel-work ID rules (conventions.md): sequential IDs allocated at build time collide
// across worktrees. So: (1) ADR numbers are RESERVED here in Setup, before any task runs;
// (2) migration files are TIMESTAMP-prefixed (e.g. 20260920143000_add_waitlist.sql), never
// sequential (0013_…); (3) any other sequential registry the project has (seed ids, tags) gets a
// uniqueness test that Integrate runs.

// Decisions this phase's IMPLEMENTATION_PLAN scope block names. One reserved ADR per entry.
// Setup allocates the numbers; tasks write into the stubs. Leave empty ([]) if the scope names none.
const RESERVED_ADRS = [
  '{{adr-slug-1 — e.g. "email-provider"}}',
  '{{adr-slug-2}}',
]

phase('Setup')

await agent(`
  Working directory: <project root>

  Create or resume the Phase {{N}} integration branch, then reserve ADR IDs.

  Branch:
  1. git fetch origin main --quiet 2>/dev/null || true
  2. If phase-{{N}}-{{SLUG}} already exists (resuming a partially-done phase): git checkout phase-{{N}}-{{SLUG}}
     Otherwise: git checkout -b phase-{{N}}-{{SLUG}} main
  3. Confirm: git branch --show-current  (must print phase-{{N}}-{{SLUG}})

  Reserve ADR IDs (skip if ${JSON.stringify(RESERVED_ADRS)} is empty or every stub already exists — resuming):
  4. Find the highest existing ADR number across BOTH layouts:
       ls docs/adr/ADR-*.md 2>/dev/null | sed -E 's/.*ADR-([0-9]+).*/\\1/' | sort -n | tail -1
       grep -oE '^## ADR-[0-9]+' docs/ADR.md 2>/dev/null | sed -E 's/.*ADR-//' | sort -n | tail -1
     Take the max of the two (0 if neither exists). Next = max + 1.
  5. For each slug in ${JSON.stringify(RESERVED_ADRS)}, in order, create
       docs/adr/ADR-<NNN>-<slug>.md   (NNN zero-padded to 3 digits)
     from references/templates/adr/ADR-NNN-slug.md's shape with: title "ADR-NNN — <slug, humanised>",
     Status row = "Proposed (reserved for Phase {{N}}, {{today}})", every other cell "{{TBD — filled by the task that decides this}}".
     Add a row to docs/adr/README.md's index for each, Status "Proposed".
  6. Commit: git add docs/adr && git commit -m "docs: reserve ADR-<first>..<last> for phase {{N}}"
  7. Report the mapping slug → ADR-NNN (tasks are told this in their prompt via the Build step).

  Do not do any task work here — this step only ensures the integration branch exists, is
  checked out, and the phase's decision slots are numbered before any worktree branches from it.
`, { label: 'phase-branch-setup' })

phase('Build')

const TASKS = [
  '{{TASK_1 — e.g. "Implement auth module per LLD.md §3.1 — login, session, role checks"}}',
  '{{TASK_2 — e.g. "Add user profile API endpoints per LLD.md §3.2"}}',
  '{{TASK_3 — e.g. "Build the core UI screen per DESIGN.md §6.1 — run /impeccable shape first"}}',
  // Add or remove tasks. One task = one worktree. Tasks must not write to the same files.
]

const buildResults = await parallel(TASKS.map((task, i) => () => agent(`
  You are working in a git worktree of <project root>.
  Reference these docs before starting: IMPLEMENTATION_PLAN.md Phase {{N}}, ARCHITECTURE.md, LLD.md.
  Non-negotiables (ENGINEERING_DESIGN.md) apply unconditionally.

  Your task: ${task}

  0. Confirm this worktree branched from phase-{{N}}-{{SLUG}}, not main — if it didn't, fix it
     before writing any code:
       git merge-base --is-ancestor phase-{{N}}-{{SLUG}} HEAD || git rebase phase-{{N}}-{{SLUG}}

  FIRST — set your exit condition:
    /goal "${task} is implemented, its tests pass, lint is clean, and the verify skill confirms
    the behavior end-to-end (plus a manual claude-in-chrome pass if this touches UI)"
  This is a real Claude Code primitive — it blocks you from ending your turn until the condition
  holds. Treat it as your directive, not a checklist to skim.

  ── ID rules (other worktrees are running in parallel — these prevent collisions) ────
  - Migrations: TIMESTAMP-prefixed file names (YYYYMMDDHHmmss_<slug>.<ext>), never the next
    sequential number. If the project's migration tool insists on sequence numbers, say so in
    your report — Integrate will renumber, but do not pick a number yourself.
  - ADRs: Setup reserved docs/adr/ADR-NNN-<slug>.md stubs for this phase (see its report / git log
    on phase-{{N}}-{{SLUG}}). Write your decision INTO the matching stub (fill every {{TBD}} cell,
    flip Status to "Accepted ({{today}})"). Do not create a new ADR number. If you must record a
    decision that has no reserved stub, create docs/adr/ADR-{{N}}-pending-<slug>.md (literally the
    word "pending", no number) — Integrate assigns the number.
  - Decisions you did NOT get to make (needs founder/legal input): leave the stub "Proposed" and
    add the question to docs/adr/README.md's Open decisions table with a Decider tag
    (founder | engineering | legal). Never invent a decision to fill a stub.
  ── End ID rules ───────────────────────────────────────────────────────────

  ── If this task includes UI work ──────────────────────────────────────────
  1. Run /impeccable shape <feature> FIRST — plan the UX/UI before writing code.
  2. Check modern-web-guidance before any new UI pattern:
       npx -y modern-web-guidance@latest search "<what you want to achieve>"
       npx -y modern-web-guidance@latest retrieve "<id>"  (for the full guide)
  3. After the feature is functionally complete:
       /impeccable critique <target>   (UX review)
       /impeccable audit <target>      (technical gate — must pass with zero P0/P1)
  4. Manually verify in-browser with claude-in-chrome — drive the actual golden path and its
     key edge cases; reading the code back is not verification.
  ── End UI section ─────────────────────────────────────────────────────────

  Implementation steps:
  1. Read the relevant spec sections listed above.
  2. Implement the task following the spec.
  3. Write tests alongside the code (unit for logic, integration for cross-module behaviour).
  4. Run tests and lint: npm test && npm run lint  (or project equivalent).
  5. Run the verify skill — exercise the change end-to-end, not just tests/typecheck.
  6. If anything fails: fix it and repeat from step 3. Do not stop on a failure — that's what
     /goal is for.

  {{GOAL_EXIT_STRATEGY_BLOCK — filled from IMPLEMENTATION_PLAN's Standing rules choice. Example
    (bounded-retries-then-escalate, the default): "Retry budget: up to 3 fix-and-retest cycles.
    If the goal still isn't met after 3 attempts, stop — run /goal clear, commit whatever is
    working, and add a row to IMPLEMENTATION_PLAN's deferred-items table stating exactly what's
    blocking and why, for human review."}}

  7. Stage and commit all changes: git add -A && git commit -m "feat(${task.slice(0,40)}): ..."
  8. Return: your branch name (git branch --show-current), a 2–3 line summary, and — honestly —
     the evidence LEVEL you reached for this task (code-read | unit | integration | local-browser).
     Verify will re-run suites; you are not the last word on "done".

  Do NOT merge or push from here — the Integrate step merges your branch into phase-{{N}}-{{SLUG}}.
`, { isolation: 'worktree', label: `task-${i + 1}` })))

phase('Integrate')

const taskBranches = buildResults
  .filter(Boolean)
  .map(r => {
    if (!r) return null
    if (typeof r === 'string') return r.match(/worktree-[a-z0-9-]+/)?.[0] || null
    return r.branch || null
  })
  .filter(Boolean)

log('Integrating into phase-{{N}}-{{SLUG}}: ' + (taskBranches.length ? taskBranches.join(', ') : 'checking git worktree list'))

await agent(`
  Working directory: <project root>

  Merge every Phase {{N}} task branch into the phase-{{N}}-{{SLUG}} integration branch. This is
  NOT the final merge to main — main is untouched until the Merge step, after doc-sync.

  1. Checkout the integration branch: git checkout phase-{{N}}-{{SLUG}}
  2. List active worktrees: git worktree list
  3. For each task branch (from worktree list, excluding the main checkout):
       git merge --no-ff <branch> -m "merge(phase-{{N}}): <branch-task-description>"
     Resolve conflicts if any arise; re-run the failing task's tests after resolving.
  4. Remove each task worktree: git worktree remove <path> --force
  5. Delete merged task branches: git branch -d <branch>
  6. ID collision sweep (after all merges):
     - Pending ADRs: for each docs/adr/ADR-{{N}}-pending-*.md, assign the next free number
       (max existing + 1, same lookup as Setup), git mv it to ADR-NNN-<slug>.md, fix its title
       and add its index row. Commit "docs: number pending ADRs from phase {{N}}".
     - Migrations: if two migration files share a sequence prefix (project uses sequential
       numbering despite the rule), renumber the later-merged one and commit
       "fix(phase-{{N}}): renumber migration <old> -> <new> — collision". Say in the report
       that the project should move to timestamp names.
     - Run any registry uniqueness tests the project has (seed ids, capability tags, route names).
  7. Confirm: git log --oneline -8

  Report: branches integrated, worktrees removed, any conflicts and how resolved, any IDs renumbered.
`, { label: 'integrate' })

phase('Verify')

// The ONE place suites run for evidence. Output is the machine-citable record Doc Sync fills
// the exit-gate table from. Build agents' own "it passes" claims are inputs, not evidence.
await agent(`
  Working directory: <project root> — must be on phase-{{N}}-{{SLUG}} (confirm: git branch --show-current).

  Produce evidence for every exit gate of IMPLEMENTATION_PLAN.md Phase {{N}} and write it to
  .keel/evidence/phase-{{N}}.json. You run the checks yourself, once. Do not trust the Build
  agents' summaries — reproduce.

  1. Read IMPLEMENTATION_PLAN.md Phase {{N}} — list every exit gate verbatim (the Gate column of
     its exit-gate table, or the bullets if not yet tabular).
  2. Run the full suite set once, capturing counts and every skipped test BY NAME:
       lint · typecheck · unit · integration · isolation/critical suites · e2e/smoke · audit
       (npm audit or equivalent) · build.   Use the project's COMMANDS.md names.
     Save raw reports under .keel/evidence/phase-{{N}}/ (test-report.txt, audit.txt, …).
  3. For each gate, decide the highest evidence LEVEL you actually observed:
       code-read      — you read the code; nothing executed
       unit           — unit tests exercised it
       integration    — cross-module / real DB or service in a test
       local-browser  — a real claude-in-chrome pass on the local stack (save the transcript to
                        .keel/evidence/phase-{{N}}/browser-<gate-slug>.md)
       staging        — observed on a deployed staging env
     NEVER write "prod-live" here — only a deploy (DEPLOYMENT.md deploy log) can claim that.
     If a gate's own wording demands a level you did not reach (e.g. it says "in a browser" and
     you only have unit tests), status is "partial", not "met". Say what is missing in notes.
  4. UI phases: run the claude-in-chrome golden path + key edge cases against the local stack,
     and /impeccable audit <target> (zero P0/P1 is a gate). Save transcripts/outputs as artefacts.
  5. Write .keel/evidence/phase-{{N}}.json with EXACTLY this shape:
     {
       "phase": "{{N}}",
       "branch": "phase-{{N}}-{{SLUG}}",
       "commit": "<git rev-parse --short HEAD>",
       "date": "<YYYY-MM-DD>",
       "gates": [
         {
           "gate": "<verbatim gate text>",
           "level": "code-read | unit | integration | local-browser | staging",
           "artefact": "<commit sha | .keel/evidence/phase-{{N}}/<file> | CI run URL | browser transcript path>",
           "verifiedBy": "verify-agent",
           "status": "met | partial | unmet",
           "notes": "<what was observed; for partial/unmet, exactly what is missing>"
         }
       ],
       "suites": {
         "<suite name>": { "files": <int>, "passed": <int>, "failed": <int>, "skipped": ["<test name>", "..."] , "report": "<path>" }
       },
       "impeccable": { "target": "<path or null>", "p0": <int>, "p1": <int>, "report": "<path or null>" }
     }
     Every gate in the plan appears exactly once. Unknown = "unmet", never omitted.
  6. Commit: git add .keel/evidence && git commit -m "test(phase-{{N}}): verify — <met>/<total> gates met"

  Report: the gates table (gate · level · status) and any suite failures. Do NOT fix code here —
  if a gate is unmet, the report is the finding; Doc Sync records it as 🔄 with a note.
`, { label: 'verify' })

phase('Doc Sync')

// MANDATORY — do not skip. No merge to main without the doc-sync commit, and it lands on the
// phase branch (not main) so main only ever receives phase branch + doc-sync as one unit.
// This step CITES .keel/evidence/phase-{{N}}.json. It does not re-run anything.
await agent(`
  Working directory: <project root> — must be on phase-{{N}}-{{SLUG}} (confirm: git branch --show-current).

  Phase {{N}} — mandatory doc sync before merging phase-{{N}}-{{SLUG}} to main.
  Tables, not prose. Every claim carries an evidence level + artefact from the Verify record.

  Wording rule: the merge has not happened yet, and this text must not need editing after it
  does. Write deploy state as "on \`phase-{{N}}-{{SLUG}}\`" — never "not yet merged", "pending
  merge", or "will be merged". The Merge step flips it to [merged] mechanically.

  1. Read .keel/evidence/phase-{{N}}.json (Verify's record) and git log --oneline main..HEAD.
     If the evidence file is missing, STOP and report — Doc Sync does not run suites itself.
  2. IMPLEMENTATION_PLAN.md Phase {{N}} exit-gate table — one row per gate, straight from the JSON:
       | Gate | Evidence level | Artefact | Verified by | Status |
     Status: met → ✅, partial → 🔄 + the notes, unmet → ⬜ + the notes.
     Phase status table: ✅ only if EVERY gate is met; otherwise 🔄 with "N/M gates met, see
     exit-gate table". Deploy state column: "on \`phase-{{N}}-{{SLUG}}\`". Last update: today.
     Next phase → 🔄 only if this one is ✅.
  3. AGENTS.md (or CLAUDE.md if AGENTS.md does not exist) Current status — the 2-row table:
       | Last completed | Phase {{N}} — <one line> · on \`phase-{{N}}-{{SLUG}}\` · evidence: .keel/evidence/phase-{{N}}.json |
       | Now | <next phase or the open gates of this one> |
     One line per cell. Detail belongs in CHANGELOG / IMPLEMENTATION_PLAN, not here.
  4. ADRs (docs/adr/):
     - Reserved stubs now "Accepted" with every {{TBD}} filled → set index row Status to
       "Accepted → Built (<commit>)" and fill the ADR's "Build deviation" row ("none" if built
       as decided). Decisions are one Y-statement row; if a decision needs more than that, it is
       a second ADR, not a longer cell.
     - Stubs still "Proposed" or with {{TBD}} cells → index Status "UNCLASSIFIED (review)".
       Never auto-accept, never invent content, never delete the stub.
     - Any decision visible in git log / diffs with no ADR at all → create it now (next free
       number, same lookup as Setup) — but only if the decision was actually made; otherwise
       an Open decisions row with a Decider tag.
     - [NEEDS DECISION] markers resolved during the phase: remove marker + ADR. Never just delete.
  5. Deferred items table: one row per punted item — Item · Deferred from · Reason · Owner
     (founder | engineering | legal) · Revisit trigger · Target · Status. WHY and WHEN, not
     just WHAT. Earlier rows now resolved → ✅ + note. Negative results ("re-checked, still
     deferred", "investigated, not a bug") get a row or a note — never silence.
  6. CHANGELOG.md [Unreleased]: one line per user-visible change this phase shipped, tagged
     [on-branch] with refs (Phase {{N}}, ADR-xxx). Postmortem-shaped findings (an incident,
     a silent breakage found and fixed) → RUNBOOK.md Postmortems table, not an ADR addendum.
  7. Other docs the work touched: COMMANDS.md (new commands) · DEPLOYMENT.md (new env var /
     build-arg / gotcha) · RUNBOOK.md (new playbook) · requirement coverage map.
  8. Evidence-ladder lint before committing: grep the files you edited for "✅", "verified",
     "live-verified", "confirmed" — each occurrence you wrote must sit in a row/line that names
     a level and an artefact. Fix any that don't. Do not write "prod-live" anywhere.
  9. Commit on phase-{{N}}-{{SLUG}}:
       git add AGENTS.md CLAUDE.md docs/IMPLEMENTATION_PLAN.md docs/adr CHANGELOG.md && git add -u
       git commit -m "docs: phase {{N}} — <met>/<total> gates met | <n> ADRs accepted | <n> deferred"

  Report: gates met/partial/unmet, ADRs accepted / unclassified, deferred rows added.
`, { label: 'doc-sync' })

phase('Merge')

await agent(`
  Working directory: <project root>

  Merge the completed phase-{{N}}-{{SLUG}} branch (code + evidence + doc-sync commit) into main,
  then flip deploy state to [merged] — the one and only state edit this step makes.

  1. Checkout main: git checkout main
  2. Confirm phase-{{N}}-{{SLUG}} is fully ready: git log --oneline main..phase-{{N}}-{{SLUG}}
     — the last commit must be the doc-sync commit from the previous step, and
     .keel/evidence/phase-{{N}}.json must exist on the branch. If either is missing, STOP.
  3. Merge: git merge --no-ff phase-{{N}}-{{SLUG}} -m "merge(phase-{{N}}): {{PHASE_NAME}}"
  4. Flip state — mechanical text edits only, no re-wording:
     - CHANGELOG.md: every [Unreleased] line tagged [on-branch] that references Phase {{N}} →
       [merged <short sha of the merge commit>]
     - IMPLEMENTATION_PLAN.md phase status table, Phase {{N}} row, Deploy state column:
       "on \`phase-{{N}}-{{SLUG}}\`" → "merged <sha>"
     - AGENTS.md / CLAUDE.md status table, Last completed cell: same substitution.
     git add -u && git commit -m "docs: phase {{N}} merged"
  5. Delete the phase branch: git branch -d phase-{{N}}-{{SLUG}}
  6. Confirm: git log --oneline -8
  7. Report: what merged, any conflicts and how resolved. Remind: "deployed vNN" and
     "live-verified" are recorded by the deploy procedure in DEPLOYMENT.md (deploy log +
     CHANGELOG stamp), not here.

  DO NOT push to origin unless explicitly instructed.
`, { label: 'merge-to-main' })
