import type {
  InvoiceAdditionalInfo,
  InvoiceCurrency,
  InvoicePaymentInfo,
  InvoicePaymentMethod,
} from '../../../../models/invoice';

import styles from './InvoicePaymentPanel.module.scss';

interface InvoicePaymentPanelProps {
  issueDate: string;
  dueDate: string;

  total: number;
  currency: InvoiceCurrency;

  payment: InvoicePaymentInfo;

  additionalInfo: InvoiceAdditionalInfo;

  onDueDateChange: (value: string) => void;

  onPaymentChange: (payment: InvoicePaymentInfo) => void;

  onAdditionalInfoChange: (additionalInfo: InvoiceAdditionalInfo) => void;
}

export function InvoicePaymentPanel({
  issueDate,

  dueDate,

  total,

  currency,

  payment,

  additionalInfo,

  onDueDateChange,

  onPaymentChange,

  onAdditionalInfoChange,
}: InvoicePaymentPanelProps) {
  function updatePayment(changes: Partial<InvoicePaymentInfo>) {
    onPaymentChange({
      ...payment,
      ...changes,
    });
  }

  function updateAdditionalInfo(changes: Partial<InvoiceAdditionalInfo>) {
    onAdditionalInfoChange({
      ...additionalInfo,
      ...changes,
    });
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
    }).format(value);
  }

  const showBankFields = payment.method === 'bankTransfer';

  const collectedAmount = Math.max(0, payment.collectedAmount ?? 0);

  const remainingAmount = Math.max(0, total - collectedAmount);

  const collectionStatus =
    total <= 0 || collectedAmount <= 0
      ? 'Tahsilat bekleniyor'
      : collectedAmount >= total
        ? 'Tam tahsil edildi'
        : 'Kısmi tahsilat';

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Ödeme ve Fatura Notları</h2>

          <p>Vade, tahsilat ve faturada gösterilecek açıklamaları yönetin.</p>
        </div>

        <span className={styles.badge}>Fatura Detayları</span>
      </div>

      <div className={styles.content}>
        <div className={styles.notesPanel}>
          <div className={styles.panelTitle}>
            <div className={styles.iconBox}>N</div>

            <div>
              <strong>Fatura Notları</strong>

              <span>Müşteriye gösterilecek ve dahili açıklamalar</span>
            </div>
          </div>

          <label className={styles.field}>
            <span>Faturada Görünecek Not</span>

            <textarea
              rows={5}
              value={additionalInfo.note}
              placeholder="Örn: Ödemenizi belirtilen IBAN hesabına gerçekleştirmenizi rica ederiz."
              onChange={(event) =>
                updateAdditionalInfo({
                  note: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Dahili / Özel Not</span>

            <textarea
              rows={3}
              value={additionalInfo.privateNote}
              placeholder="Bu alan yalnızca şirket içi kullanım içindir."
              onChange={(event) =>
                updateAdditionalInfo({
                  privateNote: event.target.value,
                })
              }
            />

            <small>Bu açıklama müşteriye gösterilmez.</small>
          </label>
        </div>

        <div className={styles.paymentPanel}>
          <div className={styles.panelTitle}>
            <div className={styles.iconBox}>₺</div>

            <div>
              <strong>Ödeme / Tahsilat Bilgileri</strong>

              <span>Vade, tahsilat ve banka bilgileri</span>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Ödeme Şekli</span>

              <select
                value={payment.method}
                onChange={(event) =>
                  updatePayment({
                    method: event.target.value as InvoicePaymentMethod,
                  })
                }
              >
                <option value="cash">Nakit</option>

                <option value="bankTransfer">Havale / EFT</option>

                <option value="creditCard">Kredi Kartı</option>

                <option value="other">Diğer</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Vade Tarihi</span>

              <input
                type="date"
                value={dueDate}
                min={issueDate}
                onChange={(event) => onDueDateChange(event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Tahsil Edilen Tutar ({currency})</span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={payment.collectedAmount ?? 0}
                onChange={(event) =>
                  updatePayment({
                    collectedAmount: Math.max(0, Number(event.target.value)),
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>Tahsilat Tarihi</span>

              <input
                type="date"
                value={payment.collectionDate ?? ''}
                onChange={(event) =>
                  updatePayment({
                    collectionDate: event.target.value,
                  })
                }
              />
            </label>

            {showBankFields ? (
              <>
                <label className={styles.field}>
                  <span>Banka</span>

                  <input
                    type="text"
                    value={payment.bankName}
                    placeholder="Örn: Ziraat Bankası"
                    onChange={(event) =>
                      updatePayment({
                        bankName: event.target.value,
                      })
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>Hesap Sahibi</span>

                  <input
                    type="text"
                    value={payment.accountName}
                    placeholder="Firma / hesap sahibi"
                    onChange={(event) =>
                      updatePayment({
                        accountName: event.target.value,
                      })
                    }
                  />
                </label>

                <label className={`${styles.field} ${styles.fullWidth}`}>
                  <span>IBAN</span>

                  <input
                    type="text"
                    value={payment.iban}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    onChange={(event) =>
                      updatePayment({
                        iban: event.target.value.toUpperCase(),
                      })
                    }
                  />
                </label>
              </>
            ) : null}

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Ödeme Açıklaması</span>

              <input
                type="text"
                value={payment.paymentDescription}
                placeholder="Örn: Fatura numarasını açıklama alanına yazınız."
                onChange={(event) =>
                  updatePayment({
                    paymentDescription: event.target.value,
                  })
                }
              />
            </label>
          </div>

          <div className={styles.paymentInfo}>
            <span className={styles.infoIcon} aria-hidden="true">
              i
            </span>

            <p>
              {collectionStatus} • Tahsil edilen: {formatMoney(collectedAmount)} • Kalan:{' '}
              {formatMoney(remainingAmount)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
