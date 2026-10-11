import type {
    InvoiceCompany,
    InvoiceCurrency,
    InvoicePaymentMethod,
} from './invoice';

export interface CompanySettings {
    company: InvoiceCompany;

    bankName: string;

    accountName: string;

    iban: string;

    defaultCurrency: InvoiceCurrency;

    defaultPaymentMethod: InvoicePaymentMethod;

    invoiceSeries: string;

    defaultDueDays: number;
}