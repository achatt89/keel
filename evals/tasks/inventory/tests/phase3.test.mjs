// Hidden acceptance tests, phase 3. The agent never sees these.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInventory, code, stocked } from './_load.mjs';

test('p3: history in order with one global seq', () => {
  const inv = createInventory();
  inv.addItem({ sku: 'ABC-0001', name: 'a' });
  inv.addItem({ sku: 'XYZ-0002', name: 'b' });
  inv.receive('ABC-0001', 10);
  inv.receive('XYZ-0002', 4);
  inv.ship('ABC-0001', 2);
  inv.reserve('ORD-7', [{ sku: 'ABC-0001', qty: 3 }, { sku: 'XYZ-0002', qty: 1 }]);
  inv.fulfil('ORD-7');
  assert.deepEqual(inv.history('ABC-0001'), [
    { seq: 1, sku: 'ABC-0001', type: 'receive', qty: 10 },
    { seq: 3, sku: 'ABC-0001', type: 'ship', qty: 2 },
    { seq: 4, sku: 'ABC-0001', type: 'reserve', qty: 3, orderId: 'ORD-7' },
    { seq: 6, sku: 'ABC-0001', type: 'fulfil', qty: 3, orderId: 'ORD-7' },
  ]);
  assert.deepEqual(inv.history('XYZ-0002').map((m) => [m.seq, m.type]), [[2, 'receive'], [5, 'reserve'], [7, 'fulfil']]);
});

test('p3: release is recorded; failed changes are not', () => {
  const inv = stocked({ 'ABC-0001': 2 });
  assert.equal(code(() => inv.ship('ABC-0001', 5)), 'insufficient_stock');
  inv.reserve('ORD-8', [{ sku: 'ABC-0001', qty: 1 }]);
  inv.release('ORD-8');
  assert.deepEqual(inv.history('ABC-0001').map((m) => m.type), ['receive', 'reserve', 'release']);
  assert.equal(code(() => inv.history('NOP-0000')), 'not_found');
});

test('p3: reorder report', () => {
  const inv = stocked({ 'ZZZ-0003': 4, 'ABC-0001': 10, 'MMM-0002': 3, 'NOP-0004': 0 });
  inv.setReorderPoint('ZZZ-0003', 5);
  inv.setReorderPoint('ABC-0001', 5);
  inv.setReorderPoint('MMM-0002', 3);
  inv.reserve('ORD-9', [{ sku: 'ABC-0001', qty: 6 }]);
  assert.deepEqual(inv.reorderReport(), [
    { sku: 'ABC-0001', available: 4, reorderPoint: 5, suggestedQty: 6 },
    { sku: 'MMM-0002', available: 3, reorderPoint: 3, suggestedQty: 3 },
    { sku: 'ZZZ-0003', available: 4, reorderPoint: 5, suggestedQty: 6 },
  ]);
});

test('p3: reorder point validation', () => {
  const inv = stocked();
  inv.setReorderPoint('ABC-0001', 0);
  assert.equal(code(() => inv.setReorderPoint('ABC-0001', -1)), 'invalid_qty');
  assert.equal(code(() => inv.setReorderPoint('ABC-0001', 1.5)), 'invalid_qty');
  assert.equal(code(() => inv.setReorderPoint('NOP-0000', 1)), 'not_found');
  assert.deepEqual(inv.reorderReport(), []);
});
