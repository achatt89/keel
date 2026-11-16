# shortlinks — COMMANDS.md

> Command reference. All commands run from the repo root. Requires Node.js ≥ 20. There is nothing to install (no dependencies).

## Run

```bash
node src/main.js                 # listens on PORT (default 3000)
PORT=8080 node src/main.js       # custom port
```

## Test

```bash
node --test                      # all tests (node:test, discovers test/**)
node --test test/<name>.test.js  # one file
node --test --test-name-pattern="rate" # by name
```

## Try it (curl)

```bash
curl -i -X POST localhost:3000/links -H 'content-type: application/json' \
     -d '{"url":"https://example.com/some/long/path"}'            # 201 {"code","url"}
curl -i -X POST localhost:3000/links -d '{"url":"https://example.com","code":"my-link"}'
curl -i localhost:3000/my-link                                     # 302 + Location, +1 hit
curl -i localhost:3000/links/my-link                               # 200 {code,url,hits,createdAt}
curl -i -X DELETE localhost:3000/links/my-link                     # 204
for i in 1 2 3 4 5 6; do curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3000/links -d '{"url":"https://example.com"}'; done  # sixth: 429 + Retry-After
```

## Docs tooling

```bash
node .keel/doc-size.mjs          # byte budgets + split-link check (doc-sync runs it)
node .keel/prune-evidence.mjs    # dry run of review-evidence pruning
claude --workflow .claude/workflows/phase-0-skeleton-guardrails.js   # start Phase 0
```

## Environment variables

| Var | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | TCP port; must be an integer 0–65535, else `main.js` exits non-zero |

No other configuration. The service binds all interfaces (Node default; OD-04) — run it only behind the team VPN. Restarting discards all links (RSK-001).
