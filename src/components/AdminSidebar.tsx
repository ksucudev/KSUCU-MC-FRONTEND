import React, { useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Vote,
  MessageSquare,
  FileText,
  FolderOpen,
  DollarSign,
  Shield,
  LogOut
} from 'lucide-react';
import styles from '../styles/adminSidebar.module.css';

export type AdminSection = 'dashboard' | 'students' | 'polling' | 'messages' | 'minutes' | 'documents' | 'committee' | 'adminManagement' | 'finance';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout?: () => void;
}

interface MenuItem {
  id: AdminSection;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'students', label: 'Students', icon: <Users size={16} /> },
  { id: 'polling', label: 'Polling', icon: <Vote size={16} /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare size={16} /> },
  { id: 'minutes', label: 'Minutes', icon: <FileText size={16} /> },
  { id: 'documents', label: 'Documents', icon: <FolderOpen size={16} /> },
  { id: 'committee', label: 'Committee', icon: <UserCog size={16} /> },
  { id: 'adminManagement', label: 'Admins', icon: <Shield size={16} /> },
  { id: 'finance', label: 'Finance', icon: <DollarSign size={16} /> },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  isOpen,
  onToggle,
  onLogout
}) => {
  const sidebarRef = useRef<HTMLElement>(null);

  const handleItemClick = (section: AdminSection) => {
    onSectionChange(section);
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  // Close sidebar when clicking anywhere outside it (mobile)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className={styles.overlay} onClick={onToggle} />}

      {/* Sidebar */}
      <aside ref={sidebarRef} className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <nav className={styles.nav}>
          <ul className={styles.menuList}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.menuItem} ${activeSection === item.id ? styles.active : ''}`}
                  onClick={() => handleItemClick(item.id)}
                  data-label={item.label}
                >
                  <span className={styles.menuIcon}>{item.icon}</span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {onLogout && (
          <div className={styles.sidebarFooter}>
            <button className={styles.logoutBtn} onClick={onLogout}>
              <LogOut size={14} />
              <span className={styles.menuLabel}>Log Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;
