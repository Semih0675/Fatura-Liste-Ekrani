import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import type { InvoiceCustomer } from '../../../../models/invoice';

import { useAppSelector } from '../../../../store/hooks';

import styles from './CustomerAddressCard.module.scss';

interface CustomerAddressCardProps {
  initialCustomer?: InvoiceCustomer;

  initialCustomerName?: string;

  onCustomerChange?: (customer: InvoiceCustomer) => void;
}

const knownCities = [
  'Adana',
  'Ankara',
  'Antalya',
  'Bursa',
  'Gaziantep',
  'İstanbul',
  'İzmir',
  'Kocaeli',
  'Konya',
];

function createInitialCustomer(
  initialCustomer?: InvoiceCustomer,

  initialCustomerName = '',
): InvoiceCustomer {
  const customerName = initialCustomer?.name ?? initialCustomerName;

  return {
    id: initialCustomer?.id ?? '',

    name: customerName,

    titleName: initialCustomer?.titleName ?? customerName,

    taxNumber: initialCustomer?.taxNumber ?? '',

    taxOfficeCode: initialCustomer?.taxOfficeCode ?? '',

    taxOfficeName: initialCustomer?.taxOfficeName ?? '',

    phone: initialCustomer?.phone ?? '',

    email: initialCustomer?.email ?? '',

    address: {
      addressName: initialCustomer?.address?.addressName ?? '',

      country: initialCustomer?.address?.country ?? 'Türkiye',

      city: initialCustomer?.address?.city ?? '',

      district: initialCustomer?.address?.district ?? '',

      neighborhood: initialCustomer?.address?.neighborhood ?? '',

      avenue: initialCustomer?.address?.avenue ?? '',

      street: initialCustomer?.address?.street ?? '',

      buildingNumber: initialCustomer?.address?.buildingNumber ?? '',

      apartmentNumber: initialCustomer?.address?.apartmentNumber ?? '',

      postalCode: initialCustomer?.address?.postalCode ?? '',

      addressCode: initialCustomer?.address?.addressCode ?? '',

      additionalDescription: initialCustomer?.address?.additionalDescription ?? '',
    },
  };
}

export function CustomerAddressCard({
  initialCustomer,

  initialCustomerName = '',

  onCustomerChange,
}: CustomerAddressCardProps) {
  const { t } = useTranslation();

  const knownCustomers = useAppSelector((state) => state.customers.items);

  const [isExpanded, setIsExpanded] = useState(false);

  const [customer, setCustomer] = useState<InvoiceCustomer>(() =>
    createInitialCustomer(initialCustomer, initialCustomerName),
  );

  const selectedKnownCustomer = useMemo(() => {
    return knownCustomers.find(
      (knownCustomer) => knownCustomer.id === customer.id || knownCustomer.name === customer.name,
    );
  }, [customer.id, customer.name, knownCustomers]);

  function handleToggle() {
    setIsExpanded((current) => !current);
  }

  function applyCustomer(updated: InvoiceCustomer) {
    setCustomer(updated);

    onCustomerChange?.(updated);
  }

  function updateCustomer(changes: Partial<InvoiceCustomer>) {
    const updated: InvoiceCustomer = {
      ...customer,

      ...changes,
    };

    applyCustomer(updated);
  }

  function updateAddress(changes: Partial<InvoiceCustomer['address']>) {
    const updated: InvoiceCustomer = {
      ...customer,

      address: {
        ...customer.address,

        ...changes,
      },
    };

    applyCustomer(updated);
  }

  function handleCustomerNameChange(value: string) {
    const knownCustomer = knownCustomers.find((item) => item.name === value);

    if (knownCustomer) {
      applyCustomer({
        id: knownCustomer.id,

        name: knownCustomer.name,

        titleName: knownCustomer.titleName,

        taxNumber: knownCustomer.taxNumber,

        taxOfficeCode: knownCustomer.taxOfficeCode,

        taxOfficeName: knownCustomer.taxOfficeName,

        phone: knownCustomer.phone,

        email: knownCustomer.email,

        address: {
          ...knownCustomer.address,
        },
      });

      return;
    }

    updateCustomer({
      id: '',

      name: value,

      titleName: customer.titleName || value,
    });
  }

  return (
    <section className={`${styles.panel} ${isExpanded ? styles.panelOpen : ''}`}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${styles.activeTab}`}
          onClick={handleToggle}
        >
          {t('customerAddress.currentAccountInfo', {
            defaultValue: 'Cari / Müşteri Bilgileri',
          })}

          {customer.name ? <span className={styles.customerStatusDot} aria-hidden="true" /> : null}
        </button>
      </div>

      <button
        type="button"
        className={styles.toggleButton}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-label={
          isExpanded
            ? t('customerAddress.hideDetails', {
                defaultValue: 'Cari detaylarını gizle',
              })
            : t('customerAddress.showDetails', {
                defaultValue: 'Cari detaylarını göster',
              })
        }
      >
        <span
          className={`${styles.arrow} ${isExpanded ? styles.arrowOpen : ''}`}
          aria-hidden="true"
        >
          ⌄
        </span>
      </button>

      <div className={styles.previewGrid}>
        <label className={styles.field}>
          <span>
            {t('customerAddress.customerName', {
              defaultValue: 'Cari / Müşteri',
            })}
          </span>

          <input
            type="text"
            list="invoice-customer-options"
            value={customer.name}
            placeholder={t('customerAddress.selectCustomer', {
              defaultValue: 'Cari ara veya yaz...',
            })}
            onChange={(event) => handleCustomerNameChange(event.target.value)}
          />

          <datalist id="invoice-customer-options">
            {knownCustomers.map((knownCustomer) => (
              <option key={knownCustomer.id} value={knownCustomer.name} />
            ))}
          </datalist>
        </label>

        <label className={styles.field}>
          <span>
            {t('customerAddress.titleName', {
              defaultValue: 'Ünvan / Ad Soyad',
            })}
          </span>

          <input
            type="text"
            value={customer.titleName}
            onChange={(event) =>
              updateCustomer({
                titleName: event.target.value,
              })
            }
            placeholder={t('customerAddress.titleNamePlaceholder', {
              defaultValue: 'Ticari ünvan veya ad soyad',
            })}
          />
        </label>
      </div>

      {customer.taxNumber || customer.phone || customer.email ? (
        <div className={styles.customerSummary}>
          <div className={styles.summaryMain}>
            {customer.taxNumber ? (
              <span>
                <small>VKN / TCKN</small>

                <strong>{customer.taxNumber}</strong>
              </span>
            ) : null}

            {customer.phone ? (
              <span>
                <small>Telefon</small>

                <strong>{customer.phone}</strong>
              </span>
            ) : null}
          </div>

          {selectedKnownCustomer ? (
            <span
              className={
                selectedKnownCustomer.isEInvoiceTaxpayer
                  ? styles.eInvoiceBadge
                  : styles.eArchiveBadge
              }
            >
              {selectedKnownCustomer.isEInvoiceTaxpayer ? 'e-Fatura Mükellefi' : 'e-Arşiv'}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={`${styles.expandable} ${isExpanded ? styles.expandableOpen : ''}`}>
        <div className={styles.expandableInner}>
          <div className={styles.detailsGrid}>
            <div className={`${styles.sectionTitle} ${styles.fullWidth}`}>
              <span>Vergi Bilgileri</span>

              <small>VKN/TCKN ve vergi dairesi</small>
            </div>

            <label className={styles.field}>
              <span>VKN / TCKN</span>

              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={customer.taxNumber}
                onChange={(event) =>
                  updateCustomer({
                    taxNumber: event.target.value.replace(/\D/g, ''),
                  })
                }
              />
            </label>

            <div className={styles.lookupButtons}>
              <button type="button">Mükellef Sorgula</button>

              <button type="button">VKN Sorgula</button>
            </div>

            <label className={styles.field}>
              <span>Vergi Dairesi Kodu</span>

              <input
                type="text"
                value={customer.taxOfficeCode}
                onChange={(event) =>
                  updateCustomer({
                    taxOfficeCode: event.target.value,
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>Vergi Dairesi</span>

              <input
                type="text"
                value={customer.taxOfficeName}
                onChange={(event) =>
                  updateCustomer({
                    taxOfficeName: event.target.value,
                  })
                }
              />
            </label>

            <div className={`${styles.sectionTitle} ${styles.fullWidth}`}>
              <span>İletişim Bilgileri</span>

              <small>Telefon ve e-posta</small>
            </div>

            <label className={styles.field}>
              <span>Telefon</span>

              <input
                type="tel"
                value={customer.phone}
                onChange={(event) =>
                  updateCustomer({
                    phone: event.target.value,
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>E-posta</span>

              <input
                type="email"
                value={customer.email}
                onChange={(event) =>
                  updateCustomer({
                    email: event.target.value,
                  })
                }
              />
            </label>

            <div className={`${styles.sectionTitle} ${styles.fullWidth}`}>
              <span>Fatura Adresi</span>

              <small>Faturada kullanılacak adres</small>
            </div>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Adres Tanımı</span>

              <input
                type="text"
                value={customer.address.addressName}
                onChange={(event) =>
                  updateAddress({
                    addressName: event.target.value,
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>Ülke</span>

              <select
                value={customer.address.country}
                onChange={(event) =>
                  updateAddress({
                    country: event.target.value,
                  })
                }
              >
                <option value="Türkiye">Türkiye</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>İl</span>

              <input
                type="text"
                list="invoice-city-options"
                value={customer.address.city}
                onChange={(event) =>
                  updateAddress({
                    city: event.target.value,
                  })
                }
              />

              <datalist id="invoice-city-options">
                {knownCities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </label>

            <label className={styles.field}>
              <span>İlçe</span>

              <input
                type="text"
                value={customer.address.district}
                onChange={(event) =>
                  updateAddress({
                    district: event.target.value,
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>Mahalle</span>

              <input
                type="text"
                value={customer.address.neighborhood}
                onChange={(event) =>
                  updateAddress({
                    neighborhood: event.target.value,
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>Cadde</span>

              <input
                type="text"
                value={customer.address.avenue}
                onChange={(event) =>
                  updateAddress({
                    avenue: event.target.value,
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>Sokak</span>

              <input
                type="text"
                value={customer.address.street}
                onChange={(event) =>
                  updateAddress({
                    street: event.target.value,
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>Bina No</span>

              <input
                type="text"
                value={customer.address.buildingNumber}
                onChange={(event) =>
                  updateAddress({
                    buildingNumber: event.target.value,
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>Daire No</span>

              <input
                type="text"
                value={customer.address.apartmentNumber}
                onChange={(event) =>
                  updateAddress({
                    apartmentNumber: event.target.value,
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>Posta Kodu</span>

              <input
                type="text"
                inputMode="numeric"
                value={customer.address.postalCode}
                onChange={(event) =>
                  updateAddress({
                    postalCode: event.target.value.replace(/\D/g, ''),
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>Adres Kodu</span>

              <input
                type="text"
                value={customer.address.addressCode}
                onChange={(event) =>
                  updateAddress({
                    addressCode: event.target.value,
                  })
                }
              />
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Adres Açıklaması</span>

              <textarea
                rows={3}
                value={customer.address.additionalDescription}
                onChange={(event) =>
                  updateAddress({
                    additionalDescription: event.target.value,
                  })
                }
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
