import type {
    InvoiceCurrency,
    InvoiceItemType,
    InvoiceItemUnit,
} from './invoice';

export interface Product {
    id: string;

    code: string;

    barcode: string;

    name: string;

    description: string;

    type: InvoiceItemType;

    unit: InvoiceItemUnit;

    purchasePrice: number;

    salePrice: number;

    currency: InvoiceCurrency;

    vatRate: number;

    trackStock: boolean;

    stockQuantity: number | null;

    criticalStock: number | null;

    isActive: boolean;

    createdAt: string;

    updatedAt: string;
}

export type ProductFormInput = Omit<
    Product,
    'id' | 'createdAt' | 'updatedAt'
>;

export type StockMovementType =
    | 'sale'
    | 'purchase'
    | 'manual-in'
    | 'manual-out'
    | 'adjustment';

export interface ProductStockMovement {
    id: string;

    productId: string;

    type: StockMovementType;

    quantity: number;

    date: string;

    description: string;

    reference: string;

    invoiceId?: number;
}