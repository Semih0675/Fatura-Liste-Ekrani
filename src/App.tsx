import { useEffect, useState } from 'react';
import styles from './App.module.scss';
import invoiceData from './data/invoices.json';
import { Header } from './components/Header';
import { InvoiceTable } from './components/InvoiceTable';
import { SummaryCards, type SummaryCard } from './components/SummaryCards';
import type { Invoice } from './models/invoice';
import { formatMoney } from './utils/formatters';

const invoices = invoiceData as Invoice[];

const totalAmount = invoices.reduce((total, invoice) => total + invoice.amount, 0);

const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue');

const overdueAmount = overdueInvoices.reduce((total, invoice) => total + invoice.amount, 0);

const summaryCards: SummaryCard[] = [
  {
    id: 'total-invoices',
    label: 'Toplam Fatura',
    value: `${invoices.length} adet`,
    helperText: 'Mock veri kaydı',
    variant: 'primary',
  },
  {
    id: 'total-amount',
    label: 'Toplam Tutar',
    value: formatMoney(totalAmount),
    helperText: 'KDV dahil',
    variant: 'info',
  },
  {
    id: 'overdue-amount',
    label: 'Geciken Tutar',
    value: formatMoney(overdueAmount),
    helperText: `${overdueInvoices.length} fatura vadesi geçmiş`,
    variant: 'danger',
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
          <InvoiceTable invoices={invoices} />
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
