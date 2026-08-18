import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    useNavigate,
} from 'react-router-dom';

import type {
    InvoiceCurrency,
} from '../../models/invoice';

import type {
    Product,
    ProductFormInput,
} from '../../models/product';

import {
    useAppDispatch,
    useAppSelector,
} from '../../store/hooks';

import {
    adjustProductStock,
    addProduct,
    deleteProduct,
    updateProduct,
} from '../../store/slices/productSlice';

import {
    fetchInvoices,
} from '../../store/slices/invoiceSlice';

import {
    ProductDetailModal,
} from './components/ProductDetailModal/ProductDetailModal';

import {
    ProductFormModal,
} from './components/ProductFormModal/ProductFormModal';

import styles from './ProductListPage.module.scss';

type TypeFilter =
    | 'all'
    | 'product'
    | 'service';

type StockFilter =
    | 'all'
    | 'critical'
    | 'out'
    | 'active'
    | 'passive';

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

export default function ProductListPage() {
    const navigate =
        useNavigate();

    const dispatch =
        useAppDispatch();

    const products =
        useAppSelector(
            (state) =>
                state.products.items,
        );

    const movements =
        useAppSelector(
            (state) =>
                state.products.movements,
        );

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

    const [
        searchTerm,
        setSearchTerm,
    ] = useState('');

    const [
        typeFilter,
        setTypeFilter,
    ] =
        useState<TypeFilter>('all');

    const [
        stockFilter,
        setStockFilter,
    ] =
        useState<StockFilter>('all');

    const [
        isFormOpen,
        setIsFormOpen,
    ] = useState(false);

    const [
        editingProduct,
        setEditingProduct,
    ] =
        useState<Product | null>(
            null,
        );

    const [
        selectedProduct,
        setSelectedProduct,
    ] =
        useState<Product | null>(
            null,
        );

    useEffect(() => {
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

    useEffect(() => {
        document.title =
            'Ürün & Stok | PreAccounting';
    }, []);

    const filteredProducts =
        useMemo(() => {
            const search =
                searchTerm
                    .trim()
                    .toLocaleLowerCase(
                        'tr-TR',
                    );

            return products
                .filter((product) => {
                    if (
                        typeFilter !== 'all' &&
                        product.type !==
                        typeFilter
                    ) {
                        return false;
                    }

                    const isCritical =
                        product.trackStock &&
                        product.stockQuantity !==
                        null &&
                        product.criticalStock !==
                        null &&
                        product.stockQuantity <=
                        product.criticalStock;

                    const isOut =
                        product.trackStock &&
                        product.stockQuantity !==
                        null &&
                        product.stockQuantity <= 0;

                    if (
                        stockFilter ===
                        'critical' &&
                        !isCritical
                    ) {
                        return false;
                    }

                    if (
                        stockFilter === 'out' &&
                        !isOut
                    ) {
                        return false;
                    }

                    if (
                        stockFilter ===
                        'active' &&
                        !product.isActive
                    ) {
                        return false;
                    }

                    if (
                        stockFilter ===
                        'passive' &&
                        product.isActive
                    ) {
                        return false;
                    }

                    if (!search) {
                        return true;
                    }

                    return [
                        product.name,
                        product.code,
                        product.barcode,
                        product.description,
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLocaleLowerCase(
                            'tr-TR',
                        )
                        .includes(search);
                })
                .sort((a, b) =>
                    a.name.localeCompare(
                        b.name,
                        'tr',
                    ),
                );
        }, [
            products,
            searchTerm,
            stockFilter,
            typeFilter,
        ]);

    const criticalCount =
        useMemo(
            () =>
                products.filter(
                    (product) =>
                        product.trackStock &&
                        product.stockQuantity !==
                        null &&
                        product.criticalStock !==
                        null &&
                        product.stockQuantity <=
                        product.criticalStock,
                ).length,
            [products],
        );

    const inventoryValues =
        useMemo(() => {
            const result: Record<
                InvoiceCurrency,
                number
            > = {
                TRY: 0,
                USD: 0,
                EUR: 0,
            };

            products.forEach(
                (product) => {
                    if (
                        !product.trackStock ||
                        product.stockQuantity ===
                        null
                    ) {
                        return;
                    }

                    result[
                        product.currency
                    ] +=
                        product.purchasePrice *
                        product.stockQuantity;
                },
            );

            return result;
        }, [products]);

    function openNewProduct() {
        setEditingProduct(null);

        setIsFormOpen(true);
    }

    function openEditProduct(
        product: Product,
    ) {
        setSelectedProduct(null);

        setEditingProduct(
            product,
        );

        setIsFormOpen(true);
    }

    function handleSaveProduct(
        input: ProductFormInput,
    ) {
        const now =
            new Date().toISOString();

        if (editingProduct) {
            dispatch(
                updateProduct({
                    ...editingProduct,

                    ...input,

                    updatedAt: now,
                }),
            );
        } else {
            dispatch(
                addProduct({
                    ...input,

                    id: `product-${crypto.randomUUID()}`,

                    createdAt: now,

                    updatedAt: now,
                }),
            );
        }

        setIsFormOpen(false);

        setEditingProduct(null);
    }

    function handleDeleteProduct(
        product: Product,
    ) {
        const isUsed =
            invoices.some(
                (invoice) =>
                    invoice.items?.some(
                        (item) =>
                            item.productId ===
                            product.id,
                    ),
            );

        if (isUsed) {
            window.alert(
                'Bu ürün daha önce faturada kullanıldığı için silinemez. Bunun yerine kartı pasif yapabilirsiniz.',
            );

            return;
        }

        const approved =
            window.confirm(
                `${product.name} ürün kartını silmek istediğinize emin misiniz?`,
            );

        if (!approved) {
            return;
        }

        dispatch(
            deleteProduct(
                product.id,
            ),
        );

        setSelectedProduct(null);
    }

    function handleAdjustStock(
        product: Product,
    ) {
        if (!product.trackStock) {
            return;
        }

        const value =
            window.prompt(
                [
                    `${product.name}`,
                    `Mevcut stok: ${product.stockQuantity ?? 0}`,
                    '',
                    'Stok değişimini girin.',
                    'Örn: 10 giriş için 10',
                    '5 çıkış için -5',
                ].join('\n'),
            );

        if (value === null) {
            return;
        }

        const quantity =
            Number(
                value.replace(',', '.'),
            );

        if (
            !Number.isFinite(quantity) ||
            quantity === 0
        ) {
            window.alert(
                'Geçerli bir stok miktarı girin.',
            );

            return;
        }

        dispatch(
            adjustProductStock({
                productId:
                    product.id,

                quantity,

                description:
                    'Manuel stok düzeltme',
            }),
        );

        setSelectedProduct(
            null,
        );
    }

    return (
        <div
            className={styles.page}
        >
            <header
                className={styles.topBar}
            >
                <div
                    className={
                        styles.topBarInner
                    }
                >
                    <div
                        className={styles.brand}
                    >
                        <div
                            className={
                                styles.brandMark
                            }
                        >
                            P
                        </div>

                        <div>
                            <strong>
                                PreAccounting
                            </strong>

                            <span>
                                Ürün & Stok Yönetimi
                            </span>
                        </div>
                    </div>

                    <div
                        className={
                            styles.topActions
                        }
                    >
                        <button
                            type="button"
                            onClick={() =>
                                navigate('/customers')
                            }
                        >
                            Cari Hesaplar
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/')
                            }
                        >
                            ← Faturalar
                        </button>
                    </div>
                </div>
            </header>

            <main
                className={styles.container}
            >
                <section
                    className={
                        styles.pageHeader
                    }
                >
                    <div>
                        <span
                            className={
                                styles.eyebrow
                            }
                        >
                            STOK YÖNETİMİ
                        </span>

                        <h1>
                            Ürün & Stok
                        </h1>

                        <p>
                            Ürün, hizmet, fiyat,
                            KDV ve stok
                            hareketlerinizi tek
                            noktadan yönetin.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={
                            styles.newButton
                        }
                        onClick={
                            openNewProduct
                        }
                    >
                        <span>+</span>

                        Yeni Ürün
                    </button>
                </section>

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
                        <span>
                            Toplam Kart
                        </span>

                        <strong>
                            {products.length}
                        </strong>

                        <small>
                            Ürün ve hizmet
                        </small>
                    </div>

                    <div
                        className={
                            styles.summaryCard
                        }
                    >
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

                    <div
                        className={`${styles.summaryCard} ${criticalCount > 0
                                ? styles.warningCard
                                : ''
                            }`}
                    >
                        <span>
                            Kritik Stok
                        </span>

                        <strong>
                            {criticalCount}
                        </strong>

                        <small>
                            Kritik seviyedeki
                            ürünler
                        </small>
                    </div>

                    <div
                        className={
                            styles.summaryCard
                        }
                    >
                        <span>
                            Stok Maliyeti
                        </span>

                        <div
                            className={
                                styles.moneyStack
                            }
                        >
                            {(
                                [
                                    'TRY',
                                    'USD',
                                    'EUR',
                                ] as InvoiceCurrency[]
                            ).map((currency) => (
                                <strong
                                    key={currency}
                                >
                                    {formatMoney(
                                        inventoryValues[
                                        currency
                                        ],
                                        currency,
                                    )}
                                </strong>
                            ))}
                        </div>

                        <small>
                            Alış fiyatı üzerinden
                        </small>
                    </div>
                </section>

                <section
                    className={
                        styles.contentCard
                    }
                >
                    <div
                        className={
                            styles.toolbar
                        }
                    >
                        <label
                            className={
                                styles.searchBox
                            }
                        >
                            <span>⌕</span>

                            <input
                                type="search"
                                value={searchTerm}
                                placeholder="Ürün adı, kod veya barkod ara..."
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value,
                                    )
                                }
                            />
                        </label>

                        <select
                            value={typeFilter}
                            onChange={(event) =>
                                setTypeFilter(
                                    event.target
                                        .value as TypeFilter,
                                )
                            }
                        >
                            <option value="all">
                                Tüm Kartlar
                            </option>

                            <option value="product">
                                Ürün
                            </option>

                            <option value="service">
                                Hizmet
                            </option>
                        </select>

                        <select
                            value={stockFilter}
                            onChange={(event) =>
                                setStockFilter(
                                    event.target
                                        .value as StockFilter,
                                )
                            }
                        >
                            <option value="all">
                                Tüm Durumlar
                            </option>

                            <option value="critical">
                                Kritik Stok
                            </option>

                            <option value="out">
                                Stokta Yok
                            </option>

                            <option value="active">
                                Aktif
                            </option>

                            <option value="passive">
                                Pasif
                            </option>
                        </select>

                        <span
                            className={
                                styles.resultCount
                            }
                        >
                            {filteredProducts.length}{' '}
                            kayıt
                        </span>
                    </div>

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
                                    <th>
                                        Ürün / Hizmet
                                    </th>

                                    <th>Kod</th>

                                    <th>Tür</th>

                                    <th>Stok</th>

                                    <th>
                                        Alış Fiyatı
                                    </th>

                                    <th>
                                        Satış Fiyatı
                                    </th>

                                    <th>KDV</th>

                                    <th>
                                        Para Birimi
                                    </th>

                                    <th>Durum</th>

                                    <th />
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProducts.length >
                                    0 ? (
                                    filteredProducts.map(
                                        (product) => {
                                            const isCritical =
                                                product.trackStock &&
                                                product.stockQuantity !==
                                                null &&
                                                product.criticalStock !==
                                                null &&
                                                product.stockQuantity <=
                                                product.criticalStock;

                                            return (
                                                <tr
                                                    key={product.id}
                                                    onClick={() =>
                                                        setSelectedProduct(
                                                            product,
                                                        )
                                                    }
                                                >
                                                    <td>
                                                        <div
                                                            className={
                                                                styles.productCell
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.productIcon
                                                                }
                                                            >
                                                                {product.type ===
                                                                    'product'
                                                                    ? 'Ü'
                                                                    : 'H'}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {
                                                                        product.name
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {product.barcode
                                                                        ? `Barkod: ${product.barcode}`
                                                                        : product.description ||
                                                                        'Açıklama yok'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {
                                                                product.code
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                styles.typeBadge
                                                            }
                                                        >
                                                            {product.type ===
                                                                'product'
                                                                ? 'Ürün'
                                                                : 'Hizmet'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {product.trackStock ? (
                                                            <div
                                                                className={
                                                                    styles.stockCell
                                                                }
                                                            >
                                                                <strong
                                                                    className={
                                                                        isCritical
                                                                            ? styles.criticalStock
                                                                            : ''
                                                                    }
                                                                >
                                                                    {product.stockQuantity ??
                                                                        0}
                                                                </strong>

                                                                <span>
                                                                    Kritik:{' '}
                                                                    {product.criticalStock ??
                                                                        0}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span
                                                                className={
                                                                    styles.noStock
                                                                }
                                                            >
                                                                Takip yok
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td>
                                                        {formatMoney(
                                                            product.purchasePrice,
                                                            product.currency,
                                                        )}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {formatMoney(
                                                                product.salePrice,
                                                                product.currency,
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        %{product.vatRate}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                styles.currencyBadge
                                                            }
                                                        >
                                                            {
                                                                product.currency
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`${styles.statusBadge} ${product.isActive
                                                                    ? styles.active
                                                                    : styles.passive
                                                                }`}
                                                        >
                                                            {product.isActive
                                                                ? 'Aktif'
                                                                : 'Pasif'}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.editButton
                                                            }
                                                            onClick={(event) => {
                                                                event.stopPropagation();

                                                                openEditProduct(
                                                                    product,
                                                                );
                                                            }}
                                                        >
                                                            Düzenle
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className={
                                                styles.emptyCell
                                            }
                                        >
                                            Ürün / hizmet
                                            bulunamadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <ProductFormModal
                isOpen={isFormOpen}
                product={
                    editingProduct
                }
                onClose={() => {
                    setIsFormOpen(false);

                    setEditingProduct(
                        null,
                    );
                }}
                onSubmit={
                    handleSaveProduct
                }
            />

            <ProductDetailModal
                product={
                    selectedProduct
                }
                invoices={invoices}
                movements={movements}
                onClose={() =>
                    setSelectedProduct(
                        null,
                    )
                }
                onEdit={
                    openEditProduct
                }
                onDelete={
                    handleDeleteProduct
                }
                onAdjustStock={
                    handleAdjustStock
                }
            />
        </div>
    );
}