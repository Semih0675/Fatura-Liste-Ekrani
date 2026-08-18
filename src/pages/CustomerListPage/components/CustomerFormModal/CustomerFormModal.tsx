import { useEffect, useState } from 'react';

import type {
  CustomerAccount,
  CustomerAccountType,
  CustomerFormInput,
} from '../../../../models/customer';

import styles from './CustomerFormModal.module.scss';

interface CustomerFormModalProps {
  isOpen: boolean;

  customer: CustomerAccount | null;

  onClose: () => void;

  onSubmit: (customer: CustomerFormInput) => void;
}

function createEmptyForm(): CustomerFormInput {
  return {
    accountType: 'customer',

    isEInvoiceTaxpayer: false,

    name: '',

    titleName: '',

    taxNumber: '',

    taxOfficeCode: '',

    taxOfficeName: '',

    phone: '',

    email: '',

    address: {
      addressName: 'Merkez',

      country: 'Türkiye',

      city: '',

      district: '',

      neighborhood: '',

      avenue: '',

      street: '',

      buildingNumber: '',

      apartmentNumber: '',

      postalCode: '',

      addressCode: '',

      additionalDescription: '',
    },
  };
}

function customerToForm(customer: CustomerAccount): CustomerFormInput {
  return {
    accountType: customer.accountType,

    isEInvoiceTaxpayer: customer.isEInvoiceTaxpayer,

    name: customer.name,

    titleName: customer.titleName,

    taxNumber: customer.taxNumber,

    taxOfficeCode: customer.taxOfficeCode,

    taxOfficeName: customer.taxOfficeName,

    phone: customer.phone,

    email: customer.email,

    address: {
      ...customer.address,
    },
  };
}

export function CustomerFormModal({
  isOpen,

  customer,

  onClose,

  onSubmit,
}: CustomerFormModalProps) {
  const [form, setForm] = useState<CustomerFormInput>(createEmptyForm());

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(customer ? customerToForm(customer) : createEmptyForm());

    setError(null);
  }, [customer, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function updateForm(changes: Partial<CustomerFormInput>) {
    setForm((current) => ({
      ...current,

      ...changes,
    }));
  }

  function updateAddress(changes: Partial<CustomerFormInput['address']>) {
    setForm((current) => ({
      ...current,

      address: {
        ...current.address,

        ...changes,
      },
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError('Cari adı boş bırakılamaz.');

      return;
    }

    const taxNumber = form.taxNumber.trim();

    if (taxNumber && taxNumber.length !== 10 && taxNumber.length !== 11) {
      setError('VKN 10, TCKN 11 haneli olmalıdır.');

      return;
    }

    onSubmit({
      ...form,

      name,

      titleName: form.titleName.trim() || name,

      taxNumber,
    });
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={customer ? 'Cari düzenle' : 'Yeni cari'}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <form className={styles.modal} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <div>
            <span>CARİ KARTI</span>

            <h2>{customer ? 'Cari Düzenle' : 'Yeni Cari'}</h2>

            <p>Müşteri veya tedarikçi kartının ticari bilgilerini yönetin.</p>
          </div>

          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Kapat">
            ×
          </button>
        </div>

        <div className={styles.body}>
          {error ? <div className={styles.error}>{error}</div> : null}

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <strong>Temel Bilgiler</strong>

              <span>Cari tipi ve ünvan</span>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Cari Tipi</span>

                <select
                  value={form.accountType}
                  onChange={(event) =>
                    updateForm({
                      accountType: event.target.value as CustomerAccountType,
                    })
                  }
                >
                  <option value="customer">Müşteri</option>

                  <option value="supplier">Tedarikçi</option>

                  <option value="both">Müşteri + Tedarikçi</option>
                </select>
              </label>

              <label className={styles.checkField}>
                <input
                  type="checkbox"
                  checked={form.isEInvoiceTaxpayer}
                  onChange={(event) =>
                    updateForm({
                      isEInvoiceTaxpayer: event.target.checked,
                    })
                  }
                />

                <span>e-Fatura mükellefi</span>
              </label>

              <label className={`${styles.field} ${styles.span2}`}>
                <span>Cari / Kısa Ad</span>

                <input
                  type="text"
                  value={form.name}
                  placeholder="Örn: Zentrix Teknoloji"
                  onChange={(event) =>
                    updateForm({
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label className={`${styles.field} ${styles.span2}`}>
                <span>Ticari Ünvan / Ad Soyad</span>

                <input
                  type="text"
                  value={form.titleName}
                  placeholder="Tam ticari ünvan"
                  onChange={(event) =>
                    updateForm({
                      titleName: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <strong>Vergi Bilgileri</strong>

              <span>VKN / TCKN ve vergi dairesi</span>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span>VKN / TCKN</span>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={form.taxNumber}
                  onChange={(event) =>
                    updateForm({
                      taxNumber: event.target.value.replace(/\D/g, ''),
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Vergi Dairesi Kodu</span>

                <input
                  type="text"
                  value={form.taxOfficeCode}
                  onChange={(event) =>
                    updateForm({
                      taxOfficeCode: event.target.value,
                    })
                  }
                />
              </label>

              <label className={`${styles.field} ${styles.span2}`}>
                <span>Vergi Dairesi</span>

                <input
                  type="text"
                  value={form.taxOfficeName}
                  onChange={(event) =>
                    updateForm({
                      taxOfficeName: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <strong>İletişim</strong>

              <span>Telefon ve e-posta</span>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Telefon</span>

                <input
                  type="tel"
                  value={form.phone}
                  placeholder="0 (5xx) xxx xx xx"
                  onChange={(event) =>
                    updateForm({
                      phone: event.target.value,
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>E-posta</span>

                <input
                  type="email"
                  value={form.email}
                  placeholder="muhasebe@firma.com"
                  onChange={(event) =>
                    updateForm({
                      email: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <strong>Fatura Adresi</strong>

              <span>Faturalarda kullanılacak adres</span>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Adres Tanımı</span>

                <input
                  type="text"
                  value={form.address.addressName}
                  onChange={(event) =>
                    updateAddress({
                      addressName: event.target.value,
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Ülke</span>

                <input
                  type="text"
                  value={form.address.country}
                  onChange={(event) =>
                    updateAddress({
                      country: event.target.value,
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>İl</span>

                <input
                  type="text"
                  value={form.address.city}
                  onChange={(event) =>
                    updateAddress({
                      city: event.target.value,
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>İlçe</span>

                <input
                  type="text"
                  value={form.address.district}
                  onChange={(event) =>
                    updateAddress({
                      district: event.target.value,
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Mahalle</span>

                <input
                  type="text"
                  value={form.address.neighborhood}
                  onChange={(event) =>
                    updateAddress({
                      neighborhood: event.target.value,
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Cadde</span>

                <input
                  type="text"
                  value={form.address.avenue}
                  onChange={(event) =>
                    updateAddress({
                      avenue: event.target.value,
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Sokak</span>

                <input
                  type="text"
                  value={form.address.street}
                  onChange={(event) =>
                    updateAddress({
                      street: event.target.value,
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Bina No</span>

                <input
                  type="text"
                  value={form.address.buildingNumber}
                  onChange={(event) =>
                    updateAddress({
                      buildingNumber: event.target.value,
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Daire No</span>

                <input
                  type="text"
                  value={form.address.apartmentNumber}
                  onChange={(event) =>
                    updateAddress({
                      apartmentNumber: event.target.value,
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Posta Kodu</span>

                <input
                  type="text"
                  value={form.address.postalCode}
                  onChange={(event) =>
                    updateAddress({
                      postalCode: event.target.value.replace(/\D/g, ''),
                    })
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Adres Kodu</span>

                <input
                  type="text"
                  value={form.address.addressCode}
                  onChange={(event) =>
                    updateAddress({
                      addressCode: event.target.value,
                    })
                  }
                />
              </label>

              <label className={`${styles.field} ${styles.span2}`}>
                <span>Adres Açıklaması</span>

                <textarea
                  rows={3}
                  value={form.address.additionalDescription}
                  onChange={(event) =>
                    updateAddress({
                      additionalDescription: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          </section>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Vazgeç
          </button>

          <button type="submit" className={styles.saveButton}>
            {customer ? 'Değişiklikleri Kaydet' : 'Cari Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}
