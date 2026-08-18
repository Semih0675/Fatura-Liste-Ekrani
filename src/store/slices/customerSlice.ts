import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CustomerAccount } from '../../models/customer';

export interface CustomerState {
  items: CustomerAccount[];
}

export const CUSTOMER_STORAGE_KEY = 'preaccounting.customers.v1';

const defaultCustomers: CustomerAccount[] = [
  {
    id: 'customer-1',

    accountType: 'customer',

    isEInvoiceTaxpayer: true,

    name: 'Yılmaz Ticaret A.Ş.',

    titleName: 'Yılmaz Ticaret Anonim Şirketi',

    taxNumber: '1234567890',

    taxOfficeCode: '006252',

    taxOfficeName: 'Çankaya Vergi Dairesi',

    phone: '0312 555 10 10',

    email: 'muhasebe@yilmazticaret.com',

    address: {
      addressName: 'Merkez Ofis',

      country: 'Türkiye',

      city: 'Ankara',

      district: 'Çankaya',

      neighborhood: 'Kavaklıdere',

      avenue: 'Atatürk Bulvarı',

      street: '',

      buildingNumber: '125',

      apartmentNumber: '8',

      postalCode: '06680',

      addressCode: '',

      additionalDescription: 'Merkez bina, 3. kat',
    },

    createdAt: '2026-01-10T09:00:00.000Z',

    updatedAt: '2026-01-10T09:00:00.000Z',
  },

  {
    id: 'customer-2',

    accountType: 'both',

    isEInvoiceTaxpayer: true,

    name: 'Demir İnşaat Ltd. Şti.',

    titleName: 'Demir İnşaat Sanayi ve Ticaret Limited Şirketi',

    taxNumber: '9876543210',

    taxOfficeCode: '034204',

    taxOfficeName: 'Maslak Vergi Dairesi',

    phone: '0212 555 20 20',

    email: 'finans@demirinsaat.com',

    address: {
      addressName: 'Genel Müdürlük',

      country: 'Türkiye',

      city: 'İstanbul',

      district: 'Sarıyer',

      neighborhood: 'Maslak',

      avenue: 'Büyükdere Caddesi',

      street: '',

      buildingNumber: '201',

      apartmentNumber: '14',

      postalCode: '34398',

      addressCode: '',

      additionalDescription: '',
    },

    createdAt: '2026-02-08T09:00:00.000Z',

    updatedAt: '2026-02-08T09:00:00.000Z',
  },

  {
    id: 'customer-3',

    accountType: 'customer',

    isEInvoiceTaxpayer: false,

    name: 'Aksa Gıda San. A.Ş.',

    titleName: 'Aksa Gıda Sanayi Anonim Şirketi',

    taxNumber: '1122334455',

    taxOfficeCode: '035102',

    taxOfficeName: 'Konak Vergi Dairesi',

    phone: '0232 555 30 30',

    email: 'muhasebe@aksagida.com',

    address: {
      addressName: 'İzmir Şube',

      country: 'Türkiye',

      city: 'İzmir',

      district: 'Konak',

      neighborhood: 'Alsancak',

      avenue: 'Kıbrıs Şehitleri Caddesi',

      street: '',

      buildingNumber: '55',

      apartmentNumber: '3',

      postalCode: '35220',

      addressCode: '',

      additionalDescription: '',
    },

    createdAt: '2026-03-12T09:00:00.000Z',

    updatedAt: '2026-03-12T09:00:00.000Z',
  },
];

function loadCustomers(): CustomerAccount[] {
  if (typeof window === 'undefined') {
    return defaultCustomers;
  }

  try {
    const savedCustomers = window.localStorage.getItem(CUSTOMER_STORAGE_KEY);

    if (!savedCustomers) {
      return defaultCustomers;
    }

    const parsed = JSON.parse(savedCustomers) as unknown;

    if (!Array.isArray(parsed)) {
      return defaultCustomers;
    }

    return parsed as CustomerAccount[];
  } catch {
    return defaultCustomers;
  }
}

const initialState: CustomerState = {
  items: loadCustomers(),
};

const customerSlice = createSlice({
  name: 'customers',

  initialState,

  reducers: {
    addCustomer(state, action: PayloadAction<CustomerAccount>) {
      state.items.unshift(action.payload);
    },

    updateCustomer(state, action: PayloadAction<CustomerAccount>) {
      const index = state.items.findIndex((customer) => customer.id === action.payload.id);

      if (index === -1) {
        return;
      }

      state.items[index] = action.payload;
    },

    deleteCustomer(state, action: PayloadAction<string>) {
      state.items = state.items.filter((customer) => customer.id !== action.payload);
    },
  },
});

export const { addCustomer, updateCustomer, deleteCustomer } = customerSlice.actions;

export default customerSlice.reducer;
