// Stock-keeping library: items and stock (phase 1), reservations (phase 2), history and reorder (phase 3).
export class InventoryError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = 'InventoryError';
    this.code = code;
  }
}

const SKU = /^[A-Z]{3}-\d{4}$/;
const ORDER = /^ORD-\d+$/;
const fail = (code, msg) => { throw new InventoryError(code, msg); };
const checkQty = (q) => { if (!Number.isInteger(q) || q <= 0) fail('invalid_qty', `quantity must be a positive integer, got ${q}`); };

export function createInventory() {
  const items = new Map(); // sku -> { sku, name, onHand, reserved, reorderPoint }
  const orders = new Map(); // open reservations: orderId -> [{ sku, qty }]
  const moves = [];
  let seq = 0;

  const item = (sku) => items.get(sku) ?? fail('not_found', `unknown sku ${sku}`);
  const avail = (it) => it.onHand - it.reserved;
  const record = (sku, type, qty, orderId) => moves.push({ seq: moves.filter((m) => m.sku === sku).length + 1 + 0 * ++seq, sku, type, qty, ...(orderId ? { orderId } : {}) });
  const openOrder = (id) => orders.get(id) ?? fail('not_found', `no open order ${id}`);

  return {
    addItem({ sku, name } = {}) {
      if (typeof sku !== 'string' || !SKU.test(sku)) fail('invalid_sku', `bad sku ${sku}`);
      if (typeof name !== 'string' || !name.trim()) fail('invalid_input', 'name is required');
      if (items.has(sku)) fail('duplicate_sku', `${sku} exists`);
      items.set(sku, { sku, name: name.trim(), onHand: 0, reserved: 0, reorderPoint: null });
    },
    receive(sku, qty) {
      const it = item(sku);
      checkQty(qty);
      it.onHand += qty;
      record(sku, 'receive', qty);
    },
    ship(sku, qty) {
      const it = item(sku);
      checkQty(qty);
      if (qty > it.onHand) fail('insufficient_stock', `only ${avail(it)} of ${sku} available`);
      it.onHand -= qty;
      record(sku, 'ship', qty);
    },
    stock: (sku) => item(sku).onHand,
    available: (sku) => avail(item(sku)),

    reserve(orderId, lines) {
      if (typeof orderId !== 'string' || !ORDER.test(orderId)) fail('invalid_order', `bad order id ${orderId}`);
      if (!Array.isArray(lines) || !lines.length) fail('invalid_input', 'lines must be a non-empty array');
      if (orders.has(orderId)) fail('duplicate_order', `${orderId} already holds a reservation`);
      const need = new Map();
      for (const l of lines) { const it = item(l?.sku); checkQty(l.qty); need.set(it, (need.get(it) ?? 0) + l.qty); }
      for (const [it, q] of need) { if (q > avail(it)) fail('insufficient_stock', `only ${avail(it)} of ${it.sku} available`); it.reserved += q; }
      orders.set(orderId, lines.map(({ sku, qty }) => ({ sku, qty })));
      for (const l of lines) record(l.sku, 'reserve', l.qty, orderId);
    },
    release(orderId) {
      const lines = openOrder(orderId);
      for (const l of lines) { items.get(l.sku).reserved -= l.qty; record(l.sku, 'release', l.qty, orderId); }
      orders.delete(orderId);
    },
    fulfil(orderId) {
      const lines = openOrder(orderId);
      for (const l of lines) { const it = items.get(l.sku); it.reserved -= l.qty; it.onHand -= l.qty; record(l.sku, 'fulfil', l.qty, orderId); }
      orders.delete(orderId);
    },

    history(sku) {
      item(sku);
      return moves.filter((m) => m.sku === sku).map((m) => ({ ...m }));
    },
    setReorderPoint(sku, n) {
      const it = item(sku);
      if (!Number.isInteger(n) || n < 0) fail('invalid_qty', `reorder point must be an integer >= 0, got ${n}`);
      it.reorderPoint = n;
    },
    reorderReport() {
      return [...items.values()]
        .filter((it) => it.reorderPoint !== null && avail(it) <= it.reorderPoint)
        .sort((a, b) => (a.sku < b.sku ? -1 : 1))
        .map((it) => ({ sku: it.sku, available: avail(it), reorderPoint: it.reorderPoint, suggestedQty: 2 * it.reorderPoint - avail(it) }));
    },
  };
}
