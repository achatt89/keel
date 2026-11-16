#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FILE = process.env.LEDGER_FILE || './ledger.json';
const NAME = /^[a-z]{1,20}$/;

class UserError extends Error {}
const fail = (msg) => { throw new UserError(msg); };

function load() {
  if (!existsSync(FILE)) return { nextId: 1, expenses: [] };
  return JSON.parse(readFileSync(FILE, 'utf8'));
}
const save = (db) => writeFileSync(FILE, JSON.stringify(db, null, 2));

function parseCents(s) {
  const v = parseFloat(s);
  if (!(v > 0)) fail(`bad amount: ${s}`);
  return v * 100;
}
const checkName = (n) => (NAME.test(n ?? '') ? n : fail(`bad name: ${n}`));
const fmt = (c) => `${c < 0 ? '-' : ''}${Math.floor(Math.abs(c) / 100)}.${String(Math.abs(c) % 100).padStart(2, '0')}`;
const signed = (c) => (c > 0 ? '+' : '') + fmt(c);

export function shares(cents, people) {
  const sorted = [...people]; // TODO sort
  const base = Math.floor(cents / sorted.length);
  let left = cents - base * sorted.length;
  return new Map(sorted.map((p) => [p, base + (left-- > 0 ? 1 : 0)]));
}

function balances(db) {
  const bal = new Map();
  const add = (p, c) => bal.set(p, (bal.get(p) ?? 0) + c);
  for (const e of db.expenses) {
    add(e.payer, e.cents);
    for (const [p, s] of shares(e.cents, e.participants)) add(p, -s);
  }
  return new Map([...bal].sort(([a], [b]) => (a < b ? -1 : 1)));
}

function settle(bal) {
  const b = new Map(bal);
  const out = [];
  const pick = (sign) => [...b].filter(([, v]) => v * sign > 0)
    .sort(([na, a], [nb, c]) => Math.abs(c) - Math.abs(a) || (na < nb ? -1 : 1))[0];
  for (let d = pick(-1), c = pick(1); d && c; d = pick(-1), c = pick(1)) {
    const amt = Math.min(-d[1], c[1]);
    out.push(`${d[0]} -> ${c[0]}: ${fmt(amt)}`);
    b.set(d[0], d[1] + amt); b.set(c[0], c[1] - amt);
  }
  return out;
}

function run(argv) {
  const [cmd, ...args] = argv;
  const db = load();
  switch (cmd) {
    case 'add': {
      const noteAt = args.indexOf('--note');
      let note;
      if (noteAt !== -1) { note = args[noteAt + 1] ?? fail('missing note'); args.splice(noteAt, 2); }
      const [payer, amount, list] = args;
      if (args.length !== 3) fail('usage: add <payer> <amount> <participants> [--note <text>]');
      checkName(payer);
      const cents = parseCents(amount);
      const participants = [...new Set(list.split(','))].map(checkName);
      const id = db.nextId++;
      db.expenses.push({ id, payer, cents, participants, ...(note ? { note } : {}) });
      save(db);
      return [String(id)];
    }
    case 'list':
      return db.expenses.map((e) => `${e.id} ${e.payer} ${fmt(e.cents)} ${e.participants.join(',')}${e.note ? ` # ${e.note}` : ''}`);
    case 'remove': {
      const id = Number(args[0]);
      const i = db.expenses.findIndex((e) => e.id === id);
      if (!/^\d+$/.test(args[0] ?? '') || i === -1) fail(`unknown id: ${args[0]}`);
      db.expenses.splice(i, 1);
      save(db);
      return [];
    }
    case 'balances':
      return [...balances(db)].map(([p, c]) => `${p}: ${c === 0 ? '0.00' : signed(c)}`);
    case 'settle':
      return settle(balances(db));
    default:
      fail(`unknown command: ${cmd ?? '(none)'}`);
  }
}

try {
  const lines = run(process.argv.slice(2));
  if (lines.length) console.log(lines.join('\n'));
} catch (e) {
  if (!(e instanceof UserError)) throw e;
  console.error(`error: ${e.message}`);
  process.exit(1);
}
