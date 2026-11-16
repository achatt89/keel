// Hidden acceptance tests, phase 1. The agent never sees these.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInventory, code, stocked } from './_load.mjs';

test('p1: receive and ship move stock on hand', () => {
  const inv = stocked();
  inv.receive('ABC-0001', 5);
  inv.ship('ABC-0001', 12);
  assert.equal(inv.stock('ABC-0001'), 3);
  assert.equal(inv.stock('XYZ-0002'), 5);
});

test('p1: new item starts at zero', () => {
  const inv = createInventory();
  inv.addItem({ sku: 'NEW-0001', name: 'thing' });
  assert.equal(inv.stock('NEW-0001'), 0);
});

test('p1: sku and name validation, duplicates', () => {
  const inv = stocked();
  for (const sku of ['abc-0001', 'AB-0001', 'ABC-001', 'ABC0001', '', undefined]) assert.equal(code(() => inv.addItem({ sku, name: 'x' })), 'invalid_sku', String(sku));
  assert.equal(code(() => inv.addItem({ sku: 'QQQ-0001', name: '' })), 'invalid_input');
  assert.equal(code(() => inv.addItem({ sku: 'ABC-0001', name: 'again' })), 'duplicate_sku');
});

test('p1: quantities are positive integers', () => {
  const inv = stocked();
  for (const q of [0, -1, 1.5, '2', undefined]) {
    assert.equal(code(() => inv.receive('ABC-0001', q)), 'invalid_qty', `receive ${q}`);
    assert.equal(code(() => inv.ship('ABC-0001', q)), 'invalid_qty', `ship ${q}`);
  }
});

test('p1: never below zero; unknown sku', () => {
  const inv = stocked();
  assert.equal(code(() => inv.ship('ABC-0001', 11)), 'insufficient_stock');
  assert.equal(inv.stock('ABC-0001'), 10);
  assert.equal(code(() => inv.stock('NOP-0000')), 'not_found');
  assert.equal(code(() => inv.receive('NOP-0000', 1)), 'not_found');
  assert.equal(code(() => inv.ship('NOP-0000', 1)), 'not_found');
});
