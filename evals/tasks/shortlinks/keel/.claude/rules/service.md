---
paths:
  - "src/**"
  - "test/**"
---
# Service rules
- Standard library only; no `package.json` dependencies; `createServer(options)` returns a non-listening server: ADR-001 (`docs/adr/ADR-001-stdlib-only-http.md`).
- State lives in per-server `Map`s, never a plain object keyed by user input or a module singleton: ADR-002.
- Rate limit counts successful creates only, reads time from `options.now`, ignores `X-Forwarded-For`: ADR-003.
- Route by path shape; `links` is a reserved code; 405 for any other method on a known shape: ADR-004.
- Every error goes through `src/errors.js` as `{"error":"<code>"}`: `docs/PRD.md` §3.8.
