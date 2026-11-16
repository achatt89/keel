// CSV export for the accountant (German Excel / DATEV): ';' separator, decimal comma, UTF-8 BOM, CRLF.
const HEADER = 'invoice;date;customer;country;net;vat;gross;status';
const berlinDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });

export const amount = (cents) => `${cents < 0 ? '-' : ''}${Math.floor(Math.abs(cents) / 100)},${String(Math.abs(cents) % 100).padStart(2, '0')}`;
export const field = (v) => (/[;"\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
export const localDate = (timestamp) => berlinDate.format(new Date(timestamp));

export function isDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// invoices: in invoice-number order; nameOf(customerId) -> name.
export function toCsv(invoices, nameOf, countryOf) {
  const rows = invoices.map((inv) => [inv.id, localDate(inv.issuedAt), nameOf(inv.customer), countryOf(inv.customer),
    amount(inv.netCents), amount(inv.taxCents), amount(inv.grossCents), inv.status].map(field).join(';'));
  return `﻿${[HEADER, ...rows].map((l) => `${l}\r\n`).join('')}`;
}
