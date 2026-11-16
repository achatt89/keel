# shortlinks — Commands & environment

Planned commands; they work once Phase 0 lands. Contract: [PRD.md](./PRD.md). Environments: local only (one dev machine or one VM behind the team VPN); no deploy pipeline, so no `DEPLOYMENT.md`.

## Run

| Task | Command |
|---|---|
| Start the service | `node src/main.js` (listens on `PORT`, default 3000) |
| Start on another port | `PORT=8080 node src/main.js` |
| Run all tests | `node --test` |
| Run one file | `node --test test/routing.test.js` |
| Doc size + link check | `node .keel/doc-size.mjs` |
| Drift check | `node .keel/check.mjs` |

Requires Node.js 20 or later. There is no `npm install`.

## Try it

```sh
curl -si -X POST localhost:3000/links -H 'content-type: application/json' \
  -d '{"url":"https://example.com/a/very/long/path","code":"docs_1"}'   # 201 {"code","url"}
curl -si localhost:3000/docs_1                                           # 302 Location
curl -s  localhost:3000/links/docs_1                                     # {"code","url","hits","createdAt"}
curl -si -X DELETE localhost:3000/links/docs_1                           # 204
```

## Environment variables

| Var | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | TCP port for `src/main.js` |

No secrets, no config files.
