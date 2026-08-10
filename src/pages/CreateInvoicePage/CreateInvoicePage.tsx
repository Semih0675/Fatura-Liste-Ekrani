import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { CreateInvoiceInput, Invoice, InvoiceItem } from '../../models/invoice';
import { CustomerAddressCard } from './components/CustomerAddressCard/CustomerAddressCard';
import { DocumentInfoBar } from './components/DocumentInfoBar/DocumentInfoBar';
import { InvoiceItemsTable } from './components/InvoiceItemsTable/InvoiceItemsTable';
import styles from './CreateInvoicePage.module.scss';
import { useAppDispatch } from '../../store/hooks';
import { createInvoice } from '../../store/slices/invoiceSlice';
interface CreateInvoiceLocationState {
  sourceInvoice?: Invoice;
}

export default function CreateInvoicePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const sourceInvoice =
    (location.state as CreateInvoiceLocationState | null)?.sourceInvoice ?? null;

  const dispatch = useAppDispatch();

  const [items, setItems] = useState<InvoiceItem[]>(sourceInvoice?.items ?? []);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isEnglish = i18n.resolvedLanguage?.startsWith('en') ?? false;

  function handleCancel() {
    navigate('/');
  }
  function calculateTotals(invoiceItems: InvoiceItem[]) {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalVat = 0;

    invoiceItems.forEach((item) => {
      const gross = item.quantity * item.unitPrice;
      const discount = gross * (item.discountRate / 100);
      const discounted = gross - discount;
      const vat = discounted * (item.vatRate / 100);

      subtotal += gross;
      totalDiscount += discount;
      totalVat += vat;
    });

    return {
      subtotal,
      totalDiscount,
      totalVat,
      grandTotal: subtotal - totalDiscount + totalVat,
    };
  }
  async function handleSave() {
    if (items.length === 0) {
      setSaveError('En az bir fatura kalemi eklemelisiniz.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const totals = calculateTotals(items);
      const now = new Date();

      const invoiceNumber = `FTR-${now.getFullYear()}-${Date.now().toString().slice(-6)}`;

      const invoice: CreateInvoiceInput = {
        invoiceNumber,
        customerName: sourceInvoice?.customerName ?? 'Yeni Müşteri',

        issueDate: now.toISOString().slice(0, 10),

        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),

        amount: totals.grandTotal,

        type: sourceInvoice?.type ?? 'sale',

        status: 'pending',

        customer: sourceInvoice?.customer,
        document: sourceInvoice?.document,

        sourceDocuments: sourceInvoice?.sourceDocuments ?? [],

        items,

        totals,
      };

      await dispatch(createInvoice(invoice)).unwrap();

      navigate('/');
    } catch (error) {
      setSaveError(typeof error === 'string' ? error : 'Fatura kaydedilirken hata oluştu.');
    } finally {
      setIsSaving(false);
    }
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
            {saveError ? (
              <div className={styles.saveError}>
                {saveError}
              </div>
            ) : null}

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

            <button
              type="button"
              className={styles.saveButton}
              onClick={() => void handleSave()}
              disabled={isSaving}
            >
              <span aria-hidden="true">✓</span>

              {isSaving ? 'Kaydediliyor...' : t('createInvoice.saveInvoice')}
            </button>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.topPanels}>
            <CustomerAddressCard
              initialCustomer={sourceInvoice?.customer}
              initialCustomerName={sourceInvoice?.customerName ?? ''}
            />

            <DocumentInfoBar
              initialDocument={sourceInvoice?.document}
              initialSourceDocuments={sourceInvoice?.sourceDocuments}
              initialInvoiceNumber={sourceInvoice?.invoiceNumber ?? ''}
              initialIssueDate={sourceInvoice?.issueDate ?? ''}
            />
          </div>

          <InvoiceItemsTable
            initialItems={sourceInvoice?.items}
            initialAmount={sourceInvoice?.amount ?? 0}
            onItemsChange={setItems}
          />
        </section>
      </div>
    </div>
  );
}
