import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DocumentInfoBar.module.scss';
import type { InvoiceDocument, InvoiceSourceDocument } from '../../../../models/invoice';

interface DocumentInfoBarProps {
  initialDocument?: InvoiceDocument;
  initialSourceDocuments?: InvoiceSourceDocument[];
  initialInvoiceNumber?: string;
  initialIssueDate?: string;
}

function splitInvoiceNumber(invoiceNumber: string) {
  const match = invoiceNumber.match(/^([A-Za-zÇĞİÖŞÜçğıöşü]+)[-\s/]?(.+)$/);

  return {
    series: match?.[1] ?? '',
    number: match?.[2] ?? invoiceNumber,
  };
}

function toDateTimeLocal(value: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset();

  return new Date(date.getTime() - timezoneOffset * 60_000).toISOString().slice(0, 16);
}

type DocumentTab = 'general' | 'source';
type Currency = 'TRY' | 'USD' | 'EUR';

interface SourceDocument {
  id: string;
  documentType: string;
  documentNumber: string;
  documentDate: string;
  issuer: string;
  ettn: string;
  amount: number;
  currency: Currency;
}

function createSourceDocument(): SourceDocument {
  return {
    id: crypto.randomUUID(),
    documentType: '',
    documentNumber: '',
    documentDate: '',
    issuer: '',
    ettn: '',
    amount: 0,
    currency: 'TRY',
  };
}

export function DocumentInfoBar({
  initialDocument,
  initialSourceDocuments,
  initialInvoiceNumber = '',
  initialIssueDate = '',
}: DocumentInfoBarProps) {
  const { t } = useTranslation();

  const fallbackDocument = splitInvoiceNumber(initialInvoiceNumber);

  const initialSeries = initialDocument?.series ?? fallbackDocument.series;

  const initialNumber = initialDocument?.number ?? fallbackDocument.number;

  const [activeTab, setActiveTab] = useState<DocumentTab>('general');

  const [isExpanded, setIsExpanded] = useState(false);

  const [sourceDocuments, setSourceDocuments] = useState<SourceDocument[]>(() => {
    if (initialSourceDocuments && initialSourceDocuments.length > 0) {
      return initialSourceDocuments.map((document) => ({
        ...document,
      }));
    }

    return [createSourceDocument()];
  });

  function handleGeneralTab() {
    if (activeTab === 'general') {
      setIsExpanded((current) => !current);
      return;
    }

    setActiveTab('general');
    setIsExpanded(true);
  }

  function handleSourceTab() {
    if (activeTab === 'source') {
      setIsExpanded((current) => !current);
      return;
    }

    setActiveTab('source');
    setIsExpanded(true);
  }

  function handleToggle() {
    setIsExpanded((current) => !current);
  }

  function updateSourceDocument(id: string, changes: Partial<SourceDocument>) {
    setSourceDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === id
          ? {
              ...document,
              ...changes,
            }
          : document,
      ),
    );
  }

  function addSourceDocument() {
    setSourceDocuments((currentDocuments) => [...currentDocuments, createSourceDocument()]);
  }

  function removeSourceDocument(id: string) {
    setSourceDocuments((currentDocuments) => {
      if (currentDocuments.length === 1) {
        return currentDocuments;
      }

      return currentDocuments.filter((document) => document.id !== id);
    });
  }

  return (
    <section className={`${styles.panel} ${isExpanded ? styles.panelOpen : ''}`}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
          onClick={handleGeneralTab}
        >
          {t('documentInfo.generalTab')}
        </button>

        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'source' ? styles.activeTab : ''}`}
          onClick={handleSourceTab}
        >
          {t('documentInfo.sourceTab')}
        </button>
      </div>

      <button
        type="button"
        className={styles.toggleButton}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? t('documentInfo.closeDetails') : t('documentInfo.openDetails')}
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
              <span>{t('documentInfo.series')}</span>

              <select defaultValue={initialSeries}>
                <option value="">{t('documentInfo.select')}</option>

                {initialSeries && !['A', 'B', 'FTR'].includes(initialSeries) ? (
                  <option value={initialSeries}>{initialSeries}</option>
                ) : null}

                <option value="A">A</option>
                <option value="B">B</option>
                <option value="FTR">FTR</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>{t('documentInfo.number')}</span>
              <input type="text" defaultValue={initialNumber} />
            </label>
          </div>

          <div className={`${styles.expandable} ${isExpanded ? styles.expandableOpen : ''}`}>
            <div className={styles.expandableInner}>
              <label className={`${styles.field} ${styles.descriptionField}`}>
                <span>{t('documentInfo.description')}</span>

                <input
                  type="text"
                  defaultValue={initialDocument?.description ?? ''}
                  placeholder={t('documentInfo.descriptionPlaceholder')}
                />
              </label>

              <div className={styles.detailsGrid}>
                <label className={styles.field}>
                  <span>{t('documentInfo.dateTime')}</span>

                  <input
                    type="datetime-local"
                    defaultValue={
                      initialDocument?.dateTime
                        ? toDateTimeLocal(initialDocument.dateTime)
                        : toDateTimeLocal(initialIssueDate)
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>{t('documentInfo.scenario')}</span>

                  <select defaultValue={initialDocument?.scenario ?? 'eArchive'}>
                    <option value="eArchive">{t('documentInfo.eArchiveInvoice')}</option>

                    <option value="eInvoice">{t('documentInfo.eInvoice')}</option>

                    <option value="commercial">{t('documentInfo.commercialInvoice')}</option>

                    <option value="basic">{t('documentInfo.basicInvoice')}</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>{t('documentInfo.eType')}</span>

                  <select defaultValue={initialDocument?.eType ?? 'sale'}>
                    <option value="sale">{t('documentInfo.sale')}</option>

                    <option value="return">{t('documentInfo.return')}</option>

                    <option value="withholding">{t('documentInfo.withholding')}</option>

                    <option value="exemption">{t('documentInfo.exemption')}</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>{t('documentInfo.currency')}</span>

                  <select defaultValue={initialDocument?.currency ?? 'TRY'}>
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </label>

                <label className={`${styles.field} ${styles.fullWidth}`}>
                  <span>{t('documentInfo.ettn')}</span>

                  <input type="text" defaultValue={initialDocument?.ettn ?? ''} />
                </label>

                <label className={styles.field}>
                  <span>{t('documentInfo.cashier')}</span>

                  <select defaultValue={initialDocument?.cashier ?? ''}>
                    <option value="">{t('documentInfo.select')}</option>

                    <option value="cashier-1">{t('documentInfo.cashierOne')}</option>

                    <option value="cashier-2">{t('documentInfo.cashierTwo')}</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>{t('documentInfo.label')}</span>

                  <select defaultValue={initialDocument?.label ?? ''}>
                    <option value="">{t('documentInfo.select')}</option>

                    <option value="urgent">{t('documentInfo.urgent')}</option>

                    <option value="standard">{t('documentInfo.standard')}</option>
                  </select>
                </label>
              </div>

              <div className={styles.checkboxRow}>
                <label>
                  <input type="checkbox" defaultChecked={initialDocument?.internetSale ?? false} />

                  <span>{t('documentInfo.internetSale')}</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    defaultChecked={initialDocument?.deliveryReplacement ?? false}
                  />

                  <span>{t('documentInfo.deliveryReplacement')}</span>
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
                <strong>{t('documentInfo.sourceTitle')}</strong>

                <span>{t('documentInfo.sourceDescription')}</span>
              </div>

              <button type="button" className={styles.sourceAddButton} onClick={addSourceDocument}>
                + {t('documentInfo.addSource')}
              </button>
            </div>

            <div className={styles.sourceRows}>
              {sourceDocuments.map((document, index) => (
                <div key={document.id} className={styles.sourceRow}>
                  <div className={styles.sourceRowTitle}>
                    <strong>
                      {t('documentInfo.sourceRow', {
                        number: index + 1,
                      })}
                    </strong>

                    <button
                      type="button"
                      className={styles.sourceRemoveButton}
                      disabled={sourceDocuments.length === 1}
                      onClick={() => removeSourceDocument(document.id)}
                      aria-label={t('documentInfo.removeSource')}
                    >
                      −
                    </button>
                  </div>

                  <div className={styles.sourceGrid}>
                    <label className={styles.field}>
                      <span>{t('documentInfo.sourceDocumentType')}</span>

                      <select
                        value={document.documentType}
                        onChange={(event) =>
                          updateSourceDocument(document.id, {
                            documentType: event.target.value,
                          })
                        }
                      >
                        <option value="">{t('documentInfo.select')}</option>

                        <option value="invoice">{t('documentInfo.sourceInvoice')}</option>

                        <option value="dispatchNote">{t('documentInfo.sourceDispatchNote')}</option>

                        <option value="order">{t('documentInfo.sourceOrder')}</option>

                        <option value="receipt">{t('documentInfo.sourceReceipt')}</option>

                        <option value="contract">{t('documentInfo.sourceContract')}</option>
                      </select>
                    </label>

                    <label className={styles.field}>
                      <span>{t('documentInfo.sourceDocumentNumber')}</span>

                      <input
                        type="text"
                        value={document.documentNumber}
                        onChange={(event) =>
                          updateSourceDocument(document.id, {
                            documentNumber: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label className={styles.field}>
                      <span>{t('documentInfo.sourceDocumentDate')}</span>

                      <input
                        type="date"
                        value={document.documentDate}
                        onChange={(event) =>
                          updateSourceDocument(document.id, {
                            documentDate: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label className={styles.field}>
                      <span>{t('documentInfo.sourceIssuer')}</span>

                      <input
                        type="text"
                        value={document.issuer}
                        onChange={(event) =>
                          updateSourceDocument(document.id, {
                            issuer: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label className={`${styles.field} ${styles.fullWidth}`}>
                      <span>{t('documentInfo.sourceEttn')}</span>

                      <input
                        type="text"
                        value={document.ettn}
                        onChange={(event) =>
                          updateSourceDocument(document.id, {
                            ettn: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label className={styles.field}>
                      <span>{t('documentInfo.sourceAmount')}</span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={document.amount}
                        onChange={(event) =>
                          updateSourceDocument(document.id, {
                            amount: Math.max(0, Number(event.target.value)),
                          })
                        }
                      />
                    </label>

                    <label className={styles.field}>
                      <span>{t('documentInfo.sourceCurrency')}</span>

                      <select
                        value={document.currency}
                        onChange={(event) =>
                          updateSourceDocument(document.id, {
                            currency: event.target.value as Currency,
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
          </div>
        </div>
      )}
    </section>
  );
}
