import { useTranslation } from 'react-i18next';
import type { InvoicePageSize } from '../models/invoice';
import styles from './Pagination.module.scss';

type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis';

interface PaginationProps {
  currentPage: number;
  pageSize: InvoicePageSize;
  totalItems: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: InvoicePageSize) => void;
}

const pageSizeOptions: InvoicePageSize[] = [10, 25, 50];

function createPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  }

  const items: PaginationItem[] = [1];

  if (currentPage <= 4) {
    items.push(2, 3, 4, 5, 'end-ellipsis');
  } else if (currentPage >= totalPages - 3) {
    items.push('start-ellipsis');

    for (let page = totalPages - 4; page < totalPages; page += 1) {
      items.push(page);
    }
  } else {
    items.push('start-ellipsis', currentPage - 1, currentPage, currentPage + 1, 'end-ellipsis');
  }

  items.push(totalPages);

  return items;
}

export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  startItem,
  endItem,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { t } = useTranslation();

  if (totalItems === 0) {
    return null;
  }

  const paginationItems = createPaginationItems(currentPage, totalPages);

  return (
    <nav className={styles.pagination} aria-label={t('pagination.ariaLabel')}>
      <div className={styles.summary}>
        {t('pagination.summary', {
          startItem,
          endItem,
          totalItems,
        })}
      </div>

      <div className={styles.controls}>
        <label className={styles.pageSize}>
          <span>{t('pagination.pageSize')}</span>

          <select
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value) as InvoicePageSize);
            }}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.pageButtons}>
          <button
            className={styles.navigationButton}
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label={t('pagination.previous')}
          >
            ‹
          </button>

          {paginationItems.map((item) => {
            if (typeof item !== 'number') {
              return (
                <span key={item} className={styles.ellipsis} aria-hidden="true">
                  …
                </span>
              );
            }

            const isActive = item === currentPage;

            return (
              <button
                key={item}
                className={isActive ? styles.activePage : styles.pageButton}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={t('pagination.goToPage', {
                  page: item,
                })}
              >
                {item}
              </button>
            );
          })}

          <button
            className={styles.navigationButton}
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label={t('pagination.next')}
          >
            ›
          </button>
        </div>
      </div>
    </nav>
  );
}
