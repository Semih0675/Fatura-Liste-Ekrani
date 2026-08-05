import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import type { Invoice } from '../../models/invoice';
import { CustomerAddressCard } from './components/CustomerAddressCard/CustomerAddressCard';
import { DocumentInfoBar } from './components/DocumentInfoBar/DocumentInfoBar';
import { InvoiceItemsTable } from './components/InvoiceItemsTable/InvoiceItemsTable';
import styles from './CreateInvoicePage.module.scss';

interface CreateInvoiceLocationState {
  sourceInvoice?: Invoice;
}

export default function CreateInvoicePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const sourceInvoice =
    (location.state as CreateInvoiceLocationState | null)?.sourceInvoice ?? null;

  const isEnglish = i18n.resolvedLanguage?.startsWith('en') ?? false;

  function handleCancel() {
    navigate('/');
  }

  function handleSave() {
    console.log('Fatura kaydedilecek');
  }

  function handleLanguageChange(language: 'tr' | 'en') {
    void i18n.changeLanguage(language);
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>P</div>

            <div className={styles.brandText}>
              <strong>PreAccounting</strong>

              <span>{t('createInvoice.pageTitle')}</span>
            </div>
          </div>

          <div className={styles.topBarActions}>
            <button type="button" className={styles.backButton} onClick={handleCancel}>
              <span aria-hidden="true">←</span>

              {t('navigation.invoiceList', {
                defaultValue: 'Fatura Listesi',
              })}
            </button>

            <div className={styles.languageSwitcher}>
              <button
                type="button"
                className={!isEnglish ? styles.activeLanguageButton : styles.languageButton}
                onClick={() => handleLanguageChange('tr')}
              >
                TR
              </button>

              <button
                type="button"
                className={isEnglish ? styles.activeLanguageButton : styles.languageButton}
                onClick={() => handleLanguageChange('en')}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.pageInner}>
        <section className={styles.pageHeader}>
          <div className={styles.heading}>
            <span className={styles.eyebrow}>{t('createInvoice.pageEyebrow')}</span>

            <h1>{t('createInvoice.pageTitle')}</h1>

            <p>{t('createInvoice.pageDescription')}</p>

            {sourceInvoice ? (
              <div className={styles.prefillNotice}>
                <span aria-hidden="true">✓</span>

                {t('createInvoice.prefilledFrom', {
                  invoiceNumber: sourceInvoice.invoiceNumber,
                })}
              </div>
            ) : null}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={handleCancel}>
              {t('actions.cancel')}
            </button>

            <button type="button" className={styles.saveButton} onClick={handleSave}>
              <span aria-hidden="true">✓</span>

              {t('createInvoice.saveInvoice')}
            </button>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.topPanels}>
            <CustomerAddressCard initialCustomerName={sourceInvoice?.customerName ?? ''} />

            <DocumentInfoBar
              initialInvoiceNumber={sourceInvoice?.invoiceNumber ?? ''}
              initialIssueDate={sourceInvoice?.issueDate ?? ''}
            />
          </div>

          <InvoiceItemsTable initialAmount={sourceInvoice?.amount ?? 0} />
        </section>
      </div>
    </div>
  );
}
