import styles from './InvoiceToolbar.module.scss';

interface InvoiceToolbarProps {
  searchTerm: string;
  resultCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
}

export function InvoiceToolbar({
  searchTerm,
  resultCount,
  totalCount,
  onSearchChange,
}: InvoiceToolbarProps) {
  return (
    <section className={styles.toolbar} aria-label="Fatura arama araçları">
      <div className={styles.searchGroup}>
        <label htmlFor="invoice-search">Faturalarda ara</label>

        <div className={styles.inputRow}>
          <input
            id="invoice-search"
            className={styles.input}
            type="search"
            value={searchTerm}
            placeholder="Fatura no, müşteri, durum veya tutar..."
            onChange={(event) => onSearchChange(event.target.value)}
          />

          {searchTerm && (
            <button className={styles.clearButton} type="button" onClick={() => onSearchChange('')}>
              Temizle
            </button>
          )}
        </div>
      </div>

      <p className={styles.resultCount} aria-live="polite">
        <strong>{resultCount}</strong> / {totalCount} kayıt
      </p>
    </section>
  );
}
