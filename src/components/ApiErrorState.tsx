import styles from './ApiErrorState.module.scss';

interface ApiErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ApiErrorState({ message, onRetry }: ApiErrorStateProps) {
  return (
    <section className={styles.container} role="alert">
      <div className={styles.icon} aria-hidden="true">
        !
      </div>

      <h2>Fatura verileri yüklenemedi</h2>
      <p>{message}</p>

      <button type="button" onClick={onRetry}>
        Tekrar Dene
      </button>
    </section>
  );
}
