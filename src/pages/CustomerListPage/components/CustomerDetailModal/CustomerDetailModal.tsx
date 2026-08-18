import { useMemo, useState } from 'react';

import type { CustomerAccount } from '../../../../models/customer';

import type { Invoice, InvoiceCurrency } from '../../../../models/invoice';

import {
  calculateCustomerFinancials,
  getCustomerBalanceStatus,
  invoiceCurrencies,
} from '../../../../utils/customerFinance';

import styles from './CustomerDetailModal.module.scss';

interface CustomerDetailModalProps {
  customer: CustomerAccount | null;

  invoices: Invoice[];

  onClose: () => void;

  onEdit: (customer: CustomerAccount) => void;

  onDelete: (customer: CustomerAccount) => void;
}

type DetailTab = 'invoices' | 'collections' | 'movements' | 'info';

function formatMoney(value: number, currency: InvoiceCurrency) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',

    currency,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('tr-TR').format(date);
}

export function CustomerDetailModal({
  customer,

  invoices,

  onClose,

  onEdit,

  onDelete,
}: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('invoices');

  const customerInvoices = useMemo(() => {
    if (!customer) {
      return [];
    }

    return invoices.filter((invoice) => {
      if (invoice.customer?.id === customer.id) {
        return true;
      }

      if (
        invoice.customer?.taxNumber &&
        customer.taxNumber &&
        invoice.customer.taxNumber === customer.taxNumber
      ) {
        return true;
      }

      return (
        invoice.customerName?.trim().toLocaleLowerCase('tr-TR') ===
        customer.name.trim().toLocaleLowerCase('tr-TR')
      );
    });
  }, [customer, invoices]);

  const financials = useMemo(() => {
    if (!customer) {
      return null;
    }

    return calculateCustomerFinancials(customer, invoices);
  }, [customer, invoices]);

  const movements = useMemo(() => {
    if (!customer) {
      return [];
    }

    const rows: {
      id: string;

      date: string;

      type: 'invoice' | 'payment';

      description: string;

      currency: InvoiceCurrency;

      amount: number;
    }[] = [];

    customerInvoices.forEach((invoice) => {
      if (invoice.status === 'draft') {
        return;
      }

      const currency = invoice.document?.currency ?? 'TRY';

      const amount = invoice.totals?.grandTotal ?? invoice.amount;

      rows.push({
        id: `invoice-${invoice.id}`,

        date: invoice.issueDate,

        type: 'invoice',

        description:
          invoice.type === 'purchase'
            ? `${invoice.invoiceNumber} • Alış Faturası`
            : `${invoice.invoiceNumber} • Satış Faturası`,

        currency,

        amount: invoice.type === 'purchase' ? -amount : amount,
      });

      const paymentAmount = invoice.payment?.collectedAmount ?? 0;

      if (paymentAmount > 0) {
        rows.push({
          id: `payment-${invoice.id}`,

          date: invoice.payment?.collectionDate || invoice.issueDate,

          type: 'payment',

          description:
            invoice.type === 'purchase'
              ? `${invoice.invoiceNumber} • Ödeme`
              : `${invoice.invoiceNumber} • Tahsilat`,

          currency,

          amount: invoice.type === 'purchase' ? paymentAmount : -paymentAmount,
        });
      }
    });

    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [customer, customerInvoices]);

  if (!customer || !financials) {
    return null;
  }

  const balanceStatus = getCustomerBalanceStatus(financials);

  const statusLabels = {
    debtor: 'Borçlu',

    creditor: 'Alacaklı',

    balanced: 'Bakiyesi Yok',

    mixed: 'Karma Bakiye',
  };

  const accountTypeLabels = {
    customer: 'Müşteri',

    supplier: 'Tedarikçi',

    both: 'Müşteri / Tedarikçi',
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <div>
            <span>CARİ DETAYI</span>

            <h2>{customer.titleName || customer.name}</h2>

            <p>
              {accountTypeLabels[customer.accountType]}

              {customer.taxNumber ? ` • VKN/TCKN ${customer.taxNumber}` : ''}

              {customer.address.city ? ` • ${customer.address.city}` : ''}
            </p>
          </div>

          <div className={styles.headerActions}>
            <button type="button" onClick={() => onEdit(customer)}>
              Düzenle
            </button>

            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => onDelete(customer)}
            >
              Sil
            </button>

            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
        </header>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span>Durum</span>

            <strong>{statusLabels[balanceStatus]}</strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Fatura Sayısı</span>

            <strong>
              {customerInvoices.filter((invoice) => invoice.status !== 'draft').length}
            </strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Toplam Satış</span>

            <div className={styles.moneyStack}>
              {invoiceCurrencies.map((currency) =>
                financials[currency].sales > 0 ? (
                  <strong key={currency}>
                    {formatMoney(financials[currency].sales, currency)}
                  </strong>
                ) : null,
              )}

              {invoiceCurrencies.every((currency) => financials[currency].sales === 0) ? (
                <strong>₺0,00</strong>
              ) : null}
            </div>
          </div>

          <div className={styles.summaryCard}>
            <span>Cari Bakiye</span>

            <div className={styles.moneyStack}>
              {invoiceCurrencies.map((currency) =>
                Math.abs(financials[currency].balance) > 0.005 ? (
                  <strong key={currency}>
                    {formatMoney(financials[currency].balance, currency)}
                  </strong>
                ) : null,
              )}

              {invoiceCurrencies.every(
                (currency) => Math.abs(financials[currency].balance) <= 0.005,
              ) ? (
                <strong>₺0,00</strong>
              ) : null}
            </div>
          </div>
        </div>

        <nav className={styles.tabs}>
          <button
            type="button"
            className={activeTab === 'invoices' ? styles.activeTab : ''}
            onClick={() => setActiveTab('invoices')}
          >
            Faturalar
          </button>

          <button
            type="button"
            className={activeTab === 'collections' ? styles.activeTab : ''}
            onClick={() => setActiveTab('collections')}
          >
            Tahsilatlar
          </button>

          <button
            type="button"
            className={activeTab === 'movements' ? styles.activeTab : ''}
            onClick={() => setActiveTab('movements')}
          >
            Cari Hareketleri
          </button>

          <button
            type="button"
            className={activeTab === 'info' ? styles.activeTab : ''}
            onClick={() => setActiveTab('info')}
          >
            Cari Bilgileri
          </button>
        </nav>

        <div className={styles.body}>
          {activeTab === 'invoices' ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fatura No</th>

                    <th>Tarih</th>

                    <th>Tip</th>

                    <th>Durum</th>

                    <th>Tutar</th>

                    <th>Kalan</th>
                  </tr>
                </thead>

                <tbody>
                  {customerInvoices.length > 0 ? (
                    customerInvoices.map((invoice) => {
                      const currency = invoice.document?.currency ?? 'TRY';

                      const amount = invoice.totals?.grandTotal ?? invoice.amount;

                      const payment = invoice.payment?.collectedAmount ?? 0;

                      return (
                        <tr key={invoice.id}>
                          <td>
                            <strong>{invoice.invoiceNumber || 'Taslak'}</strong>
                          </td>

                          <td>{formatDate(invoice.issueDate)}</td>

                          <td>{invoice.type === 'purchase' ? 'Alış' : 'Satış'}</td>

                          <td>{invoice.status}</td>

                          <td>{formatMoney(amount, currency)}</td>

                          <td>
                            {invoice.status === 'draft'
                              ? '—'
                              : formatMoney(Math.max(0, amount - payment), currency)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className={styles.emptyCell}>
                        Bu cariye ait fatura bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === 'collections' ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tarih</th>

                    <th>Fatura</th>

                    <th>İşlem</th>

                    <th>Yöntem</th>

                    <th>Tutar</th>
                  </tr>
                </thead>

                <tbody>
                  {customerInvoices.filter((invoice) => (invoice.payment?.collectedAmount ?? 0) > 0)
                    .length > 0 ? (
                    customerInvoices
                      .filter((invoice) => (invoice.payment?.collectedAmount ?? 0) > 0)
                      .map((invoice) => {
                        const currency = invoice.document?.currency ?? 'TRY';

                        return (
                          <tr key={invoice.id}>
                            <td>
                              {formatDate(invoice.payment?.collectionDate || invoice.issueDate)}
                            </td>

                            <td>{invoice.invoiceNumber}</td>

                            <td>{invoice.type === 'purchase' ? 'Ödeme' : 'Tahsilat'}</td>

                            <td>{invoice.payment?.method}</td>

                            <td>{formatMoney(invoice.payment?.collectedAmount ?? 0, currency)}</td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={5} className={styles.emptyCell}>
                        Henüz tahsilat veya ödeme kaydı yok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {activeTab === 'movements' ? (
            <div className={styles.movements}>
              {movements.length > 0 ? (
                movements.map((movement) => (
                  <div key={movement.id} className={styles.movement}>
                    <div
                      className={
                        movement.type === 'invoice' ? styles.invoiceIcon : styles.paymentIcon
                      }
                    >
                      {movement.type === 'invoice' ? 'F' : '₺'}
                    </div>

                    <div className={styles.movementMain}>
                      <strong>{movement.description}</strong>

                      <span>{formatDate(movement.date)}</span>
                    </div>

                    <strong
                      className={
                        movement.amount >= 0 ? styles.positiveMovement : styles.negativeMovement
                      }
                    >
                      {movement.amount > 0 ? '+' : ''}

                      {formatMoney(movement.amount, movement.currency)}
                    </strong>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>Cari hareketi bulunmuyor.</div>
              )}
            </div>
          ) : null}

          {activeTab === 'info' ? (
            <div className={styles.infoGrid}>
              <div>
                <span>Cari Adı</span>

                <strong>{customer.name}</strong>
              </div>

              <div>
                <span>Ünvan</span>

                <strong>{customer.titleName || '—'}</strong>
              </div>

              <div>
                <span>Cari Tipi</span>

                <strong>{accountTypeLabels[customer.accountType]}</strong>
              </div>

              <div>
                <span>e-Fatura</span>

                <strong>{customer.isEInvoiceTaxpayer ? 'Mükellef' : 'e-Arşiv'}</strong>
              </div>

              <div>
                <span>VKN / TCKN</span>

                <strong>{customer.taxNumber || '—'}</strong>
              </div>

              <div>
                <span>Vergi Dairesi</span>

                <strong>{customer.taxOfficeName || '—'}</strong>
              </div>

              <div>
                <span>Telefon</span>

                <strong>{customer.phone || '—'}</strong>
              </div>

              <div>
                <span>E-posta</span>

                <strong>{customer.email || '—'}</strong>
              </div>

              <div className={styles.fullInfo}>
                <span>Adres</span>

                <strong>
                  {[
                    customer.address.neighborhood,

                    customer.address.avenue,

                    customer.address.street,

                    customer.address.buildingNumber ? `No: ${customer.address.buildingNumber}` : '',

                    customer.address.apartmentNumber
                      ? `Daire: ${customer.address.apartmentNumber}`
                      : '',

                    customer.address.district,

                    customer.address.city,

                    customer.address.country,
                  ]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </strong>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
