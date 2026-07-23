import styles from './EmptyInvoiceState.module.scss';

export function EmptyInvoiceState() {
  return (
    <section className={styles.container}>
      <div className={styles.icon} aria-hidden="true">
        0
      </div>

      <h2>Henüz fatura bulunmuyor</h2>

      <p>API başarıyla yanıt verdi ancak görüntülenecek bir fatura kaydı bulunamadı.</p>
    </section>
  );
}
