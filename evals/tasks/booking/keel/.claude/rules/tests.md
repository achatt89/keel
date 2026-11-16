---
paths:
  - "test/**"
---

# Test rules

- Use `node:test` and `node:assert/strict` only; run with `node --test`: BRD CON-002, TST-001.
- One test per row of PRD §3; assert both `instanceof BookingError` and the exact `code`: `docs/PRD.md` §2–3.
- Fresh `createBookings()` per test; tests never share state: ADR-005.
