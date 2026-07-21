import type { InvoiceStatus, InvoiceType } from '../models/invoice';

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  paid: 'Ödendi',
  pending: 'Bekliyor',
  overdue: 'Gecikmiş',
};

export const invoiceTypeLabels: Record<InvoiceType, string> = {
  sale: 'Satış',
  purchase: 'Alış',
};
