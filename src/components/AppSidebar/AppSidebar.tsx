import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import styles from './AppSidebar.module.scss';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        {!isCollapsed ? (
          <div className={styles.brand}>
            <span className={styles.logo}>P</span>

            <div className={styles.brandText}>
              <strong>PreAccounting</strong>
              <span>{t('navigation.managementPanel')}</span>
            </div>
          </div>
        ) : (
          <span className={styles.logo}>P</span>
        )}

        <button
          type="button"
          className={styles.toggleButton}
          onClick={onToggle}
          aria-label={isCollapsed ? t('navigation.expandMenu') : t('navigation.collapseMenu')}
          title={isCollapsed ? t('navigation.expandMenu') : t('navigation.collapseMenu')}
        >
          {isCollapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className={styles.navigation}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${styles.navigationLink} ${isActive ? styles.activeLink : ''}`
          }
          title={isCollapsed ? t('navigation.invoiceList') : undefined}
        >
          <span className={styles.icon} aria-hidden="true">
            ▤
          </span>

          {!isCollapsed ? <span>{t('navigation.invoiceList')}</span> : null}
        </NavLink>

        <NavLink
          to="/invoices/new"
          className={({ isActive }) =>
            `${styles.navigationLink} ${isActive ? styles.activeLink : ''}`
          }
          title={isCollapsed ? t('navigation.createInvoice') : undefined}
        >
          <span className={styles.icon} aria-hidden="true">
            ＋
          </span>

          {!isCollapsed ? <span>{t('navigation.createInvoice')}</span> : null}
        </NavLink>
      </nav>

      {!isCollapsed ? (
        <div className={styles.footer}>
          <span>{t('navigation.invoiceOperations')}</span>
        </div>
      ) : null}
    </aside>
  );
}
