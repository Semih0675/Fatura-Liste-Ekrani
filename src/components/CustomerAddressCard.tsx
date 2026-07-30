import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CustomerAddressCard.module.scss';

type CustomerTab = 'customer' | 'address';

export function CustomerAddressCard() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<CustomerTab>('customer');
  const [isExpanded, setIsExpanded] = useState(false);

  function handleCustomerTab() {
    if (activeTab === 'customer') {
      setIsExpanded((current) => !current);
      return;
    }

    setActiveTab('customer');
    setIsExpanded(true);
  }

  function handleAddressTab() {
    if (activeTab === 'address') {
      setIsExpanded((current) => !current);
      return;
    }

    setActiveTab('address');
    setIsExpanded(true);
  }

  function handleToggle() {
    setIsExpanded((current) => !current);
  }

  return (
    <section className={`${styles.panel} ${isExpanded ? styles.panelOpen : ''}`}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'customer' ? styles.activeTab : ''}`}
          onClick={handleCustomerTab}
        >
          Müşteri Bilgileri
        </button>

        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'address' ? styles.activeTab : ''}`}
          onClick={handleAddressTab}
        >
          Adres Bilgileri
        </button>
      </div>

      <button
        type="button"
        className={styles.toggleButton}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Bilgileri kapat' : 'Bilgileri aç'}
      >
        <span
          className={`${styles.arrow} ${isExpanded ? styles.arrowOpen : ''}`}
          aria-hidden="true"
        >
          ⌄
        </span>
      </button>

      {activeTab === 'customer' ? (
        <>
          <div className={styles.previewGrid}>
            <label className={styles.field}>
              <span>{t('customerAddress.customerName')}</span>

              <select defaultValue="">
                <option value="" disabled>
                  {t('customerAddress.selectCustomer')}
                </option>

                <option value="yilmaz">Yılmaz Ticaret A.Ş.</option>
                <option value="demir">Demir İnşaat Ltd. Şti.</option>
                <option value="aksa">Aksa Gıda San. A.Ş.</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>{t('customerAddress.titleName')}</span>

              <input type="text" placeholder={t('customerAddress.titleNamePlaceholder')} />
            </label>
          </div>

          <div className={`${styles.expandable} ${isExpanded ? styles.expandableOpen : ''}`}>
            <div className={styles.expandableInner}>
              <div className={styles.detailsGrid}>
                <label className={styles.field}>
                  <span>{t('customerAddress.taxNumber')}</span>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={t('customerAddress.taxNumberPlaceholder')}
                  />
                </label>

                <div className={styles.lookupButtons}>
                  <button type="button">{t('customerAddress.declaration')}</button>

                  <button type="button">{t('customerAddress.freeQuery')}</button>
                </div>

                <label className={styles.field}>
                  <span>{t('customerAddress.taxOfficeCode')}</span>

                  <input type="text" placeholder={t('customerAddress.taxOfficeCodePlaceholder')} />
                </label>

                <label className={styles.field}>
                  <span>{t('customerAddress.taxOfficeName')}</span>

                  <input type="text" placeholder={t('customerAddress.taxOfficeNamePlaceholder')} />
                </label>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={`${styles.expandable} ${isExpanded ? styles.expandableOpen : ''}`}>
          <div className={styles.expandableInner}>
            <div className={styles.detailsGrid}>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>{t('customerAddress.addressName')}</span>

                <input type="text" placeholder={t('customerAddress.addressNamePlaceholder')} />
              </label>

              <label className={styles.field}>
                <span>{t('customerAddress.country')}</span>

                <select defaultValue="turkey">
                  <option value="turkey">{t('customerAddress.turkey')}</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>{t('customerAddress.city')}</span>

                <select defaultValue="">
                  <option value="" disabled>
                    {t('customerAddress.select')}
                  </option>

                  <option value="ankara">Ankara</option>
                  <option value="istanbul">İstanbul</option>
                  <option value="izmir">İzmir</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>{t('customerAddress.district')}</span>

                <input type="text" placeholder={t('customerAddress.select')} />
              </label>

              <label className={styles.field}>
                <span>{t('customerAddress.neighborhood')}</span>

                <input type="text" placeholder={t('customerAddress.neighborhoodPlaceholder')} />
              </label>

              <label className={styles.field}>
                <span>{t('customerAddress.avenue')}</span>

                <input type="text" placeholder={t('customerAddress.avenuePlaceholder')} />
              </label>

              <label className={styles.field}>
                <span>{t('customerAddress.street')}</span>

                <input type="text" placeholder={t('customerAddress.streetPlaceholder')} />
              </label>

              <label className={styles.field}>
                <span>{t('customerAddress.buildingNumber')}</span>
                <input type="text" />
              </label>

              <label className={styles.field}>
                <span>{t('customerAddress.apartmentNumber')}</span>
                <input type="text" />
              </label>

              <label className={styles.field}>
                <span>{t('customerAddress.postalCode')}</span>
                <input type="text" inputMode="numeric" />
              </label>

              <label className={styles.field}>
                <span>{t('customerAddress.addressCode')}</span>
                <input type="text" />
              </label>

              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>{t('customerAddress.additionalDescription')}</span>

                <textarea
                  rows={3}
                  placeholder={t('customerAddress.additionalDescriptionPlaceholder')}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
