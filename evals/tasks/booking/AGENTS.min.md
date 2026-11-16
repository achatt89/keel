# AGENTS.md: booking

Meeting-room booking library. Node.js 20+, standard library only, no I/O, no npm dependencies.

- `src/booking.js` exports `createBookings()` and `BookingError` (with a `code`).
- Times are UTC strings `YYYY-MM-DDTHH:MMZ`; compare as minutes, intervals are half-open.
- Every rule violation throws `BookingError` with the code the spec names.
- Tests: `node --test`. Keep them passing; add tests with every change.
- README says how to use the library and run the tests.
