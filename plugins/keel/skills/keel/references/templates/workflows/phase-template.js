// Keel phase workflow template
// Copy this file to .claude/workflows/phase-N-<slug>.js and fill in the {{PLACEHOLDERS}}.
// Run: claude --workflow .claude/workflows/phase-N-<slug>.js
// Or invoke via the Workflow tool in a Claude Code session.

export const meta = {
  name: 'phase-{{N}}-{{SLUG}}',
  description: 'Phase {{N}}: {{PHASE_NAME}} — {{PHASE_GOAL_ONE_SENTENCE}}',
  phases: [
    { title: 'Setup', detail: 'Create/checkout the phase-{{N}}-{{SLUG}} integration branch off main' },
    { title: 'Build', detail: '{{TASKS_SUMMARY — comma-separated list of parallel tasks}}' },
    { title: 'Integrate', detail: 'Merge each task branch into phase-{{N}}-{{SLUG}}' },
    { title: 'Doc Sync', detail: 'Update CLAUDE.md, IMPLEMENTATION_PLAN, ADR, deferred items' },
    { title: 'Merge', detail: 'Merge phase-{{N}}-{{SLUG}} into main, clean up' },
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

phase('Setup')

await agent(`
  Working directory: <project root>

  Create or resume the Phase {{N}} integration branch:
  1. git fetch origin main --quiet 2>/dev/null || true
  2. If phase-{{N}}-{{SLUG}} already exists (resuming a partially-done phase): git checkout phase-{{N}}-{{SLUG}}
     Otherwise: git checkout -b phase-{{N}}-{{SLUG}} main
  3. Confirm: git branch --show-current  (must print phase-{{N}}-{{SLUG}})

  Do not do any task work here — this step only ensures the integration branch exists and is
  checked out, so every task worktree created in the next phase branches from it, not from main.
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
  8. Return: your branch name (git branch --show-current) and a 2–3 line summary.

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
  6. Confirm: git log --oneline -8

  Report: branches integrated, worktrees removed, any conflicts and how resolved.
`, { label: 'integrate' })

phase('Doc Sync')

// MANDATORY — do not skip. No merge to main without the doc-sync commit, and it lands on the
// phase branch (not main) so main only ever receives phase branch + doc-sync as one unit.
await agent(`
  Working directory: <project root> — must be on phase-{{N}}-{{SLUG}} (confirm: git branch --show-current).

  Phase {{N}} — mandatory doc sync before merging phase-{{N}}-{{SLUG}} to main.

  1. Read git log --oneline main..HEAD to see what this phase delivered.
  2. Update CLAUDE.md current status (2 lines: last completed + now).
  3. Update IMPLEMENTATION_PLAN.md phase {{N}} status → ✅, next phase → 🔄.
  4. Capture any decisions made during Phase {{N}} as ADR entries in ADR.md.
  5. Record any deferred items in the IMPLEMENTATION_PLAN deferred-items table (with reason + target phase).
  6. Resolve any [NEEDS DECISION] markers: remove marker + add ADR. Never just delete the marker.
  7. Commit on phase-{{N}}-{{SLUG}}: git add CLAUDE.md IMPLEMENTATION_PLAN.md ADR.md && git add -u
            git commit -m "docs: phase {{N}} complete — [decisions] [deferred items]"
`, { label: 'doc-sync' })

phase('Merge')

await agent(`
  Working directory: <project root>

  Merge the completed phase-{{N}}-{{SLUG}} branch (code + doc-sync commit) into main.

  1. Checkout main: git checkout main
  2. Confirm phase-{{N}}-{{SLUG}} is fully ready: git log --oneline main..phase-{{N}}-{{SLUG}}
     — the last commit must be the doc-sync commit from the previous step.
  3. Merge: git merge --no-ff phase-{{N}}-{{SLUG}} -m "merge(phase-{{N}}): {{PHASE_NAME}} complete"
  4. Delete the phase branch: git branch -d phase-{{N}}-{{SLUG}}
  5. Confirm: git log --oneline -8
  6. Report: what merged, any conflicts and how resolved.

  DO NOT push to origin unless explicitly instructed.
`, { label: 'merge-to-main' })
