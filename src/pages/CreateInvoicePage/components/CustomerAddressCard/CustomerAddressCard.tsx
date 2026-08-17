import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { InvoiceCustomer } from '../../../../models/invoice';
import styles from './CustomerAddressCard.module.scss';

interface CustomerAddressCardProps {
  initialCustomer?: InvoiceCustomer;
  initialCustomerName?: string;
  onCustomerChange?: (customer: InvoiceCustomer) => void;
}

export function CustomerAddressCard({
  initialCustomer,
  initialCustomerName = '',
  onCustomerChange,
}: CustomerAddressCardProps) {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);

  const customerName = initialCustomer?.name ?? initialCustomerName;

  const [customer, setCustomer] = useState<InvoiceCustomer>({
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
  });

  const knownCustomers = ['Yılmaz Ticaret A.Ş.', 'Demir İnşaat Ltd. Şti.', 'Aksa Gıda San. A.Ş.'];

  const knownCities = ['Ankara', 'İstanbul', 'İzmir'];

  function handleToggle() {
    setIsExpanded((current) => !current);
  }

  function updateCustomer(changes: Partial<InvoiceCustomer>) {
    const updated: InvoiceCustomer = {
      ...customer,
      ...changes,
    };

    setCustomer(updated);
    onCustomerChange?.(updated);
  }

  function updateAddress(changes: Partial<InvoiceCustomer['address']>) {
    const updated: InvoiceCustomer = {
      ...customer,
      address: {
        ...customer.address,
        ...changes,
      },
    };

    setCustomer(updated);
    onCustomerChange?.(updated);
  }

  return (
    <section className={`${styles.panel} ${isExpanded ? styles.panelOpen : ''}`}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${styles.activeTab}`}
          onClick={handleToggle}
        >
          {t('customerAddress.currentAccountInfo')}
        </button>
      </div>

      <button
        type="button"
        className={styles.toggleButton}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-label={
          isExpanded ? t('customerAddress.hideDetails') : t('customerAddress.showDetails')
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
          <span>{t('customerAddress.customerName')}</span>

          <select
            value={customer.name}
            onChange={(event) =>
              updateCustomer({
                name: event.target.value,
              })
            }
          >
            <option value="" disabled>
              {t('customerAddress.selectCustomer')}
            </option>

            {customer.name && !knownCustomers.includes(customer.name) ? (
              <option value={customer.name}>{customer.name}</option>
            ) : null}

            {knownCustomers.map((knownCustomer) => (
              <option key={knownCustomer} value={knownCustomer}>
                {knownCustomer}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>{t('customerAddress.titleName')}</span>

          <input
            type="text"
            value={customer.titleName}
            onChange={(event) =>
              updateCustomer({
                titleName: event.target.value,
              })
            }
            placeholder={t('customerAddress.titleNamePlaceholder')}
          />
        </label>
      </div>

      <div className={`${styles.expandable} ${isExpanded ? styles.expandableOpen : ''}`}>
        <div className={styles.expandableInner}>
          <div className={styles.detailsGrid}>
            <div className={`${styles.sectionTitle} ${styles.fullWidth}`}>
              {t('customerAddress.taxInformation')}
            </div>

            <label className={styles.field}>
              <span>{t('customerAddress.taxNumber')}</span>

              <input
                type="text"
                inputMode="numeric"
                value={customer.taxNumber}
                onChange={(event) =>
                  updateCustomer({
                    taxNumber: event.target.value,
                  })
                }
                placeholder={t('customerAddress.taxNumberPlaceholder')}
              />
            </label>

            <div className={styles.lookupButtons}>
              <button type="button">{t('customerAddress.declaration')}</button>

              <button type="button">{t('customerAddress.freeQuery')}</button>
            </div>

            <label className={styles.field}>
              <span>{t('customerAddress.taxOfficeCode')}</span>

              <input
                type="text"
                value={customer.taxOfficeCode}
                onChange={(event) =>
                  updateCustomer({
                    taxOfficeCode: event.target.value,
                  })
                }
                placeholder={t('customerAddress.taxOfficeCodePlaceholder')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.taxOfficeName')}</span>

              <input
                type="text"
                value={customer.taxOfficeName}
                onChange={(event) =>
                  updateCustomer({
                    taxOfficeName: event.target.value,
                  })
                }
                placeholder={t('customerAddress.taxOfficeNamePlaceholder')}
              />
            </label>

            <div className={`${styles.sectionTitle} ${styles.fullWidth}`}>
              {t('customerAddress.addressInformation')}
            </div>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>{t('customerAddress.addressName')}</span>

              <input
                type="text"
                value={customer.address.addressName}
                onChange={(event) =>
                  updateAddress({
                    addressName: event.target.value,
                  })
                }
                placeholder={t('customerAddress.addressNamePlaceholder')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.country')}</span>

              <select
                value={customer.address.country}
                onChange={(event) =>
                  updateAddress({
                    country: event.target.value,
                  })
                }
              >
                <option value="Türkiye">{t('customerAddress.turkey')}</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.city')}</span>

              <select
                value={customer.address.city}
                onChange={(event) =>
                  updateAddress({
                    city: event.target.value,
                  })
                }
              >
                <option value="" disabled>
                  {t('customerAddress.select')}
                </option>

                {customer.address.city && !knownCities.includes(customer.address.city) ? (
                  <option value={customer.address.city}>{customer.address.city}</option>
                ) : null}

                {knownCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.district')}</span>

              <input
                type="text"
                value={customer.address.district}
                onChange={(event) =>
                  updateAddress({
                    district: event.target.value,
                  })
                }
                placeholder={t('customerAddress.select')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.neighborhood')}</span>

              <input
                type="text"
                value={customer.address.neighborhood}
                onChange={(event) =>
                  updateAddress({
                    neighborhood: event.target.value,
                  })
                }
                placeholder={t('customerAddress.neighborhoodPlaceholder')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.avenue')}</span>

              <input
                type="text"
                value={customer.address.avenue}
                onChange={(event) =>
                  updateAddress({
                    avenue: event.target.value,
                  })
                }
                placeholder={t('customerAddress.avenuePlaceholder')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.street')}</span>

              <input
                type="text"
                value={customer.address.street}
                onChange={(event) =>
                  updateAddress({
                    street: event.target.value,
                  })
                }
                placeholder={t('customerAddress.streetPlaceholder')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.buildingNumber')}</span>

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
              <span>{t('customerAddress.apartmentNumber')}</span>

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
              <span>{t('customerAddress.postalCode')}</span>

              <input
                type="text"
                inputMode="numeric"
                value={customer.address.postalCode}
                onChange={(event) =>
                  updateAddress({
                    postalCode: event.target.value,
                  })
                }
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.addressCode')}</span>

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
              <span>{t('customerAddress.additionalDescription')}</span>

              <textarea
                rows={3}
                value={customer.address.additionalDescription}
                onChange={(event) =>
                  updateAddress({
                    additionalDescription: event.target.value,
                  })
                }
                placeholder={t('customerAddress.additionalDescriptionPlaceholder')}
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
