import { useTranslation } from 'react-i18next';
import styles from './LoadingSpinner.module.scss';

export function LoadingSpinner() {
  const { t } = useTranslation();

  return (
    <section className={styles.container} role="status">
      <div className={styles.spinner} aria-hidden="true" />
      <p>{t('loading.message')}</p>
    </section>
  );
}
