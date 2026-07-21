interface HeaderProps {
  appName: string;
  pageName: string;
  isTableVisible: boolean;
  onToggleTable: () => void;
}

export function Header({
  appName,
  pageName,
  isTableVisible,
  onToggleTable,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand">
          <strong>{appName}</strong>
          <span>{pageName}</span>
        </div>

        <button className="header-button" type="button" onClick={onToggleTable}>
          {isTableVisible ? "Tabloyu Gizle" : "Tabloyu Göster"}
        </button>
      </div>
    </header>
  );
}
