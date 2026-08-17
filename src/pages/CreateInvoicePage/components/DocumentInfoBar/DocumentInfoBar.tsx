import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './DocumentInfoBar.module.scss';

import type {
  InvoiceDocument,
  InvoiceSourceDocument,
} from '../../../../models/invoice';

interface DocumentInfoBarProps {
  initialDocument?: InvoiceDocument;
  initialSourceDocuments?: InvoiceSourceDocument[];
  initialInvoiceNumber?: string;
  initialIssueDate?: string;

  onDocumentChange?: (document: InvoiceDocument) => void;
  onSourceDocumentsChange?: (
    documents: InvoiceSourceDocument[],
  ) => void;
}

function splitInvoiceNumber(invoiceNumber: string) {
  const match = invoiceNumber.match(
    /^([A-Za-zÇĞİÖŞÜçğıöşü]+)[-\s/]?(.+)$/,
  );

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

  return new Date(
    date.getTime() - timezoneOffset * 60_000,
  )
    .toISOString()
    .slice(0, 16);
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
  onDocumentChange,
  onSourceDocumentsChange,
}: DocumentInfoBarProps) {
  const { t } = useTranslation();

  const fallbackDocument =
    splitInvoiceNumber(initialInvoiceNumber);

  const [activeTab, setActiveTab] =
    useState<DocumentTab>('general');

  const [isExpanded, setIsExpanded] =
    useState(false);

  const [document, setDocument] =
    useState<InvoiceDocument>(() => ({
      series:
        initialDocument?.series ??
        fallbackDocument.series,

      number:
        initialDocument?.number ??
        fallbackDocument.number,

      description:
        initialDocument?.description ?? '',

      dateTime:
        initialDocument?.dateTime ??
        initialIssueDate,

      scenario:
        initialDocument?.scenario ??
        'eArchive',

      eType:
        initialDocument?.eType ??
        'sale',

      currency:
        initialDocument?.currency ??
        'TRY',

      ettn:
        initialDocument?.ettn ?? '',

      cashier:
        initialDocument?.cashier ?? '',

      label:
        initialDocument?.label ?? '',

      internetSale:
        initialDocument?.internetSale ??
        false,

      deliveryReplacement:
        initialDocument?.deliveryReplacement ??
        false,
    }));

  const [sourceDocuments, setSourceDocuments] =
    useState<SourceDocument[]>(() => {
      if (
        initialSourceDocuments &&
        initialSourceDocuments.length > 0
      ) {
        return initialSourceDocuments.map(
          (sourceDocument) => ({
            ...sourceDocument,
          }),
        );
      }

      return [createSourceDocument()];
    });

  function updateDocument(
    changes: Partial<InvoiceDocument>,
  ) {
    setDocument((currentDocument) => {
      const updatedDocument = {
        ...currentDocument,
        ...changes,
      };

      onDocumentChange?.(updatedDocument);

      return updatedDocument;
    });
  }

  function updateSourceDocument(
    id: string,
    changes: Partial<SourceDocument>,
  ) {
    setSourceDocuments((currentDocuments) => {
      const updatedDocuments =
        currentDocuments.map(
          (sourceDocument) =>
            sourceDocument.id === id
              ? {
                ...sourceDocument,
                ...changes,
              }
              : sourceDocument,
        );

      onSourceDocumentsChange?.(
        updatedDocuments,
      );

      return updatedDocuments;
    });
  }

  function addSourceDocument() {
    setSourceDocuments((currentDocuments) => {
      const updatedDocuments = [
        ...currentDocuments,
        createSourceDocument(),
      ];

      onSourceDocumentsChange?.(
        updatedDocuments,
      );

      return updatedDocuments;
    });
  }

  function removeSourceDocument(id: string) {
    setSourceDocuments((currentDocuments) => {
      if (currentDocuments.length === 1) {
        return currentDocuments;
      }

      const updatedDocuments =
        currentDocuments.filter(
          (sourceDocument) =>
            sourceDocument.id !== id,
        );

      onSourceDocumentsChange?.(
        updatedDocuments,
      );

      return updatedDocuments;
    });
  }

  function handleGeneralTab() {
    if (activeTab === 'general') {
      setIsExpanded(
        (currentValue) => !currentValue,
      );

      return;
    }

    setActiveTab('general');
    setIsExpanded(true);
  }

  function handleSourceTab() {
    if (activeTab === 'source') {
      setIsExpanded(
        (currentValue) => !currentValue,
      );

      return;
    }

    setActiveTab('source');
    setIsExpanded(true);
  }

  function handleToggle() {
    setIsExpanded(
      (currentValue) => !currentValue,
    );
  }


  return (
    <section
      className={`${styles.panel} ${isExpanded ? styles.panelOpen : ''
        }`}
    >
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'general'
            ? styles.activeTab
            : ''
            }`}
          onClick={handleGeneralTab}
        >
          {t('documentInfo.generalTab')}
        </button>

        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'source'
            ? styles.activeTab
            : ''
            }`}
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
        aria-label={
          isExpanded
            ? t('documentInfo.closeDetails')
            : t('documentInfo.openDetails')
        }
      >
        <span
          className={`${styles.arrow} ${isExpanded
            ? styles.arrowOpen
            : ''
            }`}
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
                {t('documentInfo.series')}
              </span>

              <select
                value={document.series}
                onChange={(event) =>
                  updateDocument({
                    series:
                      event.target.value,
                  })
                }
              >
                <option value="">
                  {t('documentInfo.select')}
                </option>

                {!['A', 'B', 'FTR'].includes(
                  document.series,
                ) &&
                  document.series ? (
                  <option
                    value={document.series}
                  >
                    {document.series}
                  </option>
                ) : null}

                <option value="A">A</option>
                <option value="B">B</option>
                <option value="FTR">FTR</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>
                {t('documentInfo.number')}
              </span>

              <input
                type="text"
                value={document.number}
                onChange={(event) =>
                  updateDocument({
                    number:
                      event.target.value,
                  })
                }
              />
            </label>
          </div>

          <div
            className={`${styles.expandable} ${isExpanded
              ? styles.expandableOpen
              : ''
              }`}
          >
            <div
              className={
                styles.expandableInner
              }
            >
              <label
                className={`${styles.field} ${styles.descriptionField}`}
              >
                <span>
                  {t(
                    'documentInfo.description',
                  )}
                </span>

                <input
                  type="text"
                  value={document.description}
                  onChange={(event) =>
                    updateDocument({
                      description:
                        event.target.value,
                    })
                  }
                  placeholder={t(
                    'documentInfo.descriptionPlaceholder',
                  )}
                />
              </label>

              <div className={styles.detailsGrid}>
                <label className={styles.field}>
                  <span>
                    {t('documentInfo.dateTime')}
                  </span>

                  <input
                    type="datetime-local"
                    value={toDateTimeLocal(
                      document.dateTime,
                    )}
                    onChange={(event) =>
                      updateDocument({
                        dateTime:
                          event.target.value,
                      })
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>
                    {t(
                      'documentInfo.scenario',
                    )}
                  </span>

                  <select
                    value={document.scenario}
                    onChange={(event) =>
                      updateDocument({
                        scenario:
                          event.target
                            .value as InvoiceDocument['scenario'],
                      })
                    }
                  >
                    <option value="eArchive">
                      {t(
                        'documentInfo.eArchiveInvoice',
                      )}
                    </option>

                    <option value="eInvoice">
                      {t(
                        'documentInfo.eInvoice',
                      )}
                    </option>

                    <option value="commercial">
                      {t(
                        'documentInfo.commercialInvoice',
                      )}
                    </option>

                    <option value="basic">
                      {t(
                        'documentInfo.basicInvoice',
                      )}
                    </option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>
                    {t(
                      'documentInfo.eType',
                    )}
                  </span>

                  <select
                    value={document.eType}
                    onChange={(event) =>
                      updateDocument({
                        eType:
                          event.target
                            .value as InvoiceDocument['eType'],
                      })
                    }
                  >
                    <option value="sale">
                      {t(
                        'documentInfo.sale',
                      )}
                    </option>

                    <option value="return">
                      {t(
                        'documentInfo.return',
                      )}
                    </option>

                    <option value="withholding">
                      {t(
                        'documentInfo.withholding',
                      )}
                    </option>

                    <option value="exemption">
                      {t(
                        'documentInfo.exemption',
                      )}
                    </option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>
                    {t(
                      'documentInfo.currency',
                    )}
                  </span>

                  <select
                    value={document.currency}
                    onChange={(event) =>
                      updateDocument({
                        currency:
                          event.target
                            .value as InvoiceDocument['currency'],
                      })
                    }
                  >
                    <option value="TRY">
                      TRY
                    </option>

                    <option value="USD">
                      USD
                    </option>

                    <option value="EUR">
                      EUR
                    </option>
                  </select>
                </label>

                <label
                  className={`${styles.field} ${styles.fullWidth}`}
                >
                  <span>
                    {t(
                      'documentInfo.ettn',
                    )}
                  </span>

                  <input
                    type="text"
                    value={document.ettn}
                    onChange={(event) =>
                      updateDocument({
                        ettn:
                          event.target.value,
                      })
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>
                    {t(
                      'documentInfo.cashier',
                    )}
                  </span>

                  <select
                    value={document.cashier}
                    onChange={(event) =>
                      updateDocument({
                        cashier:
                          event.target.value,
                      })
                    }
                  >
                    <option value="">
                      {t(
                        'documentInfo.select',
                      )}
                    </option>

                    <option value="cashier-1">
                      {t(
                        'documentInfo.cashierOne',
                      )}
                    </option>

                    <option value="cashier-2">
                      {t(
                        'documentInfo.cashierTwo',
                      )}
                    </option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>
                    {t(
                      'documentInfo.label',
                    )}
                  </span>

                  <select
                    value={document.label}
                    onChange={(event) =>
                      updateDocument({
                        label:
                          event.target.value,
                      })
                    }
                  >
                    <option value="">
                      {t(
                        'documentInfo.select',
                      )}
                    </option>

                    <option value="urgent">
                      {t(
                        'documentInfo.urgent',
                      )}
                    </option>

                    <option value="standard">
                      {t(
                        'documentInfo.standard',
                      )}
                    </option>
                  </select>
                </label>
              </div>

              <div className={styles.checkboxRow}>
                <label>
                  <input
                    type="checkbox"
                    checked={
                      document.internetSale
                    }
                    onChange={(event) =>
                      updateDocument({
                        internetSale:
                          event.target.checked,
                      })
                    }
                  />

                  <span>
                    {t(
                      'documentInfo.internetSale',
                    )}
                  </span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={
                      document.deliveryReplacement
                    }
                    onChange={(event) =>
                      updateDocument({
                        deliveryReplacement:
                          event.target.checked,
                      })
                    }
                  />

                  <span>
                    {t(
                      'documentInfo.deliveryReplacement',
                    )}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div
          className={`${styles.expandable} ${isExpanded
            ? styles.expandableOpen
            : ''
            }`}
        >
          <div
            className={
              styles.expandableInner
            }
          >
            <div className={styles.sourceHeader}>
              <div>
                <strong>
                  {t(
                    'documentInfo.sourceTitle',
                  )}
                </strong>

                <span>
                  {t(
                    'documentInfo.sourceDescription',
                  )}
                </span>
              </div>

              <button
                type="button"
                className={
                  styles.sourceAddButton
                }
                onClick={addSourceDocument}
              >
                +{' '}
                {t(
                  'documentInfo.addSource',
                )}
              </button>
            </div>

            <div className={styles.sourceRows}>
              {sourceDocuments.map(
                (sourceDocument, index) => (
                  <div
                    key={sourceDocument.id}
                    className={styles.sourceRow}
                  >
                    <div
                      className={
                        styles.sourceRowTitle
                      }
                    >
                      <strong>
                        {t(
                          'documentInfo.sourceRow',
                          {
                            number:
                              index + 1,
                          },
                        )}
                      </strong>

                      <button
                        type="button"
                        className={
                          styles.sourceRemoveButton
                        }
                        disabled={
                          sourceDocuments.length ===
                          1
                        }
                        onClick={() =>
                          removeSourceDocument(
                            sourceDocument.id,
                          )
                        }
                        aria-label={t(
                          'documentInfo.removeSource',
                        )}
                      >
                        −
                      </button>
                    </div>

                    <div
                      className={
                        styles.sourceGrid
                      }
                    >
                      <label
                        className={
                          styles.field
                        }
                      >
                        <span>
                          {t(
                            'documentInfo.sourceDocumentType',
                          )}
                        </span>

                        <select
                          value={
                            sourceDocument.documentType
                          }
                          onChange={(event) =>
                            updateSourceDocument(
                              sourceDocument.id,
                              {
                                documentType:
                                  event.target
                                    .value,
                              },
                            )
                          }
                        >
                          <option value="">
                            {t(
                              'documentInfo.select',
                            )}
                          </option>

                          <option value="invoice">
                            {t(
                              'documentInfo.sourceInvoice',
                            )}
                          </option>

                          <option value="dispatchNote">
                            {t(
                              'documentInfo.sourceDispatchNote',
                            )}
                          </option>

                          <option value="order">
                            {t(
                              'documentInfo.sourceOrder',
                            )}
                          </option>

                          <option value="receipt">
                            {t(
                              'documentInfo.sourceReceipt',
                            )}
                          </option>

                          <option value="contract">
                            {t(
                              'documentInfo.sourceContract',
                            )}
                          </option>
                        </select>
                      </label>

                      <label
                        className={
                          styles.field
                        }
                      >
                        <span>
                          {t(
                            'documentInfo.sourceDocumentNumber',
                          )}
                        </span>

                        <input
                          type="text"
                          value={
                            sourceDocument.documentNumber
                          }
                          onChange={(event) =>
                            updateSourceDocument(
                              sourceDocument.id,
                              {
                                documentNumber:
                                  event.target
                                    .value,
                              },
                            )
                          }
                        />
                      </label>

                      <label
                        className={
                          styles.field
                        }
                      >
                        <span>
                          {t(
                            'documentInfo.sourceDocumentDate',
                          )}
                        </span>

                        <input
                          type="date"
                          value={
                            sourceDocument.documentDate
                          }
                          onChange={(event) =>
                            updateSourceDocument(
                              sourceDocument.id,
                              {
                                documentDate:
                                  event.target
                                    .value,
                              },
                            )
                          }
                        />
                      </label>

                      <label
                        className={
                          styles.field
                        }
                      >
                        <span>
                          {t(
                            'documentInfo.sourceIssuer',
                          )}
                        </span>

                        <input
                          type="text"
                          value={
                            sourceDocument.issuer
                          }
                          onChange={(event) =>
                            updateSourceDocument(
                              sourceDocument.id,
                              {
                                issuer:
                                  event.target
                                    .value,
                              },
                            )
                          }
                        />
                      </label>

                      <label
                        className={`${styles.field} ${styles.fullWidth}`}
                      >
                        <span>
                          {t(
                            'documentInfo.sourceEttn',
                          )}
                        </span>

                        <input
                          type="text"
                          value={
                            sourceDocument.ettn
                          }
                          onChange={(event) =>
                            updateSourceDocument(
                              sourceDocument.id,
                              {
                                ettn:
                                  event.target
                                    .value,
                              },
                            )
                          }
                        />
                      </label>

                      <label
                        className={
                          styles.field
                        }
                      >
                        <span>
                          {t(
                            'documentInfo.sourceAmount',
                          )}
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            sourceDocument.amount
                          }
                          onChange={(event) =>
                            updateSourceDocument(
                              sourceDocument.id,
                              {
                                amount: Math.max(
                                  0,
                                  Number(
                                    event.target
                                      .value,
                                  ),
                                ),
                              },
                            )
                          }
                        />
                      </label>

                      <label
                        className={
                          styles.field
                        }
                      >
                        <span>
                          {t(
                            'documentInfo.sourceCurrency',
                          )}
                        </span>

                        <select
                          value={
                            sourceDocument.currency
                          }
                          onChange={(event) =>
                            updateSourceDocument(
                              sourceDocument.id,
                              {
                                currency:
                                  event.target
                                    .value as Currency,
                              },
                            )
                          }
                        >
                          <option value="TRY">
                            TRY
                          </option>

                          <option value="USD">
                            USD
                          </option>

                          <option value="EUR">
                            EUR
                          </option>
                        </select>
                      </label>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}