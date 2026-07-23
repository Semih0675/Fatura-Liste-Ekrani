import { useTranslation } from 'react-i18next';
import styles from './EmptyInvoiceState.module.scss';

export function EmptyInvoiceState() {
  const { t } = useTranslation();

  return (
    <section className={styles.container}>
      <div className={styles.icon} aria-hidden="true">
        0
      </div>

      <h2>{t('empty.title')}</h2>
      <p>{t('empty.description')}</p>
    </section>
  );
}
