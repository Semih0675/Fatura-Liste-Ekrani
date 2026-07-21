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

export type InvoiceSortKey =
  'invoiceNumber' | 'customerName' | 'issueDate' | 'dueDate' | 'amount' | 'type' | 'status';

export type SortDirection = 'ascending' | 'descending';

export interface InvoiceSortConfig {
  key: InvoiceSortKey;
  direction: SortDirection;
}
