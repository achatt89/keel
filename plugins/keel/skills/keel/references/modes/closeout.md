# Keel mode: closeout

Loaded by the router (`SKILL.md`, "Modes"). The router's Operating principles, Update check and
"Writing into split docs" apply here. Phase Mode is in `phase.md`.

## Closeout Mode — `/keel closeout`

**Trigger:** user says "keel closeout", "close out deferred items", "deferred table is too long",
"clear the backlog of deferred rows"; **or** doc-sync reports the threshold below has been
crossed and the user agrees.

**Why this exists:** deferred items are not forgotten by definition — but in practice they are,
unless something periodically turns the open rows into scheduled work. Every project keel has
documented ended up running "deferred-items closeout" phases by hand; this makes it a standing
cadence.

**Threshold** (from `.keel/meta.json` `closeout`, defaults `maxOpenDeferred: 8`,
`everyNPhases: 5`): the Deferred items table has more than `maxOpenDeferred` ⬜ rows, or
`everyNPhases` phases have closed since the last closeout phase.

### Steps

1. **List the open rows** with their `Owner` and `Revisit trigger` columns:
   `node .keel/doc-size.mjs --closeout docs/IMPLEMENTATION_PLAN.md` lists every ⬜ row (split plan
   included) and the closeout phase number. An italic placeholder row (`*(none yet — …)*`) is not a
   row: never count or schedule it. Rows owned by
   `founder` or `legal` whose trigger has not fired are **excluded** (they are decisions, not
   work) — show them separately so the user can pull one in explicitly.
2. **Confirm scope** with `AskUserQuestion`: all eligible rows (recommended) / let me pick / skip.
3. **Run Phase Mode** with the slug `deferred-closeout`, numbered as the checker printed (`N.5`, or the
   next free `N.x`; see Phase Mode step 1),
   whose scope items are *exactly* the chosen rows, one task each, each task's `/goal` being the
   row's own resolution condition. Each chosen row gets `Target phase` = that number.
4. Report which rows were pulled in, which were left (and why), and the run command.

**Never:** resolve a row inside closeout itself; invent a resolution for a founder/legal row;
delete a row (resolved rows are marked ✅ by the phase's doc-sync and later relocated by archive).
