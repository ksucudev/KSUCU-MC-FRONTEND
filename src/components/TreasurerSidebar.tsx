import React from 'react';
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  Briefcase,
  Smartphone,
  Settings,
  LogOut,
  X,
  ShieldCheck
} from 'lucide-react';
import styles from '../styles/chairpersonSidebar.module.css'; // Reusing established styles
import cuLogo from '../assets/KSUCU logo updated document.png';

export type TreasurerSection = 'dashboard' | 'transactions' | 'requisitions' | 'assets' | 'reports' | 'mpesa' | 'audit' | 'settings';

interface TreasurerSidebarProps {
  activeSection: TreasurerSection;
  onSectionChange: (section: TreasurerSection) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

interface MenuItem {
  id: TreasurerSection;
  label: string;
  icon: React.ReactNode;
}

const mainItems: MenuItem[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
];

const financeItems: MenuItem[] = [
  { id: 'transactions', label: 'Transactions', icon: <DollarSign size={18} /> },
  { id: 'requisitions', label: 'Requisitions', icon: <FileText size={18} /> },
  { id: 'assets', label: 'Assets', icon: <Briefcase size={18} /> },
  { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
  { id: 'mpesa', label: 'M-Pesa / STK', icon: <Smartphone size={18} /> },
];

const systemItems: MenuItem[] = [
  { id: 'audit', label: 'Audit Logs', icon: <ShieldCheck size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

const TreasurerSidebar: React.FC<TreasurerSidebarProps> = ({
  activeSection,
  onSectionChange,
  isOpen,
  onToggle,
  onLogout
}) => {
  const handleItemClick = (section: TreasurerSection) => {
    onSectionChange(section);
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  const renderGroup = (title: string, items: MenuItem[]) => (
    <div className={styles.navGroup}>
      <div className={styles.groupHeadTitle}>{title}</div>
      <ul className={styles.menuList}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              className={`${styles.menuItem} ${activeSection === item.id ? styles.active : ''}`}
              onClick={() => handleItemClick(item.id)}
              title={item.label}
              data-label={item.label}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              <span className={styles.menuLabel}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onToggle} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.identityBlock}>
            <div className={styles.logoCircle}>
              <img src={cuLogo} alt="KSUCU-MC" />
            </div>
            <div className={styles.identityText}>
              <span className={styles.brandName}>KSUCU-MC</span>
              <span className={styles.roleBadge}>
                 <ShieldCheck size={10} color="#c9a227" /> Treasurer
              </span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onToggle} title="Close Menu">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {renderGroup('Main', mainItems)}
          {renderGroup('Finance Management', financeItems)}
          {renderGroup('System', systemItems)}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutButton} onClick={onLogout}>
            <span className={styles.menuIcon}><LogOut size={18} /></span>
            <span className={styles.menuLabel}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default TreasurerSidebar;
