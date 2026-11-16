# Founder answers (for a non-interactive /keel run)

The idea: the full specification above is the founder's own description. Treat every line of it as a confirmed requirement, including the three phases and their order.

Answers to the interview, by topic:
- Ambition tier: **Product / MVP**. Real users (the warehouse team), maintained, stock errors cost money. Not a prototype.
- Users: developers who will build the warehouse app on this library; warehouse staff are the end users later.
- Problem: orders are promised against stock that is already promised to other orders, and nobody knows when to reorder.
- Success: every rule holds exactly as specified, with the stated error codes; reserved stock is never shipped twice.
- Stack: Node.js 20+, standard library only, `node:test` for tests, ES modules. In memory only.
- Interface: a JavaScript module API. No UI, no HTTP, no CLI.
- Phases: exactly the three in the description, one phase per working session, each finished (tests, README) before the next starts.
- Data: SKUs, item names, quantities, order ids. Nothing sensitive.
- Deployment: none; a library imported by a later app.
- Compliance: none applies to this library.
- Security: validate every input; never trust caller-supplied ids.
- Team: one developer building with Claude Code, one phase per session.
- Design skills (impeccable, modern-web-guidance): not applicable (no UI). Decline.
- Security-audit skill offer: decline.
- Update-check hook: decline.
- Almanac: no.
- Anything else you would ask: take your recommended default and mark it [ASSUMPTION].
