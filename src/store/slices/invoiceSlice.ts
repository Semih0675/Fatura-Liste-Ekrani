import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import invoiceData from '../../data/invoices.json';
import type { Invoice, InvoiceSortConfig, InvoiceSortKey } from '../../models/invoice';

export interface InvoiceFiltersState {
  searchTerm: string;
  sortConfig: InvoiceSortConfig;
}

export interface InvoiceState {
  items: Invoice[];
  filters: InvoiceFiltersState;
}

const initialState: InvoiceState = {
  items: invoiceData as Invoice[],
  filters: {
    searchTerm: '',
    sortConfig: {
      key: 'invoiceNumber',
      direction: 'descending',
    },
  },
};

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    replaceInvoices(state, action: PayloadAction<Invoice[]>) {
      state.items = action.payload;
    },

    setSearchTerm(state, action: PayloadAction<string>) {
      state.filters.searchTerm = action.payload;
    },

    clearSearchTerm(state) {
      state.filters.searchTerm = '';
    },

    toggleSort(state, action: PayloadAction<InvoiceSortKey>) {
      const selectedKey = action.payload;
      const currentSort = state.filters.sortConfig;

      if (currentSort.key === selectedKey) {
        currentSort.direction = currentSort.direction === 'ascending' ? 'descending' : 'ascending';

        return;
      }

      state.filters.sortConfig = {
        key: selectedKey,
        direction: 'ascending',
      };
    },

    resetFilters(state) {
      state.filters = {
        searchTerm: '',
        sortConfig: {
          key: 'invoiceNumber',
          direction: 'descending',
        },
      };
    },
  },
});

export const { replaceInvoices, setSearchTerm, clearSearchTerm, toggleSort, resetFilters } =
  invoiceSlice.actions;

export default invoiceSlice.reducer;
