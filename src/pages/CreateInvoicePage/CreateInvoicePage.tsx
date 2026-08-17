import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import type {
  Invoice,
  InvoiceCustomer,
  InvoiceItem,
} from '../../models/invoice';

import { useAppDispatch } from '../../store/hooks';
import {
  createInvoice,
  updateInvoice,
} from '../../store/slices/invoiceSlice';

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
  const dispatch = useAppDispatch();

  const sourceInvoice =
    (location.state as CreateInvoiceLocationState | null)
      ?.sourceInvoice ?? null;

  const [items, setItems] = useState<InvoiceItem[]>(
    sourceInvoice?.items ?? [],
  );

  const [customer, setCustomer] = useState<
    InvoiceCustomer | undefined
  >(sourceInvoice?.customer);

  const [document, setDocument] =
    useState(sourceInvoice?.document);

  const [sourceDocuments, setSourceDocuments] =
    useState(sourceInvoice?.sourceDocuments ?? []);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isEnglish =
    i18n.resolvedLanguage?.startsWith('en') ?? false;

  function handleCancel() {
    navigate('/');
  }

  function calculateTotals(invoiceItems: InvoiceItem[]) {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalVat = 0;

    invoiceItems.forEach((item) => {
      const gross = item.quantity * item.unitPrice;

      const discount =
        gross * (item.discountRate / 100);

      const discounted = gross - discount;

      const vat =
        discounted * (item.vatRate / 100);

      subtotal += gross;
      totalDiscount += discount;
      totalVat += vat;
    });

    return {
      subtotal,
      totalDiscount,
      totalVat,
      grandTotal:
        subtotal - totalDiscount + totalVat,
    };
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);

    try {
      const totals = calculateTotals(items);

      const invoiceData = {
        invoiceNumber:
          sourceInvoice?.invoiceNumber ?? '',

        customerName:
          customer?.name ??
          sourceInvoice?.customerName ??
          '',

        issueDate:
          sourceInvoice?.issueDate ?? '',

        dueDate:
          sourceInvoice?.dueDate ?? '',

        amount: totals.grandTotal,

        type:
          sourceInvoice?.type ?? 'sale',

        status:
          sourceInvoice?.status ?? 'pending',

        customer,

        document,

        sourceDocuments,

        items,

        totals,
      };

      if (sourceInvoice) {
        await dispatch(
          updateInvoice({
            ...sourceInvoice,
            ...invoiceData,
          }),
        ).unwrap();
      } else {
        await dispatch(
          createInvoice(invoiceData),
        ).unwrap();
      }

      navigate('/');
    } catch (error) {
      setSaveError(
        typeof error === 'string'
          ? error
          : t('errors.invoiceSave'),
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleLanguageChange(
    language: 'tr' | 'en',
  ) {
    void i18n.changeLanguage(language);
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>
              P
            </div>

            <div className={styles.brandText}>
              <strong>PreAccounting</strong>

              <span>
                {t('createInvoice.pageTitle')}
              </span>
            </div>
          </div>

          <div className={styles.topBarActions}>
            <button
              type="button"
              className={styles.backButton}
              onClick={handleCancel}
              disabled={isSaving}
            >
              <span aria-hidden="true">
                ←
              </span>

              {t('navigation.invoiceList', {
                defaultValue: 'Fatura Listesi',
              })}
            </button>

            <div
              className={styles.languageSwitcher}
            >
              <button
                type="button"
                className={
                  !isEnglish
                    ? styles.activeLanguageButton
                    : styles.languageButton
                }
                onClick={() =>
                  handleLanguageChange('tr')
                }
              >
                TR
              </button>

              <button
                type="button"
                className={
                  isEnglish
                    ? styles.activeLanguageButton
                    : styles.languageButton
                }
                onClick={() =>
                  handleLanguageChange('en')
                }
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
            <span className={styles.eyebrow}>
              {t('createInvoice.pageEyebrow')}
            </span>

            <h1>
              {t('createInvoice.pageTitle')}
            </h1>

            <p>
              {t(
                'createInvoice.pageDescription',
              )}
            </p>

            {saveError ? (
              <div className={styles.saveError}>
                {saveError}
              </div>
            ) : null}

            {sourceInvoice ? (
              <div
                className={
                  styles.prefillNotice
                }
              >
                <span aria-hidden="true">
                  ✓
                </span>

                {t(
                  'createInvoice.prefilledFrom',
                  {
                    invoiceNumber:
                      sourceInvoice.invoiceNumber,
                  },
                )}
              </div>
            ) : null}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isSaving}
            >
              {t('actions.cancel')}
            </button>

            <button
              type="button"
              className={styles.saveButton}
              onClick={() =>
                void handleSave()
              }
              disabled={isSaving}
            >
              <span aria-hidden="true">
                ✓
              </span>

              {isSaving
                ? 'Kaydediliyor...'
                : t(
                  'createInvoice.saveInvoice',
                )}
            </button>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.topPanels}>
            <CustomerAddressCard
              initialCustomer={
                sourceInvoice?.customer
              }
              initialCustomerName={
                sourceInvoice?.customerName ?? ''
              }
              onCustomerChange={
                setCustomer
              }
            />

            <DocumentInfoBar
              initialDocument={sourceInvoice?.document}
              initialSourceDocuments={sourceInvoice?.sourceDocuments}
              initialInvoiceNumber={sourceInvoice?.invoiceNumber ?? ''}
              initialIssueDate={sourceInvoice?.issueDate ?? ''}
              onDocumentChange={setDocument}
              onSourceDocumentsChange={setSourceDocuments}
            />
          </div>

          <InvoiceItemsTable
            initialItems={
              sourceInvoice?.items
            }
            initialAmount={
              sourceInvoice?.amount ?? 0
            }
            onItemsChange={setItems}
          />
        </section>
      </div>
    </div>
  );
}