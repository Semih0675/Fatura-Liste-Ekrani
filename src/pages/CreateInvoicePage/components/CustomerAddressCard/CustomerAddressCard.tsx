import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { InvoiceCustomer } from '../../../../models/invoice';
import styles from './CustomerAddressCard.module.scss';

interface CustomerAddressCardProps {
  initialCustomer?: InvoiceCustomer;
  initialCustomerName?: string;
}

export function CustomerAddressCard({
  initialCustomer,
  initialCustomerName = '',
}: CustomerAddressCardProps) {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);

  const customerName = initialCustomer?.name ?? initialCustomerName;

  const address = initialCustomer?.address;

  const knownCustomers = ['Yılmaz Ticaret A.Ş.', 'Demir İnşaat Ltd. Şti.', 'Aksa Gıda San. A.Ş.'];

  const knownCities = ['Ankara', 'İstanbul', 'İzmir'];

  function handleToggle() {
    setIsExpanded((current) => !current);
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

          <select defaultValue={customerName}>
            <option value="" disabled>
              {t('customerAddress.selectCustomer')}
            </option>

            {customerName && !knownCustomers.includes(customerName) ? (
              <option value={customerName}>{customerName}</option>
            ) : null}

            {knownCustomers.map((customer) => (
              <option key={customer} value={customer}>
                {customer}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>{t('customerAddress.titleName')}</span>

          <input
            type="text"
            defaultValue={initialCustomer?.titleName ?? customerName}
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
                defaultValue={initialCustomer?.taxNumber ?? ''}
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
                defaultValue={initialCustomer?.taxOfficeCode ?? ''}
                placeholder={t('customerAddress.taxOfficeCodePlaceholder')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.taxOfficeName')}</span>

              <input
                type="text"
                defaultValue={initialCustomer?.taxOfficeName ?? ''}
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
                defaultValue={address?.addressName ?? ''}
                placeholder={t('customerAddress.addressNamePlaceholder')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.country')}</span>

              <select defaultValue={address?.country ?? 'Türkiye'}>
                <option value="Türkiye">{t('customerAddress.turkey')}</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.city')}</span>

              <select defaultValue={address?.city ?? ''}>
                <option value="" disabled>
                  {t('customerAddress.select')}
                </option>

                {address?.city && !knownCities.includes(address.city) ? (
                  <option value={address.city}>{address.city}</option>
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
                defaultValue={address?.district ?? ''}
                placeholder={t('customerAddress.select')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.neighborhood')}</span>

              <input
                type="text"
                defaultValue={address?.neighborhood ?? ''}
                placeholder={t('customerAddress.neighborhoodPlaceholder')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.avenue')}</span>

              <input
                type="text"
                defaultValue={address?.avenue ?? ''}
                placeholder={t('customerAddress.avenuePlaceholder')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.street')}</span>

              <input
                type="text"
                defaultValue={address?.street ?? ''}
                placeholder={t('customerAddress.streetPlaceholder')}
              />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.buildingNumber')}</span>

              <input type="text" defaultValue={address?.buildingNumber ?? ''} />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.apartmentNumber')}</span>

              <input type="text" defaultValue={address?.apartmentNumber ?? ''} />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.postalCode')}</span>

              <input type="text" inputMode="numeric" defaultValue={address?.postalCode ?? ''} />
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.addressCode')}</span>

              <input type="text" defaultValue={address?.addressCode ?? ''} />
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>{t('customerAddress.additionalDescription')}</span>

              <textarea
                rows={3}
                defaultValue={address?.additionalDescription ?? ''}
                placeholder={t('customerAddress.additionalDescriptionPlaceholder')}
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
