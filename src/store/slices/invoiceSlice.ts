import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { getHttpErrorMessage } from '../../api/http';
import { invoiceResource } from '../../api/resources/invoice';

import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceFiltersState,
  InvoiceFilterValues,
  InvoicePageSize,
  InvoicePaginationState,
  InvoiceSortKey,
} from '../../models/invoice';

export type InvoiceRequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface InvoiceState {
  items: Invoice[];

  filters: InvoiceFiltersState;

  pagination: InvoicePaginationState;

  requestStatus: InvoiceRequestStatus;

  error: string | null;
}

/* =========================================================
   INITIAL FILTERS
   ========================================================= */

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

/* =========================================================
   INITIAL PAGINATION
   ========================================================= */

function createInitialPagination(): InvoicePaginationState {
  return {
    currentPage: 1,

    pageSize: 10,
  };
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: InvoiceState = {
  items: [],

  filters: createInitialFilters(),

  pagination: createInitialPagination(),

  requestStatus: 'idle',

  error: null,
};

/* =========================================================
   FETCH
   ========================================================= */

export const fetchInvoices = createAsyncThunk<
  Invoice[],
  void,
  {
    rejectValue: string;
  }
>(
  'invoices/fetchInvoices',

  async (_, { rejectWithValue, signal }) => {
    try {
      return await invoiceResource.getAll(signal);
    } catch (error) {
      return rejectWithValue(getHttpErrorMessage(error));
    }
  },
);

/* =========================================================
   CREATE FINAL INVOICE
   ========================================================= */

export const createInvoice = createAsyncThunk<
  Invoice,
  CreateInvoiceInput,
  {
    rejectValue: string;
  }
>(
  'invoices/createInvoice',

  async (invoice, { rejectWithValue }) => {
    try {
      return await invoiceResource.create(invoice);
    } catch (error) {
      return rejectWithValue(getHttpErrorMessage(error));
    }
  },
);

/* =========================================================
   SAVE DRAFT
   ========================================================= */

export const createDraftInvoice = createAsyncThunk<
  Invoice,
  CreateInvoiceInput,
  {
    rejectValue: string;
  }
>(
  'invoices/createDraftInvoice',

  async (invoice, { rejectWithValue }) => {
    try {
      return await invoiceResource.create({
        ...invoice,

        status: 'draft',
      });
    } catch (error) {
      return rejectWithValue(getHttpErrorMessage(error));
    }
  },
);

/* =========================================================
   UPDATE
   ========================================================= */

export const updateInvoice = createAsyncThunk<
  Invoice,
  Invoice,
  {
    rejectValue: string;
  }
>(
  'invoices/updateInvoice',

  async (invoice, { rejectWithValue }) => {
    try {
      return await invoiceResource.update(invoice.id, invoice);
    } catch (error) {
      return rejectWithValue(getHttpErrorMessage(error));
    }
  },
);

/* =========================================================
   DELETE
   ========================================================= */

export const deleteInvoice = createAsyncThunk<
  number,
  number,
  {
    rejectValue: string;
  }
>(
  'invoices/deleteInvoice',

  async (id, { rejectWithValue }) => {
    try {
      await invoiceResource.remove(id);

      return id;
    } catch (error) {
      return rejectWithValue(getHttpErrorMessage(error));
    }
  },
);

/* =========================================================
   SLICE
   ========================================================= */

const invoiceSlice = createSlice({
  name: 'invoices',

  initialState,

  reducers: {
    /* =====================================================
       FILTERS
       ===================================================== */

    applyFilters(state, action: PayloadAction<InvoiceFilterValues>) {
      const currentSortConfig = {
        ...state.filters.sortConfig,
      };

      state.filters = {
        ...action.payload,

        statuses: [...action.payload.statuses],

        sortConfig: currentSortConfig,
      };

      state.pagination.currentPage = 1;
    },

    resetFilters(state) {
      state.filters = createInitialFilters();

      state.pagination.currentPage = 1;
    },

    /* =====================================================
       SORT
       ===================================================== */

    toggleSort(state, action: PayloadAction<InvoiceSortKey>) {
      const selectedKey = action.payload;

      const currentSort = state.filters.sortConfig;

      if (currentSort.key === selectedKey) {
        currentSort.direction = currentSort.direction === 'ascending' ? 'descending' : 'ascending';

        state.pagination.currentPage = 1;

        return;
      }

      state.filters.sortConfig = {
        key: selectedKey,

        direction: 'ascending',
      };

      state.pagination.currentPage = 1;
    },

    /* =====================================================
       PAGINATION
       ===================================================== */

    setCurrentPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = Math.max(1, Math.trunc(action.payload));
    },

    setPageSize(state, action: PayloadAction<InvoicePageSize>) {
      state.pagination.pageSize = action.payload;

      state.pagination.currentPage = 1;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers(builder) {
    builder
      /* ===================================================
         FETCH
         =================================================== */

      .addCase(fetchInvoices.pending, (state) => {
        state.requestStatus = 'loading';

        state.error = null;
      })

      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.requestStatus = 'succeeded';

        state.items = action.payload;

        state.error = null;

        state.pagination.currentPage = 1;
      })

      .addCase(fetchInvoices.rejected, (state, action) => {
        state.requestStatus = 'failed';

        state.error = action.payload ?? 'Fatura verileri alınırken bir hata oluştu.';
      })

      /* ===================================================
         CREATE FINAL INVOICE
         =================================================== */

      .addCase(createInvoice.pending, (state) => {
        state.error = null;
      })

      .addCase(createInvoice.fulfilled, (state, action) => {
        state.items.unshift(action.payload);

        state.pagination.currentPage = 1;

        state.error = null;
      })

      .addCase(createInvoice.rejected, (state, action) => {
        state.error = action.payload ?? 'Fatura kaydedilirken bir hata oluştu.';
      })

      /* ===================================================
         CREATE DRAFT
         =================================================== */

      .addCase(createDraftInvoice.pending, (state) => {
        state.error = null;
      })

      .addCase(createDraftInvoice.fulfilled, (state, action) => {
        state.items.unshift(action.payload);

        state.pagination.currentPage = 1;

        state.error = null;
      })

      .addCase(createDraftInvoice.rejected, (state, action) => {
        state.error = action.payload ?? 'Taslak kaydedilirken bir hata oluştu.';
      })

      /* ===================================================
         UPDATE
         =================================================== */

      .addCase(updateInvoice.pending, (state) => {
        state.error = null;
      })

      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.items.findIndex((invoice) => invoice.id === action.payload.id);

        if (index !== -1) {
          state.items[index] = action.payload;
        }

        state.error = null;
      })

      .addCase(updateInvoice.rejected, (state, action) => {
        state.error = action.payload ?? 'Fatura güncellenirken bir hata oluştu.';
      })

      /* ===================================================
         DELETE
         =================================================== */

      .addCase(deleteInvoice.pending, (state) => {
        state.error = null;
      })

      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.items = state.items.filter((invoice) => invoice.id !== action.payload);

        state.error = null;
      })

      .addCase(deleteInvoice.rejected, (state, action) => {
        state.error = action.payload ?? 'Fatura silinirken bir hata oluştu.';
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const { applyFilters, resetFilters, toggleSort, setCurrentPage, setPageSize } =
  invoiceSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default invoiceSlice.reducer;
