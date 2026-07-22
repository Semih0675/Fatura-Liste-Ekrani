import { useEffect, useState } from 'react';
import styles from './App.module.scss';
import { ApiErrorState } from './components/ApiErrorState';
import { FilterForm } from './components/FilterForm';
import { Header } from './components/Header';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { InvoiceTable } from './components/InvoiceTable';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Pagination } from './components/Pagination';
import { SummaryCards, type SummaryCard } from './components/SummaryCards';
import type {
  Invoice,
  InvoiceFilterValues,
  InvoicePageSize,
  InvoiceSortKey,
} from './models/invoice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  selectInvoiceError,
  selectInvoiceFilterValues,
  selectInvoicePaginationMeta,
  selectInvoiceRequestStatus,
  selectInvoiceSortConfig,
  selectInvoiceSummary,
  selectInvoiceTotalCount,
  selectPaginatedInvoices,
} from './store/selectors/invoiceSelectors';
import {
  applyFilters,
  fetchInvoices,
  resetFilters,
  setCurrentPage,
  setPageSize,
  toggleSort,
} from './store/slices/invoiceSlice';
import { formatMoney } from './utils/formatters';

export default function App() {
  const dispatch = useAppDispatch();

  const filterValues = useAppSelector(selectInvoiceFilterValues);

  const sortConfig = useAppSelector(selectInvoiceSortConfig);

  const pageInvoices = useAppSelector(selectPaginatedInvoices);

  const pagination = useAppSelector(selectInvoicePaginationMeta);

  const invoiceSummary = useAppSelector(selectInvoiceSummary);

  const invoiceTotalCount = useAppSelector(selectInvoiceTotalCount);

  const requestStatus = useAppSelector(selectInvoiceRequestStatus);

  const requestError = useAppSelector(selectInvoiceError);

  const [isTableVisible, setIsTableVisible] = useState(true);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (requestStatus === 'idle') {
      void dispatch(fetchInvoices());
    }
  }, [dispatch, requestStatus]);

  useEffect(() => {
    document.title = isTableVisible
      ? 'PreAccounting | Fatura Listesi'
      : 'PreAccounting | Tablo Gizli';
  }, [isTableVisible]);

  const summaryCards: SummaryCard[] = [
    {
      id: 'filtered-invoices',
      label: 'Filtrelenen Fatura',
      value: `${invoiceSummary.totalCount} adet`,
      helperText: `${invoiceTotalCount} toplam kayıt`,
      variant: 'primary',
    },
    {
      id: 'filtered-total',
      label: 'Filtrelenen Tutar',
      value: formatMoney(invoiceSummary.totalAmount),
      helperText: 'Aktif filtre sonuçları',
      variant: 'info',
    },
    {
      id: 'overdue-total',
      label: 'Geciken Tutar',
      value: formatMoney(invoiceSummary.overdueAmount),
      helperText: `${invoiceSummary.overdueCount} gecikmiş fatura`,
      variant: 'danger',
    },
  ];

  function handleToggleTable() {
    setIsTableVisible((currentValue) => !currentValue);
  }

  function handleApplyFilters(newFilterValues: InvoiceFilterValues) {
    dispatch(applyFilters(newFilterValues));
  }

  function handleResetFilters() {
    dispatch(resetFilters());
  }

  function handleSort(sortKey: InvoiceSortKey) {
    dispatch(toggleSort(sortKey));
  }

  function handlePageChange(page: number) {
    dispatch(setCurrentPage(page));
  }

  function handlePageSizeChange(pageSize: InvoicePageSize) {
    dispatch(setPageSize(pageSize));
  }

  function handleOpenInvoice(invoice: Invoice) {
    setSelectedInvoice(invoice);
  }

  function handleCloseInvoice() {
    setSelectedInvoice(null);
  }

  function handleRetry() {
    void dispatch(fetchInvoices());
  }

  const isLoading = requestStatus === 'idle' || requestStatus === 'loading';

  const hasError = requestStatus === 'failed';

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

          <button
            className={styles.primaryButton}
            type="button"
            disabled={requestStatus !== 'succeeded'}
          >
            + Yeni Fatura
          </button>
        </section>

        {isLoading ? (
          <LoadingSpinner />
        ) : hasError ? (
          <ApiErrorState
            message={requestError ?? 'Fatura verileri alınamadı.'}
            onRetry={handleRetry}
          />
        ) : (
          <>
            <SummaryCards cards={summaryCards} />

            {isTableVisible ? (
              <div className={styles.tableArea}>
                <FilterForm
                  initialFilters={filterValues}
                  resultCount={pagination.totalItems}
                  totalCount={invoiceTotalCount}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                />

                <InvoiceTable
                  invoices={pageInvoices}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onInvoiceSelect={handleOpenInvoice}
                />

                <Pagination
                  currentPage={pagination.currentPage}
                  pageSize={pagination.pageSize}
                  totalItems={pagination.totalItems}
                  totalPages={pagination.totalPages}
                  startItem={pagination.startItem}
                  endItem={pagination.endItem}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            ) : (
              <section className={styles.emptyState}>
                <h2>Tablo gizlendi</h2>

                <p>Tabloyu yeniden görüntülemek için header’daki butona bas.</p>
              </section>
            )}
          </>
        )}
      </main>

      <InvoiceDetailModal invoice={selectedInvoice} onClose={handleCloseInvoice} />
    </div>
  );
}
