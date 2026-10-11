import type {
    InvoiceCurrency,
    InvoicePaymentMethod,
} from './invoice';

export type PaymentDirection =
    | 'collection'
    | 'payment';

export interface PaymentRecord {
    id: string;

    direction: PaymentDirection;

    customerId: string;

    customerName: string;

    invoiceId: number;

    invoiceNumber: string;

    date: string;

    amount: number;

    currency: InvoiceCurrency;

    method: InvoicePaymentMethod;

    note: string;

    createdAt: string;
}