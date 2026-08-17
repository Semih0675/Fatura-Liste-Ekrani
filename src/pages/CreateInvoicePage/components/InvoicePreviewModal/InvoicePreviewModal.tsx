import { useEffect } from 'react';

import type {
  InvoiceAdditionalInfo,
  InvoiceCompany,
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

  company?: InvoiceCompany;

  document?: InvoiceDocument;

  items: InvoiceItem[];

  totals: InvoiceTotals;

  payment: InvoicePaymentInfo;

  additionalInfo: InvoiceAdditionalInfo;

  onClose: () => void;
}

const unitLabels: Record<InvoiceItem['unit'], string> = {
  piece: 'Adet',

  kg: 'Kg',

  meter: 'Metre',

  hour: 'Saat',
};

const invoiceTypeLabels: Record<InvoiceDocument['eType'], string> = {
  sale: 'Satış',

  return: 'İade',

  withholding: 'Tevkifat',

  exemption: 'İstisna',
};

const paymentMethodLabels: Record<InvoicePaymentInfo['method'], string> = {
  cash: 'Nakit',

  bankTransfer: 'Havale / EFT',

  creditCard: 'Kredi Kartı',

  other: 'Diğer',
};

export function InvoicePreviewModal({
  isOpen,

  invoiceNumber,

  issueDate,

  dueDate,

  customer,

  company,

  document,

  items,

  totals,

  payment,

  additionalInfo,

  onClose,
}: InvoicePreviewModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    const previousOverflow = documentGlobal().body.style.overflow;

    documentGlobal().body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      documentGlobal().body.style.overflow = previousOverflow;

      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const currency = document?.currency ?? 'TRY';

  const vatBreakdown = totals.vatBreakdown ?? [];

  const netSubtotal = totals.netSubtotal ?? totals.subtotal - totals.totalDiscount;

  const collectedAmount = Math.max(0, payment.collectedAmount ?? 0);

  const remainingAmount = Math.max(0, totals.grandTotal - collectedAmount);

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

  function handlePrint() {
    window.print();
  }

  const documentTitle = document?.scenario === 'eArchive' ? 'e-ARŞİV FATURA' : 'e-FATURA';

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Fatura Önizleme"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <span>FATURA ÖNİZLEME</span>

            <strong>{invoiceNumber || 'Fatura Numarası Bekleniyor'}</strong>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className={styles.printButton} onClick={handlePrint}>
              Yazdır / PDF
            </button>

            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Önizlemeyi kapat"
            >
              ×
            </button>
          </div>
        </div>

        <div className={styles.previewArea}>
          <article className={styles.invoice} id="invoice-print-area">
            <header className={styles.invoiceHeader}>
              <div className={styles.company}>
                <div className={styles.logo}>
                  {company?.logoUrl ? (
                    <img src={company.logoUrl} alt="Firma logosu" />
                  ) : (
                    <span>{company?.title?.trim()?.slice(0, 1).toUpperCase() || 'F'}</span>
                  )}
                </div>

                <div className={styles.companyText}>
                  <h1>{company?.title || 'Firma Ünvanı'}</h1>

                  <p>
                    {[company?.address, company?.district, company?.city, company?.country]
                      .filter(Boolean)
                      .join(' • ') || 'Firma adresi girilmedi'}
                  </p>

                  <p>
                    {company?.taxNumber ? `VKN: ${company.taxNumber}` : ''}

                    {company?.taxOffice ? ` • ${company.taxOffice}` : ''}
                  </p>

                  <p>
                    {[company?.phone, company?.email, company?.website].filter(Boolean).join(' • ')}
                  </p>
                </div>
              </div>

              <div className={styles.documentTitle}>
                <h2>{documentTitle}</h2>

                <strong>{invoiceNumber || '-'}</strong>

                <span>
                  {document?.scenario ?? 'eArchive'} • {currency}
                </span>
              </div>
            </header>

            <section className={styles.infoGrid}>
              <div className={styles.customerBox}>
                <span>SAYIN</span>

                <strong>{customer?.titleName || customer?.name || 'Müşteri seçilmedi'}</strong>

                {customer?.taxNumber ? <p>VKN/TCKN: {customer.taxNumber}</p> : null}

                {customer?.taxOfficeName ? <p>{customer.taxOfficeName}</p> : null}

                {customer?.phone ? <p>Tel: {customer.phone}</p> : null}

                {customer?.email ? <p>E-posta: {customer.email}</p> : null}

                {customer?.address ? (
                  <p>
                    {[
                      customer.address.neighborhood,

                      customer.address.avenue,

                      customer.address.street,

                      customer.address.buildingNumber
                        ? `No: ${customer.address.buildingNumber}`
                        : '',

                      customer.address.apartmentNumber
                        ? `Daire: ${customer.address.apartmentNumber}`
                        : '',

                      customer.address.district,

                      customer.address.city,

                      customer.address.country,
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

                  <strong>{document ? invoiceTypeLabels[document.eType] : 'Satış'}</strong>
                </div>

                <div>
                  <span>Para Birimi</span>

                  <strong>{currency}</strong>
                </div>

                <div>
                  <span>Ödeme Şekli</span>

                  <strong>{paymentMethodLabels[payment.method]}</strong>
                </div>

                {document?.ettn ? (
                  <div>
                    <span>ETTN</span>

                    <strong className={styles.ettnValue}>{document.ettn}</strong>
                  </div>
                ) : null}
              </div>
            </section>

            <div className={styles.itemsTableWrapper}>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>#</th>

                    <th>Kod</th>

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
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>

                        <td>{item.productCode || '-'}</td>

                        <td>{item.productName || '-'}</td>

                        <td>{item.description || '-'}</td>

                        <td>{item.quantity}</td>

                        <td>{unitLabels[item.unit]}</td>

                        <td>{formatMoney(item.unitPrice)}</td>

                        <td>%{item.discountRate}</td>

                        <td>%{item.vatRate}</td>

                        <td>{formatMoney(item.lineTotal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className={styles.emptyItems}>
                        Fatura kalemi eklenmedi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <section className={styles.bottomArea}>
              <div className={styles.notes}>
                {additionalInfo.note ? (
                  <div className={styles.noteBlock}>
                    <strong>Fatura Notu</strong>

                    <p>{additionalInfo.note}</p>
                  </div>
                ) : null}

                {document?.description ? (
                  <div className={styles.noteBlock}>
                    <strong>Belge Açıklaması</strong>

                    <p>{document.description}</p>
                  </div>
                ) : null}

                {payment.method === 'bankTransfer' && payment.iban ? (
                  <div className={styles.noteBlock}>
                    <strong>Ödeme Bilgisi</strong>

                    <p>{payment.bankName}</p>

                    <p>{payment.accountName}</p>

                    <p>IBAN: {payment.iban}</p>

                    {payment.paymentDescription ? <p>{payment.paymentDescription}</p> : null}
                  </div>
                ) : null}

                {company?.mersisNumber || company?.tradeRegistryNumber ? (
                  <div className={styles.noteBlock}>
                    <strong>Firma Sicil Bilgileri</strong>

                    {company?.mersisNumber ? <p>MERSİS: {company.mersisNumber}</p> : null}

                    {company?.tradeRegistryNumber ? (
                      <p>Ticaret Sicil No: {company.tradeRegistryNumber}</p>
                    ) : null}
                  </div>
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
                  <span>KDV Matrahı</span>

                  <strong>{formatMoney(netSubtotal)}</strong>
                </div>

                {vatBreakdown.map((vat) => (
                  <div key={vat.rate} className={styles.taxSummaryRow}>
                    <span>%{vat.rate} KDV Matrahı / KDV</span>

                    <strong>
                      {formatMoney(vat.taxableAmount)} / {formatMoney(vat.vatAmount)}
                    </strong>
                  </div>
                ))}

                <div>
                  <span>Toplam KDV</span>

                  <strong>{formatMoney(totals.totalVat)}</strong>
                </div>

                <div className={styles.grandTotal}>
                  <span>Ödenecek Tutar</span>

                  <strong>{formatMoney(totals.grandTotal)}</strong>
                </div>

                <div className={styles.collectionRow}>
                  <span>Tahsil Edilen</span>

                  <strong>{formatMoney(collectedAmount)}</strong>
                </div>

                <div className={styles.collectionRow}>
                  <span>Kalan Tutar</span>

                  <strong>{formatMoney(remainingAmount)}</strong>
                </div>
              </div>
            </section>

            <footer className={styles.invoiceFooter}>
              <span>Bu belge elektronik fatura önizlemesidir.</span>

              <strong>{invoiceNumber || '-'}</strong>
            </footer>
          </article>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" onClick={handlePrint} className={styles.footerPrintButton}>
            Yazdır / PDF Olarak Kaydet
          </button>

          <button type="button" onClick={onClose}>
            Önizlemeyi Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

function documentGlobal(): Document {
  return window.document;
}
