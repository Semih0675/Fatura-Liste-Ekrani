import styles from './InvoiceActionBar.module.scss';

interface InvoiceActionBarProps {
  isSaving: boolean;
  savingMode: 'draft' | 'final' | null;

  invoiceNumber: string;
  customerName: string;

  total: number;
  currency?: string;

  onCancel: () => void;
  onPreview: () => void;
  onSaveDraft: () => void;
  onSave: () => void;
}

export function InvoiceActionBar({
  isSaving,
  savingMode,
  invoiceNumber,
  customerName,
  total,
  currency = 'TRY',
  onCancel,
  onPreview,
  onSaveDraft,
  onSave,
}: InvoiceActionBarProps) {
  function formatMoney(value: number) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
    }).format(value);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar}>
        <div className={styles.invoiceInfo}>
          <div className={styles.infoItem}>
            <span>Fatura No</span>

            <strong>{invoiceNumber || 'Henüz atanmadı'}</strong>
          </div>

          <div className={styles.divider} />

          <div className={styles.infoItem}>
            <span>Müşteri</span>

            <strong>{customerName || 'Müşteri seçilmedi'}</strong>
          </div>
        </div>

        <div className={styles.rightArea}>
          <div className={styles.total}>
            <span>Ödenecek Tutar</span>

            <strong>{formatMoney(total)}</strong>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={isSaving}
            >
              Vazgeç
            </button>

            <button
              type="button"
              className={styles.previewButton}
              onClick={onPreview}
              disabled={isSaving}
            >
              Önizle
            </button>

            <button
              type="button"
              className={styles.draftButton}
              onClick={onSaveDraft}
              disabled={isSaving}
            >
              {savingMode === 'draft' ? 'Taslak Kaydediliyor...' : 'Taslak Kaydet'}
            </button>

            <button
              type="button"
              className={styles.saveButton}
              onClick={onSave}
              disabled={isSaving}
            >
              {savingMode === 'final' ? 'Kaydediliyor...' : 'Faturayı Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
