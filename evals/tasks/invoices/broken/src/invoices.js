// Invoicing core: customers, invoices with line items, VAT by customer country.
// Money is integer cents everywhere; VAT is rounded half up once per invoice, on the net total.
import { formatEUR } from './money.js';

export class InvoiceError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = 'InvoiceError';
    this.code = code;
  }
}

// VAT rate in percent by customer country. Any other country: 0 (export / reverse charge).
export const VAT_RATES = { DE: 19, FR: 20, NL: 21, AT: 20 };
const TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/;

export const vatCents = (netCents, rate) => Math.floor((netCents * rate + 50) / 100);

function checkTimestamp(s) {
  const m = typeof s === 'string' && s.match(TIMESTAMP);
  if (!m) throw new InvoiceError('invalid_date', `issuedAt must be YYYY-MM-DDTHH:MM:SSZ, got ${s}`);
  const d = new Date(s);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 19) + 'Z' !== s) throw new InvoiceError('invalid_date', `not a real time: ${s}`);
}

function checkLines(lines) {
  if (!Array.isArray(lines) || lines.length === 0) throw new InvoiceError('invalid_input', 'an invoice needs at least one line');
  for (const l of lines) {
    if (!l || typeof l.desc !== 'string' || !l.desc.trim()) throw new InvoiceError('invalid_input', 'every line needs a description');
    if (!Number.isInteger(l.qty) || l.qty <= 0) throw new InvoiceError('invalid_input', 'qty must be a positive integer');
    if (!Number.isInteger(l.unitCents) || l.unitCents < 0) throw new InvoiceError('invalid_input', 'unitCents must be a non-negative integer');
  }
}

export function createLedger() {
  const customers = new Map();
  const invoices = new Map(); // insertion order = invoice-number order
  const seqByYear = new Map();
  let customerSeq = 0;

  const find = (id) => {
    const inv = invoices.get(id);
    if (!inv) throw new InvoiceError('not_found', `unknown invoice ${id}`);
    return inv;
  };
  const copy = (inv) => ({ ...inv, lines: inv.lines.map((l) => ({ ...l })) });

  return {
    addCustomer({ name, country } = {}) {
      if (typeof name !== 'string' || !name.trim()) throw new InvoiceError('invalid_input', 'customer name is required');
      if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country)) throw new InvoiceError('invalid_input', 'country must be an ISO 3166 alpha-2 code');
      const id = `C${String(++customerSeq).padStart(4, '0')}`;
      customers.set(id, { id, name: name.trim(), country });
      return id;
    },

    customer(id) {
      const c = customers.get(id);
      if (!c) throw new InvoiceError('not_found', `unknown customer ${id}`);
      return { ...c };
    },

    // Invoice numbers are INV-<year>-<4-digit sequence>, gapless per year of issue.
    issue({ customer, lines, issuedAt } = {}) {
      const c = customers.get(customer);
      if (!c) throw new InvoiceError('not_found', `unknown customer ${customer}`);
      checkLines(lines);
      checkTimestamp(issuedAt);
      const year = issuedAt.slice(0, 4);
      const n = (seqByYear.get(year) ?? 0) + 1;
      seqByYear.set(year, n);
      const id = `INV-${year}-${String(n).padStart(4, '0')}`;
      const netCents = lines.reduce((sum, l) => sum + l.qty * l.unitCents, 0);
      const vatRate = VAT_RATES[c.country] ?? 0;
      const taxCents = vatCents(netCents, vatRate);
      invoices.set(id, {
        id, customer, issuedAt, status: 'issued', vatRate,
        lines: lines.map(({ desc, qty, unitCents }) => ({ desc: desc.trim(), qty, unitCents })),
        netCents, taxCents, grossCents: netCents + taxCents,
      });
      return id;
    },

    // Voiding keeps the invoice and its number; only the status changes.
    void(id) {
      const inv = find(id);
      if (inv.status === 'void') throw new InvoiceError('already_void', `${id} is already void`);
      inv.status = 'void';
    },

    get(id) {
      return copy(find(id));
    },

    list() {
      return [...invoices.values()].map(copy);
    },

    // CSV export of the invoices issued between from and to (UTC dates, inclusive). Void invoices are left out.
    exportCsv({ from, to } = {}) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(to ?? '')) throw new InvoiceError('invalid_input', 'from and to must be YYYY-MM-DD');
      if (from > to) throw new InvoiceError('invalid_input', 'from is after to');
      const q = (v) => (/[,"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
      const money = (c) => (c / 100).toFixed(2);
      const rows = [...invoices.values()]
        .filter((inv) => inv.status !== 'void' && inv.issuedAt.slice(0, 10) >= from && inv.issuedAt.slice(0, 10) <= to)
        .sort((a, b) => a.issuedAt.localeCompare(b.issuedAt))
        .map((inv) => [inv.id, inv.issuedAt.slice(0, 10), customers.get(inv.customer).name, money(inv.netCents), money(inv.taxCents), money(inv.grossCents)].map(q).join(','));
      return ['id,date,customer,net,vat,gross', ...rows].join('\n');
    },

    // One human-readable line per invoice, for the console.
    summary() {
      return [...invoices.values()].map((inv) =>
        `${inv.id}  ${customers.get(inv.customer).name}  ${formatEUR(inv.grossCents)}${inv.status === 'void' ? '  (void)' : ''}`).join('\n');
    },
  };
}
