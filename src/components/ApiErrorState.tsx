import { useTranslation } from 'react-i18next';
import styles from './ApiErrorState.module.scss';

interface ApiErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ApiErrorState({ message, onRetry }: ApiErrorStateProps) {
  const { t } = useTranslation();

  return (
    <section className={styles.container} role="alert">
      <h2>{t('error.title')}</h2>
      <p>{message}</p>

      <button type="button" onClick={onRetry}>
        {t('actions.retry')}
      </button>
    </section>
  );
}
