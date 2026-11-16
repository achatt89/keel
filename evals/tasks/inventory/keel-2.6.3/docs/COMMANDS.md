# Commands — inventory

| Task | Command | Note |
|---|---|---|
| Run all tests | `node --test` | Node 20+; discovers `test/*.test.js` |
| Run one file | `node --test test/<file>.test.js` | |
| Check Node version | `node --version` | must be ≥ 20 |
| Docs size + link check | `node .keel/doc-size.mjs` | no breach before commit |
| Docs drift check | `node .keel/check.mjs` | read-only |
| Prune review evidence | `node .keel/prune-evidence.mjs` | dry run; `--apply` to delete |

Environment variables: none. Install step: none (no dependencies). Per-environment values: none (library, not deployed; see [DEPLOYMENT](./DEPLOYMENT.md) stub).
