import {
  configureStore,
} from '@reduxjs/toolkit';

import customerReducer, {
  CUSTOMER_STORAGE_KEY,
} from './slices/customerSlice';

import invoiceReducer from './slices/invoiceSlice';

import productReducer, {
  PRODUCT_STORAGE_KEY,
} from './slices/productSlice';

export const store = configureStore({
  reducer: {
    invoices: invoiceReducer,

    customers: customerReducer,

    products: productReducer,
  },
});

let previousCustomers =
  store.getState().customers.items;

let previousProductState =
  store.getState().products;

store.subscribe(() => {
  const state =
    store.getState();

  if (
    state.customers.items !==
    previousCustomers
  ) {
    previousCustomers =
      state.customers.items;

    try {
      window.localStorage.setItem(
        CUSTOMER_STORAGE_KEY,

        JSON.stringify(
          state.customers.items,
        ),
      );
    } catch {
      // Storage hatası uygulamayı durdurmasın.
    }
  }

  if (
    state.products !==
    previousProductState
  ) {
    previousProductState =
      state.products;

    try {
      window.localStorage.setItem(
        PRODUCT_STORAGE_KEY,

        JSON.stringify(
          state.products,
        ),
      );
    } catch {
      // Storage hatası uygulamayı durdurmasın.
    }
  }
});

export type RootState =
  ReturnType<
    typeof store.getState
  >;

export type AppDispatch =
  typeof store.dispatch;