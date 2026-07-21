import classNames from 'classnames/bind';
import styles from './SummaryCards.module.scss';

const cx = classNames.bind(styles);

export type SummaryCardVariant = 'primary' | 'info' | 'danger';

export interface SummaryCard {
  id: string;
  label: string;
  value: string;
  helperText: string;
  variant: SummaryCardVariant;
}

interface SummaryCardsProps {
  cards: SummaryCard[];
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <section className={styles.grid} aria-label="Fatura özeti">
      {cards.map((card) => (
        <article key={card.id} className={cx('card', card.variant)}>
          <span className={styles.label}>{card.label}</span>
          <strong className={styles.value}>{card.value}</strong>
          <span className={styles.helper}>{card.helperText}</span>
        </article>
      ))}
    </section>
  );
}
