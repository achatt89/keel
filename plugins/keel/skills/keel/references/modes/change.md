# Keel mode: change

Loaded by the router (`SKILL.md`, "Modes"). The router's Operating principles, Update check and
"Writing into split docs" apply here. Phase Mode is in `phase.md`.

## Change Mode — `/keel change <slug>`

**Trigger:** user says "keel change", "log a change", "hotfix", "small fix, no phase", "quick
change", or describes a single-scope fix in a keel project.

**Why this exists:** a hotfix is not a phase. Projects that model every fix as `Phase 6i…6r`
end up with 50-row status tables and 300-line workflow scripts for one-line changes, and "phase"
stops meaning *gated milestone*. A **Change** is the lighter unit: a branch, a row, a CHANGELOG
line, evidence, and the same doc-sync — nothing else.

**Prerequisite:** same as Phase Mode.

### Steps

1. **Allocate `CHG-xxx`** — next free number in `IMPLEMENTATION_PLAN.md`'s `## Changes` table
   (columns `CHG · Date · Branch · Summary · ADR · Deploy state`). Zero-padded, never reused.
2. **One question, if needed:** does this change alter a decision? If yes, reserve one ADR stub
   as in Phase Mode step 4 (a change that supersedes an accepted ADR gets a *new* ADR that
   supersedes it — the old one is never edited). If the fix is a response to an incident, ask for
   the postmortem row (`RUNBOOK.md` `## Postmortems`) or its `PM-xxx` if one exists.
3. **Write the row** (`Deploy state` = `on-branch`), the CHANGELOG `[Unreleased]` line
   `- CHG-xxx: <summary> [on-branch]`, and if a FEEDBACK_ROUNDS item spawned it, reference the
   `FR-xx` in the summary.
4. **Branch** `chg/<slug>` off `main` and run
   `.claude/workflows/change-template.js` (Setup → single Build agent with `/goal` + the recorded
   exit strategy → Verify-lite writing `.keel/evidence/chg-xxx.json` → doc-sync → Merge with the
   `[merged]` flip). If the Workflow tool is unavailable, walk the user through the same steps by
   hand — the script is the definition, not the only path.

**Explicitly not created:** a phase block, a phase-status row, a phase workflow script. If during
the change the scope grows to several independent tasks or a second decision, stop and convert:
`/keel phase new` with the CHG row marked `→ Phase N` in its Summary.
