import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react';

import type {
    Invoice,
    InvoiceCurrency,
    InvoicePaymentMethod,
    InvoiceStatus,
} from '../../models/invoice';

import {
    useAppDispatch,
    useAppSelector,
} from '../../store/hooks';

import {
    addPayment,
} from '../../store/slices/paymentSlice';

import {
    fetchInvoices,
    updateInvoice,
} from '../../store/slices/invoiceSlice';

import styles from '../../styles/ManagementPage.module.scss';

const paymentLabels:
    Record<
        InvoicePaymentMethod,
        string
    > = {
    cash: 'Nakit',

    bankTransfer: 'EFT / Havale',

    creditCard: 'Kredi Kartı',

    other: 'Diğer',
};

function today() {
    return new Date()
        .toISOString()
        .slice(0, 10);
}

function getAmount(
    invoice: Invoice,
) {
    return (
        invoice.totals?.grandTotal ??
        invoice.amount
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

export default function PaymentListPage() {
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

    const payments =
        useAppSelector(
            (state) =>
                state.payments.records,
        );

    const companySettings =
        useAppSelector(
            (state) =>
                state.companySettings.value,
        );

    const [customerId, setCustomerId] =
        useState('');

    const [invoiceId, setInvoiceId] =
        useState('');

    const [date, setDate] =
        useState(today());

    const [method, setMethod] =
        useState<InvoicePaymentMethod>(
            'bankTransfer',
        );

    const [amount, setAmount] =
        useState('');

    const [note, setNote] =
        useState('');

    const [error, setError] =
        useState<string | null>(null);

    const [isSaving, setIsSaving] =
        useState(false);

    useEffect(() => {
        document.title =
            'Tahsilatlar | PreAccounting';

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

    const selectedCustomer =
        customers.find(
            (customer) =>
                customer.id === customerId,
        );

    const availableInvoices =
        useMemo(() => {
            if (!selectedCustomer) {
                return [];
            }

            return invoices.filter(
                (invoice) => {
                    if (
                        invoice.status ===
                        'draft'
                    ) {
                        return false;
                    }

                    const customerMatches =
                        invoice.customer?.id ===
                        selectedCustomer.id ||
                        invoice.customerName ===
                        selectedCustomer.name;

                    if (!customerMatches) {
                        return false;
                    }

                    const remaining =
                        getAmount(invoice) -
                        (invoice.payment
                            ?.collectedAmount ??
                            0);

                    return remaining > 0.005;
                },
            );
        }, [
            invoices,
            selectedCustomer,
        ]);

    const selectedInvoice =
        availableInvoices.find(
            (invoice) =>
                String(invoice.id) ===
                invoiceId,
        );

    const remaining =
        selectedInvoice
            ? Math.max(
                0,
                getAmount(
                    selectedInvoice,
                ) -
                (selectedInvoice.payment
                    ?.collectedAmount ??
                    0),
            )
            : 0;

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

        if (
            !selectedCustomer ||
            !selectedInvoice
        ) {
            setError(
                'Cari ve fatura seçiniz.',
            );

            return;
        }

        const numericAmount =
            Number(
                amount.replace(',', '.'),
            );

        if (
            !Number.isFinite(
                numericAmount,
            ) ||
            numericAmount <= 0
        ) {
            setError(
                'Geçerli bir tahsilat tutarı giriniz.',
            );

            return;
        }

        if (
            numericAmount >
            remaining + 0.005
        ) {
            setError(
                'Tahsilat tutarı faturanın kalan tutarından büyük olamaz.',
            );

            return;
        }

        const previousCollected =
            selectedInvoice.payment
                ?.collectedAmount ??
            0;

        const newCollected =
            previousCollected +
            numericAmount;

        const total =
            getAmount(
                selectedInvoice,
            );

        const newStatus:
            InvoiceStatus =
            newCollected >=
                total - 0.005
                ? 'paid'
                : selectedInvoice.dueDate <
                    today()
                    ? 'overdue'
                    : 'pending';

        const direction =
            selectedInvoice.type ===
                'purchase'
                ? 'payment'
                : 'collection';

        setIsSaving(true);

        try {
            await dispatch(
                updateInvoice({
                    ...selectedInvoice,

                    status: newStatus,

                    payment: {
                        method,

                        accountName:
                            selectedInvoice.payment
                                ?.accountName ||
                            companySettings
                                .accountName,

                        bankName:
                            selectedInvoice.payment
                                ?.bankName ||
                            companySettings
                                .bankName,

                        iban:
                            selectedInvoice.payment
                                ?.iban ||
                            companySettings.iban,

                        paymentDescription:
                            note,

                        collectedAmount:
                            newCollected,

                        collectionDate: date,
                    },
                }),
            ).unwrap();

            dispatch(
                addPayment({
                    id:
                        crypto.randomUUID(),

                    direction,

                    customerId:
                        selectedCustomer.id,

                    customerName:
                        selectedCustomer.name,

                    invoiceId:
                        selectedInvoice.id,

                    invoiceNumber:
                        selectedInvoice.invoiceNumber,

                    date,

                    amount:
                        numericAmount,

                    currency:
                        getCurrency(
                            selectedInvoice,
                        ),

                    method,

                    note,

                    createdAt:
                        new Date().toISOString(),
                }),
            );

            setInvoiceId('');

            setAmount('');

            setNote('');
        } catch {
            setError(
                'Tahsilat kaydedilirken bir hata oluştu.',
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className={styles.page}>
            <main className={styles.container}>
                <section className={styles.pageHeader}>
                    <div>
                        <span className={styles.eyebrow}>
                            FİNANS
                        </span>

                        <h1>
                            Tahsilatlar
                        </h1>

                        <p>
                            Faturalara bağlı tahsilat
                            ve ödeme hareketlerini
                            yönetin.
                        </p>
                    </div>
                </section>

                <div className={styles.grid2}>
                    <form
                        className={styles.panel}
                        onSubmit={handleSubmit}
                    >
                        <div className={styles.panelHeader}>
                            <div>
                                <strong>
                                    Yeni Tahsilat
                                </strong>

                                <span>
                                    Cari ve faturaya
                                    bağlı işlem
                                </span>
                            </div>
                        </div>

                        {error ? (
                            <div className={styles.error}>
                                {error}
                            </div>
                        ) : null}

                        <div className={styles.formGrid}>
                            <label className={styles.field}>
                                <span>Cari</span>

                                <select
                                    value={customerId}
                                    onChange={(event) => {
                                        setCustomerId(
                                            event.target.value,
                                        );

                                        setInvoiceId('');
                                    }}
                                >
                                    <option value="">
                                        Cari seçiniz
                                    </option>

                                    {customers.map(
                                        (customer) => (
                                            <option
                                                key={customer.id}
                                                value={customer.id}
                                            >
                                                {customer.name}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </label>

                            <label className={styles.field}>
                                <span>Fatura</span>

                                <select
                                    value={invoiceId}
                                    disabled={!customerId}
                                    onChange={(event) =>
                                        setInvoiceId(
                                            event.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Fatura seçiniz
                                    </option>

                                    {availableInvoices.map(
                                        (invoice) => (
                                            <option
                                                key={invoice.id}
                                                value={invoice.id}
                                            >
                                                {invoice.invoiceNumber} —{' '}
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
                                                )}{' '}
                                                kalan
                                            </option>
                                        ),
                                    )}
                                </select>
                            </label>

                            <label className={styles.field}>
                                <span>Tarih</span>

                                <input
                                    type="date"
                                    value={date}
                                    onChange={(event) =>
                                        setDate(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Yöntem</span>

                                <select
                                    value={method}
                                    onChange={(event) =>
                                        setMethod(
                                            event.target
                                                .value as InvoicePaymentMethod,
                                        )
                                    }
                                >
                                    {Object.entries(
                                        paymentLabels,
                                    ).map(
                                        ([
                                            value,
                                            label,
                                        ]) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </label>

                            <label className={styles.field}>
                                <span>Tutar</span>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <label className={styles.field}>
                                <span>
                                    Kalan Fatura
                                </span>

                                <input
                                    readOnly
                                    value={
                                        selectedInvoice
                                            ? formatMoney(
                                                remaining,
                                                getCurrency(
                                                    selectedInvoice,
                                                ),
                                            )
                                            : '—'
                                    }
                                />
                            </label>

                            <label
                                className={`${styles.field} ${styles.span2}`}
                            >
                                <span>Açıklama</span>

                                <textarea
                                    value={note}
                                    onChange={(event) =>
                                        setNote(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Tahsilat açıklaması..."
                                />
                            </label>
                        </div>

                        <div className={styles.saveBar}>
                            <button
                                type="submit"
                                className={
                                    styles.primaryButton
                                }
                                disabled={isSaving}
                            >
                                {isSaving
                                    ? 'Kaydediliyor...'
                                    : 'Tahsilatı Kaydet'}
                            </button>
                        </div>
                    </form>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <strong>
                                    Tahsilat Bilgisi
                                </strong>

                                <span>
                                    Seçili faturanın
                                    ödeme durumu
                                </span>
                            </div>
                        </div>

                        {selectedInvoice ? (
                            <div className={styles.list}>
                                <div className={styles.listRow}>
                                    <div>
                                        <strong>
                                            Fatura
                                        </strong>

                                        <span>
                                            {
                                                selectedInvoice.invoiceNumber
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.listRow}>
                                    <div>
                                        <strong>
                                            Fatura Tutarı
                                        </strong>
                                    </div>

                                    <strong
                                        className={
                                            styles.rightValue
                                        }
                                    >
                                        {formatMoney(
                                            getAmount(
                                                selectedInvoice,
                                            ),
                                            getCurrency(
                                                selectedInvoice,
                                            ),
                                        )}
                                    </strong>
                                </div>

                                <div className={styles.listRow}>
                                    <div>
                                        <strong>
                                            Önceki Tahsilat
                                        </strong>
                                    </div>

                                    <strong
                                        className={
                                            styles.rightValue
                                        }
                                    >
                                        {formatMoney(
                                            selectedInvoice
                                                .payment
                                                ?.collectedAmount ??
                                            0,
                                            getCurrency(
                                                selectedInvoice,
                                            ),
                                        )}
                                    </strong>
                                </div>

                                <div className={styles.listRow}>
                                    <div>
                                        <strong>
                                            Kalan
                                        </strong>
                                    </div>

                                    <strong
                                        className={
                                            styles.rightValue
                                        }
                                    >
                                        {formatMoney(
                                            remaining,
                                            getCurrency(
                                                selectedInvoice,
                                            ),
                                        )}
                                    </strong>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.empty}>
                                Cari ve fatura seçildiğinde
                                ödeme özeti burada
                                görüntülenir.
                            </div>
                        )}
                    </section>
                </div>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <strong>
                                Tahsilat Geçmişi
                            </strong>

                            <span>
                                Bu ekrandan kaydedilen
                                hareketler
                            </span>
                        </div>

                        <span>
                            {payments.length} kayıt
                        </span>
                    </div>

                    {payments.length > 0 ? (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Tarih</th>

                                        <th>Cari</th>

                                        <th>Fatura</th>

                                        <th>İşlem</th>

                                        <th>Yöntem</th>

                                        <th>Tutar</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {payments.map(
                                        (payment) => (
                                            <tr key={payment.id}>
                                                <td>
                                                    {payment.date}
                                                </td>

                                                <td>
                                                    {
                                                        payment.customerName
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        payment.invoiceNumber
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            payment.direction ===
                                                                'collection'
                                                                ? styles.successBadge
                                                                : styles.warningBadge
                                                        }
                                                    >
                                                        {payment.direction ===
                                                            'collection'
                                                            ? 'Tahsilat'
                                                            : 'Ödeme'}
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        paymentLabels[
                                                        payment.method
                                                        ]
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {formatMoney(
                                                            payment.amount,
                                                            payment.currency,
                                                        )}
                                                    </strong>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            Henüz tahsilat kaydı yok.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}