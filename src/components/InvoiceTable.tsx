import classNames from 'classnames/bind';
import { invoiceStatusLabels, invoiceTypeLabels } from '../constants/invoiceLabels';
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

const columns: InvoiceColumn[] = [
  {
    key: 'invoiceNumber',
    label: 'Fatura No',
  },
  {
    key: 'customerName',
    label: 'Müşteri',
  },
  {
    key: 'issueDate',
    label: 'Düzenleme Tarihi',
  },
  {
    key: 'dueDate',
    label: 'Vade Tarihi',
  },
  {
    key: 'amount',
    label: 'Tutar',
  },
  {
    key: 'type',
    label: 'Tip',
  },
  {
    key: 'status',
    label: 'Durum',
  },
];

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
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>Faturalar</h2>
          <p>Kolon başlıklarına tıklayarak sıralayabilirsiniz.</p>
        </div>

        <span className={styles.countBadge}>{invoices.length} satır</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Sayfalanmış fatura listesi</caption>

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

              <th scope="col">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <strong className={styles.invoiceNumber}>{invoice.invoiceNumber}</strong>
                  </td>

                  <td>{invoice.customerName}</td>
                  <td>{formatDate(invoice.issueDate)}</td>
                  <td>{formatDate(invoice.dueDate)}</td>

                  <td className={styles.amount}>{formatMoney(invoice.amount)}</td>

                  <td>
                    <span className={styles.type}>{invoiceTypeLabels[invoice.type]}</span>
                  </td>

                  <td>
                    <span
                      className={cx('statusBadge', {
                        paid: invoice.status === 'paid',
                        pending: invoice.status === 'pending',
                        overdue: invoice.status === 'overdue',
                      })}
                    >
                      {invoiceStatusLabels[invoice.status]}
                    </span>
                  </td>

                  <td>
                    <button
                      className={styles.detailButton}
                      type="button"
                      onClick={() => onInvoiceSelect(invoice)}
                    >
                      Detay
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={styles.emptyRow} colSpan={columns.length + 1}>
                  <strong>Fatura bulunamadı</strong>
                  <span>Filtrelerinizi değiştirerek tekrar deneyin.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
