# AGENTS.md: shortlinks

URL-shortener HTTP service. Node.js 20+, `node:http` only, no npm dependencies, in-memory storage.

- `src/server.js` exports `createServer({ now })`; `src/main.js` listens on `$PORT` (default 3000).
- Every error is JSON `{"error":"<code>"}` with the status the spec names.
- Inject the clock (`now`) wherever time matters, so tests never sleep.
- Tests: `node --test`. Keep them passing; add tests with every change.
- README says how to run the service and the tests.
