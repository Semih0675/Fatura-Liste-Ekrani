import { createSelector } from '@reduxjs/toolkit';

import { invoiceStatusLabels, invoiceTypeLabels } from '../../constants/invoiceLabels';

import type { Invoice, InvoicePageSize, InvoiceSortKey } from '../../models/invoice';

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
      return collator.compare(firstInvoice.invoiceNumber ?? '', secondInvoice.invoiceNumber ?? '');

    case 'customerName':
      return collator.compare(firstInvoice.customerName ?? '', secondInvoice.customerName ?? '');

    case 'issueDate':
      return (firstInvoice.issueDate ?? '').localeCompare(secondInvoice.issueDate ?? '');

    case 'dueDate':
      return (firstInvoice.dueDate ?? '').localeCompare(secondInvoice.dueDate ?? '');

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

/* =========================================================
   BASIC SELECTORS
   ========================================================= */

export const selectInvoiceItems = (state: RootState) => state.invoices.items;

export const selectInvoiceRequestStatus = (state: RootState) => state.invoices.requestStatus;

export const selectInvoiceError = (state: RootState) => state.invoices.error;

export const selectInvoiceFilters = (state: RootState) => state.invoices.filters;

export const selectInvoiceSortConfig = (state: RootState) => state.invoices.filters.sortConfig;

export const selectInvoicePagination = (state: RootState) => state.invoices.pagination;

/* =========================================================
   TOTAL COUNT
   ========================================================= */

export const selectInvoiceTotalCount = createSelector(
  [selectInvoiceItems],

  (invoices) => invoices.length,
);

/* =========================================================
   FILTER VALUES
   ========================================================= */

export const selectInvoiceFilterValues = createSelector(
  [
    (state: RootState) => state.invoices.filters.searchTerm,

    (state: RootState) => state.invoices.filters.type,

    (state: RootState) => state.invoices.filters.statuses,

    (state: RootState) => state.invoices.filters.issueDateFrom,

    (state: RootState) => state.invoices.filters.issueDateTo,

    (state: RootState) => state.invoices.filters.minAmount,

    (state: RootState) => state.invoices.filters.maxAmount,
  ],

  (searchTerm, type, statuses, issueDateFrom, issueDateTo, minAmount, maxAmount) => ({
    searchTerm,

    type,

    statuses,

    issueDateFrom,

    issueDateTo,

    minAmount,

    maxAmount,
  }),
);

/* =========================================================
   FILTERED
   ========================================================= */

export const selectFilteredInvoices = createSelector(
  [selectInvoiceItems, selectInvoiceFilterValues],

  (invoices, filters) => {
    const normalizedSearchTerm = normalizeSearchValue(filters.searchTerm.trim());

    return invoices.filter((invoice) => {
      const searchableText = [
        invoice.invoiceNumber ?? '',

        invoice.customerName ?? '',

        invoice.issueDate ? formatDate(invoice.issueDate) : '',

        invoice.dueDate ? formatDate(invoice.dueDate) : '',

        formatMoney(invoice.amount),

        invoiceTypeLabels[invoice.type],

        invoiceStatusLabels[invoice.status],
      ]
        .join(' ')
        .toLocaleLowerCase('tr-TR');

      const matchesSearch =
        normalizedSearchTerm.length === 0 || searchableText.includes(normalizedSearchTerm);

      const matchesType = filters.type === null || invoice.type === filters.type;

      const matchesStatus =
        filters.statuses.length === 0 || filters.statuses.includes(invoice.status);

      /*
       * Taslaklarda tarih boş
       * olabilir. Tarih filtresi
       * aktifse tarihi olmayan
       * taslak eşleşmez.
       */

      const matchesStartDate =
        filters.issueDateFrom === null
          ? true
          : Boolean(invoice.issueDate && invoice.issueDate >= filters.issueDateFrom);

      const matchesEndDate =
        filters.issueDateTo === null
          ? true
          : Boolean(invoice.issueDate && invoice.issueDate <= filters.issueDateTo);

      const matchesMinimumAmount =
        filters.minAmount === null || invoice.amount >= filters.minAmount;

      const matchesMaximumAmount =
        filters.maxAmount === null || invoice.amount <= filters.maxAmount;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesStartDate &&
        matchesEndDate &&
        matchesMinimumAmount &&
        matchesMaximumAmount
      );
    });
  },
);

/* =========================================================
   SORTED
   ========================================================= */

export const selectSortedInvoices = createSelector(
  [selectFilteredInvoices, selectInvoiceSortConfig],

  (invoices, sortConfig) =>
    [...invoices].sort((firstInvoice, secondInvoice) => {
      const comparisonResult = compareInvoices(firstInvoice, secondInvoice, sortConfig.key);

      return sortConfig.direction === 'ascending' ? comparisonResult : -comparisonResult;
    }),
);

/* =========================================================
   SUMMARY
   ========================================================= */

export const selectInvoiceSummary = createSelector(
  [selectFilteredInvoices],

  (invoices) => {
    /*
     * Taslaklar gerçek mali
     * toplamlara dahil edilmez.
     */
    const finalizedInvoices = invoices.filter((invoice) => invoice.status !== 'draft');

    const totalAmount = finalizedInvoices.reduce(
      (total, invoice) => total + invoice.amount,

      0,
    );

    const overdueInvoices = finalizedInvoices.filter((invoice) => invoice.status === 'overdue');

    const overdueAmount = overdueInvoices.reduce(
      (total, invoice) => total + invoice.amount,

      0,
    );

    const draftCount = invoices.filter((invoice) => invoice.status === 'draft').length;

    return {
      totalCount: invoices.length,

      totalAmount,

      overdueCount: overdueInvoices.length,

      overdueAmount,

      draftCount,
    };
  },
);

/* =========================================================
   PAGINATION META
   ========================================================= */

export interface InvoicePaginationMeta {
  currentPage: number;

  pageSize: InvoicePageSize;

  totalItems: number;

  totalPages: number;

  startItem: number;

  endItem: number;
}

export const selectInvoicePaginationMeta = createSelector(
  [selectSortedInvoices, selectInvoicePagination],

  (invoices, pagination): InvoicePaginationMeta => {
    const totalItems = invoices.length;

    const totalPages = Math.ceil(totalItems / pagination.pageSize);

    const safeCurrentPage = totalPages === 0 ? 1 : Math.min(pagination.currentPage, totalPages);

    const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pagination.pageSize;

    const endIndex = Math.min(
      startIndex + pagination.pageSize,

      totalItems,
    );

    return {
      currentPage: safeCurrentPage,

      pageSize: pagination.pageSize,

      totalItems,

      totalPages,

      startItem: totalItems === 0 ? 0 : startIndex + 1,

      endItem: endIndex,
    };
  },
);

/* =========================================================
   PAGINATED
   ========================================================= */

export const selectPaginatedInvoices = createSelector(
  [selectSortedInvoices, selectInvoicePaginationMeta],

  (invoices, pagination) => {
    if (pagination.totalItems === 0) {
      return [];
    }

    const startIndex = pagination.startItem - 1;

    return invoices.slice(startIndex, pagination.endItem);
  },
);
