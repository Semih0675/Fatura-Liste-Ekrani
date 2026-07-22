import { useMemo } from 'react';
import classNames from 'classnames/bind';
import { tr } from 'date-fns/locale';
import { useFormik } from 'formik';
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

const typeOptions: InvoiceTypeOption[] = [
  {
    value: 'sale',
    label: 'Satış',
  },
  {
    value: 'purchase',
    label: 'Alış',
  },
];

const statusOptions: InvoiceStatusOption[] = [
  {
    value: 'paid',
    label: 'Ödendi',
  },
  {
    value: 'pending',
    label: 'Bekliyor',
  },
  {
    value: 'overdue',
    label: 'Gecikmiş',
  },
];

const validationSchema = yup.object({
  searchTerm: yup.string().trim().max(100, 'Arama metni en fazla 100 karakter olabilir.'),

  type: yup.mixed<InvoiceType>().oneOf(['sale', 'purchase']).nullable(),

  statuses: yup
    .array()
    .of(yup.mixed<InvoiceStatus>().oneOf(['paid', 'pending', 'overdue']).required())
    .required(),

  issueDateFrom: yup.date().nullable().typeError('Geçerli bir başlangıç tarihi seçin.'),

  issueDateTo: yup
    .date()
    .nullable()
    .typeError('Geçerli bir bitiş tarihi seçin.')
    .test(
      'date-order',
      'Bitiş tarihi başlangıç tarihinden önce olamaz.',
      function validateDateOrder(value) {
        const { issueDateFrom } = this.parent as InvoiceFilterFormValues;

        if (!value || !issueDateFrom) {
          return true;
        }

        return value.getTime() >= issueDateFrom.getTime();
      },
    ),

  minAmount: yup
    .number()
    .nullable()
    .typeError('Minimum tutar sayı olmalıdır.')
    .min(0, 'Minimum tutar negatif olamaz.'),

  maxAmount: yup
    .number()
    .nullable()
    .typeError('Maksimum tutar sayı olmalıdır.')
    .min(0, 'Maksimum tutar negatif olamaz.')
    .test(
      'amount-order',
      'Maksimum tutar minimum tutardan küçük olamaz.',
      function validateAmountOrder(value) {
        const { minAmount } = this.parent as InvoiceFilterFormValues;

        if (value === null || value === undefined || minAmount === null) {
          return true;
        }

        return value >= minAmount;
      },
    ),
});

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
          <h2>Fatura Filtreleri</h2>
          <p>Listeyi bir veya birden fazla alana göre filtreleyin.</p>
        </div>

        <p className={styles.resultCount} aria-live="polite">
          <strong>{resultCount}</strong> / {totalCount} kayıt
        </p>
      </div>

      <form className={styles.form} onSubmit={formik.handleSubmit} noValidate>
        <div className={styles.grid}>
          <div className={cx('field', 'searchField')}>
            <label htmlFor="searchTerm">Metin arama</label>

            <input
              id="searchTerm"
              name="searchTerm"
              className={cx('input', {
                hasError: Boolean(searchError),
              })}
              type="search"
              value={formik.values.searchTerm}
              placeholder="Fatura no, müşteri, durum veya tutar..."
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(searchError)}
            />

            {searchError ? <span className={styles.error}>{searchError}</span> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="invoice-type">Fatura tipi</label>

            <div className={styles.selectContainer}>
              <Select<InvoiceTypeOption, false>
                inputId="invoice-type"
                classNamePrefix="filterSelect"
                options={typeOptions}
                value={selectedType}
                placeholder="Tüm tipler"
                isClearable
                isSearchable={false}
                noOptionsMessage={() => 'Seçenek bulunamadı'}
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
            <label htmlFor="invoice-statuses">Durum</label>

            <div className={styles.selectContainer}>
              <Select<InvoiceStatusOption, true>
                inputId="invoice-statuses"
                classNamePrefix="filterSelect"
                options={statusOptions}
                value={selectedStatuses}
                placeholder="Tüm durumlar"
                isMulti
                isClearable
                closeMenuOnSelect={false}
                noOptionsMessage={() => 'Seçenek bulunamadı'}
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
            <label htmlFor="issueDateFrom">Düzenleme tarihi başlangıç</label>

            <DatePicker
              id="issueDateFrom"
              name="issueDateFrom"
              wrapperClassName={styles.datePickerWrapper}
              className={cx('input', {
                hasError: Boolean(startDateError),
              })}
              selected={formik.values.issueDateFrom}
              maxDate={formik.values.issueDateTo ?? undefined}
              dateFormat="dd.MM.yyyy"
              locale="tr"
              placeholderText="Başlangıç tarihi"
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
            <label htmlFor="issueDateTo">Düzenleme tarihi bitiş</label>

            <DatePicker
              id="issueDateTo"
              name="issueDateTo"
              wrapperClassName={styles.datePickerWrapper}
              className={cx('input', {
                hasError: Boolean(endDateError),
              })}
              selected={formik.values.issueDateTo}
              minDate={formik.values.issueDateFrom ?? undefined}
              dateFormat="dd.MM.yyyy"
              locale="tr"
              placeholderText="Bitiş tarihi"
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
            <label htmlFor="minAmount">Minimum tutar</label>

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
              placeholder="0,00"
              onChange={(event) => {
                void formik.setFieldValue('minAmount', parseAmountInput(event.target.value));
              }}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(minAmountError)}
            />

            {minAmountError ? <span className={styles.error}>{minAmountError}</span> : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="maxAmount">Maksimum tutar</label>

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
              placeholder="100.000,00"
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
            Filtreleri Temizle
          </button>

          <button className={styles.submitButton} type="submit" disabled={formik.isSubmitting}>
            Filtreleri Uygula
          </button>
        </div>
      </form>
    </section>
  );
}
