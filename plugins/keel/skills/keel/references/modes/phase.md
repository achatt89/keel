# Keel mode: phase

Loaded by the router (`SKILL.md`, "Modes"). The router's Operating principles, Update check and
"Writing into split docs" apply here. Upgrade Mode is in `upgrade.md`; generation Phase 3 is in `generation.md`; Change Mode is in `change.md`.

## Phase Mode — `/keel phase new <slug> [--after N | --split N]`

**Trigger:** user says "keel phase new", "add a phase", "scope the next phase", "insert a phase
after N", "split phase N", "plan Phase N", or any equivalent phrasing in a keel project.

**Why this exists:** a build never ends at the phases generated on day one. Projects grow by
scoping new phases — a plan block, a workflow script, the decisions it will need — and without a
ritual that scoping is done by hand, inconsistently, and the numbering drifts. This mode *is* the
ritual. It scopes; it does not build (the generated script does that).

**Prerequisite:** same keel-project detection as Upgrade Mode, and `docFormat: 2` in
`.keel/meta.json` (on format 1, say so and point at `/keel upgrade`).

### Steps

1. **Number the phase.** Read the phase-status table in `IMPLEMENTATION_PLAN.md`.
   - No flag → next integer after the highest existing phase.
   - `--after N` → the phase is **inserted** as `N.1` (or `N.2`… if `N.1` exists). Existing phases
     are **never renumbered**; the new block is placed after Phase N's block and the status row
     after N's row.
   - `--split N` → Phase N (must be ⬜ or 🔄, never ✅) becomes `N.a` and `N.b`: the original row
     and block are renamed `N.a` and keep everything that has evidence; `N.b` gets the remainder.
     Ask with `AskUserQuestion` which scope items move.
   - A closeout phase (from `/keel closeout`) is `N.5` after the phase that is 🔄 or last ✅; if `N.5`
     already exists, the next free `N.x` after the highest one (`N.15` exists → `N.16`). Never renumber.
     `node .keel/doc-size.mjs --closeout docs/IMPLEMENTATION_PLAN.md` prints the number.
2. **Interview, briefly.** Two to four questions in the Delivery/Ops voice: goal in one sentence;
   scope items (each becomes a task); which requirement IDs it satisfies; the decisions it will
   force (each becomes a reserved ADR); does it touch UI; does it touch the launch line. Take the
   rest from the docs — never re-ask what BRD/PRD/ARCHITECTURE already answer.
3. **Write the plan block** into `IMPLEMENTATION_PLAN.md` from the phase block in
   `references/templates/IMPLEMENTATION_PLAN.md`: Goal, Scope (with spec references),
   Deliverables, the **exit-gate table** (`Gate · Evidence level · Artefact · Verified by ·
   Status`) with every row ⬜ and the *required* evidence level filled, `Workflow:` line, doc-sync
   gate, traceability line. Add the phase-status row (⬜, Deploy state `—`).
4. **Reserve ADR stubs.** For each decision named in step 2, create
   `docs/adr/ADR-NNN-<slug>.md` from `references/templates/adr/ADR-NNN-slug.md` with Status
   `Proposed` (header `status: Proposed`, `paths` from the scope or `[]`), the Context filled from
   what is known, Options left for the build — and add the
   row to `docs/adr/README.md`'s index. Numbers are the next free ones across `docs/adr/` (and
   legacy `ADR.md` if it still exists). This is what stops parallel worktrees colliding on
   `ADR-NNN`; the phase script's Setup step re-checks the reservation, it does not re-do it.
5. **Generate the workflow script** `.claude/workflows/phase-N-<slug>.js` from
   `references/templates/workflows/phase-template.js` exactly as generation Phase 3 does (TASKS
   from the scope items, `{{RESERVED_ADRS}}` from step 4, `{{GOAL_EXIT_STRATEGY_BLOCK}}` from the
   Standing rules' recorded choice). Add its row to the Workflow scripts table.
6. **CHANGELOG line** under `[Unreleased]`: `- Phase N — <name> scoped [on-branch]`.
7. **Commit** on a branch `docs/scope-phase-N-<slug>` off `main` — or off the branch carrying an
   unmerged `/keel upgrade`, so the scope lands on the upgraded docs (never straight to `main`):
   `docs: scope Phase N — <name> | <k> ADRs reserved | workflow script added`. Tell the user the
   branch and the run command: `claude --workflow .claude/workflows/phase-N-<slug>.js`.

**Never:** renumber an existing phase; mark anything ✅; write ADR content beyond `Proposed`
context; create a phase for hotfix-weight work (that is Change Mode — if the "phase" has one
scope item and no decision, say so and offer `/keel change` instead).
