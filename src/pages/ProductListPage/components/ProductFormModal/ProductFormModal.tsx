import {
    useEffect,
    useState,
    type FormEvent,
} from 'react';

import type {
    InvoiceCurrency,
    InvoiceItemType,
    InvoiceItemUnit,
} from '../../../../models/invoice';

import type {
    Product,
    ProductFormInput,
} from '../../../../models/product';

import styles from './ProductFormModal.module.scss';

interface ProductFormModalProps {
    isOpen: boolean;

    product: Product | null;

    onClose: () => void;

    onSubmit: (
        input: ProductFormInput,
    ) => void;
}

function createEmptyForm(): ProductFormInput {
    return {
        code: '',

        barcode: '',

        name: '',

        description: '',

        type: 'product',

        unit: 'piece',

        purchasePrice: 0,

        salePrice: 0,

        currency: 'TRY',

        vatRate: 20,

        trackStock: true,

        stockQuantity: 0,

        criticalStock: 0,

        isActive: true,
    };
}

function productToForm(
    product: Product,
): ProductFormInput {
    return {
        code: product.code,

        barcode: product.barcode,

        name: product.name,

        description: product.description,

        type: product.type,

        unit: product.unit,

        purchasePrice:
            product.purchasePrice,

        salePrice: product.salePrice,

        currency: product.currency,

        vatRate: product.vatRate,

        trackStock: product.trackStock,

        stockQuantity:
            product.stockQuantity,

        criticalStock:
            product.criticalStock,

        isActive: product.isActive,
    };
}

export function ProductFormModal({
    isOpen,

    product,

    onClose,

    onSubmit,
}: ProductFormModalProps) {
    const [form, setForm] =
        useState<ProductFormInput>(
            createEmptyForm(),
        );

    const [error, setError] =
        useState<string | null>(
            null,
        );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setForm(
            product
                ? productToForm(product)
                : createEmptyForm(),
        );

        setError(null);
    }, [isOpen, product]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (
                event.key === 'Escape'
            ) {
                onClose();
            }
        }

        window.addEventListener(
            'keydown',
            handleKeyDown,
        );

        return () =>
            window.removeEventListener(
                'keydown',
                handleKeyDown,
            );
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    function updateForm(
        changes:
            Partial<ProductFormInput>,
    ) {
        setForm((current) => ({
            ...current,

            ...changes,
        }));
    }

    function handleTypeChange(
        type: InvoiceItemType,
    ) {
        if (type === 'service') {
            updateForm({
                type,

                trackStock: false,

                stockQuantity: null,

                criticalStock: null,
            });

            return;
        }

        updateForm({
            type,

            trackStock: true,

            stockQuantity:
                form.stockQuantity ?? 0,

            criticalStock:
                form.criticalStock ?? 0,
        });
    }

    function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const name =
            form.name.trim();

        const code =
            form.code.trim();

        if (!name) {
            setError(
                'Ürün / hizmet adı boş bırakılamaz.',
            );

            return;
        }

        if (!code) {
            setError(
                'Ürün / hizmet kodu boş bırakılamaz.',
            );

            return;
        }

        if (
            form.salePrice < 0 ||
            form.purchasePrice < 0
        ) {
            setError(
                'Fiyatlar negatif olamaz.',
            );

            return;
        }

        onSubmit({
            ...form,

            name,

            code,

            barcode:
                form.barcode.trim(),

            description:
                form.description.trim(),

            stockQuantity:
                form.trackStock
                    ? Math.max(
                        0,
                        form.stockQuantity ?? 0,
                    )
                    : null,

            criticalStock:
                form.trackStock
                    ? Math.max(
                        0,
                        form.criticalStock ?? 0,
                    )
                    : null,
        });
    }

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <form
                className={styles.modal}
                onSubmit={handleSubmit}
            >
                <header
                    className={styles.header}
                >
                    <div>
                        <span>
                            ÜRÜN KARTI
                        </span>

                        <h2>
                            {product
                                ? 'Ürün / Hizmet Düzenle'
                                : 'Yeni Ürün / Hizmet'}
                        </h2>

                        <p>
                            Fatura ve stok
                            işlemlerinde kullanılacak
                            kart bilgileri.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={
                            styles.closeButton
                        }
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>

                <div
                    className={styles.body}
                >
                    {error ? (
                        <div
                            className={styles.error}
                        >
                            {error}
                        </div>
                    ) : null}

                    <section
                        className={styles.section}
                    >
                        <div
                            className={
                                styles.sectionHeader
                            }
                        >
                            <strong>
                                Temel Bilgiler
                            </strong>

                            <span>
                                Kart türü, kod ve isim
                            </span>
                        </div>

                        <div
                            className={styles.grid}
                        >
                            <label
                                className={styles.field}
                            >
                                <span>Tür</span>

                                <select
                                    value={form.type}
                                    onChange={(event) =>
                                        handleTypeChange(
                                            event.target
                                                .value as InvoiceItemType,
                                        )
                                    }
                                >
                                    <option value="product">
                                        Ürün
                                    </option>

                                    <option value="service">
                                        Hizmet
                                    </option>
                                </select>
                            </label>

                            <label
                                className={
                                    styles.checkField
                                }
                            >
                                <input
                                    type="checkbox"
                                    checked={
                                        form.isActive
                                    }
                                    onChange={(event) =>
                                        updateForm({
                                            isActive:
                                                event.target.checked,
                                        })
                                    }
                                />

                                <span>
                                    Aktif kart
                                </span>
                            </label>

                            <label
                                className={styles.field}
                            >
                                <span>Kod</span>

                                <input
                                    type="text"
                                    value={form.code}
                                    placeholder="Örn: URN-001"
                                    onChange={(event) =>
                                        updateForm({
                                            code:
                                                event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label
                                className={styles.field}
                            >
                                <span>Barkod</span>

                                <input
                                    type="text"
                                    value={form.barcode}
                                    placeholder="Opsiyonel"
                                    onChange={(event) =>
                                        updateForm({
                                            barcode:
                                                event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label
                                className={`${styles.field} ${styles.span2}`}
                            >
                                <span>
                                    Ürün / Hizmet Adı
                                </span>

                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(event) =>
                                        updateForm({
                                            name:
                                                event.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label
                                className={`${styles.field} ${styles.span2}`}
                            >
                                <span>
                                    Açıklama
                                </span>

                                <textarea
                                    rows={3}
                                    value={
                                        form.description
                                    }
                                    onChange={(event) =>
                                        updateForm({
                                            description:
                                                event.target.value,
                                        })
                                    }
                                />
                            </label>
                        </div>
                    </section>

                    <section
                        className={styles.section}
                    >
                        <div
                            className={
                                styles.sectionHeader
                            }
                        >
                            <strong>
                                Fiyatlandırma
                            </strong>

                            <span>
                                Alış / satış ve vergi
                            </span>
                        </div>

                        <div
                            className={styles.grid}
                        >
                            <label
                                className={styles.field}
                            >
                                <span>Birim</span>

                                <select
                                    value={form.unit}
                                    onChange={(event) =>
                                        updateForm({
                                            unit:
                                                event.target
                                                    .value as InvoiceItemUnit,
                                        })
                                    }
                                >
                                    <option value="piece">
                                        Adet
                                    </option>

                                    <option value="kg">
                                        Kilogram
                                    </option>

                                    <option value="meter">
                                        Metre
                                    </option>

                                    <option value="hour">
                                        Saat
                                    </option>
                                </select>
                            </label>

                            <label
                                className={styles.field}
                            >
                                <span>
                                    Para Birimi
                                </span>

                                <select
                                    value={form.currency}
                                    onChange={(event) =>
                                        updateForm({
                                            currency:
                                                event.target
                                                    .value as InvoiceCurrency,
                                        })
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

                            <label
                                className={styles.field}
                            >
                                <span>
                                    Alış Fiyatı
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        form.purchasePrice
                                    }
                                    onChange={(event) =>
                                        updateForm({
                                            purchasePrice:
                                                Math.max(
                                                    0,
                                                    Number(
                                                        event.target
                                                            .value,
                                                    ),
                                                ),
                                        })
                                    }
                                />
                            </label>

                            <label
                                className={styles.field}
                            >
                                <span>
                                    Satış Fiyatı
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        form.salePrice
                                    }
                                    onChange={(event) =>
                                        updateForm({
                                            salePrice:
                                                Math.max(
                                                    0,
                                                    Number(
                                                        event.target
                                                            .value,
                                                    ),
                                                ),
                                        })
                                    }
                                />
                            </label>

                            <label
                                className={styles.field}
                            >
                                <span>KDV</span>

                                <select
                                    value={form.vatRate}
                                    onChange={(event) =>
                                        updateForm({
                                            vatRate:
                                                Number(
                                                    event.target
                                                        .value,
                                                ),
                                        })
                                    }
                                >
                                    <option value={0}>
                                        %0
                                    </option>

                                    <option value={1}>
                                        %1
                                    </option>

                                    <option value={10}>
                                        %10
                                    </option>

                                    <option value={20}>
                                        %20
                                    </option>
                                </select>
                            </label>
                        </div>
                    </section>

                    {form.type === 'product' ? (
                        <section
                            className={styles.section}
                        >
                            <div
                                className={
                                    styles.sectionHeader
                                }
                            >
                                <strong>
                                    Stok Yönetimi
                                </strong>

                                <span>
                                    Mevcut ve kritik stok
                                </span>
                            </div>

                            <div
                                className={styles.grid}
                            >
                                <label
                                    className={
                                        styles.checkField
                                    }
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            form.trackStock
                                        }
                                        onChange={(event) =>
                                            updateForm({
                                                trackStock:
                                                    event.target.checked,

                                                stockQuantity:
                                                    event.target.checked
                                                        ? form.stockQuantity ??
                                                        0
                                                        : null,

                                                criticalStock:
                                                    event.target.checked
                                                        ? form.criticalStock ??
                                                        0
                                                        : null,
                                            })
                                        }
                                    />

                                    <span>
                                        Stok takibi yap
                                    </span>
                                </label>

                                {form.trackStock ? (
                                    <>
                                        <label
                                            className={
                                                styles.field
                                            }
                                        >
                                            <span>
                                                Mevcut Stok
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    form.stockQuantity ??
                                                    0
                                                }
                                                onChange={(event) =>
                                                    updateForm({
                                                        stockQuantity:
                                                            Math.max(
                                                                0,
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            ),
                                                    })
                                                }
                                            />
                                        </label>

                                        <label
                                            className={
                                                styles.field
                                            }
                                        >
                                            <span>
                                                Kritik Stok
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    form.criticalStock ??
                                                    0
                                                }
                                                onChange={(event) =>
                                                    updateForm({
                                                        criticalStock:
                                                            Math.max(
                                                                0,
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            ),
                                                    })
                                                }
                                            />
                                        </label>
                                    </>
                                ) : null}
                            </div>
                        </section>
                    ) : null}
                </div>

                <footer
                    className={styles.footer}
                >
                    <button
                        type="button"
                        className={
                            styles.cancelButton
                        }
                        onClick={onClose}
                    >
                        Vazgeç
                    </button>

                    <button
                        type="submit"
                        className={
                            styles.saveButton
                        }
                    >
                        {product
                            ? 'Değişiklikleri Kaydet'
                            : 'Ürün Kartı Oluştur'}
                    </button>
                </footer>
            </form>
        </div>
    );
}