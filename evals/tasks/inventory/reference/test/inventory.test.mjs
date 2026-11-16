import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInventory, InventoryError } from '../src/inventory.js';

const code = (fn) => { try { fn(); } catch (e) { assert.ok(e instanceof InventoryError); return e.code; } return 'no error'; };
const inv0 = () => { const i = createInventory(); i.addItem({ sku: 'ABC-0001', name: 'a' }); i.receive('ABC-0001', 10); return i; };

test('stock moves and validation', () => {
  const i = inv0();
  i.ship('ABC-0001', 4);
  assert.equal(i.stock('ABC-0001'), 6);
  assert.equal(code(() => i.ship('ABC-0001', 7)), 'insufficient_stock');
  assert.equal(code(() => i.addItem({ sku: 'abc-1', name: 'x' })), 'invalid_sku');
  assert.equal(code(() => i.addItem({ sku: 'ABC-0001', name: 'x' })), 'duplicate_sku');
  assert.equal(code(() => i.receive('ABC-0001', 0)), 'invalid_qty');
});

test('reservations: all or nothing, ship respects them, fulfil and release close', () => {
  const i = inv0();
  assert.equal(code(() => i.reserve('ORD-1', [{ sku: 'ABC-0001', qty: 6 }, { sku: 'ABC-0001', qty: 5 }])), 'insufficient_stock');
  i.reserve('ORD-1', [{ sku: 'ABC-0001', qty: 6 }]);
  assert.equal(code(() => i.ship('ABC-0001', 5)), 'insufficient_stock');
  i.fulfil('ORD-1');
  assert.deepEqual([i.stock('ABC-0001'), i.available('ABC-0001')], [4, 4]);
  assert.equal(code(() => i.release('ORD-1')), 'not_found');
});

test('history and reorder report', () => {
  const i = inv0();
  i.reserve('ORD-2', [{ sku: 'ABC-0001', qty: 8 }]);
  i.release('ORD-2');
  assert.deepEqual(i.history('ABC-0001').map((m) => [m.seq, m.type]), [[1, 'receive'], [2, 'reserve'], [3, 'release']]);
  i.setReorderPoint('ABC-0001', 12);
  assert.deepEqual(i.reorderReport(), [{ sku: 'ABC-0001', available: 10, reorderPoint: 12, suggestedQty: 14 }]);
});
