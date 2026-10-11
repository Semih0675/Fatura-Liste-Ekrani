import {
    createSlice,
    type PayloadAction,
} from '@reduxjs/toolkit';

import type {
    PaymentRecord,
} from '../../models/payment';

export const PAYMENT_STORAGE_KEY =
    'preaccounting.payments.v1';

export interface PaymentState {
    records: PaymentRecord[];
}

function loadState(): PaymentState {
    if (
        typeof window === 'undefined'
    ) {
        return {
            records: [],
        };
    }

    try {
        const raw =
            window.localStorage.getItem(
                PAYMENT_STORAGE_KEY,
            );

        if (!raw) {
            return {
                records: [],
            };
        }

        const parsed =
            JSON.parse(raw) as PaymentState;

        return {
            records: Array.isArray(
                parsed.records,
            )
                ? parsed.records
                : [],
        };
    } catch {
        return {
            records: [],
        };
    }
}

const paymentSlice =
    createSlice({
        name: 'payments',

        initialState: loadState(),

        reducers: {
            addPayment(
                state,
                action:
                    PayloadAction<PaymentRecord>,
            ) {
                state.records.unshift(
                    action.payload,
                );
            },
        },
    });

export const {
    addPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;