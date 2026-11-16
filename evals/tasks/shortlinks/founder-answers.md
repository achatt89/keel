# Founder answers (for a non-interactive /keel run)

The idea: the full specification in prompt.md is the founder's own description. Treat every line of it as a confirmed requirement.

Answers to the interview, by topic:
- Ambition tier: Prototype / weekend. An internal tool for one small team; restarting it may lose links, and that is accepted.
- Users: teammates who create links with curl or a script, and anyone who clicks a link.
- Problem: long internal URLs are hard to share; the team wants short links and hit counts.
- Success: every endpoint behaves exactly as specified, including the rate limit.
- Stack: Node.js 20+, `node:http` only, `node:test` for tests. In-memory storage; no database.
- Interface: JSON HTTP API only. No UI.
- Data: URLs and hit counts. No accounts, no personal data beyond client IP addresses held in memory for rate limiting.
- Deployment: runs on one developer machine or one small VM behind the team VPN; `node src/main.js`. No container, no CI deploy.
- Compliance: none applies.
- Security: validate every input; only http and https URLs; the rate limit is the abuse control.
- Team: one developer building with Claude Code.
- Design skills (impeccable, modern-web-guidance): not applicable (no UI). Decline.
- Security-audit skill offer: decline.
- Update-check hook: decline.
- Almanac: no.
- Anything else you would ask: take your recommended default and mark it [ASSUMPTION].
