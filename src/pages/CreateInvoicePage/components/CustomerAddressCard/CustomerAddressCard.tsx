import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { InvoiceCustomer } from '../../../../models/invoice';

import styles from './CustomerAddressCard.module.scss';

interface CustomerAddressCardProps {
  initialCustomer?: InvoiceCustomer;
  initialCustomerName?: string;
  onCustomerChange?: (customer: InvoiceCustomer) => void;
}

interface KnownCustomer {
  customer: InvoiceCustomer;
  isEInvoiceTaxpayer: boolean;
}

const knownCustomers: KnownCustomer[] = [
  {
    isEInvoiceTaxpayer: true,

    customer: {
      id: 'customer-1',

      name: 'Yılmaz Ticaret A.Ş.',
      titleName: 'Yılmaz Ticaret Anonim Şirketi',

      taxNumber: '1234567890',
      taxOfficeCode: '006252',
      taxOfficeName: 'Çankaya Vergi Dairesi',

      phone: '0312 555 10 10',
      email: 'muhasebe@yilmazticaret.com',

      address: {
        addressName: 'Merkez Ofis',

        country: 'Türkiye',
        city: 'Ankara',
        district: 'Çankaya',

        neighborhood: 'Kavaklıdere',
        avenue: 'Atatürk Bulvarı',
        street: '',

        buildingNumber: '125',
        apartmentNumber: '8',

        postalCode: '06680',
        addressCode: '',

        additionalDescription: 'Merkez bina, 3. kat',
      },
    },
  },

  {
    isEInvoiceTaxpayer: true,

    customer: {
      id: 'customer-2',

      name: 'Demir İnşaat Ltd. Şti.',
      titleName: 'Demir İnşaat Sanayi ve Ticaret Limited Şirketi',

      taxNumber: '9876543210',
      taxOfficeCode: '034204',
      taxOfficeName: 'Maslak Vergi Dairesi',

      phone: '0212 555 20 20',
      email: 'finans@demirinsaat.com',

      address: {
        addressName: 'Genel Müdürlük',

        country: 'Türkiye',
        city: 'İstanbul',
        district: 'Sarıyer',

        neighborhood: 'Maslak',
        avenue: 'Büyükdere Caddesi',
        street: '',

        buildingNumber: '201',
        apartmentNumber: '14',

        postalCode: '34398',
        addressCode: '',

        additionalDescription: '',
      },
    },
  },

  {
    isEInvoiceTaxpayer: false,

    customer: {
      id: 'customer-3',

      name: 'Aksa Gıda San. A.Ş.',
      titleName: 'Aksa Gıda Sanayi Anonim Şirketi',

      taxNumber: '1122334455',
      taxOfficeCode: '035102',
      taxOfficeName: 'Konak Vergi Dairesi',

      phone: '0232 555 30 30',
      email: 'muhasebe@aksagida.com',

      address: {
        addressName: 'İzmir Şube',

        country: 'Türkiye',
        city: 'İzmir',
        district: 'Konak',

        neighborhood: 'Alsancak',
        avenue: 'Kıbrıs Şehitleri Caddesi',
        street: '',

        buildingNumber: '55',
        apartmentNumber: '3',

        postalCode: '35220',
        addressCode: '',

        additionalDescription: '',
      },
    },
  },
];

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

  const [isExpanded, setIsExpanded] = useState(false);

  const [customer, setCustomer] = useState<InvoiceCustomer>(() =>
    createInitialCustomer(initialCustomer, initialCustomerName),
  );

  const selectedKnownCustomer = useMemo(() => {
    return knownCustomers.find((knownCustomer) => knownCustomer.customer.name === customer.name);
  }, [customer.name]);

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
    const knownCustomer = knownCustomers.find((item) => item.customer.name === value);

    if (knownCustomer) {
      applyCustomer({
        ...knownCustomer.customer,

        address: {
          ...knownCustomer.customer.address,
        },
      });

      return;
    }

    /*
     * Kullanıcı serbest şekilde yeni
     * bir cari adı da yazabilir.
     */
    updateCustomer({
      name: value,

      titleName: customer.titleName || value,
    });
  }

  return (
    <section className={`${styles.panel} ${isExpanded ? styles.panelOpen : ''}`}>
      {/* ===============================================
          TAB
          =============================================== */}

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

      {/* ===============================================
          TOGGLE
          =============================================== */}

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

      {/* ===============================================
          COMPACT CUSTOMER AREA
          =============================================== */}

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
            {knownCustomers.map(({ customer }) => (
              <option key={customer.id} value={customer.name} />
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

      {/* ===============================================
          COMPACT SUMMARY
          =============================================== */}

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

      {/* ===============================================
          FLOATING DETAILS
          =============================================== */}

      <div className={`${styles.expandable} ${isExpanded ? styles.expandableOpen : ''}`}>
        <div className={styles.expandableInner}>
          <div className={styles.detailsGrid}>
            {/* =========================================
                TAX
                ========================================= */}

            <div className={`${styles.sectionTitle} ${styles.fullWidth}`}>
              <span>Vergi Bilgileri</span>

              <small>VKN/TCKN ve vergi dairesi</small>
            </div>

            <label className={styles.field}>
              <span>
                {t('customerAddress.taxNumber', {
                  defaultValue: 'VKN / TCKN',
                })}
              </span>

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
                placeholder="Vergi / T.C. kimlik numarası"
              />
            </label>

            <div className={styles.lookupButtons}>
              <button type="button">
                {t('customerAddress.declaration', {
                  defaultValue: 'Mükellef Sorgula',
                })}
              </button>

              <button type="button">
                {t('customerAddress.freeQuery', {
                  defaultValue: 'VKN Sorgula',
                })}
              </button>
            </div>

            <label className={styles.field}>
              <span>
                {t('customerAddress.taxOfficeCode', {
                  defaultValue: 'Vergi Dairesi Kodu',
                })}
              </span>

              <input
                type="text"
                value={customer.taxOfficeCode}
                onChange={(event) =>
                  updateCustomer({
                    taxOfficeCode: event.target.value,
                  })
                }
                placeholder="Vergi dairesi kodu"
              />
            </label>

            <label className={styles.field}>
              <span>
                {t('customerAddress.taxOfficeName', {
                  defaultValue: 'Vergi Dairesi',
                })}
              </span>

              <input
                type="text"
                value={customer.taxOfficeName}
                onChange={(event) =>
                  updateCustomer({
                    taxOfficeName: event.target.value,
                  })
                }
                placeholder="Vergi dairesi adı"
              />
            </label>

            {/* =========================================
                CONTACT
                ========================================= */}

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
                placeholder="0 (5xx) xxx xx xx"
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
                placeholder="muhasebe@firma.com"
              />
            </label>

            {/* =========================================
                ADDRESS
                ========================================= */}

            <div className={`${styles.sectionTitle} ${styles.fullWidth}`}>
              <span>
                {t('customerAddress.addressInformation', {
                  defaultValue: 'Fatura Adresi',
                })}
              </span>

              <small>Faturada kullanılacak adres</small>
            </div>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>
                {t('customerAddress.addressName', {
                  defaultValue: 'Adres Tanımı',
                })}
              </span>

              <input
                type="text"
                value={customer.address.addressName}
                onChange={(event) =>
                  updateAddress({
                    addressName: event.target.value,
                  })
                }
                placeholder="Örn: Merkez Ofis"
              />
            </label>

            <label className={styles.field}>
              <span>
                {t('customerAddress.country', {
                  defaultValue: 'Ülke',
                })}
              </span>

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
              <span>
                {t('customerAddress.city', {
                  defaultValue: 'İl',
                })}
              </span>

              <input
                type="text"
                list="invoice-city-options"
                value={customer.address.city}
                onChange={(event) =>
                  updateAddress({
                    city: event.target.value,
                  })
                }
                placeholder="İl seçin veya yazın"
              />

              <datalist id="invoice-city-options">
                {knownCities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </label>

            <label className={styles.field}>
              <span>
                {t('customerAddress.district', {
                  defaultValue: 'İlçe',
                })}
              </span>

              <input
                type="text"
                value={customer.address.district}
                onChange={(event) =>
                  updateAddress({
                    district: event.target.value,
                  })
                }
                placeholder="İlçe"
              />
            </label>

            <label className={styles.field}>
              <span>
                {t('customerAddress.neighborhood', {
                  defaultValue: 'Mahalle',
                })}
              </span>

              <input
                type="text"
                value={customer.address.neighborhood}
                onChange={(event) =>
                  updateAddress({
                    neighborhood: event.target.value,
                  })
                }
                placeholder="Mahalle"
              />
            </label>

            <label className={styles.field}>
              <span>
                {t('customerAddress.avenue', {
                  defaultValue: 'Cadde',
                })}
              </span>

              <input
                type="text"
                value={customer.address.avenue}
                onChange={(event) =>
                  updateAddress({
                    avenue: event.target.value,
                  })
                }
                placeholder="Cadde"
              />
            </label>

            <label className={styles.field}>
              <span>
                {t('customerAddress.street', {
                  defaultValue: 'Sokak',
                })}
              </span>

              <input
                type="text"
                value={customer.address.street}
                onChange={(event) =>
                  updateAddress({
                    street: event.target.value,
                  })
                }
                placeholder="Sokak"
              />
            </label>

            <label className={styles.field}>
              <span>
                {t('customerAddress.buildingNumber', {
                  defaultValue: 'Bina No',
                })}
              </span>

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
              <span>
                {t('customerAddress.apartmentNumber', {
                  defaultValue: 'Daire No',
                })}
              </span>

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
              <span>
                {t('customerAddress.postalCode', {
                  defaultValue: 'Posta Kodu',
                })}
              </span>

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
              <span>
                {t('customerAddress.addressCode', {
                  defaultValue: 'Adres Kodu',
                })}
              </span>

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
              <span>
                {t('customerAddress.additionalDescription', {
                  defaultValue: 'Adres Açıklaması',
                })}
              </span>

              <textarea
                rows={3}
                value={customer.address.additionalDescription}
                onChange={(event) =>
                  updateAddress({
                    additionalDescription: event.target.value,
                  })
                }
                placeholder="Kat, blok, tarif veya ek adres bilgisi..."
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
