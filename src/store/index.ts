import { configureStore } from '@reduxjs/toolkit';

import customerReducer, { CUSTOMER_STORAGE_KEY } from './slices/customerSlice';

import invoiceReducer from './slices/invoiceSlice';

export const store = configureStore({
  reducer: {
    invoices: invoiceReducer,

    customers: customerReducer,
  },
});

let previousCustomers = store.getState().customers.items;

store.subscribe(() => {
  const customers = store.getState().customers.items;

  if (customers === previousCustomers) {
    return;
  }

  previousCustomers = customers;

  try {
    window.localStorage.setItem(
      CUSTOMER_STORAGE_KEY,

      JSON.stringify(customers),
    );
  } catch {
    // localStorage kullanılamıyorsa
    // uygulamanın çalışmasını engelleme.
  }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
