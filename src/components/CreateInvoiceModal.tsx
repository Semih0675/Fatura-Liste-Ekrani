import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import * as yup from 'yup';
import type { CreateInvoiceInput, InvoiceStatus, InvoiceType } from '../models/invoice';
import styles from './CreateInvoiceModal.module.scss';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: CreateInvoiceInput) => Promise<void>;
}

interface CreateInvoiceFormValues {
  invoiceNumber: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: string;
  type: InvoiceType;
  status: InvoiceStatus;
}

export function CreateInvoiceModal({ isOpen, onClose, onSubmit }: CreateInvoiceModalProps) {
  const { t } = useTranslation();

  const validationSchema = yup.object({
    invoiceNumber: yup.string().trim().required(t('createInvoice.validation.invoiceNumber')),

    customerName: yup.string().trim().required(t('createInvoice.validation.customerName')),

    issueDate: yup.string().required(t('createInvoice.validation.issueDate')),

    dueDate: yup
      .string()
      .required(t('createInvoice.validation.dueDate'))
      .test('date-order', t('createInvoice.validation.dateOrder'), function (value) {
        const { issueDate } = this.parent as CreateInvoiceFormValues;

        return !value || !issueDate || value >= issueDate;
      }),

    amount: yup
      .number()
      .typeError(t('createInvoice.validation.amount'))
      .positive(t('createInvoice.validation.positiveAmount'))
      .required(t('createInvoice.validation.amount')),
  });

  const formik = useFormik<CreateInvoiceFormValues>({
    initialValues: {
      invoiceNumber: '',
      customerName: '',
      issueDate: '',
      dueDate: '',
      amount: '',
      type: 'sale',
      status: 'pending',
    },

    validationSchema,

    async onSubmit(values, helpers) {
      await onSubmit({
        invoiceNumber: values.invoiceNumber.trim(),
        customerName: values.customerName.trim(),
        issueDate: values.issueDate,
        dueDate: values.dueDate,
        amount: Number(values.amount),
        type: values.type,
        status: values.status,
      });

      helpers.resetForm();
      onClose();
    },
  });

  function handleClose() {
    formik.resetForm();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      className={styles.modal}
      overlayClassName={styles.overlay}
      onRequestClose={handleClose}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      aria={{
        labelledby: 'create-invoice-title',
      }}
    >
      <header className={styles.header}>
        <h2 id="create-invoice-title">{t('createInvoice.title')}</h2>

        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label={t('createInvoice.close')}
        >
          ×
        </button>
      </header>

      <form className={styles.form} onSubmit={formik.handleSubmit} noValidate>
        <label>
          {t('createInvoice.invoiceNumber')}

          <input
            name="invoiceNumber"
            value={formik.values.invoiceNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          {formik.touched.invoiceNumber && formik.errors.invoiceNumber ? (
            <span className={styles.error}>{formik.errors.invoiceNumber}</span>
          ) : null}
        </label>

        <label>
          {t('createInvoice.customerName')}

          <input
            name="customerName"
            value={formik.values.customerName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          {formik.touched.customerName && formik.errors.customerName ? (
            <span className={styles.error}>{formik.errors.customerName}</span>
          ) : null}
        </label>

        <label>
          {t('createInvoice.issueDate')}

          <input
            name="issueDate"
            type="date"
            value={formik.values.issueDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </label>

        <label>
          {t('createInvoice.dueDate')}

          <input
            name="dueDate"
            type="date"
            value={formik.values.dueDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          {formik.touched.dueDate && formik.errors.dueDate ? (
            <span className={styles.error}>{formik.errors.dueDate}</span>
          ) : null}
        </label>

        <label>
          {t('createInvoice.amount')}

          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={formik.values.amount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </label>

        <label>
          {t('createInvoice.type')}

          <select name="type" value={formik.values.type} onChange={formik.handleChange}>
            <option value="sale">{t('invoiceType.sale')}</option>

            <option value="purchase">{t('invoiceType.purchase')}</option>
          </select>
        </label>

        <label>
          {t('createInvoice.status')}

          <select name="status" value={formik.values.status} onChange={formik.handleChange}>
            <option value="paid">{t('invoiceStatus.paid')}</option>

            <option value="pending">{t('invoiceStatus.pending')}</option>

            <option value="overdue">{t('invoiceStatus.overdue')}</option>
          </select>
        </label>

        <footer className={styles.actions}>
          <button type="button" onClick={handleClose}>
            {t('actions.close')}
          </button>

          <button type="submit" disabled={formik.isSubmitting}>
            {t('createInvoice.save')}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
