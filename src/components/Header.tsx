import { useTranslation } from 'react-i18next';
import styles from './Header.module.scss';

interface HeaderProps {
  appName: string;
  pageName: string;
  isTableVisible: boolean;
  isNewInvoiceDisabled: boolean;
  onToggleTable: () => void;
}

export function Header({
  appName,
  pageName,
  isNewInvoiceDisabled,
}: HeaderProps) {
  const { t, i18n } = useTranslation();

  const isEnglish =
    i18n.resolvedLanguage?.startsWith('en') ?? false;

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <strong>{appName}</strong>
          <span>{pageName}</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.newInvoiceButton}
            type="button"
            disabled={isNewInvoiceDisabled}
          >
            + {t('actions.newInvoice')}
          </button>
          <div
            className={styles.languageSwitcher}
            aria-label={t('language.selector')}
          >
            <button
              className={
                !isEnglish
                  ? styles.activeLanguageButton
                  : styles.languageButton
              }
              type="button"
              onClick={() => void i18n.changeLanguage('tr')}
              aria-pressed={!isEnglish}
            >
              TR
            </button>

            <button
              className={
                isEnglish
                  ? styles.activeLanguageButton
                  : styles.languageButton
              }
              type="button"
              onClick={() => void i18n.changeLanguage('en')}
              aria-pressed={isEnglish}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}