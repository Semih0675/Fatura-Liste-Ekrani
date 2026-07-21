import { useEffect, useState } from 'react';
import styles from './App.module.scss';
import { Header } from './components/Header';
import { InvoiceTable, type StaticInvoice } from './components/InvoiceTable';
import { SummaryCards, type SummaryCard } from './components/SummaryCards';

const summaryCards: SummaryCard[] = [
  {
    id: 'total-invoices',
    label: 'Toplam Fatura',
    value: '128 adet',
    helperText: 'Seçili dönem',
    variant: 'primary',
  },
  {
    id: 'total-amount',
    label: 'Toplam Tutar',
    value: '2.847.350,75 ₺',
    helperText: 'KDV dahil',
    variant: 'info',
  },
  {
    id: 'overdue-amount',
    label: 'Geciken Tutar',
    value: '312.480,00 ₺',
    helperText: '9 fatura vadesi geçmiş',
    variant: 'danger',
  },
];

const staticInvoices: StaticInvoice[] = [
  {
    id: 148,
    invoiceNumber: 'FTR-2026-0148',
    customer: 'Yılmaz Ticaret A.Ş.',
    issueDate: '03.07.2026',
    dueDate: '02.08.2026',
    amount: '45.780,50 ₺',
    type: 'sale',
    status: 'paid',
  },
  {
    id: 147,
    invoiceNumber: 'FTR-2026-0147',
    customer: 'Demir İnşaat Ltd. Şti.',
    issueDate: '02.07.2026',
    dueDate: '01.08.2026',
    amount: '128.940,00 ₺',
    type: 'sale',
    status: 'pending',
  },
  {
    id: 146,
    invoiceNumber: 'FTR-2026-0146',
    customer: 'Aksa Gıda San. A.Ş.',
    issueDate: '30.06.2026',
    dueDate: '15.07.2026',
    amount: '12.315,75 ₺',
    type: 'purchase',
    status: 'pending',
  },
  {
    id: 145,
    invoiceNumber: 'FTR-2026-0145',
    customer: 'Kaya Otomotiv',
    issueDate: '28.06.2026',
    dueDate: '28.06.2026',
    amount: '67.200,00 ₺',
    type: 'sale',
    status: 'overdue',
  },
  {
    id: 144,
    invoiceNumber: 'FTR-2026-0144',
    customer: 'Öztürk Tekstil Ltd.',
    issueDate: '25.06.2026',
    dueDate: '25.07.2026',
    amount: '8.450,25 ₺',
    type: 'purchase',
    status: 'paid',
  },
  {
    id: 143,
    invoiceNumber: 'FTR-2026-0143',
    customer: 'Mavi Lojistik A.Ş.',
    issueDate: '22.06.2026',
    dueDate: '22.07.2026',
    amount: '94.610,00 ₺',
    type: 'sale',
    status: 'paid',
  },
];

export default function App() {
  const [isTableVisible, setIsTableVisible] = useState(true);

  useEffect(() => {
    document.title = isTableVisible
      ? 'PreAccounting | Fatura Listesi'
      : 'PreAccounting | Tablo Gizli';
  }, [isTableVisible]);

  function handleToggleTable() {
    setIsTableVisible((currentValue) => !currentValue);
  }

  return (
    <div className={styles.app}>
      <Header
        appName="PreAccounting"
        pageName="Fatura Listesi"
        isTableVisible={isTableVisible}
        onToggleTable={handleToggleTable}
      />

      <main className={styles.page}>
        <section className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>Fatura yönetimi</p>
            <h1>Fatura Listesi</h1>
            <p>Faturalarınızı görüntüleyin ve finansal durumunuzu takip edin.</p>
          </div>

          <button className={styles.primaryButton} type="button">
            + Yeni Fatura
          </button>
        </section>

        <SummaryCards cards={summaryCards} />

        {isTableVisible ? (
          <InvoiceTable invoices={staticInvoices} />
        ) : (
          <section className={styles.emptyState}>
            <h2>Tablo gizlendi</h2>
            <p>Tabloyu yeniden görüntülemek için header’daki butona bas.</p>
          </section>
        )}
      </main>
    </div>
  );
}
