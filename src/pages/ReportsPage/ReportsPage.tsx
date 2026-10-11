import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import type {
    InvoiceCurrency,
} from '../../models/invoice';

import {
    useAppDispatch,
    useAppSelector,
} from '../../store/hooks';

import {
    fetchInvoices,
} from '../../store/slices/invoiceSlice';

import styles from '../../styles/ManagementPage.module.scss';

type CurrencyFilter =
    | 'all'
    | InvoiceCurrency;

const currencies:
    InvoiceCurrency[] = [
        'TRY',
        'USD',
        'EUR',
    ];

function moneyMap() {
    return {
        TRY: 0,
        USD: 0,
        EUR: 0,
    } satisfies Record<
        InvoiceCurrency,
        number
    >;
}

function formatMoney(
    amount: number,
    currency: InvoiceCurrency,
) {
    return new Intl.NumberFormat(
        'tr-TR',
        {
            style: 'currency',
            currency,
        },
    ).format(amount);
}

function firstDayOfMonth() {
    const date =
        new Date();

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1,
    ).padStart(2, '0')}-01`;
}

function today() {
    return new Date()
        .toISOString()
        .slice(0, 10);
}

export default function ReportsPage() {
    const dispatch =
        useAppDispatch();

    const invoices =
        useAppSelector(
            (state) =>
                state.invoices.items,
        );

    const requestStatus =
        useAppSelector(
            (state) =>
                state.invoices.requestStatus,
        );

    const movements =
        useAppSelector(
            (state) =>
                state.products.movements,
        );

    const [dateFrom, setDateFrom] =
        useState(firstDayOfMonth());

    const [dateTo, setDateTo] =
        useState(today());

    const [currency, setCurrency] =
        useState<CurrencyFilter>('all');

    useEffect(() => {
        document.title =
            'Raporlar | PreAccounting';

        if (
            requestStatus === 'idle'
        ) {
            void dispatch(
                fetchInvoices(),
            );
        }
    }, [
        dispatch,
        requestStatus,
    ]);

    const report =
        useMemo(() => {
            const filtered =
                invoices.filter(
                    (invoice) => {
                        if (
                            invoice.status ===
                            'draft'
                        ) {
                            return false;
                        }

                        if (
                            dateFrom &&
                            invoice.issueDate <
                            dateFrom
                        ) {
                            return false;
                        }

                        if (
                            dateTo &&
                            invoice.issueDate >
                            dateTo
                        ) {
                            return false;
                        }

                        const invoiceCurrency =
                            invoice.document
                                ?.currency ??
                            'TRY';

                        if (
                            currency !== 'all' &&
                            invoiceCurrency !==
                            currency
                        ) {
                            return false;
                        }

                        return true;
                    },
                );

            const sales =
                moneyMap();

            const purchases =
                moneyMap();

            const vat =
                moneyMap();

            const collected =
                moneyMap();

            const open =
                moneyMap();

            const overdueInvoices =
                [];

            const todayValue =
                today();

            const productMap =
                new Map<
                    string,
                    {
                        name: string;

                        unit: string;

                        quantity: number;

                        currency:
                        InvoiceCurrency;

                        revenue: number;
                    }
                >();

            filtered.forEach(
                (invoice) => {
                    const invoiceCurrency =
                        invoice.document
                            ?.currency ??
                        'TRY';

                    const total =
                        invoice.totals
                            ?.grandTotal ??
                        invoice.amount;

                    const payment =
                        invoice.payment
                            ?.collectedAmount ??
                        0;

                    if (
                        invoice.type ===
                        'sale'
                    ) {
                        sales[
                            invoiceCurrency
                        ] += total;

                        collected[
                            invoiceCurrency
                        ] += payment;

                        open[
                            invoiceCurrency
                        ] += Math.max(
                            0,
                            total - payment,
                        );

                        if (
                            total - payment >
                            0.005 &&
                            invoice.dueDate <
                            todayValue
                        ) {
                            overdueInvoices.push(
                                invoice,
                            );
                        }
                    } else {
                        purchases[
                            invoiceCurrency
                        ] += total;
                    }

                    vat[
                        invoiceCurrency
                    ] +=
                        invoice.totals
                            ?.totalVat ??
                        0;

                    if (
                        invoice.type ===
                        'sale' &&
                        invoice.items
                    ) {
                        invoice.items.forEach(
                            (item) => {
                                const key =
                                    `${item.productId || item.productName}-${item.currency}-${item.unit}`;

                                const existing =
                                    productMap.get(
                                        key,
                                    );

                                if (existing) {
                                    existing.quantity +=
                                        item.quantity;

                                    existing.revenue +=
                                        item.lineTotal;

                                    return;
                                }

                                productMap.set(
                                    key,
                                    {
                                        name:
                                            item.productName ||
                                            item.description ||
                                            'Ürün',

                                        unit:
                                            item.unit,

                                        quantity:
                                            item.quantity,

                                        currency:
                                            item.currency,

                                        revenue:
                                            item.lineTotal,
                                    },
                                );
                            },
                        );
                    }
                },
            );

            const topProducts =
                Array.from(
                    productMap.values(),
                )
                    .sort(
                        (a, b) =>
                            b.quantity -
                            a.quantity,
                    )
                    .slice(0, 10);

            return {
                filtered,

                sales,

                purchases,

                vat,

                collected,

                open,

                overdueInvoices,

                topProducts,
            };
        }, [
            currency,
            dateFrom,
            dateTo,
            invoices,
        ]);

    return (
        <div className={styles.page}>
            <main className={styles.container}>
                <section className={styles.pageHeader}>
                    <div>
                        <span className={styles.eyebrow}>
                            ANALİZ
                        </span>

                        <h1>
                            Raporlar
                        </h1>

                        <p>
                            Satış, KDV, cari,
                            tahsilat ve stok
                            hareketlerinizi analiz
                            edin.
                        </p>
                    </div>
                </section>

                <section className={styles.panel}>
                    <div className={styles.toolbar}>
                        <label className={styles.field}>
                            <span>Başlangıç</span>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) =>
                                    setDateFrom(
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label className={styles.field}>
                            <span>Bitiş</span>

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) =>
                                    setDateTo(
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <label className={styles.field}>
                            <span>
                                Para Birimi
                            </span>

                            <select
                                value={currency}
                                onChange={(event) =>
                                    setCurrency(
                                        event.target
                                            .value as CurrencyFilter,
                                    )
                                }
                            >
                                <option value="all">
                                    Tüm Para Birimleri
                                </option>

                                <option value="TRY">
                                    TRY
                                </option>

                                <option value="USD">
                                    USD
                                </option>

                                <option value="EUR">
                                    EUR
                                </option>
                            </select>
                        </label>
                    </div>
                </section>

                <section
                    className={styles.summaryGrid}
                    style={{
                        marginTop: 14,
                    }}
                >
                    {[
                        [
                            'Satış',
                            report.sales,
                        ],

                        [
                            'Tahsilat',
                            report.collected,
                        ],

                        [
                            'Açık Alacak',
                            report.open,
                        ],

                        [
                            'KDV',
                            report.vat,
                        ],
                    ].map(
                        ([label, values]) => (
                            <div
                                key={label as string}
                                className={
                                    styles.summaryCard
                                }
                            >
                                <span>
                                    {label as string}
                                </span>

                                <div
                                    className={
                                        styles.moneyStack
                                    }
                                >
                                    {currencies
                                        .filter(
                                            (item) =>
                                                currency ===
                                                'all' ||
                                                currency ===
                                                item,
                                        )
                                        .map(
                                            (item) => (
                                                <strong
                                                    key={item}
                                                >
                                                    {formatMoney(
                                                        (
                                                            values as Record<
                                                                InvoiceCurrency,
                                                                number
                                                            >
                                                        )[item],
                                                        item,
                                                    )}
                                                </strong>
                                            ),
                                        )}
                                </div>
                            </div>
                        ),
                    )}
                </section>

                <div className={styles.grid2}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <strong>
                                    Vadesi Geçenler
                                </strong>

                                <span>
                                    Tahsil edilmemiş satış
                                    faturaları
                                </span>
                            </div>

                            <span>
                                {
                                    report
                                        .overdueInvoices
                                        .length
                                }{' '}
                                kayıt
                            </span>
                        </div>

                        {report.overdueInvoices
                            .length > 0 ? (
                            <div
                                className={
                                    styles.tableWrapper
                                }
                            >
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Fatura</th>

                                            <th>Cari</th>

                                            <th>Vade</th>

                                            <th>Kalan</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {report.overdueInvoices.map(
                                            (invoice) => {
                                                const invoiceCurrency =
                                                    invoice
                                                        .document
                                                        ?.currency ??
                                                    'TRY';

                                                const total =
                                                    invoice
                                                        .totals
                                                        ?.grandTotal ??
                                                    invoice.amount;

                                                const remaining =
                                                    Math.max(
                                                        0,
                                                        total -
                                                        (invoice
                                                            .payment
                                                            ?.collectedAmount ??
                                                            0),
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
                                                            {
                                                                invoice.customerName
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                invoice.dueDate
                                                            }
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {formatMoney(
                                                                    remaining,
                                                                    invoiceCurrency,
                                                                )}
                                                            </strong>
                                                        </td>
                                                    </tr>
                                                );
                                            },
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={styles.empty}>
                                Seçilen dönemde gecikmiş
                                fatura yok.
                            </div>
                        )}
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <strong>
                                    En Çok Satılanlar
                                </strong>

                                <span>
                                    Satış miktarına göre
                                </span>
                            </div>
                        </div>

                        {report.topProducts.length >
                            0 ? (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Ürün</th>

                                            <th>Miktar</th>

                                            <th>Satış</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {report.topProducts.map(
                                            (
                                                product,
                                                index,
                                            ) => (
                                                <tr
                                                    key={`${product.name}-${index}`}
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                product.name
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            product.quantity
                                                        }{' '}
                                                        {product.unit}
                                                    </td>

                                                    <td>
                                                        {formatMoney(
                                                            product.revenue,
                                                            product.currency,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={styles.empty}>
                                Ürün satış verisi yok.
                            </div>
                        )}
                    </section>
                </div>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <strong>
                                Son Stok Hareketleri
                            </strong>

                            <span>
                                Fatura ve manuel stok
                                işlemleri
                            </span>
                        </div>
                    </div>

                    {movements.length > 0 ? (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Tarih</th>

                                        <th>Referans</th>

                                        <th>Açıklama</th>

                                        <th>Miktar</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {[...movements]
                                        .sort(
                                            (a, b) =>
                                                new Date(
                                                    b.date,
                                                ).getTime() -
                                                new Date(
                                                    a.date,
                                                ).getTime(),
                                        )
                                        .slice(0, 15)
                                        .map(
                                            (movement) => (
                                                <tr
                                                    key={
                                                        movement.id
                                                    }
                                                >
                                                    <td>
                                                        {
                                                            movement.date
                                                        }
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
                                                        <span
                                                            className={
                                                                movement.quantity >=
                                                                    0
                                                                    ? styles.successBadge
                                                                    : styles.dangerBadge
                                                            }
                                                        >
                                                            {movement.quantity >
                                                                0
                                                                ? '+'
                                                                : ''}

                                                            {
                                                                movement.quantity
                                                            }
                                                        </span>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            Stok hareketi bulunmuyor.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}