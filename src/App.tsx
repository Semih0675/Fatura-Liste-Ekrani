import { useEffect, useState } from 'react';
import styles from './App.module.scss';
import { Header } from './components/Header';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceToolbar } from './components/InvoiceToolbar';
import { SummaryCards, type SummaryCard } from './components/SummaryCards';
import type { InvoiceSortKey } from './models/invoice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  selectInvoiceSearchTerm,
  selectInvoiceSortConfig,
  selectInvoiceSummary,
  selectVisibleInvoices,
} from './store/selectors/invoiceSelectors';
import { setSearchTerm, toggleSort } from './store/slices/invoiceSlice';
import { formatMoney } from './utils/formatters';

export default function App() {
  const dispatch = useAppDispatch();

  const searchTerm = useAppSelector(selectInvoiceSearchTerm);
  const sortConfig = useAppSelector(selectInvoiceSortConfig);
  const visibleInvoices = useAppSelector(selectVisibleInvoices);
  const invoiceSummary = useAppSelector(selectInvoiceSummary);

  const [isTableVisible, setIsTableVisible] = useState(true);

  useEffect(() => {
    document.title = isTableVisible
      ? 'PreAccounting | Fatura Listesi'
      : 'PreAccounting | Tablo Gizli';
  }, [isTableVisible]);

  const summaryCards: SummaryCard[] = [
    {
      id: 'total-invoices',
      label: 'Toplam Fatura',
      value: `${invoiceSummary.totalCount} adet`,
      helperText: 'Redux store kaydı',
      variant: 'primary',
    },
    {
      id: 'total-amount',
      label: 'Toplam Tutar',
      value: formatMoney(invoiceSummary.totalAmount),
      helperText: 'KDV dahil',
      variant: 'info',
    },
    {
      id: 'overdue-amount',
      label: 'Geciken Tutar',
      value: formatMoney(invoiceSummary.overdueAmount),
      helperText: `${invoiceSummary.overdueCount} fatura vadesi geçmiş`,
      variant: 'danger',
    },
  ];

  function handleToggleTable() {
    setIsTableVisible((currentValue) => !currentValue);
  }

  function handleSearchChange(value: string) {
    dispatch(setSearchTerm(value));
  }

  function handleSort(sortKey: InvoiceSortKey) {
    dispatch(toggleSort(sortKey));
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
          <div className={styles.tableArea}>
            <InvoiceToolbar
              searchTerm={searchTerm}
              resultCount={visibleInvoices.length}
              totalCount={invoiceSummary.totalCount}
              onSearchChange={handleSearchChange}
            />

            <InvoiceTable invoices={visibleInvoices} sortConfig={sortConfig} onSort={handleSort} />
          </div>
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
