import { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import type {
  InvoiceCurrency,
  InvoiceItem,
  InvoiceItemType,
  InvoiceItemUnit,
} from '../../../../models/invoice';

import {
  calculateInvoiceLine,
  calculateInvoiceTotals,
} from '../../../../utils/invoiceCalculations';

import styles from './InvoiceItemsTable.module.scss';

interface InvoiceItemsTableProps {
  initialItems?: InvoiceItem[];

  initialAmount?: number;

  currency: InvoiceCurrency;

  onItemsChange?: (items: InvoiceItem[]) => void;
}

interface CatalogProduct {
  id: string;

  code: string;

  name: string;

  description: string;

  type: InvoiceItemType;

  unit: InvoiceItemUnit;

  unitPrice: number;

  vatRate: number;

  stockQuantity: number | null;
}

interface InvoiceItemRow {
  id: string;

  type: InvoiceItemType;

  productId: string;

  productName: string;

  productCode: string;

  description: string;

  quantity: number;

  unit: InvoiceItemUnit;

  unitPrice: number;

  discountRate: number;

  vatRate: number;
}

const MANUAL_PRODUCT_ID = '__manual__';

const products: CatalogProduct[] = [
  {
    id: 'product-1',

    code: '3D-001',

    name: '3D Baskı Ürünü',

    description: '3D baskı üretim ürünü',

    type: 'product',

    unit: 'piece',

    unitPrice: 1250,

    vatRate: 20,

    stockQuantity: 48,
  },

  {
    id: 'product-2',

    code: 'FLM-PLA-001',

    name: 'Filament',

    description: 'PLA filament',

    type: 'product',

    unit: 'piece',

    unitPrice: 650,

    vatRate: 20,

    stockQuantity: 125,
  },

  {
    id: 'product-3',

    code: 'HZM-TSR-001',

    name: 'Tasarım Hizmeti',

    description: '3D modelleme ve tasarım hizmeti',

    type: 'service',

    unit: 'hour',

    unitPrice: 2500,

    vatRate: 20,

    stockQuantity: null,
  },

  {
    id: 'product-4',

    code: 'HZM-KRG-001',

    name: 'Kargo Hizmeti',

    description: 'Kargo ve teslimat hizmeti',

    type: 'service',

    unit: 'piece',

    unitPrice: 250,

    vatRate: 20,

    stockQuantity: null,
  },
];

function createEmptyRow(initialAmount = 0): InvoiceItemRow {
  return {
    id: crypto.randomUUID(),

    type: 'product',

    productId: '',

    productName: '',

    productCode: '',

    description: '',

    quantity: 1,

    unit: 'piece',

    unitPrice: initialAmount,

    discountRate: 0,

    vatRate: 20,
  };
}

function createRowFromInvoiceItem(item: InvoiceItem): InvoiceItemRow {
  const knownProduct = products.find((product) => product.id === item.productId);

  const isManual = !knownProduct && Boolean(item.productName);

  return {
    id: item.id,

    type: item.type,

    productId: knownProduct?.id ?? (isManual ? MANUAL_PRODUCT_ID : ''),

    productName: item.productName ?? '',

    productCode: item.productCode ?? knownProduct?.code ?? '',

    description: item.description,

    quantity: item.quantity,

    unit: item.unit,

    unitPrice: item.unitPrice,

    discountRate: item.discountRate,

    vatRate: item.vatRate,
  };
}

export function InvoiceItemsTable({
  initialItems,

  initialAmount = 0,

  currency,

  onItemsChange,
}: InvoiceItemsTableProps) {
  const { t, i18n } = useTranslation();

  const [rows, setRows] = useState<InvoiceItemRow[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.map(createRowFromInvoiceItem);
    }

    return [createEmptyRow(initialAmount)];
  });

  const locale = i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'tr-TR';

  const invoiceItems = useMemo<InvoiceItem[]>(
    () =>
      rows.map((row) => {
        const amounts = calculateInvoiceLine(row);

        const knownProduct = products.find((product) => product.id === row.productId);

        return {
          id: row.id,

          type: row.type,

          productId: row.productId === MANUAL_PRODUCT_ID ? '' : row.productId,

          productName: row.productName || knownProduct?.name || '',

          productCode: row.productCode || knownProduct?.code || '',

          description: row.description,

          quantity: row.quantity,

          unit: row.unit,

          unitPrice: row.unitPrice,

          discountRate: row.discountRate,

          vatRate: row.vatRate,

          currency,

          lineTotal: amounts.lineTotal,
        };
      }),
    [currency, rows],
  );

  const totals = useMemo(() => calculateInvoiceTotals(invoiceItems), [invoiceItems]);

  useEffect(() => {
    onItemsChange?.(invoiceItems);
  }, [invoiceItems, onItemsChange]);

  function updateRow(
    id: string,

    changes: Partial<InvoiceItemRow>,
  ) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id
          ? {
              ...row,
              ...changes,
            }
          : row,
      ),
    );
  }

  function handleProductChange(
    row: InvoiceItemRow,

    productId: string,
  ) {
    if (productId === MANUAL_PRODUCT_ID) {
      updateRow(row.id, {
        productId: MANUAL_PRODUCT_ID,

        productName: '',

        productCode: '',

        description: '',
      });

      return;
    }

    const product = products.find((item) => item.id === productId);

    if (!product) {
      updateRow(row.id, {
        productId: '',

        productName: '',

        productCode: '',
      });

      return;
    }

    updateRow(row.id, {
      productId: product.id,

      productName: product.name,

      productCode: product.code,

      description: product.description,

      type: product.type,

      unit: product.unit,

      unitPrice: product.unitPrice,

      vatRate: product.vatRate,
    });
  }

  function addRowAfter(id: string) {
    setRows((currentRows) => {
      const rowIndex = currentRows.findIndex((row) => row.id === id);

      if (rowIndex === -1) {
        return currentRows;
      }

      const nextRows = [...currentRows];

      nextRows.splice(rowIndex + 1, 0, createEmptyRow());

      return nextRows;
    });
  }

  function addRowToEnd() {
    setRows((currentRows) => [...currentRows, createEmptyRow()]);
  }

  function removeRow(id: string) {
    setRows((currentRows) => {
      if (currentRows.length === 1) {
        return currentRows;
      }

      return currentRows.filter((row) => row.id !== id);
    });
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2>
            {t('invoiceItems.title', {
              defaultValue: 'Fatura Kalemleri',
            })}
          </h2>

          <p>
            {t('invoiceItems.description', {
              defaultValue: 'Faturaya ait ürün ve hizmetleri ekleyin.',
            })}
          </p>
        </div>

        <div className={styles.headerActions}>
          <span className={styles.currencyHeaderBadge}>{currency}</span>

          <span className={styles.rowCount}>
            {t('invoiceItems.rowCount', {
              count: rows.length,

              defaultValue: '{{count}} kalem',
            })}
          </span>

          <button type="button" className={styles.addLineButton} onClick={addRowToEnd}>
            <span aria-hidden="true">+</span>

            {t('invoiceItems.addItem', {
              defaultValue: 'Kalem Ekle',
            })}
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table
          className={styles.table}
          aria-label={t('invoiceItems.title', {
            defaultValue: 'Fatura Kalemleri',
          })}
        >
          <thead>
            <tr>
              <th className={styles.controlsHeader}>#</th>

              <th>
                {t('invoiceItems.type', {
                  defaultValue: 'Tür',
                })}
              </th>

              <th>
                {t('invoiceItems.product', {
                  defaultValue: 'Mal / Hizmet',
                })}
              </th>

              <th>
                {t('invoiceItems.descriptionColumn', {
                  defaultValue: 'Açıklama',
                })}
              </th>

              <th>
                {t('invoiceItems.quantity', {
                  defaultValue: 'Miktar',
                })}
              </th>

              <th>
                {t('invoiceItems.unit', {
                  defaultValue: 'Birim',
                })}
              </th>

              <th>
                {t('invoiceItems.unitPrice', {
                  defaultValue: 'Birim Fiyat',
                })}
              </th>

              <th>
                {t('invoiceItems.currency', {
                  defaultValue: 'Döviz',
                })}
              </th>

              <th>
                {t('invoiceItems.grossAmount', {
                  defaultValue: 'Tutar',
                })}
              </th>

              <th>
                {t('invoiceItems.discount', {
                  defaultValue: 'İsk. %',
                })}
              </th>

              <th>
                {t('invoiceItems.discountAmount', {
                  defaultValue: 'İskonto',
                })}
              </th>

              <th>
                {t('invoiceItems.vat', {
                  defaultValue: 'KDV %',
                })}
              </th>

              <th>
                {t('invoiceItems.vatAmount', {
                  defaultValue: 'KDV',
                })}
              </th>

              <th>
                {t('invoiceItems.lineTotal', {
                  defaultValue: 'Satır Toplamı',
                })}
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => {
              const amounts = calculateInvoiceLine(row);

              const knownProduct = products.find((product) => product.id === row.productId);

              const isManualProduct = row.productId === MANUAL_PRODUCT_ID;

              return (
                <tr key={row.id}>
                  <td className={styles.controlsCell}>
                    <div className={styles.rowControls}>
                      <span className={styles.rowNumber}>{index + 1}</span>

                      <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => addRowAfter(row.id)}
                        aria-label="Altına satır ekle"
                        title="Altına satır ekle"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1}
                        aria-label="Satırı sil"
                        title="Satırı sil"
                      >
                        −
                      </button>
                    </div>
                  </td>

                  <td>
                    <select
                      value={row.type}
                      onChange={(event) =>
                        updateRow(row.id, {
                          type: event.target.value as InvoiceItemType,
                        })
                      }
                    >
                      <option value="product">Ürün</option>

                      <option value="service">Hizmet</option>
                    </select>
                  </td>

                  <td>
                    <div className={styles.productEditor}>
                      <select
                        value={knownProduct?.id ?? (isManualProduct ? MANUAL_PRODUCT_ID : '')}
                        onChange={(event) => handleProductChange(row, event.target.value)}
                      >
                        <option value="">Mal / hizmet seç</option>

                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            [{product.code}] {product.name}
                          </option>
                        ))}

                        <option value={MANUAL_PRODUCT_ID}>+ Serbest ürün / hizmet</option>
                      </select>

                      {isManualProduct ? (
                        <input
                          type="text"
                          value={row.productName}
                          placeholder="Ürün / hizmet adı"
                          onChange={(event) =>
                            updateRow(row.id, {
                              productName: event.target.value,
                            })
                          }
                        />
                      ) : null}

                      {knownProduct ? (
                        <span className={styles.productMeta}>
                          Kod: {knownProduct.code} •{' '}
                          {knownProduct.stockQuantity === null
                            ? 'Hizmet'
                            : `Stok: ${knownProduct.stockQuantity}`}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td>
                    <input
                      type="text"
                      value={row.description}
                      placeholder="Satır açıklaması"
                      onChange={(event) =>
                        updateRow(row.id, {
                          description: event.target.value,
                        })
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={row.quantity}
                      onChange={(event) =>
                        updateRow(row.id, {
                          quantity: Math.max(0, Number(event.target.value)),
                        })
                      }
                    />
                  </td>

                  <td>
                    <select
                      value={row.unit}
                      onChange={(event) =>
                        updateRow(row.id, {
                          unit: event.target.value as InvoiceItemUnit,
                        })
                      }
                    >
                      <option value="piece">Adet</option>

                      <option value="kg">Kilogram</option>

                      <option value="meter">Metre</option>

                      <option value="hour">Saat</option>
                    </select>
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.unitPrice}
                      onChange={(event) =>
                        updateRow(row.id, {
                          unitPrice: Math.max(0, Number(event.target.value)),
                        })
                      }
                    />
                  </td>

                  <td className={styles.currencyCell}>
                    <span className={styles.currencyBadge}>{currency}</span>
                  </td>

                  <td className={styles.amountCell}>{formatCurrency(amounts.grossAmount)}</td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={row.discountRate}
                      onChange={(event) =>
                        updateRow(row.id, {
                          discountRate: Math.min(100, Math.max(0, Number(event.target.value))),
                        })
                      }
                    />
                  </td>

                  <td className={styles.amountCell}>{formatCurrency(amounts.discountAmount)}</td>

                  <td>
                    <select
                      value={row.vatRate}
                      onChange={(event) =>
                        updateRow(row.id, {
                          vatRate: Number(event.target.value),
                        })
                      }
                    >
                      <option value={0}>%0</option>

                      <option value={1}>%1</option>

                      <option value={10}>%10</option>

                      <option value={20}>%20</option>
                    </select>
                  </td>

                  <td className={styles.amountCell}>{formatCurrency(amounts.vatAmount)}</td>

                  <td className={styles.totalCell}>{formatCurrency(amounts.lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerInformation}>
          <strong>Fatura Özeti</strong>

          <span>
            {rows.length} kalem • Tek belge para birimi: {currency}
          </span>

          <span>Para birimi, Belge Genel Bilgileri alanından değiştirilir.</span>
        </div>

        <div className={styles.summaryContainer}>
          <div className={styles.currencySummary}>
            <div className={styles.summaryRow}>
              <span>Mal / Hizmet Toplamı</span>

              <strong>{formatCurrency(totals.subtotal)}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Toplam İskonto</span>

              <strong>-{formatCurrency(totals.totalDiscount)}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>KDV Matrahı</span>

              <strong>{formatCurrency(totals.netSubtotal ?? 0)}</strong>
            </div>

            {(totals.vatBreakdown ?? []).map((vat) => (
              <div key={vat.rate} className={styles.vatGroup}>
                <div className={styles.summaryRow}>
                  <span>%{vat.rate} KDV Matrahı</span>

                  <strong>{formatCurrency(vat.taxableAmount)}</strong>
                </div>

                <div className={styles.summaryRow}>
                  <span>%{vat.rate} Hesaplanan KDV</span>

                  <strong>{formatCurrency(vat.vatAmount)}</strong>
                </div>
              </div>
            ))}

            <div className={styles.summaryRow}>
              <span>Toplam KDV</span>

              <strong>{formatCurrency(totals.totalVat)}</strong>
            </div>

            <div className={styles.grandTotalRow}>
              <span>Ödenecek Tutar</span>

              <strong>{formatCurrency(totals.grandTotal)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
