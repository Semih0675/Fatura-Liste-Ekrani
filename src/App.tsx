import { useEffect, useMemo, useState } from 'react';
import styles from './App.module.scss';
import { Header } from './components/Header';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceToolbar } from './components/InvoiceToolbar';
import { SummaryCards, type SummaryCard } from './components/SummaryCards';
import { invoiceStatusLabels, invoiceTypeLabels } from './constants/invoiceLabels';
import invoiceData from './data/invoices.json';
import type { Invoice, InvoiceSortConfig, InvoiceSortKey } from './models/invoice';
import { formatDate, formatMoney } from './utils/formatters';

const invoices = invoiceData as Invoice[];

const collator = new Intl.Collator('tr-TR', {
  sensitivity: 'base',
  numeric: true,
});

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

function normalizeSearchValue(value: string): string {
  return value.toLocaleLowerCase('tr-TR');
}

function compareInvoices(
  firstInvoice: Invoice,
  secondInvoice: Invoice,
  sortKey: InvoiceSortKey,
): number {
  switch (sortKey) {
    case 'invoiceNumber':
      return collator.compare(firstInvoice.invoiceNumber, secondInvoice.invoiceNumber);

    case 'customerName':
      return collator.compare(firstInvoice.customerName, secondInvoice.customerName);

    case 'issueDate':
      return firstInvoice.issueDate.localeCompare(secondInvoice.issueDate);

    case 'dueDate':
      return firstInvoice.dueDate.localeCompare(secondInvoice.dueDate);

    case 'amount':
      return firstInvoice.amount - secondInvoice.amount;

    case 'type':
      return collator.compare(
        invoiceTypeLabels[firstInvoice.type],
        invoiceTypeLabels[secondInvoice.type],
      );

    case 'status':
      return collator.compare(
        invoiceStatusLabels[firstInvoice.status],
        invoiceStatusLabels[secondInvoice.status],
      );
  }
}

export default function App() {
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [sortConfig, setSortConfig] = useState<InvoiceSortConfig>({
    key: 'invoiceNumber',
    direction: 'descending',
  });

  useEffect(() => {
    document.title = isTableVisible
      ? 'PreAccounting | Fatura Listesi'
      : 'PreAccounting | Tablo Gizli';
  }, [isTableVisible]);

  const visibleInvoices = useMemo(() => {
    const normalizedSearchTerm = normalizeSearchValue(searchTerm.trim());

    const filteredInvoices = normalizedSearchTerm
      ? invoices.filter((invoice) => {
          const searchableText = [
            invoice.invoiceNumber,
            invoice.customerName,
            formatDate(invoice.issueDate),
            formatDate(invoice.dueDate),
            formatMoney(invoice.amount),
            invoiceTypeLabels[invoice.type],
            invoiceStatusLabels[invoice.status],
          ]
            .join(' ')
            .toLocaleLowerCase('tr-TR');

          return searchableText.includes(normalizedSearchTerm);
        })
      : invoices;

    const sortedInvoices = [...filteredInvoices].sort((firstInvoice, secondInvoice) => {
      const comparisonResult = compareInvoices(firstInvoice, secondInvoice, sortConfig.key);

      return sortConfig.direction === 'ascending' ? comparisonResult : -comparisonResult;
    });

    return sortedInvoices;
  }, [searchTerm, sortConfig.key, sortConfig.direction]);

  function handleToggleTable() {
    setIsTableVisible((currentValue) => !currentValue);
  }

  function handleSort(sortKey: InvoiceSortKey) {
    setSortConfig((currentConfig) => {
      if (currentConfig.key === sortKey) {
        return {
          key: sortKey,
          direction: currentConfig.direction === 'ascending' ? 'descending' : 'ascending',
        };
      }

      return {
        key: sortKey,
        direction: 'ascending',
      };
    });
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
              totalCount={invoices.length}
              onSearchChange={setSearchTerm}
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
