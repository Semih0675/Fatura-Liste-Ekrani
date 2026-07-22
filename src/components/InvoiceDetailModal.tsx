import classNames from 'classnames/bind';
import Modal from 'react-modal';
import { invoiceStatusLabels, invoiceTypeLabels } from '../constants/invoiceLabels';
import type { Invoice } from '../models/invoice';
import { formatDate, formatMoney } from '../utils/formatters';
import styles from './InvoiceDetailModal.module.scss';

const cx = classNames.bind(styles);

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
  return (
    <Modal
      isOpen={invoice !== null}
      className={styles.modal}
      overlayClassName={styles.overlay}
      onRequestClose={onClose}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      role="dialog"
      aria={{
        labelledby: 'invoice-detail-title',
      }}
    >
      {invoice ? (
        <>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Fatura detayı</p>

              <h2 id="invoice-detail-title">{invoice.invoiceNumber}</h2>
            </div>

            <button
              className={styles.closeButton}
              type="button"
              onClick={onClose}
              aria-label="Fatura detay penceresini kapat"
            >
              ×
            </button>
          </header>

          <div className={styles.amountSection}>
            <span>Fatura tutarı</span>
            <strong>{formatMoney(invoice.amount)}</strong>
          </div>

          <div className={styles.detailsGrid}>
            <div className={cx('detailItem', 'wide')}>
              <span>Müşteri</span>
              <strong>{invoice.customerName}</strong>
            </div>

            <div className={styles.detailItem}>
              <span>Düzenleme tarihi</span>
              <strong>{formatDate(invoice.issueDate)}</strong>
            </div>

            <div className={styles.detailItem}>
              <span>Vade tarihi</span>
              <strong>{formatDate(invoice.dueDate)}</strong>
            </div>

            <div className={styles.detailItem}>
              <span>Fatura tipi</span>
              <strong>{invoiceTypeLabels[invoice.type]}</strong>
            </div>

            <div className={styles.detailItem}>
              <span>Durum</span>

              <strong className={cx('statusBadge', invoice.status)}>
                {invoiceStatusLabels[invoice.status]}
              </strong>
            </div>
          </div>

          <footer className={styles.footer}>
            <span>Fatura ID: {invoice.id}</span>

            <button className={styles.closeFooterButton} type="button" onClick={onClose}>
              Kapat
            </button>
          </footer>
        </>
      ) : null}
    </Modal>
  );
}
