import type { CreateInvoiceInput, Invoice } from '../../models/invoice';
import { http } from '../http';

const invoiceEndpoint = '/invoices';

async function getAll(signal?: AbortSignal): Promise<Invoice[]> {
  return http.get<Invoice[]>(invoiceEndpoint, {
    signal,
  });
}

async function getById(id: number, signal?: AbortSignal): Promise<Invoice> {
  return http.get<Invoice>(`${invoiceEndpoint}/${id}`, {
    signal,
  });
}

async function create(invoice: CreateInvoiceInput): Promise<Invoice> {
  return http.post<Invoice>(invoiceEndpoint, invoice);
}

async function remove(id: number): Promise<void> {
  await http.delete<void>(`${invoiceEndpoint}/${id}`);
}

export const invoiceResource = {
  getAll,
  getById,
  create,
  remove,
};
