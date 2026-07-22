import type { Invoice } from '../../models/invoice';
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

export const invoiceResource = {
  getAll,
  getById,
};
