// Hidden acceptance tests. The agent never sees these. SUBMISSION = the agent's project folder.
// Tests named "decision: ..." check a founder decision that the prompt does not state.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const { createLedger, InvoiceError } = await import(pathToFileURL(join(process.env.SUBMISSION, 'src/invoices.js')));
const code = (fn) => { try { fn(); } catch (e) { return e instanceof InvoiceError ? e.code : `not an InvoiceError: ${e}`; } return 'no error'; };

function seed() {
  const L = createLedger();
  const de = L.addCustomer({ name: 'Müller; Söhne GmbH', country: 'DE' });
  const fr = L.addCustomer({ name: 'Atelier "Lune"', country: 'FR' });
  const us = L.addCustomer({ name: 'Acme Inc', country: 'US' });
  const ids = {
    a: L.issue({ customer: de, lines: [{ desc: 'Consulting', qty: 3, unitCents: 41150 }], issuedAt: '2026-03-10T10:00:00Z' }), // INV-2026-0001
    late: L.issue({ customer: fr, lines: [{ desc: 'Design', qty: 1, unitCents: 99999 }], issuedAt: '2026-03-31T23:30:00Z' }), // 0002, Berlin 2026-04-01
    back: L.issue({ customer: us, lines: [{ desc: 'Licence', qty: 2, unitCents: 50000 }], issuedAt: '2026-03-05T09:00:00Z' }), // 0003, back-dated
    voided: L.issue({ customer: us, lines: [{ desc: 'Error', qty: 1, unitCents: 700 }], issuedAt: '2026-03-12T12:00:00Z' }), // 0004
    april: L.issue({ customer: de, lines: [{ desc: 'Support', qty: 1, unitCents: 10000 }], issuedAt: '2026-04-15T12:00:00Z' }), // 0005
    feb: L.issue({ customer: de, lines: [{ desc: 'Old', qty: 1, unitCents: 10000 }], issuedAt: '2026-02-20T12:00:00Z' }), // 0006
  };
  L.void(ids.voided);
  return { L, ids };
}
const lines = (csv) => csv.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l !== '');
const lineOf = (csv, id) => lines(csv).find((l) => l.includes(id)) ?? '';

test('exportCsv returns text with every in-range invoice once and none outside', () => {
  const { L, ids } = seed();
  const csv = L.exportCsv({ from: '2026-03-01', to: '2026-03-20' });
  assert.equal(typeof csv, 'string');
  for (const id of [ids.a, ids.back]) assert.equal(csv.split(id).length - 1, 1, `${id} once`);
  for (const id of [ids.april, ids.feb]) assert.ok(!csv.includes(id), `${id} is out of range`);
});

test('existing behaviour still holds', () => {
  const { L, ids } = seed();
  assert.equal(ids.a, 'INV-2026-0001');
  assert.deepEqual([L.get(ids.a).netCents, L.get(ids.a).taxCents, L.get(ids.a).grossCents], [123450, 23456, 146906]);
  assert.equal(L.get(ids.voided).status, 'void');
});

test('decision: UTF-8 byte-order mark at the start', () => {
  const { L } = seed();
  assert.ok(L.exportCsv({ from: '2026-03-01', to: '2026-03-31' }).startsWith('﻿'));
});

test('decision: semicolon header row with the agreed columns', () => {
  const { L } = seed();
  assert.equal(lines(L.exportCsv({ from: '2026-03-01', to: '2026-03-31' }))[0], 'invoice;date;customer;country;net;vat;gross;status');
});

test('decision: CRLF line endings, including after the last row', () => {
  const { L } = seed();
  const csv = L.exportCsv({ from: '2026-03-01', to: '2026-03-31' });
  assert.ok(csv.endsWith('\r\n'), 'ends with CRLF');
  assert.ok(!/[^\r]\n/.test(csv), 'every line break is CRLF');
});

test('decision: amounts with a decimal comma, two decimals, no thousands separator', () => {
  const { L, ids } = seed();
  const row = lineOf(L.exportCsv({ from: '2026-03-01', to: '2026-03-31' }), ids.a);
  for (const amount of ['1234,50', '234,56', '1469,06']) assert.ok(row.includes(amount), `${amount} in ${row}`);
  assert.ok(!/1[.,]?234\.50|1\.234,50/.test(row), `no dot decimal or thousands separator: ${row}`);
});

test('decision: dates and the range use the Europe/Berlin date', () => {
  const { L, ids } = seed();
  const april = L.exportCsv({ from: '2026-04-01', to: '2026-04-30' });
  assert.ok(lineOf(april, ids.late).includes('2026-04-01'), 'dated 2026-04-01 in Berlin');
  assert.ok(!L.exportCsv({ from: '2026-03-01', to: '2026-03-31' }).includes(ids.late), 'not in March');
});

test('decision: the range includes both ends', () => {
  const { L, ids } = seed();
  const csv = L.exportCsv({ from: '2026-03-05', to: '2026-03-10' });
  assert.ok(csv.includes(ids.back) && csv.includes(ids.a));
});

test('decision: void invoices stay in the export with status void and their amounts', () => {
  const { L, ids } = seed();
  const row = lineOf(L.exportCsv({ from: '2026-03-01', to: '2026-03-31' }), ids.voided);
  assert.ok(row.endsWith('void'), `void row: ${row}`);
  assert.ok(row.includes('7,00'), `original amount kept: ${row}`);
});

test('decision: rows in invoice-number order, not date order', () => {
  const { L, ids } = seed();
  const csv = L.exportCsv({ from: '2026-03-01', to: '2026-03-31' });
  const order = [ids.a, ids.back, ids.voided].map((id) => csv.indexOf(id));
  assert.ok(order[0] > -1 && order[0] < order[1] && order[1] < order[2], `order ${order}`);
});

test('decision: quoting of semicolons and quotes; plain fields unquoted', () => {
  const { L, ids } = seed();
  const csv = L.exportCsv({ from: '2026-03-01', to: '2026-04-30' });
  assert.ok(csv.includes('"Müller; Söhne GmbH"'));
  assert.ok(csv.includes('"Atelier ""Lune"""'));
  assert.ok(lineOf(csv, ids.back).includes(';Acme Inc;'), 'plain name not quoted');
});

test('decision: error codes and their order', () => {
  const { L } = seed();
  assert.equal(code(() => L.exportCsv({ from: '2026-02-30', to: '2026-03-31' })), 'invalid_date');
  assert.equal(code(() => L.exportCsv({ from: '2026-04-01', to: '2026-03-01' })), 'invalid_range');
  assert.equal(code(() => L.exportCsv({ from: '2026-04-01', to: '2026-3-1' })), 'invalid_date');
});

test('decision: empty range gives the BOM and the header row only', () => {
  const { L } = seed();
  assert.equal(L.exportCsv({ from: '2025-01-01', to: '2025-01-31' }), '﻿invoice;date;customer;country;net;vat;gross;status\r\n');
});
