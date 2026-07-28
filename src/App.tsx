import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './App.module.scss';
import { ApiErrorState } from './components/ApiErrorState';
import { EmptyInvoiceState } from './components/EmptyInvoiceState';
import { FilterForm } from './components/FilterForm';
import { Header } from './components/Header';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { InvoiceTable } from './components/InvoiceTable';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Pagination } from './components/Pagination';
import { SummaryCards, type SummaryCard } from './components/SummaryCards';
import { CreateInvoiceModal } from './components/CreateInvoiceModal';
import type {
  CreateInvoiceInput,
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
  createInvoice,
  applyFilters,
  fetchInvoices,
  resetFilters,
  setCurrentPage,
  setPageSize,
  toggleSort,
} from './store/slices/invoiceSlice';
import { formatMoney } from './utils/formatters';

export default function App() {
  const { t, i18n } = useTranslation();
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

  const isEnglish = i18n.resolvedLanguage?.startsWith('en') ?? false;

  const locale = isEnglish ? 'en-US' : 'tr-TR';
  const language = isEnglish ? 'en' : 'tr';
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  useEffect(() => {
    if (requestStatus === 'idle') {
      void dispatch(fetchInvoices());
    }
  }, [dispatch, requestStatus]);

  useEffect(() => {
    document.documentElement.lang = language;

    document.title = isTableVisible ? t('document.invoiceList') : t('document.tableHidden');
  }, [isTableVisible, language, t]);

  const summaryCards: SummaryCard[] = [
    {
      id: 'filtered-invoices',
      label: t('summary.filteredInvoiceLabel'),
      value: t('summary.invoiceCountValue', {
        count: invoiceSummary.totalCount,
      }),
      helperText: t('summary.totalRecordCount', {
        count: invoiceTotalCount,
      }),
      variant: 'primary',
    },
    {
      id: 'filtered-total',
      label: t('summary.filteredAmountLabel'),
      value: formatMoney(invoiceSummary.totalAmount, locale),
      helperText: t('summary.activeFilterResults'),
      variant: 'info',
    },
    {
      id: 'overdue-total',
      label: t('summary.overdueAmountLabel'),
      value: formatMoney(invoiceSummary.overdueAmount, locale),
      helperText: t('summary.overdueInvoiceCount', {
        count: invoiceSummary.overdueCount,
      }),
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

  function handleOpenCreateInvoice() {
    setIsCreateInvoiceOpen(true);
  }

  function handleCloseCreateInvoice() {
    setIsCreateInvoiceOpen(false);
  }

  async function handleCreateInvoice(invoice: CreateInvoiceInput) {
    await dispatch(createInvoice(invoice)).unwrap();
  }

  const isLoading = requestStatus === 'idle' || requestStatus === 'loading';

  const hasError = requestStatus === 'failed';

  const hasNoInvoices = requestStatus === 'succeeded' && invoiceTotalCount === 0;

  return (
    <div className={styles.app}>
      <Header
        appName="PreAccounting"
        pageName={t('title')}
        isTableVisible={isTableVisible}
        isNewInvoiceDisabled={requestStatus !== 'succeeded'}
        onCreateInvoice={handleOpenCreateInvoice}
        onToggleTable={handleToggleTable}
      />

      <main className={styles.page}>
        {isLoading ? (
          <LoadingSpinner />
        ) : hasError ? (
          <ApiErrorState message={requestError ?? t('errors.invoiceFetch')} onRetry={handleRetry} />
        ) : hasNoInvoices ? (
          <EmptyInvoiceState />
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
                <h2>{t('table.hiddenTitle')}</h2>
                <p>{t('table.hiddenDescription')}</p>
              </section>
            )}
          </>
        )}
      </main>

      <InvoiceDetailModal invoice={selectedInvoice} onClose={handleCloseInvoice} />
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={handleCloseCreateInvoice}
        onSubmit={handleCreateInvoice}
      />
    </div>
  );
}
