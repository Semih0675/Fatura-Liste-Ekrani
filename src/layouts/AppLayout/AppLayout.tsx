import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../../components/AppSidebar/AppSidebar';
import styles from './AppLayout.module.scss';

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  function handleToggleSidebar() {
    setIsSidebarCollapsed((currentValue) => !currentValue);
  }

  return (
    <div className={styles.layout}>
      <AppSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggleSidebar} />

      <div className={`${styles.content} ${isSidebarCollapsed ? styles.contentCollapsed : ''}`}>
        <Outlet />
      </div>
    </div>
  );
}
