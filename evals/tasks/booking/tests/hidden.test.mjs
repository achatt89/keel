// Hidden acceptance tests. The agent never sees these. SUBMISSION = the agent's project folder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const { createBookings, BookingError } = await import(pathToFileURL(join(process.env.SUBMISSION, 'src/booking.js')));
const MON = '2026-03-02', SAT = '2026-03-07';
const at = (h, day = MON) => `${day}T${h}Z`;
const B = (room, s, e, who, day) => ({ room, start: at(s, day), end: at(e, day), who });
function code(fn) {
  try { fn(); } catch (e) { assert.ok(e instanceof BookingError, `not a BookingError: ${e}`); return e.code; }
  return 'no error';
}

test('book returns string ids; list sorted and shaped', () => {
  const b = createBookings();
  const id2 = b.book(B('oak', '13:00', '14:00', 'bo'));
  const id1 = b.book(B('oak', '09:00', '10:30', 'ana'));
  b.book(B('elm', '09:00', '10:00', 'cy'));
  assert.equal(typeof id1, 'string');
  assert.notEqual(id1, id2);
  assert.deepEqual(b.list('oak', MON), [
    { id: id1, room: 'oak', start: at('09:00'), end: at('10:30'), who: 'ana' },
    { id: id2, room: 'oak', start: at('13:00'), end: at('14:00'), who: 'bo' },
  ]);
  assert.deepEqual(b.list('oak', '2026-03-03'), []);
});

test('half-open intervals: back-to-back allowed in room and for person', () => {
  const b = createBookings();
  b.book(B('oak', '10:00', '11:00', 'ana'));
  b.book(B('oak', '11:00', '12:00', 'bo'));
  b.book(B('elm', '09:00', '10:00', 'ana'));
  b.book(B('elm', '12:00', '13:00', 'ana'));
  assert.equal(b.list('oak', MON).length, 2);
});

test('overlap and person_busy, with overlap taking precedence', () => {
  const b = createBookings();
  b.book(B('oak', '10:00', '11:00', 'ana'));
  assert.equal(code(() => b.book(B('oak', '10:45', '11:15', 'bo'))), 'overlap');
  assert.equal(code(() => b.book(B('oak', '09:00', '13:00', 'bo'))), 'overlap');
  assert.equal(code(() => b.book(B('elm', '10:30', '11:30', 'ana'))), 'person_busy');
  assert.equal(code(() => b.book(B('oak', '10:15', '10:45', 'ana'))), 'overlap');
});

test('time validation', () => {
  const b = createBookings();
  for (const [s, e] of [
    ['2026-03-02T10:00', '2026-03-02T11:00Z'], ['2026-03-02 10:00Z', '2026-03-02T11:00Z'],
    ['2026-03-02T10:00:00Z', '2026-03-02T11:00:00Z'], ['2026-02-30T10:00Z', '2026-02-30T11:00Z'],
    ['2026-03-02T10:10Z', '2026-03-02T11:00Z'], ['2026-03-02T11:00Z', '2026-03-02T10:00Z'],
    ['2026-03-02T10:00Z', '2026-03-02T10:00Z'], ['2026-03-02T24:00Z', '2026-03-02T11:00Z'],
  ]) assert.equal(code(() => b.book({ room: 'oak', start: s, end: e, who: 'ana' })), 'invalid_time', `${s} ${e}`);
});

test('opening hours, weekdays, same day, max length', () => {
  const b = createBookings();
  assert.equal(code(() => b.book(B('oak', '08:45', '09:30', 'ana'))), 'outside_hours');
  assert.equal(code(() => b.book(B('oak', '17:30', '18:15', 'ana'))), 'outside_hours');
  assert.equal(code(() => b.book(B('oak', '10:00', '11:00', 'ana', SAT))), 'outside_hours');
  assert.equal(code(() => b.book({ room: 'oak', start: at('17:00'), end: '2026-03-03T10:00Z', who: 'ana' })), 'outside_hours');
  assert.equal(code(() => b.book(B('oak', '09:00', '13:15', 'ana'))), 'too_long');
  b.book(B('oak', '14:00', '18:00', 'ana'));
});

test('cancel and invalid input', () => {
  const b = createBookings();
  const id = b.book(B('oak', '10:00', '11:00', 'ana'));
  b.cancel(id);
  assert.deepEqual(b.list('oak', MON), []);
  assert.equal(code(() => b.cancel(id)), 'not_found');
  assert.equal(code(() => b.cancel('nope')), 'not_found');
  assert.equal(code(() => b.book(B('', '10:00', '11:00', 'ana'))), 'invalid_input');
  assert.equal(code(() => b.book({ start: at('10:00'), end: at('11:00'), who: 'ana' })), 'invalid_input');
  assert.equal(code(() => b.book(B('oak', '10:00', '11:00', ''))), 'invalid_input');
  b.book(B('oak', '10:00', '11:00', 'bo'));
});

test('free intervals, adjacent bookings, weekend', () => {
  const b = createBookings();
  assert.deepEqual(b.free('oak', MON), [{ start: at('09:00'), end: at('18:00') }]);
  b.book(B('oak', '09:00', '10:00', 'ana'));
  b.book(B('oak', '10:00', '11:30', 'bo'));
  b.book(B('oak', '15:00', '18:00', 'cy'));
  b.book(B('elm', '12:00', '13:00', 'dee'));
  assert.deepEqual(b.free('oak', MON), [{ start: at('11:30'), end: at('15:00') }]);
  assert.deepEqual(b.free('oak', SAT), []);
  assert.deepEqual(b.list('oak', SAT), []);
});
