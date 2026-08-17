import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useLocation, useNavigate } from 'react-router-dom';

import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceAdditionalInfo,
  InvoiceCompany,
  InvoiceCustomer,
  InvoiceDocument,
  InvoiceItem,
  InvoicePaymentInfo,
  InvoiceSourceDocument,
} from '../../models/invoice';

import { calculateInvoiceTotals } from '../../utils/invoiceCalculations';

import { useAppDispatch, useAppSelector } from '../../store/hooks';

import { createDraftInvoice, createInvoice } from '../../store/slices/invoiceSlice';

import { CompanyInfoCard } from './components/CompanyInfoCard/CompanyInfoCard';

import { CustomerAddressCard } from './components/CustomerAddressCard/CustomerAddressCard';

import { DocumentInfoBar } from './components/DocumentInfoBar/DocumentInfoBar';

import { InvoiceActionBar } from './components/InvoiceActionBar/InvoiceActionBar';

import { InvoiceItemsTable } from './components/InvoiceItemsTable/InvoiceItemsTable';

import { InvoiceLiveSummary } from './components/InvoiceLiveSummary/InvoiceLiveSummary';

import { InvoicePaymentPanel } from './components/InvoicePaymentPanel/InvoicePaymentPanel';

import { InvoicePreviewModal } from './components/InvoicePreviewModal/InvoicePreviewModal';

import styles from './CreateInvoicePage.module.scss';

interface CreateInvoiceLocationState {
  sourceInvoice?: Invoice;
}

type SavingMode = 'draft' | 'final' | null;

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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getNextDocumentNumber(
  invoices: Invoice[],

  series: string,

  year: number,
): string {
  const safeSeries = escapeRegExp(series);

  const fullNumberPattern = new RegExp(`^${safeSeries}-${year}-(\\d+)$`, 'i');

  const documentNumberPattern = new RegExp(`^${year}-(\\d+)$`);

  let highestSequence = 0;

  invoices.forEach((invoice) => {
    const fullMatch = invoice.invoiceNumber?.trim().match(fullNumberPattern);

    if (fullMatch) {
      highestSequence = Math.max(
        highestSequence,

        Number(fullMatch[1]),
      );

      return;
    }

    if (
      invoice.document?.series?.toLocaleUpperCase('tr-TR') !== series.toLocaleUpperCase('tr-TR')
    ) {
      return;
    }

    const documentMatch = invoice.document.number?.trim().match(documentNumberPattern);

    if (documentMatch) {
      highestSequence = Math.max(
        highestSequence,

        Number(documentMatch[1]),
      );
    }
  });

  return `${year}-${String(highestSequence + 1).padStart(5, '0')}`;
}

function createDefaultCompany(): InvoiceCompany {
  return {
    title: 'PreAccounting',

    taxNumber: '',

    taxOffice: '',

    mersisNumber: '',

    tradeRegistryNumber: '',

    phone: '',

    email: '',

    website: '',

    address: '',

    district: '',

    city: '',

    country: 'Türkiye',

    logoUrl: '',
  };
}

export default function CreateInvoicePage() {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const location = useLocation();

  const dispatch = useAppDispatch();

  const existingInvoices = useAppSelector((state) => state.invoices.items);

  const sourceInvoice =
    (location.state as CreateInvoiceLocationState | null)?.sourceInvoice ?? null;

  /*
   * Bu ekran yeni fatura
   * oluşturduğu için, başka
   * faturadan aktarım yapılsa
   * bile tarih ve belge numarası
   * yeni kayıt için yeniden
   * oluşturulur.
   */

  const initialIssueDate = getToday();

  const initialDueDate = getDefaultDueDate();

  const currentYear = new Date().getFullYear();

  const sourceSeries = sourceInvoice?.document?.series?.trim() || 'FTR';

  const autoNumbers = useMemo(() => {
    const seriesList = [...new Set(['FTR', 'A', 'B', sourceSeries].filter(Boolean))];

    return Object.fromEntries(
      seriesList.map((series) => [
        series,

        getNextDocumentNumber(existingInvoices, series, currentYear),
      ]),
    );
  }, [currentYear, existingInvoices, sourceSeries]);

  const initialInvoiceNumber = `${sourceSeries}-${autoNumbers[sourceSeries]}`;

  const initialDocumentForForm = useMemo<InvoiceDocument | undefined>(() => {
    if (!sourceInvoice?.document) {
      return undefined;
    }

    return {
      ...sourceInvoice.document,

      series: sourceSeries,

      number: autoNumbers[sourceSeries],

      dateTime: initialIssueDate,

      ettn: '',
    };
  }, [autoNumbers, initialIssueDate, sourceInvoice, sourceSeries]);

  const initialItems = useMemo<InvoiceItem[]>(
    () =>
      sourceInvoice?.items?.map((item) => ({
        ...item,

        id: crypto.randomUUID(),
      })) ?? [],
    [sourceInvoice],
  );

  const initialSourceDocuments = useMemo<InvoiceSourceDocument[]>(
    () =>
      sourceInvoice?.sourceDocuments?.map((sourceDocument) => ({
        ...sourceDocument,

        id: crypto.randomUUID(),
      })) ?? [],
    [sourceInvoice],
  );

  const [items, setItems] = useState<InvoiceItem[]>(initialItems);

  const [customer, setCustomer] = useState<InvoiceCustomer | undefined>(sourceInvoice?.customer);

  const [company, setCompany] = useState<InvoiceCompany>(
    sourceInvoice?.company ?? createDefaultCompany(),
  );

  const [document, setDocument] = useState<InvoiceDocument | undefined>(initialDocumentForForm);

  const [sourceDocuments, setSourceDocuments] =
    useState<InvoiceSourceDocument[]>(initialSourceDocuments);

  const [payment, setPayment] = useState<InvoicePaymentInfo>({
    method: sourceInvoice?.payment?.method ?? 'bankTransfer',

    accountName: sourceInvoice?.payment?.accountName ?? '',

    bankName: sourceInvoice?.payment?.bankName ?? '',

    iban: sourceInvoice?.payment?.iban ?? '',

    paymentDescription: sourceInvoice?.payment?.paymentDescription ?? '',

    collectedAmount: 0,

    collectionDate: '',
  });

  const [additionalInfo, setAdditionalInfo] = useState<InvoiceAdditionalInfo>(
    sourceInvoice?.additionalInfo ?? {
      note: '',

      privateNote: '',
    },
  );

  const [dueDate, setDueDate] = useState(initialDueDate);

  const [savingMode, setSavingMode] = useState<SavingMode>(null);

  const [saveError, setSaveError] = useState<string | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isSaving = savingMode !== null;

  const isEnglish = i18n.resolvedLanguage?.startsWith('en') ?? false;

  const totals = useMemo(() => calculateInvoiceTotals(items), [items]);

  const issueDate = useMemo(() => {
    if (!document?.dateTime) {
      return initialIssueDate;
    }

    return document.dateTime.slice(0, 10) || initialIssueDate;
  }, [document?.dateTime, initialIssueDate]);

  const invoiceNumber = useMemo(() => {
    const series = document?.series?.trim();

    const number = document?.number?.trim();

    if (series && number) {
      return `${series}-${number}`;
    }

    return number || '';
  }, [document?.number, document?.series]);

  const currency = document?.currency ?? initialDocumentForForm?.currency ?? 'TRY';

  const collectedAmount = Math.max(0, payment.collectedAmount ?? 0);

  function handleCancel() {
    navigate('/');
  }

  function validateInvoice(): string | null {
    if (!customer?.name?.trim()) {
      return 'Lütfen müşteri seçiniz.';
    }

    if (!company.title.trim()) {
      return 'Lütfen faturayı düzenleyen firma ünvanını giriniz.';
    }

    if (!document?.series?.trim() || !document?.number?.trim()) {
      return 'Fatura seri ve numarası oluşturulamadı.';
    }

    const validItems = items.filter(
      (item) =>
        item.quantity > 0 &&
        item.unitPrice >= 0 &&
        Boolean(item.productName?.trim() || item.description?.trim()),
    );

    if (validItems.length === 0) {
      return 'En az bir geçerli ürün veya hizmet kalemi giriniz.';
    }

    if (!issueDate || !dueDate) {
      return 'Fatura ve vade tarihlerini kontrol ediniz.';
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

      company,

      document,

      sourceDocuments,

      items,

      totals,

      payment,

      additionalInfo,
    };
  }

  async function handleSaveDraft() {
    if (isSaving) {
      return;
    }

    setSavingMode('draft');

    setSaveError(null);

    try {
      await dispatch(createDraftInvoice(buildInvoiceInput('draft'))).unwrap();

      navigate('/');
    } catch (error) {
      setSaveError(typeof error === 'string' ? error : 'Taslak kaydedilirken bir hata oluştu.');
    } finally {
      setSavingMode(null);
    }
  }

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
      await dispatch(createInvoice(buildInvoiceInput('pending'))).unwrap();

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

      <div className={styles.pageInner}>
        <section className={styles.pageHeader}>
          <div className={styles.heading}>
            <span className={styles.eyebrow}>E-FATURA / E-ARŞİV</span>

            <h1>
              {t('createInvoice.pageTitle', {
                defaultValue: 'Yeni Fatura',
              })}
            </h1>

            <p>Cari, belge, firma, ürün, vergi ve tahsilat bilgilerini tek ekrandan yönetin.</p>

            {saveError ? <div className={styles.saveError}>{saveError}</div> : null}

            {sourceInvoice ? (
              <div className={styles.prefillNotice}>
                <span aria-hidden="true">✓</span>
                {sourceInvoice.invoiceNumber} numaralı faturadan bilgiler aktarıldı. Yeni belge
                numarası otomatik oluşturuldu.
              </div>
            ) : null}
          </div>

          <div className={styles.documentQuickInfo}>
            <span>Yeni Belge No</span>

            <strong>{invoiceNumber || initialInvoiceNumber}</strong>

            <small>
              {currency} • {currentYear}
            </small>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.topPanels}>
            <CustomerAddressCard
              initialCustomer={sourceInvoice?.customer}
              initialCustomerName={sourceInvoice?.customerName ?? ''}
              onCustomerChange={setCustomer}
            />

            <DocumentInfoBar
              initialDocument={initialDocumentForForm}
              initialSourceDocuments={initialSourceDocuments}
              initialInvoiceNumber={initialInvoiceNumber}
              initialIssueDate={initialIssueDate}
              autoNumbers={autoNumbers}
              enableAutoNumbering
              onDocumentChange={setDocument}
              onSourceDocumentsChange={setSourceDocuments}
            />
          </div>

          <CompanyInfoCard company={company} onCompanyChange={setCompany} />

          <InvoiceItemsTable
            initialItems={initialItems}
            initialAmount={sourceInvoice?.amount ?? 0}
            currency={currency}
            onItemsChange={setItems}
          />

          <div className={styles.paymentSummaryGrid}>
            <InvoicePaymentPanel
              issueDate={issueDate}
              dueDate={dueDate}
              total={totals.grandTotal}
              currency={currency}
              payment={payment}
              additionalInfo={additionalInfo}
              onDueDateChange={setDueDate}
              onPaymentChange={setPayment}
              onAdditionalInfoChange={setAdditionalInfo}
            />

            <InvoiceLiveSummary
              totals={totals}
              currency={currency}
              itemCount={items.length}
              dueDate={dueDate}
              collectedAmount={collectedAmount}
            />
          </div>

          <InvoiceActionBar
            isSaving={isSaving}
            savingMode={savingMode}
            invoiceNumber={invoiceNumber}
            customerName={customer?.name ?? ''}
            total={totals.grandTotal}
            currency={currency}
            onCancel={handleCancel}
            onPreview={() => setIsPreviewOpen(true)}
            onSaveDraft={() => void handleSaveDraft()}
            onSave={() => void handleSave()}
          />
        </section>
      </div>

      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        invoiceNumber={invoiceNumber}
        issueDate={issueDate}
        dueDate={dueDate}
        customer={customer}
        company={company}
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
