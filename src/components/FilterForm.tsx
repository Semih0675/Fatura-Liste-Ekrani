import { useMemo } from 'react';
import classNames from 'classnames/bind';
import { tr } from 'date-fns/locale';
import type { TFunction } from 'i18next';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import DatePicker, { registerLocale } from 'react-datepicker';
import Select from 'react-select';
import * as yup from 'yup';
import type { InvoiceFilterValues, InvoiceStatus, InvoiceType } from '../models/invoice';
import styles from './FilterForm.module.scss';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('tr', tr);

const cx = classNames.bind(styles);

interface SelectOption<TValue extends string> {
  value: TValue;
  label: string;
}

type InvoiceTypeOption = SelectOption<InvoiceType>;
type InvoiceStatusOption = SelectOption<InvoiceStatus>;

interface InvoiceFilterFormValues {
  searchTerm: string;
  type: InvoiceType | null;
  statuses: InvoiceStatus[];
  issueDateFrom: Date | null;
  issueDateTo: Date | null;
  minAmount: number | null;
  maxAmount: number | null;
}

interface FilterFormProps {
  initialFilters: InvoiceFilterValues;
  resultCount: number;
  totalCount: number;
  onApply: (filters: InvoiceFilterValues) => void;
  onReset: () => void;
}

function createValidationSchema(t: TFunction) {
  return yup.object({
    searchTerm: yup.string().trim().max(100, t('validation.searchMax')),

    type: yup.mixed<InvoiceType>().oneOf(['sale', 'purchase']).nullable(),

    statuses: yup
      .array()
      .of(yup.mixed<InvoiceStatus>().oneOf(['draft', 'paid', 'pending', 'overdue']).required())
      .required(),

    issueDateFrom: yup.date().nullable().typeError(t('validation.invalidDate')),

    issueDateTo: yup
      .date()
      .nullable()
      .typeError(t('validation.invalidDate'))
      .test('date-order', t('validation.endDateBeforeStart'), function validateDateOrder(value) {
        const { issueDateFrom } = this.parent as InvoiceFilterFormValues;

        if (!value || !issueDateFrom) {
          return true;
        }

        return value.getTime() >= issueDateFrom.getTime();
      }),

    minAmount: yup
      .number()
      .nullable()
      .typeError(t('validation.invalidAmount'))
      .min(0, t('validation.negativeAmount')),

    maxAmount: yup
      .number()
      .nullable()
      .typeError(t('validation.invalidAmount'))
      .min(0, t('validation.negativeAmount'))
      .test('amount-order', t('validation.maxLessThanMin'), function validateAmountOrder(value) {
        const { minAmount } = this.parent as InvoiceFilterFormValues;

        if (value == null || minAmount == null) {
          return true;
        }

        return value >= minAmount;
      }),
  });
}

function parseIsoDate(isoDate: string | null): Date | null {
  if (!isoDate) {
    return null;
  }

  const [year, month, day] = isoDate.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date | null): string | null {
  if (!date) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createFormValues(filters: InvoiceFilterValues): InvoiceFilterFormValues {
  return {
    searchTerm: filters.searchTerm,
    type: filters.type,
    statuses: [...filters.statuses],
    issueDateFrom: parseIsoDate(filters.issueDateFrom),
    issueDateTo: parseIsoDate(filters.issueDateTo),
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
  };
}

function createEmptyFormValues(): InvoiceFilterFormValues {
  return {
    searchTerm: '',
    type: null,
    statuses: [],
    issueDateFrom: null,
    issueDateTo: null,
    minAmount: null,
    maxAmount: null,
  };
}

function mapFormValuesToFilters(values: InvoiceFilterFormValues): InvoiceFilterValues {
  return {
    searchTerm: values.searchTerm.trim(),
    type: values.type,
    statuses: [...values.statuses],
    issueDateFrom: toIsoDate(values.issueDateFrom),
    issueDateTo: toIsoDate(values.issueDateTo),
    minAmount: values.minAmount,
    maxAmount: values.maxAmount,
  };
}

function parseAmountInput(value: string): number | null {
  if (value === '') {
    return null;
  }

  return Number(value);
}

export function FilterForm({
  initialFilters,
  resultCount,
  totalCount,
  onApply,
  onReset,
}: FilterFormProps) {
  const { t, i18n } = useTranslation();

  const isEnglish = i18n.resolvedLanguage?.startsWith('en') ?? false;

  const typeOptions = useMemo<InvoiceTypeOption[]>(
    () => [
      {
        value: 'sale',
        label: t('invoiceType.sale'),
      },
      {
        value: 'purchase',
        label: t('invoiceType.purchase'),
      },
    ],
    [t],
  );

  const statusOptions = useMemo<InvoiceStatusOption[]>(
    () => [
      {
        value: 'draft',

        label: t('invoiceStatus.draft'),
      },

      {
        value: 'paid',

        label: t('invoiceStatus.paid'),
      },

      {
        value: 'pending',

        label: t('invoiceStatus.pending'),
      },

      {
        value: 'overdue',

        label: t('invoiceStatus.overdue'),
      },
    ],
    [t],
  );

  const validationSchema = useMemo(() => createValidationSchema(t), [t]);

  const initialValues = useMemo(() => createFormValues(initialFilters), [initialFilters]);

  const formik = useFormik<InvoiceFilterFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema,

    onSubmit(values, helpers) {
      onApply(mapFormValuesToFilters(values));
      helpers.setSubmitting(false);
    },
  });

  function handleReset() {
    formik.resetForm({
      values: createEmptyFormValues(),
    });

    onReset();
  }

  const selectedType = typeOptions.find((option) => option.value === formik.values.type) ?? null;

  const selectedStatuses = statusOptions.filter((option) =>
    formik.values.statuses.includes(option.value),
  );

  const searchError = formik.touched.searchTerm && formik.errors.searchTerm;

  const startDateError = formik.touched.issueDateFrom && formik.errors.issueDateFrom;

  const endDateError = formik.touched.issueDateTo && formik.errors.issueDateTo;

  const minAmountError = formik.touched.minAmount && formik.errors.minAmount;

  const maxAmountError = formik.touched.maxAmount && formik.errors.maxAmount;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>{t('filters.title')}</h2>
          <p>{t('filters.description')}</p>
        </div>

        <p className={styles.resultCount} aria-live="polite">
          {t('filters.resultCount', {
            resultCount,
            totalCount,
          })}
        </p>
      </div>

      <form className={styles.form} onSubmit={formik.handleSubmit} noValidate>
        <div className={styles.grid}>
          <div className={cx('field', 'searchField')}>
            <label htmlFor="searchTerm">{t('filters.search')}</label>

            <input
              id="searchTerm"
              name="searchTerm"
              className={cx('input', {
                hasError: Boolean(searchError),
              })}
              type="search"
              value={formik.values.searchTerm}
              placeholder={t('filters.searchPlaceholder')}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(searchError)}
            />

            {searchError ? <span className={styles.error}>{searchError}</span> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="invoice-type">{t('filters.type')}</label>

            <div className={styles.selectContainer}>
              <Select<InvoiceTypeOption, false>
                inputId="invoice-type"
                classNamePrefix="filterSelect"
                options={typeOptions}
                value={selectedType}
                placeholder={t('filters.allTypes')}
                isClearable
                isSearchable={false}
                noOptionsMessage={() => t('filters.noOptions')}
                onChange={(option) => {
                  void formik.setFieldValue('type', option?.value ?? null);
                }}
                onBlur={() => {
                  void formik.setFieldTouched('type', true);
                }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="invoice-statuses">{t('filters.status')}</label>

            <div className={styles.selectContainer}>
              <Select<InvoiceStatusOption, true>
                inputId="invoice-statuses"
                classNamePrefix="filterSelect"
                options={statusOptions}
                value={selectedStatuses}
                placeholder={t('filters.allStatuses')}
                isMulti
                isClearable
                closeMenuOnSelect={false}
                noOptionsMessage={() => t('filters.noOptions')}
                onChange={(options) => {
                  void formik.setFieldValue(
                    'statuses',
                    options.map((option) => option.value),
                  );
                }}
                onBlur={() => {
                  void formik.setFieldTouched('statuses', true);
                }}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="issueDateFrom">{t('filters.issueDateFrom')}</label>

            <DatePicker
              id="issueDateFrom"
              name="issueDateFrom"
              wrapperClassName={styles.datePickerWrapper}
              className={cx('input', {
                hasError: Boolean(startDateError),
              })}
              selected={formik.values.issueDateFrom}
              maxDate={formik.values.issueDateTo ?? undefined}
              dateFormat={isEnglish ? 'MM/dd/yyyy' : 'dd.MM.yyyy'}
              locale={isEnglish ? undefined : 'tr'}
              placeholderText={t('filters.startDatePlaceholder')}
              isClearable
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              autoComplete="off"
              onChange={(date: Date | null) => {
                void formik.setFieldValue('issueDateFrom', date);
              }}
              onBlur={() => {
                void formik.setFieldTouched('issueDateFrom', true);
              }}
            />

            {startDateError ? <span className={styles.error}>{startDateError}</span> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="issueDateTo">{t('filters.issueDateTo')}</label>

            <DatePicker
              id="issueDateTo"
              name="issueDateTo"
              wrapperClassName={styles.datePickerWrapper}
              className={cx('input', {
                hasError: Boolean(endDateError),
              })}
              selected={formik.values.issueDateTo}
              minDate={formik.values.issueDateFrom ?? undefined}
              dateFormat={isEnglish ? 'MM/dd/yyyy' : 'dd.MM.yyyy'}
              locale={isEnglish ? undefined : 'tr'}
              placeholderText={t('filters.endDatePlaceholder')}
              isClearable
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              autoComplete="off"
              onChange={(date: Date | null) => {
                void formik.setFieldValue('issueDateTo', date);
              }}
              onBlur={() => {
                void formik.setFieldTouched('issueDateTo', true);
              }}
            />

            {endDateError ? <span className={styles.error}>{endDateError}</span> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="minAmount">{t('filters.minAmount')}</label>

            <input
              id="minAmount"
              name="minAmount"
              className={cx('input', {
                hasError: Boolean(minAmountError),
              })}
              type="number"
              min="0"
              step="0.01"
              value={formik.values.minAmount ?? ''}
              placeholder="0.00"
              onChange={(event) => {
                void formik.setFieldValue('minAmount', parseAmountInput(event.target.value));
              }}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(minAmountError)}
            />

            {minAmountError ? <span className={styles.error}>{minAmountError}</span> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="maxAmount">{t('filters.maxAmount')}</label>

            <input
              id="maxAmount"
              name="maxAmount"
              className={cx('input', {
                hasError: Boolean(maxAmountError),
              })}
              type="number"
              min="0"
              step="0.01"
              value={formik.values.maxAmount ?? ''}
              placeholder="100000.00"
              onChange={(event) => {
                void formik.setFieldValue('maxAmount', parseAmountInput(event.target.value));
              }}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(maxAmountError)}
            />

            {maxAmountError ? <span className={styles.error}>{maxAmountError}</span> : null}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.resetButton} type="button" onClick={handleReset}>
            {t('filters.clear')}
          </button>

          <button className={styles.submitButton} type="submit" disabled={formik.isSubmitting}>
            {t('filters.apply')}
          </button>
        </div>
      </form>
    </section>
  );
}
