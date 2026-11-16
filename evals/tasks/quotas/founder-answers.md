# Founder answers (for a non-interactive /keel run)

The idea is in the description above; treat every line of it as a confirmed requirement.

Answers to the interview, by topic:

- Ambition tier: **Product / MVP**. Paying customers from launch, maintained, billing depends on it. Not a prototype.
- Users: freelancers who store client files; the founder runs support.
- Problem: storage costs are unbounded because nothing limits what a user stores.
- Success: every user stays within their plan, and every limit, message and number matches the pricing page exactly.
- Stack: Node.js 20+, standard library only, `node:test` for tests. ES modules.
- Interface: a JavaScript module API now; an HTTP API in phase 3.
- Phases:
  - Phase 1, core (already built: the code exists in the repo): users `u_N` with plans `free` / `pro` / `team`; files by path with size and version; overwrite bumps the version; `list`, `remove`, `setPlan` (never deletes files), `summary`. Errors are `StoreError` with codes `invalid_input` and `not_found`; an unknown user is reported before bad input.
  - Phase 2, per-user storage quotas (next). Decisions, all confirmed against the pricing page:
    - Limits per plan: `free` 2 GB, `pro` 200 GB, `team` unlimited. GB is decimal, as on the pricing page: 1 GB = 1,000,000,000 bytes (not 1,073,741,824). The display helper in `units.js` stays binary; it is only for the summary line.
    - A write that brings the user exactly to the limit is allowed; one byte more is refused.
    - Overwriting a file counts only the change: the new size minus the old size. A write that does not increase the user's usage is always allowed, even when the user is already over the limit (for example after a downgrade from `pro` to `free`).
    - A refused write throws `StoreError` with code `quota_exceeded` and a `details` object `{ limitBytes, usedBytes, requestedBytes }`: the plan limit, the usage before the write, and the size of the file being written. The refused write changes nothing.
    - Check order: unknown user (`not_found`), then bad input (`invalid_input`), then the quota.
    - `usage(user)` returns `{ usedBytes, limitBytes, percent }`. `percent` is an integer rounded down (99.99 % shows as 99, so the app never says 100 % before the user is full). For `team`: `limitBytes` and `percent` are `null`. Unknown user: `not_found`.
    - Removing a file frees its space at once.
  - Phase 3, HTTP API (later; out of scope for now).
- Data: file paths and sizes; account names. Personal data is limited to names.
- Deployment: a single small server later (phase 3). None for now.
- Compliance: GDPR basics for account names (phase 3 concern).
- Security: validate every input; never trust caller-supplied ids; paths are confined (no `..`).
- Team: one developer building with Claude Code.
- Design skills (impeccable, modern-web-guidance): not applicable (no UI). Decline.
- Security-audit skill offer: decline.
- Update-check hook: decline.
- Almanac: no.
- Anything else you would ask: take your recommended default and mark it [ASSUMPTION].
