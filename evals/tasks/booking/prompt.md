Build `booking`, a meeting-room booking library.

Constraints: Node.js 20 or later, standard library only (no npm dependencies). Pure in-memory logic, no I/O. `src/booking.js` must export `createBookings()` and the error class `BookingError`.

`createBookings()` returns an object with:
- `book({ room, start, end, who })`: returns a new booking id (a string). `room` and `who` are non-empty strings. `start` and `end` are UTC timestamps written exactly as `YYYY-MM-DDTHH:MMZ`, e.g. `2026-03-02T09:15Z`.
- `cancel(id)`: removes a booking.
- `list(room, day)`: the room's bookings on `day` (`YYYY-MM-DD`), sorted by start, each as `{ id, room, start, end, who }` with times in the same format as given.
- `free(room, day)`: the free intervals of the room within opening hours on `day`, sorted, each as `{ start, end }`. Adjacent bookings leave no gap between them.

Rules, each broken rule throws a `BookingError` whose `code` property is the name in brackets:
- Timestamps must match the format and be real dates and times, minutes on a quarter hour (00, 15, 30, 45), and `start` before `end` [`invalid_time`].
- Bookings are Monday to Friday, within 09:00 to 18:00 UTC, starting and ending on the same day [`outside_hours`].
- A booking lasts at most 4 hours [`too_long`].
- A room cannot hold two overlapping bookings; times are half-open, so 10:00-11:00 and 11:00-12:00 do not overlap [`overlap`].
- A person (`who`) cannot hold two overlapping bookings in any rooms [`person_busy`]. When both this and `overlap` apply, throw `overlap`.
- `cancel` of an unknown id [`not_found`].
- Missing or empty `room` or `who` [`invalid_input`].
- On a Saturday or Sunday, `list` and `free` return empty arrays.

Also write your own tests (runnable with `node --test`) and a README that says how to use the library and run the tests.
