import type { InvoiceCurrency, InvoiceTotals } from '../../../../models/invoice';

import styles from './InvoiceLiveSummary.module.scss';

interface InvoiceLiveSummaryProps {
  totals: InvoiceTotals;
  currency: InvoiceCurrency;
  itemCount: number;
  dueDate: string;
  collectedAmount: number;
}

export function InvoiceLiveSummary({
  totals,
  currency,
  itemCount,
  dueDate,
  collectedAmount,
}: InvoiceLiveSummaryProps) {
  const netSubtotal = totals.netSubtotal ?? totals.subtotal - totals.totalDiscount;

  const remainingAmount = Math.max(0, totals.grandTotal - collectedAmount);

  const vatBreakdown = totals.vatBreakdown ?? [];

  function formatMoney(value: number) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
    }).format(value);
  }

  const paymentStatus =
    totals.grandTotal <= 0 || collectedAmount <= 0
      ? 'Tahsilat Bekleniyor'
      : collectedAmount >= totals.grandTotal
        ? 'Tahsil Edildi'
        : 'Kısmi Tahsilat';

  return (
    <aside className={styles.card} aria-label="Canlı fatura özeti">
      <div className={styles.header}>
        <div>
          <span>CANLI ÖZET</span>

          <h2>Fatura Özeti</h2>
        </div>

        <strong className={styles.currencyBadge}>{currency}</strong>
      </div>

      <div className={styles.metaRow}>
        <span>{itemCount} kalem</span>

        <span>{dueDate ? `Vade: ${dueDate}` : 'Vade seçilmedi'}</span>
      </div>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span>Mal / Hizmet Toplamı</span>

          <strong>{formatMoney(totals.subtotal)}</strong>
        </div>

        <div className={styles.row}>
          <span>Toplam İskonto</span>

          <strong>-{formatMoney(totals.totalDiscount)}</strong>
        </div>

        <div className={styles.row}>
          <span>KDV Matrahı</span>

          <strong>{formatMoney(netSubtotal)}</strong>
        </div>

        {vatBreakdown.map((vat) => (
          <div className={styles.taxGroup} key={vat.rate}>
            <div className={styles.row}>
              <span>%{vat.rate} KDV Matrahı</span>

              <strong>{formatMoney(vat.taxableAmount)}</strong>
            </div>

            <div className={styles.row}>
              <span>%{vat.rate} Hesaplanan KDV</span>

              <strong>{formatMoney(vat.vatAmount)}</strong>
            </div>
          </div>
        ))}

        <div className={styles.row}>
          <span>Toplam KDV</span>

          <strong>{formatMoney(totals.totalVat)}</strong>
        </div>
      </div>

      <div className={styles.grandTotal}>
        <span>Ödenecek Tutar</span>

        <strong>{formatMoney(totals.grandTotal)}</strong>
      </div>

      <div className={styles.collection}>
        <div>
          <span>Tahsil Edilen</span>

          <strong>{formatMoney(collectedAmount)}</strong>
        </div>

        <div>
          <span>Kalan</span>

          <strong>{formatMoney(remainingAmount)}</strong>
        </div>
      </div>

      <div className={styles.status}>{paymentStatus}</div>
    </aside>
  );
}
