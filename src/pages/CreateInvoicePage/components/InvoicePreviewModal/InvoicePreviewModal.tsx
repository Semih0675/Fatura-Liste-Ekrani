import type {
  InvoiceAdditionalInfo,
  InvoiceCustomer,
  InvoiceDocument,
  InvoiceItem,
  InvoicePaymentInfo,
  InvoiceTotals,
} from '../../../../models/invoice';

import styles from './InvoicePreviewModal.module.scss';

interface InvoicePreviewModalProps {
  isOpen: boolean;

  invoiceNumber: string;

  issueDate: string;
  dueDate: string;

  customer?: InvoiceCustomer;
  document?: InvoiceDocument;

  items: InvoiceItem[];

  totals: InvoiceTotals;

  payment: InvoicePaymentInfo;

  additionalInfo: InvoiceAdditionalInfo;

  onClose: () => void;
}

export function InvoicePreviewModal({
  isOpen,
  invoiceNumber,
  issueDate,
  dueDate,
  customer,
  document,
  items,
  totals,
  payment,
  additionalInfo,
  onClose,
}: InvoicePreviewModalProps) {
  if (!isOpen) {
    return null;
  }

  const currency = document?.currency ?? 'TRY';

  function formatMoney(value: number) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
    }).format(value);
  }

  function formatDate(value: string) {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('tr-TR').format(date);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Fatura Önizleme">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <span>FATURA ÖNİZLEME</span>

            <strong>{invoiceNumber || 'Fatura Numarası Bekleniyor'}</strong>
          </div>

          <button type="button" onClick={onClose} aria-label="Önizlemeyi kapat">
            ×
          </button>
        </div>

        <div className={styles.previewArea}>
          <article className={styles.invoice}>
            <header className={styles.invoiceHeader}>
              <div className={styles.company}>
                <div className={styles.logo}>P</div>

                <div>
                  <h1>PreAccounting</h1>

                  <p>Elektronik Fatura</p>
                </div>
              </div>

              <div className={styles.documentTitle}>
                <h2>{document?.scenario === 'eArchive' ? 'e-ARŞİV FATURA' : 'e-FATURA'}</h2>

                <span>{invoiceNumber || '-'}</span>
              </div>
            </header>

            <section className={styles.infoGrid}>
              <div className={styles.customerBox}>
                <span>SAYIN</span>

                <strong>{customer?.titleName || customer?.name || 'Müşteri seçilmedi'}</strong>

                {customer?.taxNumber ? <p>VKN/TCKN: {customer.taxNumber}</p> : null}

                {customer?.taxOfficeName ? <p>{customer.taxOfficeName}</p> : null}

                {customer?.address ? (
                  <p>
                    {[
                      customer.address.neighborhood,

                      customer.address.avenue,

                      customer.address.street,

                      customer.address.buildingNumber
                        ? `No: ${customer.address.buildingNumber}`
                        : '',

                      customer.address.district,

                      customer.address.city,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                ) : null}
              </div>

              <div className={styles.documentInfo}>
                <div>
                  <span>Fatura Tarihi</span>

                  <strong>{formatDate(issueDate)}</strong>
                </div>

                <div>
                  <span>Vade Tarihi</span>

                  <strong>{formatDate(dueDate)}</strong>
                </div>

                <div>
                  <span>Fatura Tipi</span>

                  <strong>{document?.eType ?? 'sale'}</strong>
                </div>

                <div>
                  <span>Para Birimi</span>

                  <strong>{currency}</strong>
                </div>
              </div>
            </section>

            <div className={styles.itemsTableWrapper}>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Mal / Hizmet</th>
                    <th>Açıklama</th>
                    <th>Miktar</th>
                    <th>Birim</th>
                    <th>Birim Fiyat</th>
                    <th>İsk. %</th>
                    <th>KDV %</th>
                    <th>Toplam</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>

                      <td>{item.productName || '-'}</td>

                      <td>{item.description || '-'}</td>

                      <td>{item.quantity}</td>

                      <td>{item.unit}</td>

                      <td>{formatMoney(item.unitPrice)}</td>

                      <td>%{item.discountRate}</td>

                      <td>%{item.vatRate}</td>

                      <td>{formatMoney(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <section className={styles.bottomArea}>
              <div className={styles.notes}>
                {additionalInfo.note ? (
                  <>
                    <strong>Fatura Notu</strong>

                    <p>{additionalInfo.note}</p>
                  </>
                ) : null}

                {payment.method === 'bankTransfer' && payment.iban ? (
                  <>
                    <strong>Ödeme Bilgisi</strong>

                    <p>{payment.bankName}</p>

                    <p>{payment.accountName}</p>

                    <p>IBAN: {payment.iban}</p>
                  </>
                ) : null}
              </div>

              <div className={styles.totals}>
                <div>
                  <span>Mal / Hizmet Toplamı</span>

                  <strong>{formatMoney(totals.subtotal)}</strong>
                </div>

                <div>
                  <span>Toplam İskonto</span>

                  <strong>-{formatMoney(totals.totalDiscount)}</strong>
                </div>

                <div>
                  <span>Hesaplanan KDV</span>

                  <strong>{formatMoney(totals.totalVat)}</strong>
                </div>

                <div className={styles.grandTotal}>
                  <span>Ödenecek Tutar</span>

                  <strong>{formatMoney(totals.grandTotal)}</strong>
                </div>
              </div>
            </section>
          </article>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose}>
            Önizlemeyi Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
