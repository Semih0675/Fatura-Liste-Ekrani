import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Fatura verileri yükleniyor...' }: LoadingSpinnerProps) {
  return (
    <section className={styles.container} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />

      <strong>{message}</strong>
      <span>Lütfen bekleyin.</span>
    </section>
  );
}
