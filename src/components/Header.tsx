import styles from './Header.module.scss';

interface HeaderProps {
  appName: string;
  pageName: string;
  isTableVisible: boolean;
  onToggleTable: () => void;
}

export function Header({ appName, pageName, isTableVisible, onToggleTable }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <strong>{appName}</strong>
          <span>{pageName}</span>
        </div>

        <button className={styles.button} type="button" onClick={onToggleTable}>
          {isTableVisible ? 'Tabloyu Gizle' : 'Tabloyu Göster'}
        </button>
      </div>
    </header>
  );
}
