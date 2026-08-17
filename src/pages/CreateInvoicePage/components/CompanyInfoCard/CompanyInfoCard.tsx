import { useState } from 'react';

import type { InvoiceCompany } from '../../../../models/invoice';

import styles from './CompanyInfoCard.module.scss';

interface CompanyInfoCardProps {
  company: InvoiceCompany;

  onCompanyChange: (company: InvoiceCompany) => void;
}

export function CompanyInfoCard({ company, onCompanyChange }: CompanyInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  function updateCompany(changes: Partial<InvoiceCompany>) {
    onCompanyChange({
      ...company,
      ...changes,
    });
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>SATICI / DÜZENLEYEN</span>

          <h2>Firma Bilgileri</h2>

          <p>Faturayı düzenleyen işletmenin ticari ve iletişim bilgileri.</p>
        </div>

        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Bilgileri Gizle' : 'Firma Bilgilerini Düzenle'}
        </button>
      </div>

      <div className={styles.summary}>
        <div className={styles.logoPreview}>
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt="Firma logosu"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span>{company.title?.trim()?.slice(0, 1).toUpperCase() || 'F'}</span>
          )}
        </div>

        <div className={styles.summaryMain}>
          <strong>{company.title || 'Firma ünvanı girilmedi'}</strong>

          <span>
            {company.taxNumber ? `VKN: ${company.taxNumber}` : 'VKN girilmedi'}

            {company.taxOffice ? ` • ${company.taxOffice}` : ''}
          </span>
        </div>

        <div className={styles.summaryLocation}>
          <span>Merkez</span>

          <strong>
            {[company.district, company.city, company.country].filter(Boolean).join(' / ') || '—'}
          </strong>
        </div>
      </div>

      {isExpanded ? (
        <div className={styles.formGrid}>
          <label className={`${styles.field} ${styles.span2}`}>
            <span>Firma Ünvanı</span>

            <input
              type="text"
              value={company.title}
              placeholder="Örn: Zentrix Teknoloji A.Ş."
              onChange={(event) =>
                updateCompany({
                  title: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Vergi / T.C. No</span>

            <input
              type="text"
              inputMode="numeric"
              maxLength={11}
              value={company.taxNumber}
              placeholder="VKN / TCKN"
              onChange={(event) =>
                updateCompany({
                  taxNumber: event.target.value.replace(/\D/g, ''),
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Vergi Dairesi</span>

            <input
              type="text"
              value={company.taxOffice}
              placeholder="Vergi dairesi"
              onChange={(event) =>
                updateCompany({
                  taxOffice: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>MERSİS No</span>

            <input
              type="text"
              value={company.mersisNumber}
              placeholder="MERSİS numarası"
              onChange={(event) =>
                updateCompany({
                  mersisNumber: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Ticaret Sicil No</span>

            <input
              type="text"
              value={company.tradeRegistryNumber}
              placeholder="Ticaret sicil numarası"
              onChange={(event) =>
                updateCompany({
                  tradeRegistryNumber: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Telefon</span>

            <input
              type="tel"
              value={company.phone}
              placeholder="0 (212) 000 00 00"
              onChange={(event) =>
                updateCompany({
                  phone: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>E-posta</span>

            <input
              type="email"
              value={company.email}
              placeholder="muhasebe@firma.com"
              onChange={(event) =>
                updateCompany({
                  email: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Web Sitesi</span>

            <input
              type="text"
              value={company.website}
              placeholder="www.firma.com"
              onChange={(event) =>
                updateCompany({
                  website: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Logo URL</span>

            <input
              type="text"
              value={company.logoUrl}
              placeholder="https://.../logo.png"
              onChange={(event) =>
                updateCompany({
                  logoUrl: event.target.value,
                })
              }
            />
          </label>

          <label className={`${styles.field} ${styles.span2}`}>
            <span>Adres</span>

            <input
              type="text"
              value={company.address}
              placeholder="Mahalle, cadde, sokak, bina no"
              onChange={(event) =>
                updateCompany({
                  address: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>İlçe</span>

            <input
              type="text"
              value={company.district}
              placeholder="İlçe"
              onChange={(event) =>
                updateCompany({
                  district: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Şehir</span>

            <input
              type="text"
              value={company.city}
              placeholder="Şehir"
              onChange={(event) =>
                updateCompany({
                  city: event.target.value,
                })
              }
            />
          </label>

          <label className={styles.field}>
            <span>Ülke</span>

            <input
              type="text"
              value={company.country}
              placeholder="Türkiye"
              onChange={(event) =>
                updateCompany({
                  country: event.target.value,
                })
              }
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}
