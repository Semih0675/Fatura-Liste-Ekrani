import {
    createSlice,
    type PayloadAction,
} from '@reduxjs/toolkit';

import type {
    CompanySettings,
} from '../../models/companySettings';

export const COMPANY_SETTINGS_STORAGE_KEY =
    'preaccounting.company-settings.v1';

const defaultSettings: CompanySettings = {
    company: {
        title: 'PreAccounting',

        taxNumber: '',

        taxOffice: '',

        mersisNumber: '',

        tradeRegistryNumber: '',

        phone: '',

        email: '',

        website: '',

        address: '',

        district: '',

        city: '',

        country: 'Türkiye',

        logoUrl: '',
    },

    bankName: '',

    accountName: '',

    iban: '',

    defaultCurrency: 'TRY',

    defaultPaymentMethod:
        'bankTransfer',

    invoiceSeries: 'FTR',

    defaultDueDays: 30,
};

function loadSettings(): CompanySettings {
    if (
        typeof window === 'undefined'
    ) {
        return defaultSettings;
    }

    try {
        const raw =
            window.localStorage.getItem(
                COMPANY_SETTINGS_STORAGE_KEY,
            );

        if (!raw) {
            return defaultSettings;
        }

        const parsed =
            JSON.parse(
                raw,
            ) as Partial<CompanySettings>;

        return {
            ...defaultSettings,

            ...parsed,

            company: {
                ...defaultSettings.company,

                ...(parsed.company ?? {}),
            },
        };
    } catch {
        return defaultSettings;
    }
}

export interface CompanySettingsState {
    value: CompanySettings;
}

const companySettingsSlice =
    createSlice({
        name: 'companySettings',

        initialState: {
            value: loadSettings(),
        } as CompanySettingsState,

        reducers: {
            setCompanySettings(
                state,
                action:
                    PayloadAction<CompanySettings>,
            ) {
                state.value =
                    action.payload;
            },
        },
    });

export const {
    setCompanySettings,
} =
    companySettingsSlice.actions;

export default companySettingsSlice.reducer;