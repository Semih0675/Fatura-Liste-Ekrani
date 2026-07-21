import classNames from 'classnames/bind';
import type { Invoice, InvoiceStatus, InvoiceType } from '../models/invoice';
import { formatDate, formatMoney } from '../utils/formatters';
import styles from './InvoiceTable.module.scss';

const cx = classNames.bind(styles);

interface InvoiceTableProps {
  invoices: Invoice[];
}

const statusLabels: Record<InvoiceStatus, string> = {
  paid: 'Ödendi',
  pending: 'Bekliyor',
  overdue: 'Gecikmiş',
};

const typeLabels: Record<InvoiceType, string> = {
  sale: 'Satış',
  purchase: 'Alış',
};

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>Faturalar</h2>
          <p>Mock JSON kaynağından getirilen faturalar</p>
        </div>

        <span className={styles.countBadge}>{invoices.length} kayıt</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Mock verilerden oluşturulan fatura listesi</caption>

          <thead>
            <tr>
              <th scope="col">Fatura No</th>
              <th scope="col">Müşteri</th>
              <th scope="col">Düzenleme Tarihi</th>
              <th scope="col">Vade Tarihi</th>
              <th scope="col">Tutar</th>
              <th scope="col">Tip</th>
              <th scope="col">Durum</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>
                  <strong className={styles.invoiceNumber}>{invoice.invoiceNumber}</strong>
                </td>

                <td>{invoice.customerName}</td>
                <td>{formatDate(invoice.issueDate)}</td>
                <td>{formatDate(invoice.dueDate)}</td>
                <td className={styles.amount}>{formatMoney(invoice.amount)}</td>

                <td>
                  <span className={styles.type}>{typeLabels[invoice.type]}</span>
                </td>

                <td>
                  <span
                    className={cx('statusBadge', {
                      paid: invoice.status === 'paid',
                      pending: invoice.status === 'pending',
                      overdue: invoice.status === 'overdue',
                    })}
                  >
                    {statusLabels[invoice.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
