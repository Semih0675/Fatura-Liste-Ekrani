import { createSelector } from '@reduxjs/toolkit';
import { invoiceStatusLabels, invoiceTypeLabels } from '../../constants/invoiceLabels';
import type { Invoice, InvoiceSortKey } from '../../models/invoice';
import { formatDate, formatMoney } from '../../utils/formatters';
import type { RootState } from '../index';

const collator = new Intl.Collator('tr-TR', {
  sensitivity: 'base',
  numeric: true,
});

function normalizeSearchValue(value: string): string {
  return value.toLocaleLowerCase('tr-TR');
}

function compareInvoices(
  firstInvoice: Invoice,
  secondInvoice: Invoice,
  sortKey: InvoiceSortKey,
): number {
  switch (sortKey) {
    case 'invoiceNumber':
      return collator.compare(firstInvoice.invoiceNumber, secondInvoice.invoiceNumber);

    case 'customerName':
      return collator.compare(firstInvoice.customerName, secondInvoice.customerName);

    case 'issueDate':
      return firstInvoice.issueDate.localeCompare(secondInvoice.issueDate);

    case 'dueDate':
      return firstInvoice.dueDate.localeCompare(secondInvoice.dueDate);

    case 'amount':
      return firstInvoice.amount - secondInvoice.amount;

    case 'type':
      return collator.compare(
        invoiceTypeLabels[firstInvoice.type],
        invoiceTypeLabels[secondInvoice.type],
      );

    case 'status':
      return collator.compare(
        invoiceStatusLabels[firstInvoice.status],
        invoiceStatusLabels[secondInvoice.status],
      );

    default: {
      const exhaustiveCheck: never = sortKey;

      return exhaustiveCheck;
    }
  }
}

export const selectInvoiceItems = (state: RootState) => state.invoices.items;

export const selectInvoiceSearchTerm = (state: RootState) => state.invoices.filters.searchTerm;

export const selectInvoiceSortConfig = (state: RootState) => state.invoices.filters.sortConfig;

export const selectVisibleInvoices = createSelector(
  [selectInvoiceItems, selectInvoiceSearchTerm, selectInvoiceSortConfig],
  (invoices, searchTerm, sortConfig) => {
    const normalizedSearchTerm = normalizeSearchValue(searchTerm.trim());

    const filteredInvoices = normalizedSearchTerm
      ? invoices.filter((invoice) => {
          const searchableText = [
            invoice.invoiceNumber,
            invoice.customerName,
            formatDate(invoice.issueDate),
            formatDate(invoice.dueDate),
            formatMoney(invoice.amount),
            invoiceTypeLabels[invoice.type],
            invoiceStatusLabels[invoice.status],
          ]
            .join(' ')
            .toLocaleLowerCase('tr-TR');

          return searchableText.includes(normalizedSearchTerm);
        })
      : invoices;

    return [...filteredInvoices].sort((firstInvoice, secondInvoice) => {
      const comparisonResult = compareInvoices(firstInvoice, secondInvoice, sortConfig.key);

      return sortConfig.direction === 'ascending' ? comparisonResult : -comparisonResult;
    });
  },
);

export const selectInvoiceSummary = createSelector([selectInvoiceItems], (invoices) => {
  const totalAmount = invoices.reduce((total, invoice) => total + invoice.amount, 0);

  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue');

  const overdueAmount = overdueInvoices.reduce((total, invoice) => total + invoice.amount, 0);

  return {
    totalCount: invoices.length,
    totalAmount,
    overdueCount: overdueInvoices.length,
    overdueAmount,
  };
});
