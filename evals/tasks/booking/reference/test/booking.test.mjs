import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookings } from '../src/booking.js';

const D = '2026-03-02'; // Monday
const t = (h) => `${D}T${h}Z`;
const code = (fn) => { try { fn(); } catch (e) { return e.code; } };

test('overlap, person_busy, hours', () => {
  const b = createBookings();
  b.book({ room: 'oak', start: t('10:00'), end: t('11:00'), who: 'ana' });
  assert.equal(code(() => b.book({ room: 'oak', start: t('10:30'), end: t('11:30'), who: 'bo' })), 'overlap');
  assert.equal(code(() => b.book({ room: 'elm', start: t('10:30'), end: t('11:30'), who: 'ana' })), 'person_busy');
  assert.equal(code(() => b.book({ room: 'elm', start: t('08:45'), end: t('09:30'), who: 'bo' })), 'outside_hours');
  b.book({ room: 'oak', start: t('11:00'), end: t('12:00'), who: 'ana' });
});
