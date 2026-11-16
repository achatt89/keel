---
paths:
  - "src/**"
---

# Library source rules

- Standard library only, no I/O, no clock or randomness; `node:` builtins at most: BRD CON-002, CON-003.
- Export a static `module.exports = { createBookings, BookingError }`: ADR-001.
- Parse times only through `src/time.js`; never `new Date(string)`: ADR-002.
- Keep the `book` check order; add a rule by superseding the ADR: ADR-003.
- Ids come from the internal counter; stores are `Map`/`Set`; return copies; validate then write once: ADR-004, ADR-005.
