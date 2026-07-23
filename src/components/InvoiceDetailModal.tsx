import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import type { Invoice } from '../models/invoice';
import { formatDate, formatMoney } from '../utils/formatters';
import styles from './InvoiceDetailModal.module.scss';

const cx = classNames.bind(styles);

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
  const { t, i18n } = useTranslation();

  const locale = i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'tr-TR';

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
              <p className={styles.eyebrow}>{t('modal.title')}</p>

              <h2 id="invoice-detail-title">{invoice.invoiceNumber}</h2>
            </div>

            <button
              className={styles.closeButton}
              type="button"
              onClick={onClose}
              aria-label={t('modal.closeAriaLabel')}
            >
              ×
            </button>
          </header>

          <div className={styles.amountSection}>
            <span>{t('modal.amount')}</span>

            <strong>{formatMoney(invoice.amount, locale)}</strong>
          </div>

          <div className={styles.detailsGrid}>
            <div className={cx('detailItem', 'wide')}>
              <span>{t('modal.customer')}</span>
              <strong>{invoice.customerName}</strong>
            </div>

            <div className={styles.detailItem}>
              <span>{t('modal.issueDate')}</span>

              <strong>{formatDate(invoice.issueDate, locale)}</strong>
            </div>

            <div className={styles.detailItem}>
              <span>{t('modal.dueDate')}</span>

              <strong>{formatDate(invoice.dueDate, locale)}</strong>
            </div>

            <div className={styles.detailItem}>
              <span>{t('modal.type')}</span>

              <strong>{t(`invoiceType.${invoice.type}`)}</strong>
            </div>

            <div className={styles.detailItem}>
              <span>{t('modal.status')}</span>

              <strong className={cx('statusBadge', invoice.status)}>
                {t(`invoiceStatus.${invoice.status}`)}
              </strong>
            </div>
          </div>

          <footer className={styles.footer}>
            <span>
              {t('modal.invoiceId', {
                id: invoice.id,
              })}
            </span>

            <button className={styles.closeFooterButton} type="button" onClick={onClose}>
              {t('actions.close')}
            </button>
          </footer>
        </>
      ) : null}
    </Modal>
  );
}
