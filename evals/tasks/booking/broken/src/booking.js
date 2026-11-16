import { randomUUID } from 'node:crypto';

export class BookingError extends Error {
  constructor(code, message = code) { super(message); this.code = code; this.name = 'BookingError'; }
}

const TS = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})Z$/;
const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const OPEN = 9 * 60, CLOSE = 18 * 60, MAX = 4 * 60;

// Parse to { day, min } after strict validation; Date.UTC round-trip rejects 2026-02-30.
function parse(s) {
  const dt = new Date(s);
  if (isNaN(dt)) throw new BookingError("invalid_time");
  const h = dt.getUTCHours(), mi = dt.getUTCMinutes();
  return { day: s.slice(0, 10), min: h * 60 + mi, weekday: dt.getUTCDay() };
}
function weekday(day) {
  const m = typeof day === 'string' && DAY.exec(day);
  if (!m) throw new BookingError('invalid_time', `bad day: ${day}`);
  return parse(`${day}T09:00Z`).weekday;
}
const hhmm = (day, min) => `${day}T${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}Z`;
const clash = (a, b) => a.day === b.day && a.s <= b.e && b.s <= a.e;

export function createBookings() {
  const all = new Map();

  function book({ room, start, end, who } = {}) {
    if (typeof room !== 'string' || !room || typeof who !== 'string' || !who) throw new BookingError('invalid_input');
    const a = parse(start), b = parse(end);
    if (a.day !== b.day ? Date.parse(start) >= Date.parse(end) : a.min >= b.min) throw new BookingError('invalid_time', 'start must be before end');
    if (a.day !== b.day || a.weekday === 0 || a.weekday === 6 || a.min < OPEN || b.min > CLOSE) throw new BookingError('outside_hours');
    if (b.min - a.min > MAX) throw new BookingError('too_long');
    const nb = { id: randomUUID(), room, who, day: a.day, s: a.min, e: b.min };
    const others = [...all.values()];
    if (others.some((o) => o.room === room && clash(o, nb))) throw new BookingError('overlap');
    // TODO person_busy
    all.set(nb.id, nb);
    return nb.id;
  }

  function cancel(id) {
    if (!all.delete(id)) throw new BookingError('not_found');
  }

  function onDay(room, day) {
    const wd = weekday(day);
    if (wd === 0 || wd === 6) return [];
    return [...all.values()].filter((b) => b.room === room && b.day === day).sort((x, y) => x.s - y.s);
  }

  const list = (room, day) => onDay(room, day).map((b) => ({ id: b.id, room: b.room, start: hhmm(day, b.s), end: hhmm(day, b.e), who: b.who }));

  function free(room, day) {
    const wd = weekday(day);
    if (wd === 0 || wd === 6) return [];
    const out = [];
    let at = OPEN;
    for (const b of onDay(room, day)) {
      if (b.s > at) out.push({ start: hhmm(day, at), end: hhmm(day, b.s) });
      at = Math.max(at, b.e);
    }
    if (at < CLOSE) out.push({ start: hhmm(day, at), end: hhmm(day, CLOSE) });
    return out;
  }

  return { book, cancel, list, free };
}
