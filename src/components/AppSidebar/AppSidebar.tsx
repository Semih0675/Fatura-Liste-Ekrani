import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import styles from './AppSidebar.module.scss';

interface AppSidebarProps {
  isCollapsed: boolean;

  onToggle: () => void;
}

interface MenuItem {
  label: string;

  path: string;

  icon: string;

  isActive: (pathname: string) => boolean;
}

const mainMenuItems: MenuItem[] = [
  {
    label: 'Dashboard',

    path: '/dashboard',

    icon: '▦',

    isActive: (pathname) =>
      pathname === '/dashboard',
  },

  {
    label: 'Faturalar',

    path: '/',

    icon: '▤',

    isActive: (pathname) =>
      pathname === '/' ||
      pathname.startsWith('/invoices'),
  },

  {
    label: 'Cari Hesaplar',

    path: '/customers',

    icon: '◎',

    isActive: (pathname) =>
      pathname.startsWith('/customers'),
  },

  {
    label: 'Ürün & Stok',

    path: '/products',

    icon: '◇',

    isActive: (pathname) =>
      pathname.startsWith('/products'),
  },

  {
    label: 'Tahsilatlar',

    path: '/payments',

    icon: '₺',

    isActive: (pathname) =>
      pathname.startsWith('/payments'),
  },

  {
    label: 'Raporlar',

    path: '/reports',

    icon: '▥',

    isActive: (pathname) =>
      pathname.startsWith('/reports'),
  },
];

export function AppSidebar({
  isCollapsed,

  onToggle,
}: AppSidebarProps) {
  const location = useLocation();

  const navigate = useNavigate();

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed
          ? styles.sidebarCollapsed
          : ''
        }`}
    >
      <div className={styles.brand}>
        <button
          type="button"
          className={styles.brandButton}
          onClick={() =>
            navigate('/dashboard')
          }
        >
          <span className={styles.logo}>
            P
          </span>

          <span className={styles.brandText}>
            <strong>
              PreAccounting
            </strong>

            <small>
              Ön Muhasebe
            </small>
          </span>
        </button>

        <button
          type="button"
          className={styles.collapseButton}
          onClick={onToggle}
          title={
            isCollapsed
              ? 'Menüyü genişlet'
              : 'Menüyü daralt'
          }
        >
          {isCollapsed ? '›' : '‹'}
        </button>
      </div>

      <div className={styles.quickArea}>
        <button
          type="button"
          className={styles.newInvoiceButton}
          onClick={() =>
            navigate('/invoices/new')
          }
        >
          <span>+</span>

          <strong>
            Yeni Fatura
          </strong>
        </button>
      </div>

      <nav className={styles.navigation}>
        <span className={styles.sectionLabel}>
          YÖNETİM
        </span>

        {mainMenuItems.map((item) => {
          const active =
            item.isActive(
              location.pathname,
            );

          return (
            <button
              key={item.path}
              type="button"
              className={`${styles.menuItem} ${active
                  ? styles.activeMenuItem
                  : ''
                }`}
              onClick={() =>
                navigate(item.path)
              }
              title={
                isCollapsed
                  ? item.label
                  : undefined
              }
              aria-current={
                active
                  ? 'page'
                  : undefined
              }
            >
              <span
                className={styles.menuIcon}
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <span
                className={styles.menuLabel}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className={styles.bottomArea}>
        <span className={styles.sectionLabel}>
          AYARLAR
        </span>

        <button
          type="button"
          className={`${styles.menuItem} ${location.pathname.startsWith(
            '/settings',
          )
              ? styles.activeMenuItem
              : ''
            }`}
          onClick={() =>
            navigate('/settings/company')
          }
        >
          <span
            className={styles.menuIcon}
          >
            ⚙
          </span>

          <span
            className={styles.menuLabel}
          >
            Firma Ayarları
          </span>
        </button>

        <div className={styles.version}>
          <strong>
            PreAccounting
          </strong>

          <span>v1.0</span>
        </div>
      </div>
    </aside>
  );
}