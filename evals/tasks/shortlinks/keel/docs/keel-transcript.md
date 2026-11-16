# Keel transcript — shortlinks

Non-interactive run (2026-11-16): the founder supplied the full spec and every interview answer up front; nobody could be asked follow-ups. Where an answer was missing, Keel took its recommended default and marked it `[ASSUMPTION]`. Never edited after generation.

## Phase 0 — Intake

**Founder description (`prompt.md`), verbatim:**

> Build `shortlinks`, a small URL-shortener HTTP service.
>
> Constraints: Node.js 20 or later, standard library only (`node:http`, no npm dependencies, no frameworks). Storage is in memory. `src/server.js` must export `createServer(options)` that returns a `node:http` Server that is not yet listening; `options.now` is an optional function returning the current time in milliseconds (default `Date.now`). A `node src/main.js` entry point listens on `PORT` (default 3000).
>
> API (JSON in and out; every error body is `{"error":"<code>"}`):
> - `POST /links` with body `{"url": "...", "code": "..."}` (`code` optional). `url` must be an absolute `http` or `https` URL of at most 2048 characters, else 400 `invalid_url`. A custom `code` is 4 to 16 characters from `A-Z a-z 0-9 _ -`, else 400 `invalid_code`; if already used, 409 `code_taken`. Without a code, generate a random 7-character code from `A-Z a-z 0-9`. Response 201 `{"code": "...", "url": "..."}`. A body that is not valid JSON is 400 `invalid_json`.
> - `GET /<code>`: 302 redirect with `Location` set to the url, and count one hit. Unknown code: 404 `not_found`.
> - `GET /links/<code>`: 200 `{"code","url","hits","createdAt"}` with `createdAt` as an ISO 8601 string. Unknown: 404 `not_found`.
> - `DELETE /links/<code>`: 204 with no body. Unknown: 404 `not_found`.
> - Any other path is 404 `not_found`; a known path with the wrong method is 405 `method_not_allowed`.
> - Rate limit: each client IP address may create at most 5 links in any rolling 60-second window. The sixth is 429 `rate_limited` with a `Retry-After` header: whole seconds until a slot frees, at least 1.
>
> Also write your own tests (runnable with `node --test`) and a README that says how to run the service and the tests.

**Keel's reflection:** a JSON-only internal URL shortener for one small team; the spec is the requirement set. Tier: **Prototype / weekend** (founder confirmed in the answers).

## Founder answers, by topic

| Topic | Answer |
|---|---|
| Ambition tier | Prototype / weekend; internal tool for one small team; restart may lose links, accepted |
| Users | Teammates creating links with curl or a script; anyone who clicks a link |
| Problem | Long internal URLs are hard to share; the team wants short links and hit counts |
| Success | Every endpoint behaves exactly as specified, including the rate limit |
| Stack | Node.js 20+, `node:http` only, `node:test`; in-memory; no database |
| Interface | JSON HTTP API only; no UI |
| Data | URLs and hit counts; no accounts; no personal data beyond client IPs in memory for rate limiting |
| Deployment | One developer machine or small VM behind the team VPN; `node src/main.js`; no container, no CI deploy |
| Compliance | None applies |
| Security | Validate every input; http/https only; the rate limit is the abuse control |
| Team | One developer with Claude Code |
| Design skills (impeccable, modern-web-guidance) | Not applicable; declined |
| Security-audit skill | Declined (recorded `securitySkill: "never"`) |
| Update-check hook | Declined |
| Almanac | No |
| Anything else | Keel's recommended default, marked `[ASSUMPTION]` |

## Document-set proposal (approved by instruction)

Included: AGENTS, CLAUDE, CHANGELOG, transcript, BRD (lite), PRD (the API contract is the product), ARCHITECTURE (lite), ADR-001..004, IMPLEMENTATION_PLAN, COMMANDS, docs/README, one area rule, doc-sync subagent, phase scripts. Omitted with triggers: see `docs/README.md` "Deliberately omitted". Layout: default (no almanac).

## Keel's stress-test and defaults taken

| Finding | Default taken | Where |
|---|---|---|
| Custom code `links` is valid by format but collides with the `/links` route | Reserved; 409 `code_taken` | ADR-004, OD-03 |
| "Known path" is ambiguous for `/<code>` | Path shape decides; wrong method = 405 | ADR-004, OD-02 |
| Spec silent on whether failed creates count toward the limit and on check order | Only successful creates count; validate → limit → taken-check | ADR-003, OD-01 |
| Fixed-window counters violate "any rolling window" | Sliding log of timestamps | ADR-003 |
| Client IP behind a proxy | Socket address only, `X-Forwarded-For` ignored (VPN, no proxy) | ADR-003, OD-05 |
| Malformed-but-parsable bodies, oversize bodies, unexpected errors | Map to existing codes; 500 `internal_error` for the unexpected | PRD §3.1, §3.8, OD-04 |
| Anyone on the VPN can delete any link | Accepted for an internal prototype | RSK-002 |
| Ways of working (not answered) | `git` repo, branch-per-phase, doc-sync after each phase, bounded-retries exit strategy `[ASSUMPTION]` | AGENTS.md, IMPLEMENTATION_PLAN |
| Byte budgets (not answered) | Defaults: keystone 12 KB, plan 64 KB, ADR index 16 KB, others 32 KB `[ASSUMPTION]` | `.keel/meta.json` |
| Phase 4 threat-model offer | Not asked in a non-interactive run; one adversarial pass folded into ARCHITECTURE §6 | ARCHITECTURE §6 |
