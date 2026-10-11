import {
    useEffect,
    useState,
    type FormEvent,
} from 'react';

import type {
    InvoiceCurrency,
    InvoicePaymentMethod,
} from '../../models/invoice';

import {
    useAppDispatch,
    useAppSelector,
} from '../../store/hooks';

import {
    setCompanySettings,
} from '../../store/slices/companySettingsSlice';

import {
    setExchangeRates,
} from '../../store/slices/exchangeRateSlice';

import styles from '../../styles/ManagementPage.module.scss';

export default function CompanySettingsPage() {
    const dispatch =
        useAppDispatch();

    const storedSettings =
        useAppSelector(
            (state) =>
                state.companySettings.value,
        );

    const storedRates =
        useAppSelector(
            (state) =>
                state.exchangeRates.value,
        );

    const [form, setForm] =
        useState(storedSettings);

    const [rates, setRates] =
        useState(storedRates);

    const [saved, setSaved] =
        useState(false);

    useEffect(() => {
        document.title =
            'Firma Ayarları | PreAccounting';
    }, []);

    function updateCompany(
        changes:
            Partial<
                typeof form.company
            >,
    ) {
        setForm((current) => ({
            ...current,

            company: {
                ...current.company,

                ...changes,
            },
        }));
    }

    function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        dispatch(
            setCompanySettings(
                form,
            ),
        );

        dispatch(
            setExchangeRates(
                rates,
            ),
        );

        setSaved(true);

        window.setTimeout(
            () =>
                setSaved(false),
            2500,
        );
    }

    return (
        <div className={styles.page}>
            <main className={styles.container}>
                <section className={styles.pageHeader}>
                    <div>
                        <span className={styles.eyebrow}>
                            SİSTEM AYARLARI
                        </span>

                        <h1>
                            Firma Ayarları
                        </h1>

                        <p>
                            Faturalarınızda kullanılacak
                            şirket, banka ve varsayılan
                            belge ayarlarını yönetin.
                        </p>
                    </div>
                </section>

                <form onSubmit={handleSubmit}>
                    <div className={styles.grid2}>
                        <section className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <strong>
                                        Firma Bilgileri
                                    </strong>

                                    <span>
                                        Vergi ve iletişim
                                        bilgileri
                                    </span>
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <label
                                    className={`${styles.field} ${styles.span2}`}
                                >
                                    <span>Firma Ünvanı</span>

                                    <input
                                        value={
                                            form.company.title
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                title:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>VKN / TCKN</span>

                                    <input
                                        value={
                                            form.company
                                                .taxNumber
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                taxNumber:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>
                                        Vergi Dairesi
                                    </span>

                                    <input
                                        value={
                                            form.company
                                                .taxOffice
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                taxOffice:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>MERSİS</span>

                                    <input
                                        value={
                                            form.company
                                                .mersisNumber
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                mersisNumber:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>
                                        Ticaret Sicil No
                                    </span>

                                    <input
                                        value={
                                            form.company
                                                .tradeRegistryNumber
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                tradeRegistryNumber:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Telefon</span>

                                    <input
                                        value={
                                            form.company.phone
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                phone:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>E-posta</span>

                                    <input
                                        type="email"
                                        value={
                                            form.company.email
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                email:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Website</span>

                                    <input
                                        value={
                                            form.company.website
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                website:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Logo URL</span>

                                    <input
                                        value={
                                            form.company.logoUrl
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                logoUrl:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label
                                    className={`${styles.field} ${styles.span2}`}
                                >
                                    <span>Adres</span>

                                    <textarea
                                        value={
                                            form.company.address
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                address:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>İlçe</span>

                                    <input
                                        value={
                                            form.company
                                                .district
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                district:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Şehir</span>

                                    <input
                                        value={
                                            form.company.city
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                city:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Ülke</span>

                                    <input
                                        value={
                                            form.company.country
                                        }
                                        onChange={(event) =>
                                            updateCompany({
                                                country:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />
                                </label>
                            </div>
                        </section>

                        <section className={styles.panel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <strong>
                                        Banka & Fatura
                                    </strong>

                                    <span>
                                        Varsayılan ödeme ve
                                        belge bilgileri
                                    </span>
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <label className={styles.field}>
                                    <span>Banka</span>

                                    <input
                                        value={form.bankName}
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,

                                                    bankName:
                                                        event.target
                                                            .value,
                                                }),
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>Hesap Adı</span>

                                    <input
                                        value={
                                            form.accountName
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,

                                                    accountName:
                                                        event.target
                                                            .value,
                                                }),
                                            )
                                        }
                                    />
                                </label>

                                <label
                                    className={`${styles.field} ${styles.span2}`}
                                >
                                    <span>IBAN</span>

                                    <input
                                        value={form.iban}
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,

                                                    iban:
                                                        event.target
                                                            .value,
                                                }),
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>
                                        Varsayılan Döviz
                                    </span>

                                    <select
                                        value={
                                            form.defaultCurrency
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,

                                                    defaultCurrency:
                                                        event.target
                                                            .value as InvoiceCurrency,
                                                }),
                                            )
                                        }
                                    >
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

                                <label className={styles.field}>
                                    <span>
                                        Varsayılan Ödeme
                                    </span>

                                    <select
                                        value={
                                            form.defaultPaymentMethod
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,

                                                    defaultPaymentMethod:
                                                        event.target
                                                            .value as InvoicePaymentMethod,
                                                }),
                                            )
                                        }
                                    >
                                        <option value="bankTransfer">
                                            EFT / Havale
                                        </option>

                                        <option value="cash">
                                            Nakit
                                        </option>

                                        <option value="creditCard">
                                            Kredi Kartı
                                        </option>

                                        <option value="other">
                                            Diğer
                                        </option>
                                    </select>
                                </label>

                                <label className={styles.field}>
                                    <span>
                                        Fatura Serisi
                                    </span>

                                    <input
                                        value={
                                            form.invoiceSeries
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,

                                                    invoiceSeries:
                                                        event.target
                                                            .value
                                                            .toUpperCase(),
                                                }),
                                            )
                                        }
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span>
                                        Varsayılan Vade
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            form.defaultDueDays
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (current) => ({
                                                    ...current,

                                                    defaultDueDays:
                                                        Math.max(
                                                            0,
                                                            Number(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        ),
                                                }),
                                            )
                                        }
                                    />
                                </label>
                            </div>

                            <div className={styles.notice}>
                                Bu değerler yeni
                                oluşturulan faturalar için
                                varsayılan şirket ve ödeme
                                bilgileri olarak
                                kullanılabilir.
                            </div>
                        </section>
                    </div>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <strong>
                                    Döviz / Kur Ayarları
                                </strong>

                                <span>
                                    Manuel belge kuru
                                    altyapısı
                                </span>
                            </div>
                        </div>

                        <div className={styles.formGrid}>
                            <label className={styles.field}>
                                <span>Kur Tarihi</span>

                                <input
                                    type="date"
                                    value={rates.rateDate}
                                    onChange={(event) =>
                                        setRates(
                                            (current) => ({
                                                ...current,

                                                rateDate:
                                                    event.target
                                                        .value,
                                            }),
                                        )
                                    }
                                />
                            </label>

                            <div />

                            <label className={styles.field}>
                                <span>
                                    1 USD = ? TRY
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={
                                        rates.usdTry ?? ''
                                    }
                                    onChange={(event) =>
                                        setRates(
                                            (current) => ({
                                                ...current,

                                                usdTry:
                                                    event.target.value
                                                        ? Number(
                                                            event.target
                                                                .value,
                                                        )
                                                        : null,
                                            }),
                                        )
                                    }
                                />
                            </label>

                            <label className={styles.field}>
                                <span>
                                    1 EUR = ? TRY
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={
                                        rates.eurTry ?? ''
                                    }
                                    onChange={(event) =>
                                        setRates(
                                            (current) => ({
                                                ...current,

                                                eurTry:
                                                    event.target.value
                                                        ? Number(
                                                            event.target
                                                                .value,
                                                        )
                                                        : null,
                                            }),
                                        )
                                    }
                                />
                            </label>
                        </div>

                        <div className={styles.notice}>
                            TRY, USD ve EUR tutarlarını
                            raporlarda birbirine
                            doğrudan toplamıyoruz.
                            Kur dönüşümü gerektiğinde
                            buradaki oranlar
                            kullanılacak.
                        </div>

                        <div className={styles.saveBar}>
                            {saved ? (
                                <span
                                    className={
                                        styles.successBadge
                                    }
                                >
                                    Ayarlar kaydedildi
                                </span>
                            ) : null}

                            <button
                                type="submit"
                                className={
                                    styles.primaryButton
                                }
                            >
                                Tüm Ayarları Kaydet
                            </button>
                        </div>
                    </section>
                </form>
            </main>
        </div>
    );
}