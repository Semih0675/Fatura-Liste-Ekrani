import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import invoiceData from '../../data/invoices.json';
import type {
  Invoice,
  InvoiceFiltersState,
  InvoiceFilterValues,
  InvoiceSortKey,
} from '../../models/invoice';

export interface InvoiceState {
  items: Invoice[];
  filters: InvoiceFiltersState;
}

function createInitialFilters(): InvoiceFiltersState {
  return {
    searchTerm: '',
    type: null,
    statuses: [],
    issueDateFrom: null,
    issueDateTo: null,
    minAmount: null,
    maxAmount: null,
    sortConfig: {
      key: 'invoiceNumber',
      direction: 'descending',
    },
  };
}

const initialState: InvoiceState = {
  items: invoiceData as Invoice[],
  filters: createInitialFilters(),
};

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    replaceInvoices(state, action: PayloadAction<Invoice[]>) {
      state.items = action.payload;
    },

    applyFilters(state, action: PayloadAction<InvoiceFilterValues>) {
      const currentSortConfig = {
        ...state.filters.sortConfig,
      };

      state.filters = {
        ...action.payload,
        statuses: [...action.payload.statuses],
        sortConfig: currentSortConfig,
      };
    },

    resetFilters(state) {
      state.filters = createInitialFilters();
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
  },
});

export const { replaceInvoices, applyFilters, resetFilters, toggleSort } = invoiceSlice.actions;

export default invoiceSlice.reducer;
