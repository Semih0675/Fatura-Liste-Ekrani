import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import type { Invoice, InvoiceSortConfig, InvoiceSortKey } from '../models/invoice';
import { formatDate, formatMoney } from '../utils/formatters';
import styles from './InvoiceTable.module.scss';

const cx = classNames.bind(styles);

interface InvoiceTableProps {
  invoices: Invoice[];
  sortConfig: InvoiceSortConfig;
  onSort: (key: InvoiceSortKey) => void;
  onInvoiceSelect: (invoice: Invoice) => void;
}

interface InvoiceColumn {
  key: InvoiceSortKey;
  label: string;
}

function getAriaSort(
  columnKey: InvoiceSortKey,
  sortConfig: InvoiceSortConfig,
): 'ascending' | 'descending' | 'none' {
  if (sortConfig.key !== columnKey) {
    return 'none';
  }

  return sortConfig.direction;
}

export function InvoiceTable({ invoices, sortConfig, onSort, onInvoiceSelect }: InvoiceTableProps) {
  const { t, i18n } = useTranslation();

  const locale = i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'tr-TR';

  const columns: InvoiceColumn[] = [
    {
      key: 'invoiceNumber',
      label: t('table.invoiceNumber'),
    },
    {
      key: 'customerName',
      label: t('table.customer'),
    },
    {
      key: 'issueDate',
      label: t('table.issueDate'),
    },
    {
      key: 'dueDate',
      label: t('table.dueDate'),
    },
    {
      key: 'amount',
      label: t('table.amount'),
    },
    {
      key: 'type',
      label: t('table.type'),
    },
    {
      key: 'status',
      label: t('table.status'),
    },
  ];

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>{t('table.title')}</h2>
          <p>{t('table.description')}</p>
        </div>

        <span className={styles.countBadge}>
          {t('table.rowCount', {
            count: invoices.length,
          })}
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>{t('table.caption')}</caption>

          <thead>
            <tr>
              {columns.map((column) => {
                const isActive = sortConfig.key === column.key;

                return (
                  <th key={column.key} scope="col" aria-sort={getAriaSort(column.key, sortConfig)}>
                    <button
                      className={styles.sortButton}
                      type="button"
                      onClick={() => onSort(column.key)}
                    >
                      <span>{column.label}</span>

                      <span
                        className={cx('sortIndicator', {
                          active: isActive,
                        })}
                        aria-hidden="true"
                      >
                        {isActive ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  </th>
                );
              })}

              <th scope="col">{t('table.action')}</th>
            </tr>
          </thead>

          <tbody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr key={invoice.id} onClick={() => onInvoiceSelect(invoice)}>
                  <td>
                    <strong className={styles.invoiceNumber}>{invoice.invoiceNumber}</strong>
                  </td>

                  <td>{invoice.customerName}</td>

                  <td>{formatDate(invoice.issueDate, locale)}</td>

                  <td>{formatDate(invoice.dueDate, locale)}</td>

                  <td className={styles.amount}>{formatMoney(invoice.amount, locale)}</td>

                  <td>
                    <span className={styles.type}>{t(`invoiceType.${invoice.type}`)}</span>
                  </td>

                  <td>
                    <span
                      className={cx('statusBadge', {
                        paid: invoice.status === 'paid',
                        pending: invoice.status === 'pending',
                        overdue: invoice.status === 'overdue',
                      })}
                    >
                      {t(`invoiceStatus.${invoice.status}`)}
                    </span>
                  </td>

                  <td>
                    <button
                      className={styles.detailButton}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onInvoiceSelect(invoice);
                      }}
                    >
                      {t('actions.details')}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={styles.emptyRow} colSpan={columns.length + 1}>
                  <strong>{t('table.emptyTitle')}</strong>
                  <span>{t('table.emptyDescription')}</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
