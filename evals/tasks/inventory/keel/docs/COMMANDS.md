# inventory — Commands

Commands only. The library has no environment variables, services or deployment.

| Task | Command | Available from |
|---|---|---|
| Run all tests | `node --test` (or `npm test`) | Phase 1 |
| Run one test file | `node --test test/items-stock.test.js` | Phase 1 |
| Run tests matching a name | `node --test --test-name-pattern="reserve"` | Phase 1 |
| Check Node version (needs ≥ 20) | `node --version` | now |
| Check doc sizes and split links | `node .keel/doc-size.mjs` | now |
| Run a phase | `claude --workflow .claude/workflows/phase-N-<slug>.js` | now |
| Preview review-evidence pruning | `node .keel/prune-evidence.mjs` (add `--apply` to delete) | now |

Environment variables: none. Install step: none (no dependencies).
