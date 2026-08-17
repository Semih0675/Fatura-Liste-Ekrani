import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { InvoiceItem } from '../../../../models/invoice';

import styles from './InvoiceItemsTable.module.scss';

type ItemType = 'product' | 'service';
type ItemUnit = 'piece' | 'kg' | 'meter' | 'hour';
type Currency = 'TRY' | 'USD' | 'EUR';

interface InvoiceItemsTableProps {
  initialItems?: InvoiceItem[];
  initialAmount?: number;
  onItemsChange?: (items: InvoiceItem[]) => void;
}

interface InvoiceItemRow {
  id: string;
  type: ItemType;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unit: ItemUnit;
  unitPrice: number;
  discountRate: number;
  vatRate: number;
  currency: Currency;
}

interface RowAmounts {
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  vatAmount: number;
  lineTotal: number;
}

interface CurrencyTotals {
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  vatAmount: number;
  grandTotal: number;
}

const products = [
  {
    id: 'product-1',
    name: '3D Baskı Ürünü',
  },
  {
    id: 'product-2',
    name: 'Filament',
  },
  {
    id: 'product-3',
    name: 'Tasarım Hizmeti',
  },
  {
    id: 'product-4',
    name: 'Kargo Hizmeti',
  },
];

function createEmptyRow(initialAmount = 0): InvoiceItemRow {
  return {
    id: crypto.randomUUID(),
    type: 'product',
    productId: '',
    productName: '',
    description: '',
    quantity: 1,
    unit: 'piece',
    unitPrice: initialAmount,
    discountRate: 0,
    vatRate: 20,
    currency: 'TRY',
  };
}

function createRowFromInvoiceItem(item: InvoiceItem): InvoiceItemRow {
  return {
    id: item.id,
    type: item.type,
    productId: item.productId,
    productName: item.productName ?? '',
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: item.unitPrice,
    discountRate: item.discountRate,
    vatRate: item.vatRate,
    currency: item.currency,
  };
}

function calculateRowAmounts(row: InvoiceItemRow): RowAmounts {
  const grossAmount = row.quantity * row.unitPrice;

  const discountAmount = grossAmount * (row.discountRate / 100);

  const netAmount = grossAmount - discountAmount;

  const vatAmount = netAmount * (row.vatRate / 100);

  const lineTotal = netAmount + vatAmount;

  return {
    grossAmount,
    discountAmount,
    netAmount,
    vatAmount,
    lineTotal,
  };
}

function createEmptyCurrencyTotals(): Record<Currency, CurrencyTotals> {
  return {
    TRY: {
      grossAmount: 0,
      discountAmount: 0,
      netAmount: 0,
      vatAmount: 0,
      grandTotal: 0,
    },

    USD: {
      grossAmount: 0,
      discountAmount: 0,
      netAmount: 0,
      vatAmount: 0,
      grandTotal: 0,
    },

    EUR: {
      grossAmount: 0,
      discountAmount: 0,
      netAmount: 0,
      vatAmount: 0,
      grandTotal: 0,
    },
  };
}

export function InvoiceItemsTable({
  initialItems,
  initialAmount = 0,
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

  /*
   * Parent component her zaman güncel
   * fatura kalemlerini alır.
   */
  useEffect(() => {
    const invoiceItems: InvoiceItem[] = rows.map((row) => {
      const product = products.find((item) => item.id === row.productId);

      const amounts = calculateRowAmounts(row);

      return {
        id: row.id,
        type: row.type,
        productId: row.productId,

        productName: row.productName || product?.name || '',

        description: row.description,

        quantity: row.quantity,
        unit: row.unit,
        unitPrice: row.unitPrice,

        discountRate: row.discountRate,

        vatRate: row.vatRate,

        currency: row.currency,

        lineTotal: amounts.lineTotal,
      };
    });

    onItemsChange?.(invoiceItems);
  }, [rows, onItemsChange]);

  const totalsByCurrency = useMemo(() => {
    const totals = createEmptyCurrencyTotals();

    rows.forEach((row) => {
      const amounts = calculateRowAmounts(row);

      const currencyTotal = totals[row.currency];

      currencyTotal.grossAmount += amounts.grossAmount;

      currencyTotal.discountAmount += amounts.discountAmount;

      currencyTotal.netAmount += amounts.netAmount;

      currencyTotal.vatAmount += amounts.vatAmount;

      currencyTotal.grandTotal += amounts.lineTotal;
    });

    return totals;
  }, [rows]);

  const visibleCurrencies = (
    Object.entries(totalsByCurrency) as [Currency, CurrencyTotals][]
  ).filter(([, totals]) => totals.grossAmount > 0 || totals.grandTotal > 0);

  function updateRow(id: string, changes: Partial<InvoiceItemRow>) {
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

  function handleProductChange(row: InvoiceItemRow, productId: string) {
    const product = products.find((item) => item.id === productId);

    updateRow(row.id, {
      productId,

      productName: product?.name ?? '',

      description: row.description || product?.name || '',
    });
  }

  function addRowAfter(id: string) {
    setRows((currentRows) => {
      const rowIndex = currentRows.findIndex((row) => row.id === id);

      if (rowIndex === -1) {
        return currentRows;
      }

      const currentRow = currentRows[rowIndex];

      const nextRow = createEmptyRow();

      /*
       * Yeni satır önceki satırın
       * para birimini devam ettirsin.
       */
      nextRow.currency = currentRow.currency;

      const nextRows = [...currentRows];

      nextRows.splice(rowIndex + 1, 0, nextRow);

      return nextRows;
    });
  }

  function addRowToEnd() {
    setRows((currentRows) => {
      const nextRow = createEmptyRow();

      const lastRow = currentRows[currentRows.length - 1];

      if (lastRow) {
        nextRow.currency = lastRow.currency;
      }

      return [...currentRows, nextRow];
    });
  }

  function removeRow(id: string) {
    setRows((currentRows) => {
      if (currentRows.length === 1) {
        return currentRows;
      }

      return currentRows.filter((row) => row.id !== id);
    });
  }

  function formatCurrency(value: number, currency: Currency) {
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
              const amounts = calculateRowAmounts(row);

              const knownProduct = products.find((product) => product.id === row.productId);

              return (
                <tr key={row.id}>
                  <td className={styles.controlsCell}>
                    <div className={styles.rowControls}>
                      <span className={styles.rowNumber}>{index + 1}</span>

                      <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => addRowAfter(row.id)}
                        aria-label={t('invoiceItems.addRow', {
                          defaultValue: 'Altına satır ekle',
                        })}
                        title={t('invoiceItems.addRow', {
                          defaultValue: 'Altına satır ekle',
                        })}
                      >
                        +
                      </button>

                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1}
                        aria-label={t('invoiceItems.removeRow', {
                          defaultValue: 'Satırı sil',
                        })}
                        title={t('invoiceItems.removeRow', {
                          defaultValue: 'Satırı sil',
                        })}
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
                          type: event.target.value as ItemType,
                        })
                      }
                    >
                      <option value="product">
                        {t('invoiceItems.productType', {
                          defaultValue: 'Ürün',
                        })}
                      </option>

                      <option value="service">
                        {t('invoiceItems.serviceType', {
                          defaultValue: 'Hizmet',
                        })}
                      </option>
                    </select>
                  </td>

                  <td>
                    <select
                      value={row.productId}
                      onChange={(event) => handleProductChange(row, event.target.value)}
                    >
                      <option value="">
                        {t('invoiceItems.selectProduct', {
                          defaultValue: 'Mal / hizmet seç',
                        })}
                      </option>

                      {row.productId && !knownProduct ? (
                        <option value={row.productId}>{row.productName || row.productId}</option>
                      ) : null}

                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      type="text"
                      value={row.description}
                      placeholder={t('invoiceItems.descriptionPlaceholder', {
                        defaultValue: 'Satır açıklaması',
                      })}
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
                          unit: event.target.value as ItemUnit,
                        })
                      }
                    >
                      <option value="piece">
                        {t('invoiceItems.piece', {
                          defaultValue: 'Adet',
                        })}
                      </option>

                      <option value="kg">
                        {t('invoiceItems.kilogram', {
                          defaultValue: 'Kg',
                        })}
                      </option>

                      <option value="meter">
                        {t('invoiceItems.meter', {
                          defaultValue: 'Metre',
                        })}
                      </option>

                      <option value="hour">
                        {t('invoiceItems.hour', {
                          defaultValue: 'Saat',
                        })}
                      </option>
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

                  <td>
                    <select
                      value={row.currency}
                      onChange={(event) =>
                        updateRow(row.id, {
                          currency: event.target.value as Currency,
                        })
                      }
                    >
                      <option value="TRY">TRY</option>

                      <option value="USD">USD</option>

                      <option value="EUR">EUR</option>
                    </select>
                  </td>

                  <td className={styles.amountCell}>
                    {formatCurrency(amounts.grossAmount, row.currency)}
                  </td>

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

                  <td className={styles.amountCell}>
                    {formatCurrency(amounts.discountAmount, row.currency)}
                  </td>

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

                  <td className={styles.amountCell}>
                    {formatCurrency(amounts.vatAmount, row.currency)}
                  </td>

                  <td className={styles.totalCell}>
                    {formatCurrency(amounts.lineTotal, row.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerInformation}>
          <strong>
            {t('invoiceItems.summaryTitle', {
              defaultValue: 'Fatura Özeti',
            })}
          </strong>

          <span>{rows.length} kalem</span>
        </div>

        <div className={styles.summaryContainer}>
          {visibleCurrencies.length > 0 ? (
            visibleCurrencies.map(([currency, totals]) => (
              <div key={currency} className={styles.currencySummary}>
                <div className={styles.summaryRow}>
                  <span>Mal / Hizmet Toplamı</span>

                  <strong>{formatCurrency(totals.grossAmount, currency)}</strong>
                </div>

                <div className={styles.summaryRow}>
                  <span>Toplam İskonto</span>

                  <strong>-{formatCurrency(totals.discountAmount, currency)}</strong>
                </div>

                <div className={styles.summaryRow}>
                  <span>KDV Matrahı</span>

                  <strong>{formatCurrency(totals.netAmount, currency)}</strong>
                </div>

                <div className={styles.summaryRow}>
                  <span>Hesaplanan KDV</span>

                  <strong>{formatCurrency(totals.vatAmount, currency)}</strong>
                </div>

                <div className={styles.grandTotalRow}>
                  <span>Ödenecek Tutar</span>

                  <strong>{formatCurrency(totals.grandTotal, currency)}</strong>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.currencySummary}>
              <div className={styles.grandTotalRow}>
                <span>Ödenecek Tutar</span>

                <strong>{formatCurrency(0, 'TRY')}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
