import {
    useMemo,
    useState,
} from 'react';

import type {
    Invoice,
} from '../../../../models/invoice';

import type {
    Product,
    ProductStockMovement,
} from '../../../../models/product';

import styles from './ProductDetailModal.module.scss';

interface ProductDetailModalProps {
    product: Product | null;

    invoices: Invoice[];

    movements: ProductStockMovement[];

    onClose: () => void;

    onEdit: (
        product: Product,
    ) => void;

    onDelete: (
        product: Product,
    ) => void;

    onAdjustStock: (
        product: Product,
    ) => void;
}

type Tab =
    | 'info'
    | 'movements'
    | 'invoices';

function formatMoney(
    value: number,
    currency: Product['currency'],
) {
    return new Intl.NumberFormat(
        'tr-TR',
        {
            style: 'currency',

            currency,
        },
    ).format(value);
}

function formatDate(
    value: string,
) {
    const date =
        new Date(value);

    if (
        Number.isNaN(date.getTime())
    ) {
        return value;
    }

    return new Intl.DateTimeFormat(
        'tr-TR',
    ).format(date);
}

export function ProductDetailModal({
    product,

    invoices,

    movements,

    onClose,

    onEdit,

    onDelete,

    onAdjustStock,
}: ProductDetailModalProps) {
    const [activeTab, setActiveTab] =
        useState<Tab>('info');

    const productInvoices =
        useMemo(() => {
            if (!product) {
                return [];
            }

            return invoices.filter(
                (invoice) =>
                    invoice.items?.some(
                        (item) =>
                            item.productId ===
                            product.id,
                    ),
            );
        }, [invoices, product]);

    const productMovements =
        useMemo(() => {
            if (!product) {
                return [];
            }

            return movements
                .filter(
                    (movement) =>
                        movement.productId ===
                        product.id,
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.date,
                        ).getTime() -
                        new Date(
                            a.date,
                        ).getTime(),
                );
        }, [movements, product]);

    if (!product) {
        return null;
    }

    const isCritical =
        product.trackStock &&
        product.stockQuantity !== null &&
        product.criticalStock !== null &&
        product.stockQuantity <=
        product.criticalStock;

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={styles.modal}
            >
                <header
                    className={styles.header}
                >
                    <div>
                        <span>
                            ÜRÜN DETAYI
                        </span>

                        <h2>
                            {product.name}
                        </h2>

                        <p>
                            {product.code} •{' '}
                            {product.type ===
                                'product'
                                ? 'Ürün'
                                : 'Hizmet'}
                        </p>
                    </div>

                    <div
                        className={
                            styles.actions
                        }
                    >
                        {product.trackStock ? (
                            <button
                                type="button"
                                onClick={() =>
                                    onAdjustStock(
                                        product,
                                    )
                                }
                            >
                                Stok Düzelt
                            </button>
                        ) : null}

                        <button
                            type="button"
                            onClick={() =>
                                onEdit(product)
                            }
                        >
                            Düzenle
                        </button>

                        <button
                            type="button"
                            className={
                                styles.deleteButton
                            }
                            onClick={() =>
                                onDelete(product)
                            }
                        >
                            Sil
                        </button>

                        <button
                            type="button"
                            className={
                                styles.closeButton
                            }
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>
                </header>

                <section
                    className={
                        styles.summaryGrid
                    }
                >
                    <div
                        className={
                            styles.summaryCard
                        }
                    >
                        <span>Durum</span>

                        <strong>
                            {product.isActive
                                ? 'Aktif'
                                : 'Pasif'}
                        </strong>
                    </div>

                    <div
                        className={
                            styles.summaryCard
                        }
                    >
                        <span>Stok</span>

                        <strong
                            className={
                                isCritical
                                    ? styles.criticalText
                                    : ''
                            }
                        >
                            {product.trackStock
                                ? `${product.stockQuantity ?? 0}`
                                : 'Takip Yok'}
                        </strong>
                    </div>

                    <div
                        className={
                            styles.summaryCard
                        }
                    >
                        <span>
                            Satış Fiyatı
                        </span>

                        <strong>
                            {formatMoney(
                                product.salePrice,
                                product.currency,
                            )}
                        </strong>
                    </div>

                    <div
                        className={
                            styles.summaryCard
                        }
                    >
                        <span>KDV</span>

                        <strong>
                            %{product.vatRate}
                        </strong>
                    </div>
                </section>

                <nav
                    className={styles.tabs}
                >
                    <button
                        type="button"
                        className={
                            activeTab === 'info'
                                ? styles.activeTab
                                : ''
                        }
                        onClick={() =>
                            setActiveTab('info')
                        }
                    >
                        Ürün Bilgileri
                    </button>

                    <button
                        type="button"
                        className={
                            activeTab ===
                                'movements'
                                ? styles.activeTab
                                : ''
                        }
                        onClick={() =>
                            setActiveTab(
                                'movements',
                            )
                        }
                    >
                        Stok Hareketleri
                    </button>

                    <button
                        type="button"
                        className={
                            activeTab ===
                                'invoices'
                                ? styles.activeTab
                                : ''
                        }
                        onClick={() =>
                            setActiveTab(
                                'invoices',
                            )
                        }
                    >
                        Faturalar
                    </button>
                </nav>

                <div
                    className={styles.body}
                >
                    {activeTab === 'info' ? (
                        <div
                            className={
                                styles.infoGrid
                            }
                        >
                            <div>
                                <span>Kod</span>

                                <strong>
                                    {product.code}
                                </strong>
                            </div>

                            <div>
                                <span>Barkod</span>

                                <strong>
                                    {product.barcode ||
                                        '—'}
                                </strong>
                            </div>

                            <div>
                                <span>Tür</span>

                                <strong>
                                    {product.type ===
                                        'product'
                                        ? 'Ürün'
                                        : 'Hizmet'}
                                </strong>
                            </div>

                            <div>
                                <span>Birim</span>

                                <strong>
                                    {product.unit}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Alış Fiyatı
                                </span>

                                <strong>
                                    {formatMoney(
                                        product.purchasePrice,
                                        product.currency,
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Satış Fiyatı
                                </span>

                                <strong>
                                    {formatMoney(
                                        product.salePrice,
                                        product.currency,
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Kritik Stok
                                </span>

                                <strong>
                                    {product.trackStock
                                        ? product.criticalStock ??
                                        0
                                        : '—'}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Para Birimi
                                </span>

                                <strong>
                                    {product.currency}
                                </strong>
                            </div>

                            <div
                                className={
                                    styles.fullInfo
                                }
                            >
                                <span>
                                    Açıklama
                                </span>

                                <strong>
                                    {product.description ||
                                        '—'}
                                </strong>
                            </div>
                        </div>
                    ) : null}

                    {activeTab ===
                        'movements' ? (
                        <div
                            className={
                                styles.tableWrapper
                            }
                        >
                            <table
                                className={styles.table}
                            >
                                <thead>
                                    <tr>
                                        <th>Tarih</th>

                                        <th>İşlem</th>

                                        <th>Referans</th>

                                        <th>Açıklama</th>

                                        <th>Miktar</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {productMovements.length >
                                        0 ? (
                                        productMovements.map(
                                            (movement) => (
                                                <tr
                                                    key={
                                                        movement.id
                                                    }
                                                >
                                                    <td>
                                                        {formatDate(
                                                            movement.date,
                                                        )}
                                                    </td>

                                                    <td>
                                                        {movement.quantity >=
                                                            0
                                                            ? 'Giriş'
                                                            : 'Çıkış'}
                                                    </td>

                                                    <td>
                                                        {
                                                            movement.reference
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            movement.description
                                                        }
                                                    </td>

                                                    <td>
                                                        <strong
                                                            className={
                                                                movement.quantity >=
                                                                    0
                                                                    ? styles.stockIn
                                                                    : styles.stockOut
                                                            }
                                                        >
                                                            {movement.quantity >
                                                                0
                                                                ? '+'
                                                                : ''}

                                                            {
                                                                movement.quantity
                                                            }
                                                        </strong>
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className={
                                                    styles.emptyCell
                                                }
                                            >
                                                Stok hareketi
                                                bulunmuyor.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : null}

                    {activeTab ===
                        'invoices' ? (
                        <div
                            className={
                                styles.tableWrapper
                            }
                        >
                            <table
                                className={styles.table}
                            >
                                <thead>
                                    <tr>
                                        <th>Fatura No</th>

                                        <th>Tarih</th>

                                        <th>Tip</th>

                                        <th>Miktar</th>

                                        <th>
                                            Birim Fiyat
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {productInvoices.length >
                                        0 ? (
                                        productInvoices.map(
                                            (invoice) => {
                                                const item =
                                                    invoice.items?.find(
                                                        (
                                                            invoiceItem,
                                                        ) =>
                                                            invoiceItem.productId ===
                                                            product.id,
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            invoice.id
                                                        }
                                                    >
                                                        <td>
                                                            {
                                                                invoice.invoiceNumber
                                                            }
                                                        </td>

                                                        <td>
                                                            {formatDate(
                                                                invoice.issueDate,
                                                            )}
                                                        </td>

                                                        <td>
                                                            {invoice.type ===
                                                                'sale'
                                                                ? 'Satış'
                                                                : 'Alış'}
                                                        </td>

                                                        <td>
                                                            {item?.quantity ??
                                                                0}
                                                        </td>

                                                        <td>
                                                            {item
                                                                ? formatMoney(
                                                                    item.unitPrice,
                                                                    item.currency,
                                                                )
                                                                : '—'}
                                                        </td>
                                                    </tr>
                                                );
                                            },
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className={
                                                    styles.emptyCell
                                                }
                                            >
                                                Bu ürün henüz bir
                                                faturada
                                                kullanılmamış.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}