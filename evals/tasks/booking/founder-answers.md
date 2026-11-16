# Founder answers (for a non-interactive /keel run)

The idea: the full specification in prompt.md is the founder's own description. Treat every line of it as a confirmed requirement.

Answers to the interview, by topic:
- Ambition tier: Prototype / weekend. The core library for a later office-booking app; the app and storage come later.
- Users: developers who will build the app on this library; office staff are the end users later.
- Problem: double-booked rooms and people booked into two meetings at once.
- Success: every rule holds exactly as specified, with the stated error codes; no double booking is ever possible.
- Stack: Node.js 20+, standard library only, `node:test` for tests. In-memory only.
- Interface: a JavaScript module API. No UI, no HTTP, no CLI.
- Data: room names, people's names, times. Nothing sensitive in this library.
- Deployment: none; it is a library imported by a later app.
- Compliance: none applies to this library.
- Security: validate every input; never trust caller-supplied ids.
- Team: one developer building with Claude Code.
- Design skills (impeccable, modern-web-guidance): not applicable (no UI). Decline.
- Security-audit skill offer: decline.
- Update-check hook: decline.
- Almanac: no.
- Anything else you would ask: take your recommended default and mark it [ASSUMPTION].
