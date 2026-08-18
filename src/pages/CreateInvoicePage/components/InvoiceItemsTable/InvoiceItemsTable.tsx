import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useTranslation,
} from 'react-i18next';

import type {
  InvoiceCurrency,
  InvoiceItem,
  InvoiceItemType,
  InvoiceItemUnit,
} from '../../../../models/invoice';

import {
  useAppSelector,
} from '../../../../store/hooks';

import {
  calculateInvoiceLine,
} from '../../../../utils/invoiceCalculations';

import styles from './InvoiceItemsTable.module.scss';

interface InvoiceItemsTableProps {
  initialItems?: InvoiceItem[];

  initialAmount?: number;

  currency: InvoiceCurrency;

  onItemsChange?: (
    items: InvoiceItem[],
  ) => void;
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

const MANUAL_PRODUCT_ID =
  '__manual__';

function createEmptyRow(
  initialAmount = 0,
): InvoiceItemRow {
  return {
    id: crypto.randomUUID(),

    type: 'product',

    productId: '',

    productName: '',

    productCode: '',

    description: '',

    quantity: 1,

    unit: 'piece',

    unitPrice:
      initialAmount,

    discountRate: 0,

    vatRate: 20,
  };
}

export function InvoiceItemsTable({
  initialItems,

  initialAmount = 0,

  currency,

  onItemsChange,
}: InvoiceItemsTableProps) {
  const {
    t,
    i18n,
  } = useTranslation();

  const products =
    useAppSelector(
      (state) =>
        state.products.items,
    );

  const [
    rows,
    setRows,
  ] =
    useState<InvoiceItemRow[]>(
      () => {
        if (
          initialItems &&
          initialItems.length > 0
        ) {
          return initialItems.map(
            (item) => {
              const knownProduct =
                products.find(
                  (product) =>
                    product.id ===
                    item.productId,
                );

              const isManual =
                !knownProduct &&
                Boolean(
                  item.productName,
                );

              return {
                id: item.id,

                type: item.type,

                productId:
                  knownProduct?.id ??
                  (isManual
                    ? MANUAL_PRODUCT_ID
                    : ''),

                productName:
                  item.productName ??
                  '',

                productCode:
                  item.productCode ??
                  knownProduct?.code ??
                  '',

                description:
                  item.description,

                quantity:
                  item.quantity,

                unit: item.unit,

                unitPrice:
                  item.unitPrice,

                discountRate:
                  item.discountRate,

                vatRate:
                  item.vatRate,
              };
            },
          );
        }

        return [
          createEmptyRow(
            initialAmount,
          ),
        ];
      },
    );

  const locale =
    i18n.resolvedLanguage?.startsWith(
      'en',
    )
      ? 'en-US'
      : 'tr-TR';

  const invoiceItems =
    useMemo<InvoiceItem[]>(
      () =>
        rows.map((row) => {
          const amounts =
            calculateInvoiceLine(
              row,
            );

          const knownProduct =
            products.find(
              (product) =>
                product.id ===
                row.productId,
            );

          return {
            id: row.id,

            type: row.type,

            productId:
              row.productId ===
                MANUAL_PRODUCT_ID
                ? ''
                : row.productId,

            productName:
              row.productName ||
              knownProduct?.name ||
              '',

            productCode:
              row.productCode ||
              knownProduct?.code ||
              '',

            description:
              row.description,

            quantity:
              row.quantity,

            unit:
              row.unit,

            unitPrice:
              row.unitPrice,

            discountRate:
              row.discountRate,

            vatRate:
              row.vatRate,

            currency,

            lineTotal:
              amounts.lineTotal,
          };
        }),
      [
        currency,
        products,
        rows,
      ],
    );

  useEffect(() => {
    onItemsChange?.(
      invoiceItems,
    );
  }, [
    invoiceItems,
    onItemsChange,
  ]);

  function updateRow(
    id: string,

    changes:
      Partial<InvoiceItemRow>,
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
    if (
      productId ===
      MANUAL_PRODUCT_ID
    ) {
      updateRow(row.id, {
        productId:
          MANUAL_PRODUCT_ID,

        productName: '',

        productCode: '',

        description: '',
      });

      return;
    }

    const product =
      products.find(
        (item) =>
          item.id ===
          productId,
      );

    if (!product) {
      updateRow(row.id, {
        productId: '',

        productName: '',

        productCode: '',
      });

      return;
    }

    updateRow(row.id, {
      productId:
        product.id,

      productName:
        product.name,

      productCode:
        product.code,

      description:
        product.description,

      type:
        product.type,

      unit:
        product.unit,

      unitPrice:
        product.salePrice,

      vatRate:
        product.vatRate,
    });
  }

  function addRowAfter(
    id: string,
  ) {
    setRows((currentRows) => {
      const rowIndex =
        currentRows.findIndex(
          (row) =>
            row.id === id,
        );

      if (
        rowIndex === -1
      ) {
        return currentRows;
      }

      const nextRows = [
        ...currentRows,
      ];

      nextRows.splice(
        rowIndex + 1,
        0,
        createEmptyRow(),
      );

      return nextRows;
    });
  }

  function addRowToEnd() {
    setRows(
      (currentRows) => [
        ...currentRows,

        createEmptyRow(),
      ],
    );
  }

  function removeRow(
    id: string,
  ) {
    setRows((currentRows) => {
      if (
        currentRows.length ===
        1
      ) {
        return currentRows;
      }

      return currentRows.filter(
        (row) =>
          row.id !== id,
      );
    });
  }

  function formatCurrency(
    value: number,
  ) {
    return new Intl.NumberFormat(
      locale,
      {
        style: 'currency',

        currency,
      },
    ).format(value);
  }

  return (
    <section
      className={styles.section}
    >
      <div
        className={styles.header}
      >
        <div>
          <h2>
            {t(
              'invoiceItems.title',
              {
                defaultValue:
                  'Fatura Kalemleri',
              },
            )}
          </h2>

          <p>
            {t(
              'invoiceItems.description',
              {
                defaultValue:
                  'Faturaya ait ürün ve hizmetleri ekleyin.',
              },
            )}
          </p>
        </div>

        <div
          className={
            styles.headerActions
          }
        >
          <span
            className={
              styles.currencyHeaderBadge
            }
          >
            {currency}
          </span>

          <span
            className={
              styles.rowCount
            }
          >
            {rows.length} kalem
          </span>

          <button
            type="button"
            className={
              styles.addLineButton
            }
            onClick={
              addRowToEnd
            }
          >
            <span
              aria-hidden="true"
            >
              +
            </span>

            Kalem Ekle
          </button>
        </div>
      </div>

      <div
        className={
          styles.tableWrapper
        }
      >
        <table
          className={
            styles.table
          }
        >
          <thead>
            <tr>
              <th
                className={
                  styles.controlsHeader
                }
              >
                #
              </th>

              <th>Tür</th>

              <th>
                Mal / Hizmet
              </th>

              <th>Açıklama</th>

              <th>Miktar</th>

              <th>Birim</th>

              <th>
                Birim Fiyat
              </th>

              <th>Döviz</th>

              <th>Tutar</th>

              <th>İsk. %</th>

              <th>İskonto</th>

              <th>KDV %</th>

              <th>KDV</th>

              <th>
                Satır Toplamı
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map(
              (row, index) => {
                const amounts =
                  calculateInvoiceLine(
                    row,
                  );

                const knownProduct =
                  products.find(
                    (product) =>
                      product.id ===
                      row.productId,
                  );

                const isManualProduct =
                  row.productId ===
                  MANUAL_PRODUCT_ID;

                const currencyMismatch =
                  knownProduct &&
                  knownProduct.currency !==
                  currency;

                const isCritical =
                  knownProduct?.trackStock &&
                  knownProduct.stockQuantity !==
                  null &&
                  knownProduct.criticalStock !==
                  null &&
                  knownProduct.stockQuantity <=
                  knownProduct.criticalStock;

                return (
                  <tr
                    key={row.id}
                  >
                    <td
                      className={
                        styles.controlsCell
                      }
                    >
                      <div
                        className={
                          styles.rowControls
                        }
                      >
                        <span
                          className={
                            styles.rowNumber
                          }
                        >
                          {index +
                            1}
                        </span>

                        <button
                          type="button"
                          className={
                            styles.addButton
                          }
                          onClick={() =>
                            addRowAfter(
                              row.id,
                            )
                          }
                        >
                          +
                        </button>

                        <button
                          type="button"
                          className={
                            styles.removeButton
                          }
                          onClick={() =>
                            removeRow(
                              row.id,
                            )
                          }
                          disabled={
                            rows.length ===
                            1
                          }
                        >
                          −
                        </button>
                      </div>
                    </td>

                    <td>
                      <select
                        value={
                          row.type
                        }
                        onChange={(
                          event,
                        ) =>
                          updateRow(
                            row.id,
                            {
                              type:
                                event
                                  .target
                                  .value as InvoiceItemType,
                            },
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
                    </td>

                    <td>
                      <div
                        className={
                          styles.productEditor
                        }
                      >
                        <select
                          value={
                            knownProduct?.id ??
                            (isManualProduct
                              ? MANUAL_PRODUCT_ID
                              : '')
                          }
                          onChange={(
                            event,
                          ) =>
                            handleProductChange(
                              row,

                              event
                                .target
                                .value,
                            )
                          }
                        >
                          <option value="">
                            Mal / hizmet seç
                          </option>

                          {products.map(
                            (product) => (
                              <option
                                key={
                                  product.id
                                }
                                value={
                                  product.id
                                }
                                disabled={
                                  !product.isActive
                                }
                              >
                                [
                                {
                                  product.code
                                }
                                ]{' '}
                                {
                                  product.name
                                }
                                {!product.isActive
                                  ? ' (Pasif)'
                                  : ''}
                              </option>
                            ),
                          )}

                          <option
                            value={
                              MANUAL_PRODUCT_ID
                            }
                          >
                            + Serbest ürün /
                            hizmet
                          </option>
                        </select>

                        {isManualProduct ? (
                          <input
                            type="text"
                            value={
                              row.productName
                            }
                            placeholder="Ürün / hizmet adı"
                            onChange={(
                              event,
                            ) =>
                              updateRow(
                                row.id,
                                {
                                  productName:
                                    event
                                      .target
                                      .value,
                                },
                              )
                            }
                          />
                        ) : null}

                        {knownProduct ? (
                          <span
                            className={`${styles.productMeta} ${currencyMismatch
                                ? styles.productMetaWarning
                                : ''
                              }`}
                          >
                            Kod:{' '}
                            {
                              knownProduct.code
                            }

                            {' • '}

                            {knownProduct.trackStock
                              ? `Stok: ${knownProduct.stockQuantity ?? 0}`
                              : 'Hizmet'}

                            {isCritical
                              ? ' • Kritik stok'
                              : ''}

                            {' • Kart: '}

                            {
                              knownProduct.currency
                            }

                            {currencyMismatch
                              ? ` • Belge ${currency}`
                              : ''}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td>
                      <input
                        type="text"
                        value={
                          row.description
                        }
                        placeholder="Satır açıklaması"
                        onChange={(
                          event,
                        ) =>
                          updateRow(
                            row.id,
                            {
                              description:
                                event
                                  .target
                                  .value,
                            },
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={
                          row.quantity
                        }
                        onChange={(
                          event,
                        ) =>
                          updateRow(
                            row.id,
                            {
                              quantity:
                                Math.max(
                                  0,

                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                                ),
                            },
                          )
                        }
                      />
                    </td>

                    <td>
                      <select
                        value={
                          row.unit
                        }
                        onChange={(
                          event,
                        ) =>
                          updateRow(
                            row.id,
                            {
                              unit:
                                event
                                  .target
                                  .value as InvoiceItemUnit,
                            },
                          )
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
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          row.unitPrice
                        }
                        onChange={(
                          event,
                        ) =>
                          updateRow(
                            row.id,
                            {
                              unitPrice:
                                Math.max(
                                  0,

                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                                ),
                            },
                          )
                        }
                      />
                    </td>

                    <td
                      className={
                        styles.currencyCell
                      }
                    >
                      <span
                        className={
                          styles.currencyBadge
                        }
                      >
                        {currency}
                      </span>
                    </td>

                    <td
                      className={
                        styles.amountCell
                      }
                    >
                      {formatCurrency(
                        amounts.grossAmount,
                      )}
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={
                          row.discountRate
                        }
                        onChange={(
                          event,
                        ) =>
                          updateRow(
                            row.id,
                            {
                              discountRate:
                                Math.min(
                                  100,

                                  Math.max(
                                    0,

                                    Number(
                                      event
                                        .target
                                        .value,
                                    ),
                                  ),
                                ),
                            },
                          )
                        }
                      />
                    </td>

                    <td
                      className={
                        styles.amountCell
                      }
                    >
                      {formatCurrency(
                        amounts.discountAmount,
                      )}
                    </td>

                    <td>
                      <select
                        value={
                          row.vatRate
                        }
                        onChange={(
                          event,
                        ) =>
                          updateRow(
                            row.id,
                            {
                              vatRate:
                                Number(
                                  event
                                    .target
                                    .value,
                                ),
                            },
                          )
                        }
                      >
                        <option
                          value={0}
                        >
                          %0
                        </option>

                        <option
                          value={1}
                        >
                          %1
                        </option>

                        <option
                          value={10}
                        >
                          %10
                        </option>

                        <option
                          value={20}
                        >
                          %20
                        </option>
                      </select>
                    </td>

                    <td
                      className={
                        styles.amountCell
                      }
                    >
                      {formatCurrency(
                        amounts.vatAmount,
                      )}
                    </td>

                    <td
                      className={
                        styles.totalCell
                      }
                    >
                      {formatCurrency(
                        amounts.lineTotal,
                      )}
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}