import {
    createSlice,
    type PayloadAction,
} from '@reduxjs/toolkit';

import type {
    ExchangeRateSettings,
} from '../../models/exchangeRate';

export const EXCHANGE_RATE_STORAGE_KEY =
    'preaccounting.exchange-rates.v1';

function getToday() {
    return new Date()
        .toISOString()
        .slice(0, 10);
}

const defaultRates:
    ExchangeRateSettings = {
    rateDate: getToday(),

    usdTry: null,

    eurTry: null,
};

function loadRates():
    ExchangeRateSettings {
    if (
        typeof window === 'undefined'
    ) {
        return defaultRates;
    }

    try {
        const raw =
            window.localStorage.getItem(
                EXCHANGE_RATE_STORAGE_KEY,
            );

        if (!raw) {
            return defaultRates;
        }

        return {
            ...defaultRates,

            ...(JSON.parse(
                raw,
            ) as ExchangeRateSettings),
        };
    } catch {
        return defaultRates;
    }
}

export interface ExchangeRateState {
    value: ExchangeRateSettings;
}

const exchangeRateSlice =
    createSlice({
        name: 'exchangeRates',

        initialState: {
            value: loadRates(),
        } as ExchangeRateState,

        reducers: {
            setExchangeRates(
                state,
                action:
                    PayloadAction<ExchangeRateSettings>,
            ) {
                state.value =
                    action.payload;
            },
        },
    });

export const {
    setExchangeRates,
} = exchangeRateSlice.actions;

export default exchangeRateSlice.reducer;