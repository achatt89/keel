// Hidden acceptance tests, phase 2. The agent never sees these.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { code, stocked } from './_load.mjs';

test('p2: reserve lowers available, not stock', () => {
  const inv = stocked();
  inv.reserve('ORD-1', [{ sku: 'ABC-0001', qty: 4 }, { sku: 'XYZ-0002', qty: 5 }]);
  assert.equal(inv.available('ABC-0001'), 6);
  assert.equal(inv.available('XYZ-0002'), 0);
  assert.equal(inv.stock('ABC-0001'), 10);
});

test('p2: all or nothing', () => {
  const inv = stocked();
  assert.equal(code(() => inv.reserve('ORD-2', [{ sku: 'ABC-0001', qty: 4 }, { sku: 'XYZ-0002', qty: 6 }])), 'insufficient_stock');
  assert.equal(inv.available('ABC-0001'), 10);
  assert.equal(code(() => inv.release('ORD-2')), 'not_found');
});

test('p2: order id, lines and duplicates', () => {
  const inv = stocked();
  assert.equal(code(() => inv.reserve('ORDER-1', [{ sku: 'ABC-0001', qty: 1 }])), 'invalid_order');
  assert.equal(code(() => inv.reserve('ORD-', [{ sku: 'ABC-0001', qty: 1 }])), 'invalid_order');
  assert.equal(code(() => inv.reserve('ORD-3', [{ sku: 'ABC-0001', qty: 0 }])), 'invalid_qty');
  assert.equal(code(() => inv.reserve('ORD-3', [{ sku: 'NOP-0000', qty: 1 }])), 'not_found');
  inv.reserve('ORD-3', [{ sku: 'ABC-0001', qty: 1 }]);
  assert.equal(code(() => inv.reserve('ORD-3', [{ sku: 'ABC-0001', qty: 1 }])), 'duplicate_order');
});

test('p2: release frees the reservation; closed orders are not_found', () => {
  const inv = stocked();
  inv.reserve('ORD-4', [{ sku: 'ABC-0001', qty: 7 }]);
  inv.release('ORD-4');
  assert.equal(inv.available('ABC-0001'), 10);
  assert.equal(code(() => inv.release('ORD-4')), 'not_found');
  assert.equal(code(() => inv.fulfil('ORD-4')), 'not_found');
});

test('p2: fulfil ships the reserved lines and closes the order', () => {
  const inv = stocked();
  inv.reserve('ORD-5', [{ sku: 'ABC-0001', qty: 3 }, { sku: 'XYZ-0002', qty: 2 }]);
  inv.fulfil('ORD-5');
  assert.deepEqual([inv.stock('ABC-0001'), inv.available('ABC-0001'), inv.stock('XYZ-0002')], [7, 7, 3]);
  assert.equal(code(() => inv.fulfil('ORD-5')), 'not_found');
});

test('p2: ship can only use available stock', () => {
  const inv = stocked();
  inv.reserve('ORD-6', [{ sku: 'ABC-0001', qty: 8 }]);
  assert.equal(code(() => inv.ship('ABC-0001', 3)), 'insufficient_stock');
  inv.ship('ABC-0001', 2);
  assert.equal(inv.stock('ABC-0001'), 8);
  assert.equal(inv.available('ABC-0001'), 0);
});
