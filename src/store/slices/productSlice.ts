import {
    createSlice,
    type PayloadAction,
} from '@reduxjs/toolkit';

import type {
    Product,
    ProductStockMovement,
} from '../../models/product';

import {
    createInvoice,
} from './invoiceSlice';

export interface ProductState {
    items: Product[];

    movements: ProductStockMovement[];
}

export const PRODUCT_STORAGE_KEY =
    'preaccounting.products.v1';

const defaultProducts: Product[] = [
    {
        id: 'product-1',

        code: '3D-001',

        barcode: '',

        name: '3D Baskı Ürünü',

        description: '3D baskı üretim ürünü',

        type: 'product',

        unit: 'piece',

        purchasePrice: 800,

        salePrice: 1250,

        currency: 'TRY',

        vatRate: 20,

        trackStock: true,

        stockQuantity: 48,

        criticalStock: 10,

        isActive: true,

        createdAt: '2026-01-01T09:00:00.000Z',

        updatedAt: '2026-01-01T09:00:00.000Z',
    },

    {
        id: 'product-2',

        code: 'FLM-PLA-001',

        barcode: '869000000001',

        name: 'Filament',

        description: 'PLA filament',

        type: 'product',

        unit: 'piece',

        purchasePrice: 420,

        salePrice: 650,

        currency: 'TRY',

        vatRate: 20,

        trackStock: true,

        stockQuantity: 125,

        criticalStock: 20,

        isActive: true,

        createdAt: '2026-01-01T09:00:00.000Z',

        updatedAt: '2026-01-01T09:00:00.000Z',
    },

    {
        id: 'product-3',

        code: 'HZM-TSR-001',

        barcode: '',

        name: 'Tasarım Hizmeti',

        description: '3D modelleme ve tasarım hizmeti',

        type: 'service',

        unit: 'hour',

        purchasePrice: 0,

        salePrice: 2500,

        currency: 'TRY',

        vatRate: 20,

        trackStock: false,

        stockQuantity: null,

        criticalStock: null,

        isActive: true,

        createdAt: '2026-01-01T09:00:00.000Z',

        updatedAt: '2026-01-01T09:00:00.000Z',
    },

    {
        id: 'product-4',

        code: 'HZM-KRG-001',

        barcode: '',

        name: 'Kargo Hizmeti',

        description: 'Kargo ve teslimat hizmeti',

        type: 'service',

        unit: 'piece',

        purchasePrice: 0,

        salePrice: 250,

        currency: 'TRY',

        vatRate: 20,

        trackStock: false,

        stockQuantity: null,

        criticalStock: null,

        isActive: true,

        createdAt: '2026-01-01T09:00:00.000Z',

        updatedAt: '2026-01-01T09:00:00.000Z',
    },
];

const defaultState: ProductState = {
    items: defaultProducts,

    movements: [],
};

function loadProductState(): ProductState {
    if (typeof window === 'undefined') {
        return defaultState;
    }

    try {
        const raw =
            window.localStorage.getItem(
                PRODUCT_STORAGE_KEY,
            );

        if (!raw) {
            return defaultState;
        }

        const parsed =
            JSON.parse(raw) as Partial<ProductState>;

        if (!Array.isArray(parsed.items)) {
            return defaultState;
        }

        return {
            items: parsed.items,

            movements: Array.isArray(parsed.movements)
                ? parsed.movements
                : [],
        };
    } catch {
        return defaultState;
    }
}

const initialState: ProductState =
    loadProductState();

const productSlice = createSlice({
    name: 'products',

    initialState,

    reducers: {
        addProduct(
            state,
            action: PayloadAction<Product>,
        ) {
            state.items.unshift(action.payload);
        },

        updateProduct(
            state,
            action: PayloadAction<Product>,
        ) {
            const index =
                state.items.findIndex(
                    (product) =>
                        product.id === action.payload.id,
                );

            if (index === -1) {
                return;
            }

            state.items[index] =
                action.payload;
        },

        deleteProduct(
            state,
            action: PayloadAction<string>,
        ) {
            state.items =
                state.items.filter(
                    (product) =>
                        product.id !== action.payload,
                );

            state.movements =
                state.movements.filter(
                    (movement) =>
                        movement.productId !== action.payload,
                );
        },

        adjustProductStock(
            state,
            action: PayloadAction<{
                productId: string;

                quantity: number;

                description?: string;
            }>,
        ) {
            const product =
                state.items.find(
                    (item) =>
                        item.id ===
                        action.payload.productId,
                );

            if (
                !product ||
                !product.trackStock ||
                product.stockQuantity === null
            ) {
                return;
            }

            product.stockQuantity +=
                action.payload.quantity;

            product.updatedAt =
                new Date().toISOString();

            state.movements.unshift({
                id: crypto.randomUUID(),

                productId: product.id,

                type:
                    action.payload.quantity >= 0
                        ? 'manual-in'
                        : 'manual-out',

                quantity:
                    action.payload.quantity,

                date:
                    new Date().toISOString(),

                description:
                    action.payload.description ||
                    'Manuel stok düzeltme',

                reference: 'MANUEL',
            });
        },
    },

    extraReducers(builder) {
        builder.addCase(
            createInvoice.fulfilled,

            (state, action) => {
                const invoice =
                    action.payload;

                if (
                    invoice.status === 'draft' ||
                    !invoice.items
                ) {
                    return;
                }

                invoice.items.forEach(
                    (invoiceItem) => {
                        if (!invoiceItem.productId) {
                            return;
                        }

                        const product =
                            state.items.find(
                                (item) =>
                                    item.id ===
                                    invoiceItem.productId,
                            );

                        if (
                            !product ||
                            !product.trackStock ||
                            product.stockQuantity === null
                        ) {
                            return;
                        }

                        const quantity =
                            invoice.type === 'purchase'
                                ? invoiceItem.quantity
                                : -invoiceItem.quantity;

                        product.stockQuantity += quantity;

                        product.updatedAt =
                            new Date().toISOString();

                        state.movements.unshift({
                            id: crypto.randomUUID(),

                            productId: product.id,

                            type:
                                invoice.type === 'purchase'
                                    ? 'purchase'
                                    : 'sale',

                            quantity,

                            date:
                                invoice.issueDate ||
                                new Date().toISOString(),

                            description:
                                invoice.type === 'purchase'
                                    ? 'Alış faturası stok girişi'
                                    : 'Satış faturası stok çıkışı',

                            reference:
                                invoice.invoiceNumber,

                            invoiceId: invoice.id,
                        });
                    },
                );
            },
        );
    },
});

export const {
    addProduct,
    updateProduct,
    deleteProduct,
    adjustProductStock,
} = productSlice.actions;

export default productSlice.reducer;