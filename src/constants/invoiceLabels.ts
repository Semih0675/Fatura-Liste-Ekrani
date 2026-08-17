import type { InvoiceStatus, InvoiceType } from '../models/invoice';

export const invoiceTypeLabels: Record<InvoiceType, string> = {
  sale: 'Satış',
  purchase: 'Alış',
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: 'Taslak',

  paid: 'Ödendi',

  pending: 'Bekliyor',

  overdue: 'Gecikmiş',
};
