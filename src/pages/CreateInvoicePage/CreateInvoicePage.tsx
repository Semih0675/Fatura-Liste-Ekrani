import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useLocation, useNavigate } from 'react-router-dom';

import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceAdditionalInfo,
  InvoiceCustomer,
  InvoiceDocument,
  InvoiceItem,
  InvoicePaymentInfo,
  InvoiceSourceDocument,
} from '../../models/invoice';

import { useAppDispatch } from '../../store/hooks';

import { createDraftInvoice, createInvoice } from '../../store/slices/invoiceSlice';

import { CustomerAddressCard } from './components/CustomerAddressCard/CustomerAddressCard';

import { DocumentInfoBar } from './components/DocumentInfoBar/DocumentInfoBar';

import { InvoiceItemsTable } from './components/InvoiceItemsTable/InvoiceItemsTable';

import { InvoicePaymentPanel } from './components/InvoicePaymentPanel/InvoicePaymentPanel';

import { InvoiceActionBar } from './components/InvoiceActionBar/InvoiceActionBar';

import { InvoicePreviewModal } from './components/InvoicePreviewModal/InvoicePreviewModal';

import styles from './CreateInvoicePage.module.scss';

interface CreateInvoiceLocationState {
  sourceInvoice?: Invoice;
}

type SavingMode = 'draft' | 'final' | null;

/* =========================================================
   DATE HELPERS
   ========================================================= */

function formatLocalDate(date: Date): string {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function getToday(): string {
  return formatLocalDate(new Date());
}

function getDefaultDueDate(): string {
  const date = new Date();

  date.setDate(date.getDate() + 30);

  return formatLocalDate(date);
}

/* =========================================================
   TOTALS
   ========================================================= */

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

/* =========================================================
   PAGE
   ========================================================= */

export default function CreateInvoicePage() {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const location = useLocation();

  const dispatch = useAppDispatch();

  /* =======================================================
     SOURCE INVOICE

     Sadece ön doldurma için kullanılır.
     Eski faturayı güncellemez.
     ======================================================= */

  const sourceInvoice =
    (location.state as CreateInvoiceLocationState | null)?.sourceInvoice ?? null;

  /* =======================================================
     DEFAULT DATES
     ======================================================= */

  const initialIssueDate = sourceInvoice?.issueDate || getToday();

  const initialDueDate = sourceInvoice?.dueDate || getDefaultDueDate();

  /* =======================================================
     ITEMS
     ======================================================= */

  const [items, setItems] = useState<InvoiceItem[]>(sourceInvoice?.items ?? []);

  /* =======================================================
     CUSTOMER
     ======================================================= */

  const [customer, setCustomer] = useState<InvoiceCustomer | undefined>(sourceInvoice?.customer);

  /* =======================================================
     DOCUMENT
     ======================================================= */

  const [document, setDocument] = useState<InvoiceDocument | undefined>(sourceInvoice?.document);

  /* =======================================================
     SOURCE DOCUMENTS
     ======================================================= */

  const [sourceDocuments, setSourceDocuments] = useState<InvoiceSourceDocument[]>(
    sourceInvoice?.sourceDocuments ?? [],
  );

  /* =======================================================
     PAYMENT
     ======================================================= */

  const [payment, setPayment] = useState<InvoicePaymentInfo>(
    sourceInvoice?.payment ?? {
      method: 'bankTransfer',

      accountName: '',

      bankName: '',

      iban: '',

      paymentDescription: '',
    },
  );

  /* =======================================================
     ADDITIONAL INFO
     ======================================================= */

  const [additionalInfo, setAdditionalInfo] = useState<InvoiceAdditionalInfo>(
    sourceInvoice?.additionalInfo ?? {
      note: '',

      privateNote: '',
    },
  );

  /* =======================================================
     DUE DATE
     ======================================================= */

  const [dueDate, setDueDate] = useState(initialDueDate);

  /* =======================================================
     SAVE
     ======================================================= */

  const [savingMode, setSavingMode] = useState<SavingMode>(null);

  const [saveError, setSaveError] = useState<string | null>(null);

  const isSaving = savingMode !== null;

  /* =======================================================
     PREVIEW
     ======================================================= */

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /* =======================================================
     LANGUAGE
     ======================================================= */

  const isEnglish = i18n.resolvedLanguage?.startsWith('en') ?? false;

  /* =======================================================
     TOTALS
     ======================================================= */

  const totals = useMemo(() => calculateTotals(items), [items]);

  /* =======================================================
     ISSUE DATE
     ======================================================= */

  const issueDate = useMemo(() => {
    if (!document?.dateTime) {
      return initialIssueDate;
    }

    const documentDate = document.dateTime.slice(0, 10);

    return documentDate || initialIssueDate;
  }, [document?.dateTime, initialIssueDate]);

  /* =======================================================
     INVOICE NUMBER
     ======================================================= */

  const invoiceNumber = useMemo(() => {
    const series = document?.series?.trim();

    const number = document?.number?.trim();

    if (series && number) {
      return `${series}-${number}`;
    }

    if (number) {
      return number;
    }

    return '';
  }, [document?.series, document?.number]);

  /* =======================================================
     NAVIGATION
     ======================================================= */

  function handleCancel() {
    navigate('/');
  }

  /* =======================================================
     FINAL VALIDATION
     ======================================================= */

  function validateInvoice(): string | null {
    if (!customer?.name?.trim()) {
      return 'Lütfen müşteri seçiniz.';
    }

    if (items.length === 0) {
      return 'Faturaya en az bir kalem ekleyiniz.';
    }

    const hasValidItem = items.some(
      (item) =>
        item.quantity > 0 &&
        item.unitPrice >= 0 &&
        Boolean(item.productName?.trim() || item.description?.trim()),
    );

    if (!hasValidItem) {
      return 'En az bir geçerli ürün veya hizmet kalemi giriniz.';
    }

    if (!issueDate) {
      return 'Fatura tarihi boş bırakılamaz.';
    }

    if (!dueDate) {
      return 'Vade tarihi boş bırakılamaz.';
    }

    const issueDateValue = new Date(issueDate).getTime();

    const dueDateValue = new Date(dueDate).getTime();

    if (Number.isNaN(issueDateValue) || Number.isNaN(dueDateValue)) {
      return 'Geçersiz tarih bilgisi.';
    }

    if (dueDateValue < issueDateValue) {
      return 'Vade tarihi fatura tarihinden önce olamaz.';
    }

    return null;
  }

  /* =======================================================
     BUILD INVOICE
     ======================================================= */

  function buildInvoiceInput(status: Invoice['status']): CreateInvoiceInput {
    return {
      invoiceNumber,

      customerName: customer?.name ?? '',

      issueDate,

      dueDate,

      amount: totals.grandTotal,

      type: sourceInvoice?.type ?? 'sale',

      status,

      customer,

      document,

      sourceDocuments,

      items,

      totals,

      payment,

      additionalInfo,
    };
  }

  /* =======================================================
     SAVE DRAFT
     ======================================================= */

  async function handleSaveDraft() {
    if (isSaving) {
      return;
    }

    setSavingMode('draft');

    setSaveError(null);

    try {
      /*
       * Taslakta normal fatura
       * validasyonu uygulanmıyor.
       *
       * Müşteri veya kalem bilgisi
       * eksik olsa bile taslak
       * kaydedilebilir.
       */
      const invoiceData = buildInvoiceInput('draft');

      await dispatch(createDraftInvoice(invoiceData)).unwrap();

      navigate('/');
    } catch (error) {
      setSaveError(typeof error === 'string' ? error : 'Taslak kaydedilirken bir hata oluştu.');
    } finally {
      setSavingMode(null);
    }
  }

  /* =======================================================
     SAVE FINAL INVOICE
     ======================================================= */

  async function handleSave() {
    if (isSaving) {
      return;
    }

    const validationError = validateInvoice();

    if (validationError) {
      setSaveError(validationError);

      return;
    }

    setSavingMode('final');

    setSaveError(null);

    try {
      /*
       * sourceInvoice olsa bile
       * eski kaydı UPDATE etmiyoruz.
       *
       * Bu sayfa "Yeni Fatura"
       * sayfası olduğu için her
       * zaman yeni kayıt oluşturur.
       */
      const invoiceData = buildInvoiceInput('pending');

      await dispatch(createInvoice(invoiceData)).unwrap();

      navigate('/');
    } catch (error) {
      setSaveError(
        typeof error === 'string'
          ? error
          : t('errors.invoiceSave', {
              defaultValue: 'Fatura kaydedilirken bir hata oluştu.',
            }),
      );
    } finally {
      setSavingMode(null);
    }
  }

  /* =======================================================
     LANGUAGE
     ======================================================= */

  function handleLanguageChange(language: 'tr' | 'en') {
    void i18n.changeLanguage(language);
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className={styles.page}>
      {/* ===================================================
          TOP BAR
          =================================================== */}

      <header className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>P</div>

            <div className={styles.brandText}>
              <strong>PreAccounting</strong>

              <span>
                {t('createInvoice.pageTitle', {
                  defaultValue: 'Yeni Fatura',
                })}
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

      {/* ===================================================
          PAGE
          =================================================== */}

      <div className={styles.pageInner}>
        <section className={styles.pageHeader}>
          <div className={styles.heading}>
            <span className={styles.eyebrow}>E-FATURA / E-ARŞİV</span>

            <h1>
              {t('createInvoice.pageTitle', {
                defaultValue: 'Yeni Fatura',
              })}
            </h1>

            <p>
              Müşteri, belge, ürün, ödeme ve vade bilgilerini girerek yeni faturanızı oluşturun.
            </p>

            {saveError ? <div className={styles.saveError}>{saveError}</div> : null}

            {sourceInvoice ? (
              <div className={styles.prefillNotice}>
                <span aria-hidden="true">✓</span>

                {t('createInvoice.prefilledFrom', {
                  invoiceNumber: sourceInvoice.invoiceNumber,

                  defaultValue: `${sourceInvoice.invoiceNumber} numaralı faturadan bilgiler aktarıldı. Yeni kayıt oluşturulacaktır.`,
                })}
              </div>
            ) : null}
          </div>
        </section>

        {/* =================================================
            CONTENT
            ================================================= */}

        <section className={styles.content}>
          {/* ===============================================
              CUSTOMER + DOCUMENT
              =============================================== */}

          <div className={styles.topPanels}>
            <CustomerAddressCard
              initialCustomer={sourceInvoice?.customer}
              initialCustomerName={sourceInvoice?.customerName ?? ''}
              onCustomerChange={setCustomer}
            />

            <DocumentInfoBar
              initialDocument={sourceInvoice?.document}
              initialSourceDocuments={sourceInvoice?.sourceDocuments}
              initialInvoiceNumber={sourceInvoice?.invoiceNumber ?? ''}
              initialIssueDate={initialIssueDate}
              onDocumentChange={setDocument}
              onSourceDocumentsChange={setSourceDocuments}
            />
          </div>

          {/* ===============================================
              ITEMS
              =============================================== */}

          <InvoiceItemsTable
            initialItems={sourceInvoice?.items}
            initialAmount={sourceInvoice?.amount ?? 0}
            onItemsChange={setItems}
          />

          {/* ===============================================
              PAYMENT
              =============================================== */}

          <InvoicePaymentPanel
            issueDate={issueDate}
            dueDate={dueDate}
            payment={payment}
            additionalInfo={additionalInfo}
            onDueDateChange={setDueDate}
            onPaymentChange={setPayment}
            onAdditionalInfoChange={setAdditionalInfo}
          />

          {/* ===============================================
              ACTION BAR
              =============================================== */}

          <InvoiceActionBar
            isSaving={isSaving}
            savingMode={savingMode}
            invoiceNumber={invoiceNumber}
            customerName={customer?.name ?? ''}
            total={totals.grandTotal}
            currency={document?.currency ?? 'TRY'}
            onCancel={handleCancel}
            onPreview={() => setIsPreviewOpen(true)}
            onSaveDraft={() => void handleSaveDraft()}
            onSave={() => void handleSave()}
          />
        </section>
      </div>

      {/* ===================================================
          PREVIEW
          =================================================== */}

      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        invoiceNumber={invoiceNumber}
        issueDate={issueDate}
        dueDate={dueDate}
        customer={customer}
        document={document}
        items={items}
        totals={totals}
        payment={payment}
        additionalInfo={additionalInfo}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
