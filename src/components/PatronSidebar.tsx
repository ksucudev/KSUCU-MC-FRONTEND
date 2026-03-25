import React from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Image,
  Settings,
  DollarSign,
  X
} from 'lucide-react';
import styles from '../styles/patronSidebar.module.css';

export type PatronSection = 'dashboard' | 'members' | 'feedback' | 'gallery' | 'settings' | 'finance';

interface PatronSidebarProps {
  activeSection: PatronSection;
  onSectionChange: (section: PatronSection) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: PatronSection;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'members', label: 'Members', icon: <Users size={20} /> },
  { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
  { id: 'gallery', label: 'Gallery', icon: <Image size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  { id: 'finance', label: 'Finance', icon: <DollarSign size={20} /> },
];

const PatronSidebar: React.FC<PatronSidebarProps> = ({
  activeSection,
  onSectionChange,
  isOpen,
  onToggle
}) => {
  const handleItemClick = (section: PatronSection) => {
    onSectionChange(section);
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onToggle} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Patron Panel</h2>
          <button className={styles.closeButton} onClick={onToggle}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.menuList}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.menuItem} ${activeSection === item.id ? styles.active : ''}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <span className={styles.menuIcon}>{item.icon}</span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default PatronSidebar;
