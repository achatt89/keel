import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLedger, InvoiceError, vatCents } from '../src/invoices.js';
import { formatEUR } from '../src/money.js';

const code = (fn) => { try { fn(); } catch (e) { assert.ok(e instanceof InvoiceError); return e.code; } return 'no error'; };
const setup = () => {
  const L = createLedger();
  const de = L.addCustomer({ name: 'Berg GmbH', country: 'DE' });
  const us = L.addCustomer({ name: 'Acme Inc', country: 'US' });
  return { L, de, us };
};

test('customer ids are C + 4 digits', () => {
  const { L, de, us } = setup();
  assert.equal(de, 'C0001');
  assert.equal(us, 'C0002');
  assert.deepEqual(L.customer(de), { id: 'C0001', name: 'Berg GmbH', country: 'DE' });
});

test('invoice numbers are gapless per year', () => {
  const { L, de } = setup();
  const line = [{ desc: 'Work', qty: 1, unitCents: 100 }];
  assert.equal(L.issue({ customer: de, lines: line, issuedAt: '2026-01-05T10:00:00Z' }), 'INV-2026-0001');
  assert.equal(L.issue({ customer: de, lines: line, issuedAt: '2026-02-05T10:00:00Z' }), 'INV-2026-0002');
  assert.equal(L.issue({ customer: de, lines: line, issuedAt: '2027-01-05T10:00:00Z' }), 'INV-2027-0001');
});

test('VAT by country, rounded half up on the invoice net', () => {
  const { L, de, us } = setup();
  const a = L.issue({ customer: de, lines: [{ desc: 'Consulting', qty: 3, unitCents: 41150 }], issuedAt: '2026-03-10T10:00:00Z' });
  assert.deepEqual([L.get(a).netCents, L.get(a).taxCents, L.get(a).grossCents], [123450, 23456, 146906]);
  const b = L.issue({ customer: us, lines: [{ desc: 'Licence', qty: 2, unitCents: 50000 }], issuedAt: '2026-03-11T10:00:00Z' });
  assert.equal(L.get(b).taxCents, 0);
  assert.equal(vatCents(5, 10), 1);
  assert.equal(vatCents(4, 10), 0);
});

test('void keeps the invoice and refuses a second void', () => {
  const { L, de } = setup();
  const id = L.issue({ customer: de, lines: [{ desc: 'x', qty: 1, unitCents: 1 }], issuedAt: '2026-03-10T10:00:00Z' });
  L.void(id);
  assert.equal(L.get(id).status, 'void');
  assert.equal(code(() => L.void(id)), 'already_void');
  assert.equal(L.list().length, 1);
});

test('input errors', () => {
  const { L, de } = setup();
  assert.equal(code(() => L.addCustomer({ name: '', country: 'DE' })), 'invalid_input');
  assert.equal(code(() => L.addCustomer({ name: 'X', country: 'Germany' })), 'invalid_input');
  assert.equal(code(() => L.issue({ customer: 'C9999', lines: [], issuedAt: '2026-03-10T10:00:00Z' })), 'not_found');
  assert.equal(code(() => L.issue({ customer: de, lines: [], issuedAt: '2026-03-10T10:00:00Z' })), 'invalid_input');
  assert.equal(code(() => L.issue({ customer: de, lines: [{ desc: 'x', qty: 0, unitCents: 1 }], issuedAt: '2026-03-10T10:00:00Z' })), 'invalid_input');
  assert.equal(code(() => L.issue({ customer: de, lines: [{ desc: 'x', qty: 1, unitCents: 1 }], issuedAt: '2026-02-30T10:00:00Z' })), 'invalid_date');
  assert.equal(code(() => L.get('INV-2026-0001')), 'not_found');
});

test('get returns a copy', () => {
  const { L, de } = setup();
  const id = L.issue({ customer: de, lines: [{ desc: 'x', qty: 1, unitCents: 1 }], issuedAt: '2026-03-10T10:00:00Z' });
  L.get(id).lines[0].qty = 99;
  assert.equal(L.get(id).lines[0].qty, 1);
});

test('summary and money formatting', () => {
  const { L, de } = setup();
  L.issue({ customer: de, lines: [{ desc: 'x', qty: 1, unitCents: 123456789 }], issuedAt: '2026-03-10T10:00:00Z' });
  assert.equal(formatEUR(123456789), '€1,234,567.89');
  assert.match(L.summary(), /^INV-2026-0001 {2}Berg GmbH {2}€/);
});

test('exportCsv: German Excel format, Berlin dates, quoting, void kept', () => {
  const L = createLedger();
  const de = L.addCustomer({ name: 'Müller; Söhne', country: 'DE' });
  const fr = L.addCustomer({ name: 'Atelier "Lune"', country: 'FR' });
  L.issue({ customer: de, lines: [{ desc: 'Consulting', qty: 3, unitCents: 41150 }], issuedAt: '2026-03-10T10:00:00Z' });
  const v = L.issue({ customer: fr, lines: [{ desc: 'Design', qty: 1, unitCents: 700 }], issuedAt: '2026-03-31T23:30:00Z' });
  L.void(v);
  assert.equal(L.exportCsv({ from: '2026-03-01', to: '2026-04-01' }),
    '﻿invoice;date;customer;country;net;vat;gross;status\r\n' +
    'INV-2026-0001;2026-03-10;"Müller; Söhne";DE;1234,50;234,56;1469,06;issued\r\n' +
    'INV-2026-0002;2026-04-01;"Atelier ""Lune""";FR;7,00;1,40;8,40;void\r\n');
  assert.ok(!L.exportCsv({ from: '2026-03-01', to: '2026-03-31' }).includes('INV-2026-0002'));
});

test('exportCsv errors', () => {
  const L = createLedger();
  assert.equal(code(() => L.exportCsv({ from: '2026-02-30', to: '2026-01-01' })), 'invalid_date');
  assert.equal(code(() => L.exportCsv({ from: '2026-02-01', to: '2026-01-01' })), 'invalid_range');
});
