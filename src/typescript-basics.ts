// TYPE: Belirli değerlerden oluşan türler tanımlayabiliriz.
export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export type InvoiceType = 'sale' | 'purchase';

// INTERFACE: Bir nesnenin sahip olması gereken alanları tanımlar.
export interface Customer {
  id: number;
  name: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: Customer;
  amount: number;
  status: InvoiceStatus;
  type: InvoiceType;
}

// Tanımladığımız interface ve union türlerini kullanan örnek nesne.
export const sampleInvoice: Invoice = {
  id: 1,
  invoiceNumber: 'FTR-2026-0001',
  customer: {
    id: 101,
    name: 'Yılmaz Ticaret A.Ş.',
  },
  amount: 45_780.5,
  status: 'paid',
  type: 'sale',
};

// GENERIC: Fonksiyon farklı türlerle çalışabilir.
export function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

export function wrapInArray<T>(value: T): T[] {
  return [value];
}
