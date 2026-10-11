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

import paymentReducer, {
  PAYMENT_STORAGE_KEY,
} from './slices/paymentSlice';

import companySettingsReducer, {
  COMPANY_SETTINGS_STORAGE_KEY,
} from './slices/companySettingsSlice';

import exchangeRateReducer, {
  EXCHANGE_RATE_STORAGE_KEY,
} from './slices/exchangeRateSlice';

export const store =
  configureStore({
    reducer: {
      invoices: invoiceReducer,

      customers: customerReducer,

      products: productReducer,

      payments: paymentReducer,

      companySettings:
        companySettingsReducer,

      exchangeRates:
        exchangeRateReducer,
    },
  });

let previousCustomers =
  store.getState().customers.items;

let previousProductState =
  store.getState().products;

let previousPayments =
  store.getState().payments.records;

let previousCompanySettings =
  store.getState()
    .companySettings.value;

let previousExchangeRates =
  store.getState()
    .exchangeRates.value;

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

  if (
    state.payments.records !==
    previousPayments
  ) {
    previousPayments =
      state.payments.records;

    try {
      window.localStorage.setItem(
        PAYMENT_STORAGE_KEY,

        JSON.stringify({
          records:
            state.payments.records,
        }),
      );
    } catch {
      // Storage hatası uygulamayı durdurmasın.
    }
  }

  if (
    state.companySettings
      .value !==
    previousCompanySettings
  ) {
    previousCompanySettings =
      state.companySettings.value;

    try {
      window.localStorage.setItem(
        COMPANY_SETTINGS_STORAGE_KEY,

        JSON.stringify(
          state.companySettings
            .value,
        ),
      );
    } catch {
      // Storage hatası uygulamayı durdurmasın.
    }
  }

  if (
    state.exchangeRates.value !==
    previousExchangeRates
  ) {
    previousExchangeRates =
      state.exchangeRates.value;

    try {
      window.localStorage.setItem(
        EXCHANGE_RATE_STORAGE_KEY,

        JSON.stringify(
          state.exchangeRates.value,
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