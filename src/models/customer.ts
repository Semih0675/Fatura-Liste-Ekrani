import type { InvoiceCustomer } from './invoice';

export type CustomerAccountType = 'customer' | 'supplier' | 'both';

export interface CustomerAccount extends InvoiceCustomer {
  accountType: CustomerAccountType;

  isEInvoiceTaxpayer: boolean;

  createdAt: string;

  updatedAt: string;
}

export type CustomerFormInput = Omit<CustomerAccount, 'id' | 'createdAt' | 'updatedAt'>;
