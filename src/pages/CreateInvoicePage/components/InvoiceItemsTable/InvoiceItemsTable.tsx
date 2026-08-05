import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './InvoiceItemsTable.module.scss';

type ItemType = 'product' | 'service';
type ItemUnit = 'piece' | 'kg' | 'meter' | 'hour';
type Currency = 'TRY' | 'USD' | 'EUR';

interface InvoiceItemsTableProps {
  initialAmount?: number;
}

interface InvoiceItemRow {
  id: string;
  type: ItemType;
  productId: string;
  description: string;
  quantity: number;
  unit: ItemUnit;
  unitPrice: number;
  discountRate: number;
  vatRate: number;
  currency: Currency;
}

const products = [
  { id: 'product-1', name: '3D Baskı Ürünü' },
  { id: 'product-2', name: 'Filament' },
  { id: 'product-3', name: 'Tasarım Hizmeti' },
  { id: 'product-4', name: 'Kargo Hizmeti' },
];

function createEmptyRow(initialAmount = 0): InvoiceItemRow {
  return {
    id: crypto.randomUUID(),
    type: 'product',
    productId: '',
    description: '',
    quantity: 1,
    unit: 'piece',
    unitPrice: initialAmount,
    discountRate: 0,
    vatRate: 0,
    currency: 'TRY',
  };
}

function calculateRowTotal(row: InvoiceItemRow) {
  const grossAmount = row.quantity * row.unitPrice;

  const discountAmount = grossAmount * (row.discountRate / 100);

  const discountedAmount = grossAmount - discountAmount;

  const vatAmount = discountedAmount * (row.vatRate / 100);

  return discountedAmount + vatAmount;
}
export function InvoiceItemsTable({ initialAmount = 0 }: InvoiceItemsTableProps) {
  const { t, i18n } = useTranslation();

  const [rows, setRows] = useState<InvoiceItemRow[]>(() => [createEmptyRow(initialAmount)]);
  const locale = i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'tr-TR';

  const totalsByCurrency = useMemo(() => {
    return rows.reduce<Record<Currency, number>>(
      (totals, row) => {
        totals[row.currency] += calculateRowTotal(row);
        return totals;
      },
      {
        TRY: 0,
        USD: 0,
        EUR: 0,
      },
    );
  }, [rows]);

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

  function addRowAfter(id: string) {
    setRows((currentRows) => {
      const rowIndex = currentRows.findIndex((row) => row.id === id);

      const nextRows = [...currentRows];

      nextRows.splice(rowIndex + 1, 0, createEmptyRow());

      return nextRows;
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

  const visibleTotals = (Object.entries(totalsByCurrency) as [Currency, number][]).filter(
    ([, amount]) => amount > 0,
  );

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2>{t('invoiceItems.title')}</h2>
          <p>{t('invoiceItems.description')}</p>
        </div>

        <span className={styles.rowCount}>
          {t('invoiceItems.rowCount', {
            count: rows.length,
          })}
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table} aria-label={t('invoiceItems.title')}>
          <thead>
            <tr>
              <th className={styles.controlsHeader}>#</th>

              <th>{t('invoiceItems.type')}</th>
              <th>{t('invoiceItems.product')}</th>
              <th>{t('invoiceItems.descriptionColumn')}</th>
              <th>{t('invoiceItems.quantity')}</th>
              <th>{t('invoiceItems.unit')}</th>
              <th>{t('invoiceItems.unitPrice')}</th>
              <th>{t('invoiceItems.currency')}</th>
              <th>{t('invoiceItems.discount')}</th>
              <th>{t('invoiceItems.vat')}</th>
              <th>{t('invoiceItems.lineTotal')}</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className={styles.controlsCell}>
                  <div className={styles.rowControls}>
                    <span className={styles.rowNumber}>{index + 1}</span>

                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={() => addRowAfter(row.id)}
                      aria-label={t('invoiceItems.addRow')}
                      title={t('invoiceItems.addRow')}
                    >
                      +
                    </button>

                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      aria-label={t('invoiceItems.removeRow')}
                      title={t('invoiceItems.removeRow')}
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
                    <option value="product">{t('invoiceItems.productType')}</option>

                    <option value="service">{t('invoiceItems.serviceType')}</option>
                  </select>
                </td>

                <td>
                  <select
                    value={row.productId}
                    onChange={(event) =>
                      updateRow(row.id, {
                        productId: event.target.value,
                      })
                    }
                  >
                    <option value="">{t('invoiceItems.selectProduct')}</option>

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
                    placeholder={t('invoiceItems.descriptionPlaceholder')}
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
                    min="0"
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
                    <option value="piece">{t('invoiceItems.piece')}</option>

                    <option value="kg">{t('invoiceItems.kilogram')}</option>

                    <option value="meter">{t('invoiceItems.meter')}</option>

                    <option value="hour">{t('invoiceItems.hour')}</option>
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

                <td className={styles.totalCell}>
                  {formatCurrency(calculateRowTotal(row), row.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <span>{t('invoiceItems.generalTotal')}</span>

        <div className={styles.totals}>
          {visibleTotals.length > 0 ? (
            visibleTotals.map(([currency, amount]) => (
              <strong key={currency}>{formatCurrency(amount, currency)}</strong>
            ))
          ) : (
            <strong>{formatCurrency(0, 'TRY')}</strong>
          )}
        </div>
      </div>
    </section>
  );
}
