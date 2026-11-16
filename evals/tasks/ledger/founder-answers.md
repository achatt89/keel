# Founder answers (for a non-interactive /keel run)

The idea: the full specification in prompt.md (same folder) is the founder's own description. Treat every line of it as a confirmed requirement.

Answers to the interview, by topic:
- Ambition tier: Prototype / weekend. A personal tool for a few friends sharing a flat; one user runs it on their own laptop.
- Users: the person who runs the CLI; the people named in expenses never use it themselves.
- Problem: friends lose track of who paid for what; settling up takes too many transfers.
- Success: balances always reconcile to the cent; settle prints the fewest practical transfers by the stated algorithm.
- Stack: Node.js 20+, standard library only, `node:test` for tests. No database: one JSON file.
- Interface: CLI only. No UI, no web, no API, no network access.
- Data: names and amounts only. No personal data beyond first names; no payments are made by the tool.
- Deployment: none. It is run from a clone of the repo. No remote environment.
- Compliance: none applies.
- Security: the data file is local and trusted; validate all CLI input.
- Team: one developer building with Claude Code.
- Design skills (impeccable, modern-web-guidance): not applicable (no UI). Decline.
- Security-audit skill offer: decline.
- Update-check hook: decline.
- Almanac: no.
- Anything else you would ask: take your recommended default and mark it [ASSUMPTION].
