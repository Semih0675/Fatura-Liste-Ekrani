import {
    useEffect,
    useMemo,
} from 'react';

import {
    useNavigate,
} from 'react-router-dom';

import type {
    Invoice,
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

const currencies:
    InvoiceCurrency[] = [
        'TRY',
        'USD',
        'EUR',
    ];

function createMoneyMap() {
    return {
        TRY: 0,
        USD: 0,
        EUR: 0,
    } satisfies Record<
        InvoiceCurrency,
        number
    >;
}

function getAmount(
    invoice: Invoice,
) {
    return (
        invoice.totals?.grandTotal ??
        invoice.amount ??
        0
    );
}

function getCurrency(
    invoice: Invoice,
): InvoiceCurrency {
    return (
        invoice.document?.currency ??
        'TRY'
    );
}

function formatMoney(
    value: number,
    currency: InvoiceCurrency,
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

export default function DashboardPage() {
    const navigate =
        useNavigate();

    const dispatch =
        useAppDispatch();

    const invoices =
        useAppSelector(
            (state) =>
                state.invoices.items,
        );

    const invoiceStatus =
        useAppSelector(
            (state) =>
                state.invoices.requestStatus,
        );

    const customers =
        useAppSelector(
            (state) =>
                state.customers.items,
        );

    const products =
        useAppSelector(
            (state) =>
                state.products.items,
        );

    useEffect(() => {
        document.title =
            'Dashboard | PreAccounting';

        if (
            invoiceStatus === 'idle'
        ) {
            void dispatch(
                fetchInvoices(),
            );
        }
    }, [
        dispatch,
        invoiceStatus,
    ]);

    const dashboard =
        useMemo(() => {
            const sales =
                createMoneyMap();

            const collected =
                createMoneyMap();

            const open =
                createMoneyMap();

            const overdue =
                createMoneyMap();

            const now =
                new Date();

            const monthKey =
                `${now.getFullYear()}-${String(
                    now.getMonth() + 1,
                ).padStart(2, '0')}`;

            const today =
                new Date()
                    .toISOString()
                    .slice(0, 10);

            invoices.forEach(
                (invoice) => {
                    if (
                        invoice.status ===
                        'draft' ||
                        invoice.type !== 'sale'
                    ) {
                        return;
                    }

                    const currency =
                        getCurrency(invoice);

                    const amount =
                        getAmount(invoice);

                    const payment =
                        invoice.payment
                            ?.collectedAmount ??
                        0;

                    const remaining =
                        Math.max(
                            0,
                            amount - payment,
                        );

                    if (
                        invoice.issueDate.startsWith(
                            monthKey,
                        )
                    ) {
                        sales[currency] +=
                            amount;

                        collected[currency] +=
                            payment;
                    }

                    open[currency] +=
                        remaining;

                    if (
                        remaining > 0.005 &&
                        invoice.dueDate &&
                        invoice.dueDate < today
                    ) {
                        overdue[currency] +=
                            remaining;
                    }
                },
            );

            const criticalProducts =
                products.filter(
                    (product) =>
                        product.isActive &&
                        product.trackStock &&
                        product.stockQuantity !==
                        null &&
                        product.criticalStock !==
                        null &&
                        product.stockQuantity <=
                        product.criticalStock,
                );

            const latestInvoices = [
                ...invoices,
            ]
                .filter(
                    (invoice) =>
                        invoice.status !==
                        'draft',
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.issueDate,
                        ).getTime() -
                        new Date(
                            a.issueDate,
                        ).getTime(),
                )
                .slice(0, 6);

            const upcoming =
                invoices
                    .filter(
                        (invoice) => {
                            if (
                                invoice.status ===
                                'draft' ||
                                invoice.status ===
                                'paid' ||
                                invoice.type !==
                                'sale'
                            ) {
                                return false;
                            }

                            const due =
                                new Date(
                                    invoice.dueDate,
                                ).getTime();

                            if (
                                Number.isNaN(due)
                            ) {
                                return false;
                            }

                            const difference =
                                due -
                                new Date(
                                    today,
                                ).getTime();

                            return (
                                difference >= 0 &&
                                difference <=
                                7 *
                                24 *
                                60 *
                                60 *
                                1000
                            );
                        },
                    )
                    .sort(
                        (a, b) =>
                            a.dueDate.localeCompare(
                                b.dueDate,
                            ),
                    )
                    .slice(0, 6);

            return {
                sales,

                collected,

                open,

                overdue,

                criticalProducts,

                latestInvoices,

                upcoming,
            };
        }, [
            invoices,
            products,
        ]);

    return (
        <div className={styles.page}>
            <main className={styles.container}>
                <section className={styles.pageHeader}>
                    <div>
                        <span className={styles.eyebrow}>
                            YÖNETİM PANELİ
                        </span>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Satış, tahsilat, cari
                            ve stok durumunuzu tek
                            ekrandan takip edin.
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={
                                styles.secondaryButton
                            }
                            onClick={() =>
                                navigate('/payments')
                            }
                        >
                            Tahsilat Gir
                        </button>

                        <button
                            type="button"
                            className={
                                styles.primaryButton
                            }
                            onClick={() =>
                                navigate(
                                    '/invoices/new',
                                )
                            }
                        >
                            + Yeni Fatura
                        </button>
                    </div>
                </section>

                <section className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <span>
                            Bu Ay Satış
                        </span>

                        <div className={styles.moneyStack}>
                            {currencies.map(
                                (currency) => (
                                    <strong key={currency}>
                                        {formatMoney(
                                            dashboard.sales[
                                            currency
                                            ],
                                            currency,
                                        )}
                                    </strong>
                                ),
                            )}
                        </div>

                        <small>
                            Satış faturaları
                        </small>
                    </div>

                    <div className={styles.summaryCard}>
                        <span>
                            Bu Ay Tahsilat
                        </span>

                        <div className={styles.moneyStack}>
                            {currencies.map(
                                (currency) => (
                                    <strong key={currency}>
                                        {formatMoney(
                                            dashboard
                                                .collected[
                                            currency
                                            ],
                                            currency,
                                        )}
                                    </strong>
                                ),
                            )}
                        </div>

                        <small>
                            Faturalardaki
                            tahsilatlar
                        </small>
                    </div>

                    <div className={styles.summaryCard}>
                        <span>
                            Açık Alacak
                        </span>

                        <div className={styles.moneyStack}>
                            {currencies.map(
                                (currency) => (
                                    <strong key={currency}>
                                        {formatMoney(
                                            dashboard.open[
                                            currency
                                            ],
                                            currency,
                                        )}
                                    </strong>
                                ),
                            )}
                        </div>

                        <small>
                            Henüz tahsil edilmemiş
                        </small>
                    </div>

                    <div className={styles.summaryCard}>
                        <span>
                            Gecikmiş Alacak
                        </span>

                        <div className={styles.moneyStack}>
                            {currencies.map(
                                (currency) => (
                                    <strong key={currency}>
                                        {formatMoney(
                                            dashboard.overdue[
                                            currency
                                            ],
                                            currency,
                                        )}
                                    </strong>
                                ),
                            )}
                        </div>

                        <small>
                            Vadesi geçmiş
                        </small>
                    </div>
                </section>

                <section className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <span>
                            Toplam Cari
                        </span>

                        <strong>
                            {customers.length}
                        </strong>

                        <small>
                            Müşteri ve tedarikçi
                        </small>
                    </div>

                    <div className={styles.summaryCard}>
                        <span>
                            Aktif Ürün
                        </span>

                        <strong>
                            {
                                products.filter(
                                    (product) =>
                                        product.isActive,
                                ).length
                            }
                        </strong>

                        <small>
                            Kullanıma açık kart
                        </small>
                    </div>

                    <div className={styles.summaryCard}>
                        <span>
                            Kritik Stok
                        </span>

                        <strong>
                            {
                                dashboard
                                    .criticalProducts
                                    .length
                            }
                        </strong>

                        <small>
                            Müdahale gereken ürün
                        </small>
                    </div>

                    <div className={styles.summaryCard}>
                        <span>
                            Toplam Fatura
                        </span>

                        <strong>
                            {
                                invoices.filter(
                                    (invoice) =>
                                        invoice.status !==
                                        'draft',
                                ).length
                            }
                        </strong>

                        <small>
                            Kesinleşmiş kayıt
                        </small>
                    </div>
                </section>

                <div className={styles.grid2}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <strong>
                                    Son Faturalar
                                </strong>

                                <span>
                                    En yeni işlemler
                                </span>
                            </div>
                        </div>

                        {dashboard.latestInvoices
                            .length > 0 ? (
                            <div className={styles.list}>
                                {dashboard.latestInvoices.map(
                                    (invoice) => (
                                        <div
                                            key={invoice.id}
                                            className={
                                                styles.listRow
                                            }
                                        >
                                            <div>
                                                <strong>
                                                    {
                                                        invoice.invoiceNumber
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        invoice.customerName
                                                    }{' '}
                                                    •{' '}
                                                    {formatDate(
                                                        invoice.issueDate,
                                                    )}
                                                </span>
                                            </div>

                                            <strong
                                                className={
                                                    styles.rightValue
                                                }
                                            >
                                                {formatMoney(
                                                    getAmount(
                                                        invoice,
                                                    ),
                                                    getCurrency(
                                                        invoice,
                                                    ),
                                                )}
                                            </strong>
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : (
                            <div className={styles.empty}>
                                Henüz fatura yok.
                            </div>
                        )}
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <strong>
                                    Yaklaşan Vadeler
                                </strong>

                                <span>
                                    Önümüzdeki 7 gün
                                </span>
                            </div>
                        </div>

                        {dashboard.upcoming.length >
                            0 ? (
                            <div className={styles.list}>
                                {dashboard.upcoming.map(
                                    (invoice) => (
                                        <div
                                            key={invoice.id}
                                            className={
                                                styles.listRow
                                            }
                                        >
                                            <div>
                                                <strong>
                                                    {
                                                        invoice.customerName
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        invoice.invoiceNumber
                                                    }{' '}
                                                    • Vade{' '}
                                                    {formatDate(
                                                        invoice.dueDate,
                                                    )}
                                                </span>
                                            </div>

                                            <strong
                                                className={
                                                    styles.rightValue
                                                }
                                            >
                                                {formatMoney(
                                                    Math.max(
                                                        0,
                                                        getAmount(
                                                            invoice,
                                                        ) -
                                                        (invoice
                                                            .payment
                                                            ?.collectedAmount ??
                                                            0),
                                                    ),
                                                    getCurrency(
                                                        invoice,
                                                    ),
                                                )}
                                            </strong>
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : (
                            <div className={styles.empty}>
                                Yaklaşan vade yok.
                            </div>
                        )}
                    </section>
                </div>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <strong>
                                Kritik Stoklar
                            </strong>

                            <span>
                                Kritik stok seviyesine
                                ulaşan ürünler
                            </span>
                        </div>

                        <button
                            type="button"
                            className={
                                styles.secondaryButton
                            }
                            onClick={() =>
                                navigate('/products')
                            }
                        >
                            Ürün & Stok
                        </button>
                    </div>

                    {dashboard.criticalProducts
                        .length > 0 ? (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Ürün</th>

                                        <th>Kod</th>

                                        <th>Mevcut</th>

                                        <th>Kritik</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dashboard.criticalProducts.map(
                                        (product) => (
                                            <tr key={product.id}>
                                                <td>
                                                    <strong>
                                                        {product.name}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {product.code}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            styles.dangerBadge
                                                        }
                                                    >
                                                        {
                                                            product.stockQuantity
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        product.criticalStock
                                                    }
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            Kritik stokta ürün yok.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}