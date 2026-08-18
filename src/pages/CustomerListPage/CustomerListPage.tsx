import { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import type {
  CustomerAccount,
  CustomerAccountType,
  CustomerFormInput,
} from '../../models/customer';

import type { InvoiceCurrency } from '../../models/invoice';

import { useAppDispatch, useAppSelector } from '../../store/hooks';

import { addCustomer, deleteCustomer, updateCustomer } from '../../store/slices/customerSlice';

import { fetchInvoices } from '../../store/slices/invoiceSlice';

import {
  calculateCustomerFinancials,
  getCustomerBalanceStatus,
  getCustomerInvoices,
  invoiceCurrencies,
  type CustomerBalanceStatus,
} from '../../utils/customerFinance';

import { CustomerDetailModal } from './components/CustomerDetailModal/CustomerDetailModal';

import { CustomerFormModal } from './components/CustomerFormModal/CustomerFormModal';

import styles from './CustomerListPage.module.scss';

type AccountTypeFilter = 'all' | CustomerAccountType;

type BalanceFilter = 'all' | CustomerBalanceStatus;

function formatMoney(
  value: number,

  currency: InvoiceCurrency,
) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',

    currency,
  }).format(value);
}

export default function CustomerListPage() {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const customers = useAppSelector((state) => state.customers.items);

  const invoices = useAppSelector((state) => state.invoices.items);

  const invoiceStatus = useAppSelector((state) => state.invoices.requestStatus);

  const [searchTerm, setSearchTerm] = useState('');

  const [accountTypeFilter, setAccountTypeFilter] = useState<AccountTypeFilter>('all');

  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState<CustomerAccount | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(null);

  useEffect(() => {
    if (invoiceStatus === 'idle') {
      void dispatch(fetchInvoices());
    }
  }, [dispatch, invoiceStatus]);

  useEffect(() => {
    document.title = 'Cari Hesaplar | PreAccounting';
  }, []);

  const customerRows = useMemo(() => {
    return customers.map((customer) => {
      const financials = calculateCustomerFinancials(customer, invoices);

      return {
        customer,

        financials,

        status: getCustomerBalanceStatus(financials),

        invoiceCount: getCustomerInvoices(customer, invoices).filter(
          (invoice) => invoice.status !== 'draft',
        ).length,
      };
    });
  }, [customers, invoices]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('tr-TR');

    return customerRows
      .filter(({ customer, status }) => {
        if (
          accountTypeFilter !== 'all' &&
          customer.accountType !== accountTypeFilter &&
          customer.accountType !== 'both'
        ) {
          return false;
        }

        if (balanceFilter !== 'all' && status !== balanceFilter) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const searchable = [
          customer.name,

          customer.titleName,

          customer.taxNumber,

          customer.phone,

          customer.email,

          customer.address.city,

          customer.address.district,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('tr-TR');

        return searchable.includes(normalizedSearch);
      })
      .sort((a, b) => a.customer.name.localeCompare(b.customer.name, 'tr'));
  }, [accountTypeFilter, balanceFilter, customerRows, searchTerm]);

  const globalFinancials = useMemo(() => {
    const result = Object.fromEntries(
      invoiceCurrencies.map((currency) => [
        currency,
        {
          sales: 0,

          collected: 0,

          balance: 0,
        },
      ]),
    ) as Record<
      InvoiceCurrency,
      {
        sales: number;

        collected: number;

        balance: number;
      }
    >;

    customerRows.forEach(({ financials }) => {
      invoiceCurrencies.forEach((currency) => {
        result[currency].sales += financials[currency].sales;

        result[currency].collected += financials[currency].collected;

        result[currency].balance += financials[currency].balance;
      });
    });

    return result;
  }, [customerRows]);

  function openNewCustomer() {
    setEditingCustomer(null);

    setIsFormOpen(true);
  }

  function openEditCustomer(customer: CustomerAccount) {
    setEditingCustomer(customer);

    setSelectedCustomer(null);

    setIsFormOpen(true);
  }

  function handleSaveCustomer(input: CustomerFormInput) {
    const now = new Date().toISOString();

    if (editingCustomer) {
      dispatch(
        updateCustomer({
          ...editingCustomer,

          ...input,

          address: {
            ...input.address,
          },

          updatedAt: now,
        }),
      );
    } else {
      dispatch(
        addCustomer({
          ...input,

          id: `customer-${crypto.randomUUID()}`,

          address: {
            ...input.address,
          },

          createdAt: now,

          updatedAt: now,
        }),
      );
    }

    setIsFormOpen(false);

    setEditingCustomer(null);
  }

  function handleDeleteCustomer(customer: CustomerAccount) {
    const customerInvoices = getCustomerInvoices(customer, invoices);

    if (customerInvoices.length > 0) {
      window.alert(
        'Bu cariye bağlı fatura kayıtları bulunduğu için cari silinemez. Cari kartını düzenleyebilirsiniz.',
      );

      return;
    }

    const approved = window.confirm(
      `${customer.name} cari kartını silmek istediğinize emin misiniz?`,
    );

    if (!approved) {
      return;
    }

    dispatch(deleteCustomer(customer.id));

    setSelectedCustomer(null);
  }

  const statusLabels: Record<CustomerBalanceStatus, string> = {
    debtor: 'Borçlu',

    creditor: 'Alacaklı',

    balanced: 'Bakiyesi Yok',

    mixed: 'Karma',
  };

  const accountTypeLabels: Record<CustomerAccountType, string> = {
    customer: 'Müşteri',

    supplier: 'Tedarikçi',

    both: 'Her İkisi',
  };

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>P</div>

            <div>
              <strong>PreAccounting</strong>

              <span>Cari Yönetimi</span>
            </div>
          </div>

          <button type="button" className={styles.backButton} onClick={() => navigate('/')}>
            ← Fatura Listesi
          </button>
        </div>
      </header>

      <main className={styles.container}>
        <section className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>CARİ YÖNETİMİ</span>

            <h1>Cari Hesaplar</h1>

            <p>
              Müşteri ve tedarikçilerinizi, faturalarını, tahsilatlarını ve açık bakiyelerini
              yönetin.
            </p>
          </div>

          <button type="button" className={styles.newCustomerButton} onClick={openNewCustomer}>
            <span>+</span>
            Yeni Cari
          </button>
        </section>

        <section className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span>Toplam Cari</span>

            <strong>{customers.length}</strong>

            <small>Kayıtlı cari kartı</small>
          </div>

          <div className={styles.summaryCard}>
            <span>Toplam Satış</span>

            <div className={styles.summaryMoney}>
              {invoiceCurrencies.map((currency) => (
                <strong key={currency}>
                  {formatMoney(globalFinancials[currency].sales, currency)}
                </strong>
              ))}
            </div>

            <small>Taslaklar hariç</small>
          </div>

          <div className={styles.summaryCard}>
            <span>Tahsil Edilen</span>

            <div className={styles.summaryMoney}>
              {invoiceCurrencies.map((currency) => (
                <strong key={currency}>
                  {formatMoney(globalFinancials[currency].collected, currency)}
                </strong>
              ))}
            </div>

            <small>Faturalara bağlı tahsilatlar</small>
          </div>

          <div className={`${styles.summaryCard} ${styles.balanceCard}`}>
            <span>Cari Bakiye</span>

            <div className={styles.summaryMoney}>
              {invoiceCurrencies.map((currency) => (
                <strong key={currency}>
                  {formatMoney(globalFinancials[currency].balance, currency)}
                </strong>
              ))}
            </div>

            <small>Net açık bakiye</small>
          </div>
        </section>

        <section className={styles.contentCard}>
          <div className={styles.toolbar}>
            <label className={styles.searchBox}>
              <span>⌕</span>

              <input
                type="search"
                value={searchTerm}
                placeholder="Cari adı, VKN, telefon veya şehir ara..."
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <select
              value={accountTypeFilter}
              onChange={(event) => setAccountTypeFilter(event.target.value as AccountTypeFilter)}
            >
              <option value="all">Tüm Cari Tipleri</option>

              <option value="customer">Müşteri</option>

              <option value="supplier">Tedarikçi</option>

              <option value="both">Müşteri / Tedarikçi</option>
            </select>

            <select
              value={balanceFilter}
              onChange={(event) => setBalanceFilter(event.target.value as BalanceFilter)}
            >
              <option value="all">Tüm Bakiyeler</option>

              <option value="debtor">Borçlu</option>

              <option value="creditor">Alacaklı</option>

              <option value="balanced">Bakiyesi Yok</option>

              <option value="mixed">Karma Bakiye</option>
            </select>

            <span className={styles.resultCount}>{filteredRows.length} cari</span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cari</th>

                  <th>Cari Tipi</th>

                  <th>VKN / TCKN</th>

                  <th>İletişim</th>

                  <th>Şehir</th>

                  <th>Fatura</th>

                  <th>Bakiye</th>

                  <th>Durum</th>

                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map(({ customer, financials, status, invoiceCount }) => (
                    <tr key={customer.id} onClick={() => setSelectedCustomer(customer)}>
                      <td>
                        <div className={styles.customerCell}>
                          <div className={styles.avatar}>
                            {customer.name.slice(0, 1).toUpperCase()}
                          </div>

                          <div>
                            <strong>{customer.name}</strong>

                            <span>
                              {customer.isEInvoiceTaxpayer ? 'e-Fatura Mükellefi' : 'e-Arşiv'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={styles.typeBadge}>
                          {accountTypeLabels[customer.accountType]}
                        </span>
                      </td>

                      <td>{customer.taxNumber || '—'}</td>

                      <td>
                        <div className={styles.contactCell}>
                          <strong>{customer.phone || '—'}</strong>

                          <span>{customer.email || ''}</span>
                        </div>
                      </td>

                      <td>{customer.address.city || '—'}</td>

                      <td>{invoiceCount}</td>

                      <td>
                        <div className={styles.balanceStack}>
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
                      </td>

                      <td>
                        <span className={`${styles.statusBadge} ${styles[status]}`}>
                          {statusLabels[status]}
                        </span>
                      </td>

                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              openEditCustomer(customer);
                            }}
                          >
                            Düzenle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className={styles.emptyTable}>
                      <strong>Cari bulunamadı</strong>

                      <span>Arama veya filtreleri değiştirin ya da yeni cari oluşturun.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <CustomerFormModal
        isOpen={isFormOpen}
        customer={editingCustomer}
        onClose={() => {
          setIsFormOpen(false);

          setEditingCustomer(null);
        }}
        onSubmit={handleSaveCustomer}
      />

      <CustomerDetailModal
        customer={selectedCustomer}
        invoices={invoices}
        onClose={() => setSelectedCustomer(null)}
        onEdit={openEditCustomer}
        onDelete={handleDeleteCustomer}
      />
    </div>
  );
}
