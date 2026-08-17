import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import type {
  InvoiceCurrency,
  InvoiceDocument,
  InvoiceSourceDocument,
} from '../../../../models/invoice';

import styles from './DocumentInfoBar.module.scss';

interface DocumentInfoBarProps {
  initialDocument?: InvoiceDocument;

  initialSourceDocuments?: InvoiceSourceDocument[];

  initialInvoiceNumber?: string;

  initialIssueDate?: string;

  autoNumbers?: Record<string, string>;

  enableAutoNumbering?: boolean;

  onDocumentChange?: (document: InvoiceDocument) => void;

  onSourceDocumentsChange?: (documents: InvoiceSourceDocument[]) => void;
}

type DocumentTab = 'general' | 'source';

function splitInvoiceNumber(invoiceNumber: string) {
  const match = invoiceNumber.match(/^([A-Za-zÇĞİÖŞÜçğıöşü]+)[-\s/]?(.+)$/);

  return {
    series: match?.[1] ?? '',

    number: match?.[2] ?? invoiceNumber,
  };
}

function getCurrentLocalTime() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');

  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

function normalizeDateTimeLocal(value: string) {
  if (!value) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 16);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T${getCurrentLocalTime()}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function createSourceDocument(currency: InvoiceCurrency): InvoiceSourceDocument {
  return {
    id: crypto.randomUUID(),

    documentType: '',

    documentNumber: '',

    documentDate: '',

    issuer: '',

    ettn: '',

    amount: 0,

    currency,
  };
}

export function DocumentInfoBar({
  initialDocument,

  initialSourceDocuments,

  initialInvoiceNumber = '',

  initialIssueDate = '',

  autoNumbers,

  enableAutoNumbering = true,

  onDocumentChange,

  onSourceDocumentsChange,
}: DocumentInfoBarProps) {
  const { t } = useTranslation();

  const fallbackDocument = splitInvoiceNumber(initialInvoiceNumber);

  const initialSeries = initialDocument?.series || fallbackDocument.series || 'FTR';

  const suggestedInitialNumber = autoNumbers?.[initialSeries];

  const [activeTab, setActiveTab] = useState<DocumentTab>('general');

  const [isExpanded, setIsExpanded] = useState(false);

  const [numberWasEdited, setNumberWasEdited] = useState(false);

  const [document, setDocument] = useState<InvoiceDocument>(() => ({
    series: initialSeries,

    number:
      enableAutoNumbering && suggestedInitialNumber
        ? suggestedInitialNumber
        : (initialDocument?.number ?? fallbackDocument.number),

    description: initialDocument?.description ?? '',

    dateTime: normalizeDateTimeLocal(initialDocument?.dateTime ?? initialIssueDate),

    scenario: initialDocument?.scenario ?? 'eArchive',

    eType: initialDocument?.eType ?? 'sale',

    currency: initialDocument?.currency ?? 'TRY',

    ettn: initialDocument?.ettn ?? '',

    cashier: initialDocument?.cashier ?? '',

    label: initialDocument?.label ?? '',

    internetSale: initialDocument?.internetSale ?? false,

    deliveryReplacement: initialDocument?.deliveryReplacement ?? false,
  }));

  const [sourceDocuments, setSourceDocuments] = useState<InvoiceSourceDocument[]>(
    initialSourceDocuments?.map((sourceDocument) => ({
      ...sourceDocument,
    })) ?? [],
  );

  useEffect(() => {
    onDocumentChange?.(document);
  }, [document, onDocumentChange]);

  useEffect(() => {
    onSourceDocumentsChange?.(sourceDocuments);
  }, [sourceDocuments, onSourceDocumentsChange]);

  useEffect(() => {
    if (!enableAutoNumbering || numberWasEdited) {
      return;
    }

    const suggestedNumber = autoNumbers?.[document.series];

    if (!suggestedNumber || suggestedNumber === document.number) {
      return;
    }

    setDocument((currentDocument) => ({
      ...currentDocument,

      number: suggestedNumber,
    }));
  }, [autoNumbers, document.number, document.series, enableAutoNumbering, numberWasEdited]);

  function updateDocument(changes: Partial<InvoiceDocument>) {
    setDocument((currentDocument) => ({
      ...currentDocument,
      ...changes,
    }));
  }

  function handleSeriesChange(series: string) {
    setNumberWasEdited(false);

    updateDocument({
      series,

      number: enableAutoNumbering ? (autoNumbers?.[series] ?? '') : document.number,
    });
  }

  function updateSourceDocument(
    id: string,

    changes: Partial<InvoiceSourceDocument>,
  ) {
    setSourceDocuments((currentDocuments) =>
      currentDocuments.map((sourceDocument) =>
        sourceDocument.id === id
          ? {
              ...sourceDocument,

              ...changes,
            }
          : sourceDocument,
      ),
    );
  }

  function addSourceDocument() {
    setSourceDocuments((currentDocuments) => [
      ...currentDocuments,

      createSourceDocument(document.currency),
    ]);

    setActiveTab('source');

    setIsExpanded(true);
  }

  function removeSourceDocument(id: string) {
    setSourceDocuments((currentDocuments) =>
      currentDocuments.filter((sourceDocument) => sourceDocument.id !== id),
    );
  }

  function handleGeneralTab() {
    if (activeTab === 'general') {
      setIsExpanded((currentValue) => !currentValue);

      return;
    }

    setActiveTab('general');

    setIsExpanded(true);
  }

  function handleSourceTab() {
    if (activeTab === 'source') {
      setIsExpanded((currentValue) => !currentValue);

      return;
    }

    setActiveTab('source');

    setIsExpanded(true);
  }

  function handleToggle() {
    setIsExpanded((currentValue) => !currentValue);
  }

  const invoiceNumberPreview = [document.series, document.number].filter(Boolean).join('-');

  return (
    <section className={`${styles.panel} ${isExpanded ? styles.panelOpen : ''}`}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
          onClick={handleGeneralTab}
        >
          {t('documentInfo.generalTab', {
            defaultValue: 'Fatura Bilgileri',
          })}
        </button>

        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'source' ? styles.activeTab : ''}`}
          onClick={handleSourceTab}
        >
          {t('documentInfo.sourceTab', {
            defaultValue: 'Kaynak Belgeler',
          })}

          {sourceDocuments.length > 0 ? <span>{sourceDocuments.length}</span> : null}
        </button>
      </div>

      <button
        type="button"
        className={styles.toggleButton}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-label={
          isExpanded
            ? t('documentInfo.closeDetails', {
                defaultValue: 'Belge detaylarını kapat',
              })
            : t('documentInfo.openDetails', {
                defaultValue: 'Belge detaylarını aç',
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

      {activeTab === 'general' ? (
        <>
          <div className={styles.previewGrid}>
            <label className={styles.field}>
              <span>
                {t('documentInfo.series', {
                  defaultValue: 'Fatura Serisi',
                })}
              </span>

              <select
                value={document.series}
                onChange={(event) => handleSeriesChange(event.target.value)}
              >
                <option value="">
                  {t('documentInfo.select', {
                    defaultValue: 'Seçiniz',
                  })}
                </option>

                {document.series && !['A', 'B', 'FTR'].includes(document.series) ? (
                  <option value={document.series}>{document.series}</option>
                ) : null}

                <option value="FTR">FTR</option>

                <option value="A">A</option>

                <option value="B">B</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>
                {t('documentInfo.number', {
                  defaultValue: 'Fatura No',
                })}
              </span>

              <input
                type="text"
                value={document.number}
                placeholder="2026-00001"
                onChange={(event) => {
                  setNumberWasEdited(true);

                  updateDocument({
                    number: event.target.value,
                  });
                }}
              />
            </label>
          </div>

          {invoiceNumberPreview ? (
            <div className={styles.documentPreview}>
              <span>
                Belge Numarası {enableAutoNumbering && !numberWasEdited ? '• Otomatik' : ''}
              </span>

              <strong>{invoiceNumberPreview}</strong>
            </div>
          ) : null}

          <div className={`${styles.expandable} ${isExpanded ? styles.expandableOpen : ''}`}>
            <div className={styles.expandableInner}>
              <div className={styles.detailsGrid}>
                <label className={styles.field}>
                  <span>
                    {t('documentInfo.dateTime', {
                      defaultValue: 'Düzenleme Tarihi / Saati',
                    })}
                  </span>

                  <input
                    type="datetime-local"
                    value={document.dateTime}
                    onChange={(event) =>
                      updateDocument({
                        dateTime: event.target.value,
                      })
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>
                    {t('documentInfo.scenario', {
                      defaultValue: 'Belge Profili / Senaryo',
                    })}
                  </span>

                  <select
                    value={document.scenario}
                    onChange={(event) =>
                      updateDocument({
                        scenario: event.target.value as InvoiceDocument['scenario'],
                      })
                    }
                  >
                    <option value="eArchive">
                      {t('documentInfo.eArchiveInvoice', {
                        defaultValue: 'e-Arşiv Fatura',
                      })}
                    </option>

                    <option value="eInvoice">
                      {t('documentInfo.eInvoice', {
                        defaultValue: 'e-Fatura',
                      })}
                    </option>

                    <option value="commercial">
                      {t('documentInfo.commercialInvoice', {
                        defaultValue: 'Ticari Fatura',
                      })}
                    </option>

                    <option value="basic">
                      {t('documentInfo.basicInvoice', {
                        defaultValue: 'Temel Fatura',
                      })}
                    </option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>
                    {t('documentInfo.eType', {
                      defaultValue: 'Fatura Tipi',
                    })}
                  </span>

                  <select
                    value={document.eType}
                    onChange={(event) =>
                      updateDocument({
                        eType: event.target.value as InvoiceDocument['eType'],
                      })
                    }
                  >
                    <option value="sale">
                      {t('documentInfo.sale', {
                        defaultValue: 'Satış',
                      })}
                    </option>

                    <option value="return">
                      {t('documentInfo.return', {
                        defaultValue: 'İade',
                      })}
                    </option>

                    <option value="withholding">
                      {t('documentInfo.withholding', {
                        defaultValue: 'Tevkifat',
                      })}
                    </option>

                    <option value="exemption">
                      {t('documentInfo.exemption', {
                        defaultValue: 'İstisna',
                      })}
                    </option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>
                    {t('documentInfo.currency', {
                      defaultValue: 'Para Birimi',
                    })}
                  </span>

                  <select
                    value={document.currency}
                    onChange={(event) =>
                      updateDocument({
                        currency: event.target.value as InvoiceDocument['currency'],
                      })
                    }
                  >
                    <option value="TRY">TRY — Türk Lirası</option>

                    <option value="USD">USD — Amerikan Doları</option>

                    <option value="EUR">EUR — Euro</option>
                  </select>
                </label>

                <label className={`${styles.field} ${styles.fullWidth}`}>
                  <span>
                    {t('documentInfo.description', {
                      defaultValue: 'Belge Açıklaması',
                    })}
                  </span>

                  <input
                    type="text"
                    value={document.description}
                    onChange={(event) =>
                      updateDocument({
                        description: event.target.value,
                      })
                    }
                    placeholder={t('documentInfo.descriptionPlaceholder', {
                      defaultValue: 'Faturaya ait açıklama...',
                    })}
                  />
                </label>

                <label className={`${styles.field} ${styles.fullWidth}`}>
                  <span>
                    {t('documentInfo.ettn', {
                      defaultValue: 'ETTN / UUID',
                    })}
                  </span>

                  <input
                    type="text"
                    value={document.ettn}
                    onChange={(event) =>
                      updateDocument({
                        ettn: event.target.value,
                      })
                    }
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </label>

                <label className={styles.field}>
                  <span>
                    {t('documentInfo.cashier', {
                      defaultValue: 'Satış Personeli / Kasiyer',
                    })}
                  </span>

                  <select
                    value={document.cashier}
                    onChange={(event) =>
                      updateDocument({
                        cashier: event.target.value,
                      })
                    }
                  >
                    <option value="">
                      {t('documentInfo.select', {
                        defaultValue: 'Seçiniz',
                      })}
                    </option>

                    <option value="cashier-1">
                      {t('documentInfo.cashierOne', {
                        defaultValue: 'Personel 1',
                      })}
                    </option>

                    <option value="cashier-2">
                      {t('documentInfo.cashierTwo', {
                        defaultValue: 'Personel 2',
                      })}
                    </option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>
                    {t('documentInfo.label', {
                      defaultValue: 'Etiket',
                    })}
                  </span>

                  <select
                    value={document.label}
                    onChange={(event) =>
                      updateDocument({
                        label: event.target.value,
                      })
                    }
                  >
                    <option value="">
                      {t('documentInfo.select', {
                        defaultValue: 'Seçiniz',
                      })}
                    </option>

                    <option value="standard">
                      {t('documentInfo.standard', {
                        defaultValue: 'Standart',
                      })}
                    </option>

                    <option value="urgent">
                      {t('documentInfo.urgent', {
                        defaultValue: 'Acil',
                      })}
                    </option>
                  </select>
                </label>
              </div>

              <div className={styles.checkboxRow}>
                <label>
                  <input
                    type="checkbox"
                    checked={document.internetSale}
                    onChange={(event) =>
                      updateDocument({
                        internetSale: event.target.checked,
                      })
                    }
                  />

                  <span>
                    {t('documentInfo.internetSale', {
                      defaultValue: 'İnternet Satışı',
                    })}
                  </span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={document.deliveryReplacement}
                    onChange={(event) =>
                      updateDocument({
                        deliveryReplacement: event.target.checked,
                      })
                    }
                  />

                  <span>
                    {t('documentInfo.deliveryReplacement', {
                      defaultValue: 'İrsaliye Yerine Geçer',
                    })}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={`${styles.expandable} ${isExpanded ? styles.expandableOpen : ''}`}>
          <div className={styles.expandableInner}>
            <div className={styles.sourceHeader}>
              <div>
                <strong>
                  {t('documentInfo.sourceTitle', {
                    defaultValue: 'Kaynak Belgeler',
                  })}
                </strong>

                <span>
                  {t('documentInfo.sourceDescription', {
                    defaultValue:
                      'Faturaya bağlı sipariş, irsaliye, sözleşme veya diğer belgeleri ekleyin.',
                  })}
                </span>
              </div>

              <button type="button" className={styles.sourceAddButton} onClick={addSourceDocument}>
                +{' '}
                {t('documentInfo.addSource', {
                  defaultValue: 'Kaynak Belge Ekle',
                })}
              </button>
            </div>

            {sourceDocuments.length === 0 ? (
              <div className={styles.emptySourceState}>
                <strong>Henüz kaynak belge yok</strong>

                <span>İrsaliye, sipariş, sözleşme veya başka bir belge bağlayabilirsiniz.</span>
              </div>
            ) : (
              <div className={styles.sourceRows}>
                {sourceDocuments.map((sourceDocument, index) => (
                  <div key={sourceDocument.id} className={styles.sourceRow}>
                    <div className={styles.sourceRowTitle}>
                      <strong>Kaynak Belge {index + 1}</strong>

                      <button
                        type="button"
                        className={styles.sourceRemoveButton}
                        onClick={() => removeSourceDocument(sourceDocument.id)}
                        aria-label="Kaynak belgeyi sil"
                      >
                        −
                      </button>
                    </div>

                    <div className={styles.sourceGrid}>
                      <label className={styles.field}>
                        <span>Belge Türü</span>

                        <select
                          value={sourceDocument.documentType}
                          onChange={(event) =>
                            updateSourceDocument(sourceDocument.id, {
                              documentType: event.target.value,
                            })
                          }
                        >
                          <option value="">Seçiniz</option>

                          <option value="invoice">Fatura</option>

                          <option value="dispatchNote">İrsaliye</option>

                          <option value="order">Sipariş</option>

                          <option value="receipt">Makbuz</option>

                          <option value="contract">Sözleşme</option>
                        </select>
                      </label>

                      <label className={styles.field}>
                        <span>Belge No</span>

                        <input
                          type="text"
                          value={sourceDocument.documentNumber}
                          onChange={(event) =>
                            updateSourceDocument(sourceDocument.id, {
                              documentNumber: event.target.value,
                            })
                          }
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Belge Tarihi</span>

                        <input
                          type="date"
                          value={sourceDocument.documentDate}
                          onChange={(event) =>
                            updateSourceDocument(sourceDocument.id, {
                              documentDate: event.target.value,
                            })
                          }
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Düzenleyen / Gönderen</span>

                        <input
                          type="text"
                          value={sourceDocument.issuer}
                          onChange={(event) =>
                            updateSourceDocument(sourceDocument.id, {
                              issuer: event.target.value,
                            })
                          }
                        />
                      </label>

                      <label className={`${styles.field} ${styles.fullWidth}`}>
                        <span>ETTN / UUID</span>

                        <input
                          type="text"
                          value={sourceDocument.ettn}
                          onChange={(event) =>
                            updateSourceDocument(sourceDocument.id, {
                              ettn: event.target.value,
                            })
                          }
                          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Tutar</span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={sourceDocument.amount}
                          onChange={(event) =>
                            updateSourceDocument(sourceDocument.id, {
                              amount: Math.max(0, Number(event.target.value)),
                            })
                          }
                        />
                      </label>

                      <label className={styles.field}>
                        <span>Para Birimi</span>

                        <select
                          value={sourceDocument.currency}
                          onChange={(event) =>
                            updateSourceDocument(sourceDocument.id, {
                              currency: event.target.value as InvoiceSourceDocument['currency'],
                            })
                          }
                        >
                          <option value="TRY">TRY</option>

                          <option value="USD">USD</option>

                          <option value="EUR">EUR</option>
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
