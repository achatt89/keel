# filestore — COMMANDS.md

Copy-paste commands. Node.js ≥ 20 only; there is nothing to install (`NFR-MAINT-001`).

## Setup

```bash
node --version            # must print v20 or higher
```

## Testing

```bash
node --test                          # all tests (test/*.test.js) — the definition-of-done gate
node --test test/quota.test.js       # one file
node --test --test-name-pattern="AC-2" # one named test
```

## Checks

```bash
node --check src/store.js src/plans.js src/units.js   # syntax check (no linter: stdlib only)
node .keel/doc-size.mjs                               # doc byte budgets + split-link check
node .keel/prune-evidence.mjs                         # review-evidence retention (dry run; --apply to prune)
```

## Docs workflow

```bash
claude --workflow .claude/workflows/phase-2-storage-quotas.js   # run Phase 2
claude --workflow .claude/workflows/doc-sync.js                 # doc sync (phase scripts call it)
```

## Environment variables

None. The module reads no environment and no files.

## Not applicable now

Deploy, database, seed data, local↔remote reconciliation: no such things exist before Phase 3 (`docs/README.md` omissions).

---

*End of COMMANDS.md — filestore*
