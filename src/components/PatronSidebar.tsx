import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Image,
  Settings,
  DollarSign,
  LogOut,
  Crown,
  X,
  ChevronDown,
  ChevronUp,
  Globe,
  Music
} from 'lucide-react';
import styles from '../styles/patronSidebar.module.css';
import cuLogo from '../assets/KSUCU logo updated document.png';
import { ET_LIST, MINISTRY_LIST } from '../utils/constants';

export type PatronSection = string;

interface PatronSidebarProps {
  activeSection: PatronSection;
  onSectionChange: (section: PatronSection) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

interface MenuItem {
  id: PatronSection;
  label: string;
  icon: React.ReactNode;
}

const mainItems: MenuItem[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
];

const manageableItems: MenuItem[] = [
  { id: 'members', label: 'All Members', icon: <Users size={18} /> },
  { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={18} /> },
  { id: 'gallery', label: 'Gallery', icon: <Image size={18} /> },
];

const financeItems: MenuItem[] = [
  { id: 'finance-dashboard', label: 'Dashboard', icon: <DollarSign size={16} /> },
  { id: 'finance-transactions', label: 'Transactions', icon: <DollarSign size={16} /> },
  { id: 'finance-requisitions', label: 'Requisitions', icon: <DollarSign size={16} /> },
  { id: 'finance-reports', label: 'Reports', icon: <DollarSign size={16} /> },
];

const etItems: MenuItem[] = ET_LIST.map(et => ({
  id: `et-${et}`,
  label: et,
  icon: <Users size={16} />
}));

const ministryItems: MenuItem[] = MINISTRY_LIST.map(min => ({
  id: `min-${min}`,
  label: min,
  icon: <Users size={16} />
}));

const systemItems: MenuItem[] = [
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

const PatronSidebar: React.FC<PatronSidebarProps> = ({
  activeSection,
  onSectionChange,
  isOpen,
  onToggle,
  onLogout
}) => {
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  const handleItemClick = (section: PatronSection) => {
    onSectionChange(section);
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  const toggleExpandGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
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

  const renderExpandableGroup = (title: string, items: MenuItem[], groupId: string, icon: React.ReactNode) => {
    const isExpanded = expandedGroups[groupId];
    const isActiveChild = items.some(item => activeSection === item.id);
    
    return (
      <div className={styles.navGroup}>
        <div 
          className={`${styles.groupHead} ${isActiveChild ? styles.active : ''}`}
          onClick={() => toggleExpandGroup(groupId)}
          title={title}
        >
          <div className={styles.groupHeadMain}>
            <span className={styles.menuIcon}>{icon}</span>
            <span className={styles.expandTitle}>{title}</span>
          </div>
          <span className={styles.chevronIcon}>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
        {isExpanded && (
          <ul className={`${styles.menuList} ${styles.submenuList}`}>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.menuItem} ${styles.submenuItem} ${activeSection === item.id ? styles.active : ''}`}
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
        )}
      </div>
    );
  };

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
                <Crown size={10} color="#c9a227" /> PATRON
              </span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onToggle} title="Close Menu">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {renderGroup('Main', mainItems)}
          {renderGroup('Management', manageableItems)}
          {renderExpandableGroup('Finance', financeItems, 'fin', <DollarSign size={18} />)}
          {renderExpandableGroup('Evangelistic Teams', etItems, 'et', <Globe size={18} />)}
          {renderExpandableGroup('Ministries', ministryItems, 'min', <Music size={18} />)}
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

export default PatronSidebar;
