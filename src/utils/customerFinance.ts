import type { CustomerAccount } from '../models/customer';

import type { Invoice, InvoiceCurrency } from '../models/invoice';

export interface CurrencyFinancialSummary {
  sales: number;

  purchases: number;

  collected: number;

  paid: number;

  balance: number;
}

export type CustomerFinancialSummary = Record<InvoiceCurrency, CurrencyFinancialSummary>;

export type CustomerBalanceStatus = 'debtor' | 'creditor' | 'balanced' | 'mixed';

const currencies: InvoiceCurrency[] = ['TRY', 'USD', 'EUR'];

function createCurrencySummary(): CurrencyFinancialSummary {
  return {
    sales: 0,

    purchases: 0,

    collected: 0,

    paid: 0,

    balance: 0,
  };
}

export function createEmptyCustomerFinancialSummary(): CustomerFinancialSummary {
  return {
    TRY: createCurrencySummary(),

    USD: createCurrencySummary(),

    EUR: createCurrencySummary(),
  };
}

export function getCustomerInvoices(customer: CustomerAccount, invoices: Invoice[]): Invoice[] {
  return invoices.filter((invoice) => {
    if (invoice.customer?.id && customer.id && invoice.customer.id === customer.id) {
      return true;
    }

    const invoiceTaxNumber = invoice.customer?.taxNumber?.trim();

    const customerTaxNumber = customer.taxNumber?.trim();

    if (invoiceTaxNumber && customerTaxNumber && invoiceTaxNumber === customerTaxNumber) {
      return true;
    }

    return (
      invoice.customerName?.trim().toLocaleLowerCase('tr-TR') ===
      customer.name?.trim().toLocaleLowerCase('tr-TR')
    );
  });
}

export function calculateCustomerFinancials(
  customer: CustomerAccount,
  invoices: Invoice[],
): CustomerFinancialSummary {
  const summary = createEmptyCustomerFinancialSummary();

  const customerInvoices = getCustomerInvoices(customer, invoices);

  customerInvoices.forEach((invoice) => {
    if (invoice.status === 'draft') {
      return;
    }

    const currency = invoice.document?.currency ?? 'TRY';

    const amount = invoice.totals?.grandTotal ?? invoice.amount ?? 0;

    const paymentAmount = invoice.payment?.collectedAmount ?? 0;

    const currencySummary = summary[currency];

    if (invoice.type === 'purchase') {
      currencySummary.purchases += amount;

      currencySummary.paid += paymentAmount;

      currencySummary.balance -= amount - paymentAmount;

      return;
    }

    currencySummary.sales += amount;

    currencySummary.collected += paymentAmount;

    currencySummary.balance += amount - paymentAmount;
  });

  return summary;
}

export function getCustomerBalanceStatus(
  financials: CustomerFinancialSummary,
): CustomerBalanceStatus {
  const balances = currencies.map((currency) => financials[currency].balance);

  const hasPositive = balances.some((balance) => balance > 0.005);

  const hasNegative = balances.some((balance) => balance < -0.005);

  if (hasPositive && hasNegative) {
    return 'mixed';
  }

  if (hasPositive) {
    return 'debtor';
  }

  if (hasNegative) {
    return 'creditor';
  }

  return 'balanced';
}

export function hasAnyFinancialValue(values: Record<InvoiceCurrency, number>): boolean {
  return currencies.some((currency) => Math.abs(values[currency]) > 0.005);
}

export const invoiceCurrencies = currencies;
