---
title: "Archiving and Trimming"
lead: "/keel archive moves finished or superseded detail out of AGENTS.md, IMPLEMENTATION_PLAN.md, CHANGELOG.md, RUNBOOK.md and docs/adr/ into PHASE_ARCHIVE.md. The living documents stay short, and nothing is deleted."
group: "How It Works"
order: 16
slug: archive
anchor: archive
---

## When to run it

Long-running projects accumulate real detail in the living docs: completed phase write-ups, resolved deferred items, superseded decisions. That detail is worth keeping, because it gets revisited, but it costs context on every session start. You mostly do not have to: every living doc has a byte budget in `.keel/meta.json` (keystone 12 KB by default), and the doc-sync workflow measures each one after every sync and runs the archive automatically when a budget is breached, one commit per file, so a bad relocation reverts alone. Run `/keel archive` by hand at natural checkpoints. A doc that is still over budget after archiving is split automatically (below); only the keystone, which is never split, can end with `BUDGET_EXCEEDED`.

> `/keel archive` never deletes. Every relocated block lands in `PHASE_ARCHIVE.md` verbatim, with a one-line summary and a link left behind in its place.

## How it runs

- **Phase X1**: **Discover:** inventory the living docs and measure how far each has drifted past its target size.
- **Phase X2**: **Identify:** scan for archive candidates (completed phases, resolved deferred items, superseded decisions, stale sections) against a strict never-archive list (nothing open, active, or unresolved is ever eligible).
- **Phase X3**: **Report and permission:** present the archive plan with a before/after size projection per doc. You choose to archive everything, a subset, or nothing; Keel does nothing until you approve. If archiving cannot bring a doc under its budget, the plan proposes splitting it instead.
- **Phase X4**: **Archive:** relocate the approved content to `PHASE_ARCHIVE.md` verbatim, leave a one-line summary + link behind, and never renumber or move an ID in the process.
- **Phase X5**: **Verify:** confirm every new link resolves, every ID is still unique, and report the size reclaimed.

## Splitting an oversize doc

Most docs are mostly live content, so archiving cannot shrink them. When `DESIGN.md`, `ARCHITECTURE.md`, `PRD.md`, `LLD.md` or any other doc goes over its budget (32 KB by default, set per file in `.keel/meta.json`), doc-sync splits it instead of warning. Docs with closed detail, such as the implementation plan, are archived first and split only if still over.

### One verdict per doc

The checker gives every doc one verdict and says why:

| Verdict | Meaning |
| --- | --- |
| `ok` | Within budget. Archives (`PHASE_ARCHIVE.md`, `LEGACY_*`, anything under `archive/`) are always `ok`: they are append-only history, never budgeted and never split. |
| `waived` | Over budget, and you recorded why in `.keel/meta.json` `"waivers"` (reason, reviewed date, optional maximum). After 90 days it shows "review due". |
| `archive` | Move closed detail out first. Applies to the implementation plan, changelog, runbook and deployment docs, and to the keystone. |
| `split` | Split into its folder behind a slim index. |
| `manual` | No safe automatic fix: a generated file, a doc with no headings, an index whose Parts table alone is too big, or an ADR index over its budget. You decide. |

The ADR index's budget is the larger of its `budgets` entry and 320 bytes for each decision record, since it must list them all; when the count wins, the reason says it overrides the entry, so a smaller number in `.keel/meta.json` is never ignored silently. A folder next to a doc counts as a split only when the doc has a `## Parts` heading, and a redirect stub (`# ADR.md → moved`) or the decision-record folder never does. Split docs nested deeper, such as `docs/adr/README.md`, are checked too, and every file is measured once. Links are recognised in inline, reference and repo-absolute (`/docs/x.md`) form.

- **Folder**: The content moves, word for word, into a folder next to the parent: `docs/DESIGN.md` becomes `docs/design/01-foundations.md`, `02-components.md` and so on, one part per top-level section. IDs never change.
- **Index**: The parent becomes a slim index with a Parts table that links every part. Each part opens with a link back to the parent. Links elsewhere that pointed at a section are repointed to the part that now holds it.
- **Check**: `node .keel/doc-size.mjs --split <doc>` performs the split mechanically: text moved word for word, headings inside code blocks left alone, section links elsewhere repointed. It cuts at the shallowest heading level that gives enough pieces, or splits one big table by rows (repeating the header), and keeps cutting in the same run until every part fits. Pieces of a cut part become sub-parts named after it (`07` becomes `07a`, `07b`), so the order matches the original. It refuses archives, redirect stubs, the keystone, waived and `manual` docs, and an index with nothing new, so running it twice changes nothing. `node .keel/doc-size.mjs` measures every file once: the index and each part against the parent's budget, with the family total reported. It fails if a part is not linked from the parent or has no link back, and doc-sync stops until that is fixed.
- **Keystone**: `AGENTS.md` and `CLAUDE.md` are never split and never compressed to fit. If archiving cannot bring them under budget, whole sections move out to `docs/agents/NN-<slug>.md`, listed in a Parts table in the keystone and each linking back. Hard rules stay in the keystone. `node .keel/doc-size.mjs --move-out AGENTS.md "<section>"` does the move. Before an upgrade adds keystone text, it checks the headroom and proposes a move-out if the text will not fit. Under 2% headroom the checker warns that the next addition needs content moved out first.

## Writing to a split doc

After a split, the doc-sync role writes new content into the part that holds the section, never into the index. If a part is about to go over budget it adds a new part (linked both ways) or splits that part; if an edit would push a plain doc over budget, it splits the doc instead of piling on. The caller's review checks that every index stayed an index, every part is linked both ways and nothing is over budget, and the size and link check is the last step before the commit.

Every writer finds the right file the same way: `node .keel/doc-size.mjs --where docs/IMPLEMENTATION_PLAN.md "Deferred items"` prints the doc itself, or the part holding that section if the doc is split. The change and phase scripts and the `/keel phase new`, `change`, `closeout`, `archive` and `upgrade` modes all use it. Links that pointed at a moved section are repointed, whether written as a markdown link or as a backticked ``docs/NAME.md#anchor``, except in decision records, which never change after acceptance. Those keep their old anchor, and the index lists every moved anchor under "Moved sections".

`/keel upgrade` proposes the split for existing projects, with the planned parts listed, and applies it only when you approve.

## What is eligible

- **Completed phases**: A ✅ phase's full Goal/Scope/Deliverables/Exit-gates block in IMPLEMENTATION_PLAN.md. The phase-status table row always stays.
- **Resolved deferred items**: Deferred-items table rows already marked ✅ resolved.
- **Merged changes**: Changes-table rows already merged or deployed, beyond the most recent ten.
- **Superseded decisions**: An ADR marked superseded keeps its ID and index row; its body moves.
- **Keystone drift**: Anything in AGENTS.md beyond the keystone-index job: stacked status history, sections duplicating a doc they point at.
- **Old releases and closed postmortems**: CHANGELOG sections older than the last three releases; postmortems whose prevention has landed and are older than 90 days.
