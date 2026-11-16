# booking — COMMANDS.md

> Command reference. All commands run from the repo root. Requires Node.js ≥ 20. No install step: there are no dependencies.

## Setup

```bash
node --version        # must print v20 or later
```

Nothing else: no `npm install`, no `.env`, no services.

## Testing

```bash
node --test                          # run every test/*.test.js (the only test command)
node --test test/book.test.js        # one file
node --test --test-name-pattern="overlap"   # by name
```

Tests use only `node:test` and `node:assert`. Phase 0 creates `package.json` with `"test": "node --test"`, so `npm test` also works (it installs nothing).

## Usage (quick check)

```bash
node -e "const {createBookings}=require('./src/booking'); const b=createBookings(); console.log(b.book({room:'A',start:'2026-03-02T09:15Z',end:'2026-03-02T10:15Z',who:'Dana'}))"
```

## Docs & workflow tooling

```bash
node .keel/doc-size.mjs                                  # doc byte budgets + split-link check
node .keel/doc-size.mjs --where docs/IMPLEMENTATION_PLAN.md "Deferred items"   # which file holds a section
claude --workflow .claude/workflows/phase-0-foundation.js   # run a phase (then phase-1-…, phase-2-…)
node .keel/prune-evidence.mjs                            # dry run: review-evidence retention
```

## Environment variables

None. The library reads no environment, files or clock.
