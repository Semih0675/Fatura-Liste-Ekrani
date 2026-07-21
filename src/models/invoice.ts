export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export type InvoiceType = 'sale' | 'purchase';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  type: InvoiceType;
  status: InvoiceStatus;
}
