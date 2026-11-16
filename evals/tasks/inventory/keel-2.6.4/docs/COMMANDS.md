# Commands — inventory

Copy-paste ready. Nothing to install: Node.js 20+ and the standard library only (CON-002). Commands exist from Phase 1 on (`package.json` is a Phase 1 deliverable).

| Task | Command |
|---|---|
| Run all tests | `npm test` (= `node --test`) |
| Run one test file | `node --test test/errors.test.js` |
| Check the Node version | `node --version` (must be ≥ 20) |
| Run a README example | `node examples/<name>.js` |
| Docs size + link check | `node .keel/doc-size.mjs` |
| Docs drift check (read-only) | `node .keel/check.mjs` |

## Environment variables

None. The library reads no environment and does no I/O.

## Deployment

None; see [DEPLOYMENT.md](DEPLOYMENT.md) (stub).
