import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
export const { createInventory, InventoryError } = await import(pathToFileURL(join(process.env.SUBMISSION, 'src/inventory.js')));
export const code = (fn) => { try { fn(); } catch (e) { return e instanceof InventoryError ? e.code : `not an InventoryError: ${e}`; } return 'no error'; };
export const stocked = (items = { 'ABC-0001': 10, 'XYZ-0002': 5 }) => {
  const inv = createInventory();
  for (const [sku, qty] of Object.entries(items)) { inv.addItem({ sku, name: `item ${sku}` }); if (qty) inv.receive(sku, qty); }
  return inv;
};
