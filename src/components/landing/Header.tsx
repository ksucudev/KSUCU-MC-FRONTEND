import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User, ChevronDown, ChevronRight, ExternalLink, Menu,
  Home, Building2, Globe, Music,
  UsersRound, GraduationCap, Crown, LogIn, LogOut,
  ClipboardList, BookOpen, Tv2, FileText, AlertCircle,
  MessageSquare, Coins, Folder, Book, UserPlus
} from 'lucide-react';

import { getApiUrl, getImageUrl } from '../../config/environment';
import { headerNavGroups, organizationSections, type NavItem, type NavSection } from '../../data/navigationData';
import cuLogo from '../../assets/cuLogoUAR.png';
import QuickAttendanceSign from '../attendance/QuickAttendanceSign';

interface UserData {
  username: string;
  email: string;
  profilePhoto?: string;
}

interface Session {
  _id: string;
  title: string;
  ministry: string;
  leadershipRole: string;
  isActive: boolean;
  startTime: string;
  durationMinutes: number;
}

// Cascading flyout menu item for desktop - children appear to the right (or left if near edge)
const FlyoutItem = ({ item, onClose, forceLeft = false }: { item: NavItem; onClose: () => void; forceLeft?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [openLeft, setOpenLeft] = useState(forceLeft);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const hasChildren = item.children && item.children.length > 0;

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (forceLeft) {
      setOpenLeft(true);
    } else if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      setOpenLeft(spaceRight < 220);
    }
    setIsHovered(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setIsHovered(false), 120);
  };

  if (hasChildren) {
    return (
      <div
        ref={itemRef}
        className="relative"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <button
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left ${isHovered ? 'text-[#730051] bg-purple-50' : 'text-gray-700 hover:bg-gray-50'
            }`}
        >
          <span>{item.label}</span>
          <ChevronRight size={14} className={`text-gray-400 flex-shrink-0 ml-2 ${openLeft && isHovered ? 'rotate-180' : ''}`} />
        </button>

        {isHovered && (
          <div
            className="absolute top-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
            style={{
              minWidth: '200px',
              maxWidth: '260px',
              ...(openLeft
                ? { right: '100%', marginRight: '4px' }
                : { left: '100%', marginLeft: '4px' }),
            }}
          >
            {item.children!.map((child, i) => (
              <FlyoutItem key={i} item={child} onClose={onClose} forceLeft={openLeft} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.external) {
    return (
      <a
        href={item.href || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-[#730051] hover:bg-purple-50 rounded-md transition-colors"
        onClick={onClose}
      >
        <span className="truncate">{item.label}</span>
        <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
      </a>
    );
  }

  return (
    <Link
      to={item.href || '#'}
      className="block px-3 py-2 text-sm text-gray-700 hover:text-[#730051] hover:bg-purple-50 rounded-md transition-colors truncate"
      onClick={onClose}
    >
      {item.label}
    </Link>
  );
};

// Mobile sidebar nav item
const MobileSidebarItem = ({ item, depth = 0, onClose }: { item: NavItem; depth?: number; onClose: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between py-2 px-3 rounded-md text-left transition-colors ${isOpen ? 'text-[#730051] bg-purple-50' : 'text-gray-700 hover:bg-gray-50'
            }`}
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          <span className="text-sm break-words min-w-0">{item.label}</span>
          <ChevronRight
            size={14}
            className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
          {item.children!.map((child, i) => (
            <MobileSidebarItem key={i} item={child} depth={depth + 1} onClose={onClose} />
          ))}
        </div>
      </div>
    );
  }

  if (item.external) {
    return (
      <a
        href={item.href || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 py-2 px-3 rounded-md text-sm text-gray-600 hover:text-[#730051] hover:bg-purple-50 transition-colors"
        style={{ paddingLeft: `${12 + depth * 12}px` }}
        onClick={onClose}
      >
        {item.label}
        <ExternalLink size={11} className="text-gray-400" />
      </a>
    );
  }

  return (
    <Link
      to={item.href || '#'}
      className="block py-2 px-3 rounded-md text-sm text-gray-600 hover:text-[#730051] hover:bg-purple-50 transition-colors"
      style={{ paddingLeft: `${12 + depth * 12}px` }}
      onClick={onClose}
    >
      {item.label}
    </Link>
  );
};


// Icon map for mobile sidebar tabs
const mobileNavTabs: { key: string; icon: React.ElementType; label: string; }[] = [
  { key: 'dashboard', icon: Home, label: 'Home' },
  { key: 'ministries', icon: Music, label: 'Ministries' },
  { key: 'boards', icon: Building2, label: 'Boards' },
  { key: 'eteams', icon: Globe, label: 'E. Teams' },
  { key: 'mediadesk', icon: Tv2, label: 'Media Desk' },
  { key: 'fellowships', icon: UsersRound, label: 'Fellowships' },
  { key: 'biblestudy', icon: BookOpen, label: 'Bible Study' },
  { key: 'classes', icon: GraduationCap, label: 'Classes' },
  { key: 'financials', icon: Coins, label: 'Financials' },
  { key: 'requisitions', icon: FileText, label: 'Requisitions' },
  { key: 'filemanager', icon: Folder, label: 'File Manager' },
  { key: 'library', icon: Book, label: 'Library' },
  { key: 'winasoul', icon: UserPlus, label: 'Evangelism' },
  { key: 'leadership', icon: Crown, label: 'Leadership' },
  { key: 'governingdocs', icon: FileText, label: 'Governing Docs' },
  { key: 'attendance', icon: ClipboardList, label: 'Attendance' },
  { key: 'feedback', icon: MessageSquare, label: 'Talk to us' },
];

interface TabSection {
  title: string;
  icon: React.ElementType;
  items: { label: string; href?: string; external?: boolean; children?: { label: string; href?: string }[] }[];
}

const getTabSections = (key: string, activeSessions: Session[]): TabSection[] => {
  switch (key) {
    case 'ministries': return [{ title: 'Ministries', icon: Music, items: organizationSections[3].items }];
    case 'boards': return [{ title: 'Boards', icon: Building2, items: organizationSections[1].items }];
    case 'eteams': return [{ title: 'E. Teams', icon: Globe, items: organizationSections[2].items }];
    case 'fellowships': return [{ title: 'Fellowships', icon: UsersRound, items: organizationSections[4].items }];
    case 'biblestudy': return [{ title: 'Bible Study', icon: BookOpen, items: [{ label: 'Register for Bible Study', href: '/Bs' }, { label: 'View BS Groups', href: '/Bs' }] }];
    case 'classes': return [{ title: 'Classes', icon: GraduationCap, items: organizationSections[6].items }];
    case 'feedback': return [{ title: 'Talk to us', icon: MessageSquare, items: [{ label: 'Submit Anonymously', href: '/recomendations' }, { label: 'Submit with Identity', href: '/recomendations' }] }];
    case 'financials': return [{ title: 'Financials', icon: Coins, items: [{ label: 'View Financial Statements', href: '/financial' }, { label: 'My Contributions', href: '/financial' }] }];
    case 'requisitions': return [{ title: 'Requisitions', icon: FileText, items: [{ label: 'My Requisitions', href: '/requisitions' }, { label: 'New Requisition', href: '/requisitions' }] }];
    case 'filemanager': return [{ title: 'File Manager', icon: Folder, items: [{ label: 'My Documents', href: '/my-docs' }, { label: 'Shared Files', href: '/my-docs' }] }];
    case 'library': return [{ title: 'Library', icon: Book, items: [{ label: 'Search Books', href: '/library' }, { label: 'My Borrows', href: '/library' }] }];
    case 'winasoul': return [{ title: 'Win a Soul', icon: UserPlus, items: [{ label: 'Mission Reports', href: '/save' }, { label: 'Evangelism Guide', href: '/save' }] }];
    case 'leadership': return [{ title: 'Leadership', icon: Crown, items: organizationSections[7].items }];
    case 'governingdocs': return [{ title: 'Governing Docs', icon: FileText, items: [{ label: 'Constitution', href: '/pdfs/constitution.pdf', external: true }, { label: 'Financial Policy', href: '#' }, { label: 'Leadership Manual', href: '#' }] }];
    case 'mediadesk': return [{
      title: 'Media Desk', icon: Tv2,
      items: [
        { label: 'News', href: '/news' },
        { label: 'Gallery', href: '/media' },
        {
          label: 'Socials', children: [
            { label: 'TikTok', href: 'https://tiktok.com/@ksucu_mc' },
            { label: 'YouTube', href: 'https://www.youtube.com/@ksucu-mc' },
            { label: 'Facebook', href: 'https://www.facebook.com/ksucumaincampus' },
            { label: 'Instagram', href: 'https://www.instagram.com/ksucu_mc' },
            { label: 'X (Twitter)', href: 'https://twitter.com/ksucumc' },
          ]
        },
      ]
    }];
    case 'attendance':
      if (activeSessions.length === 0) return [];
      return [{ title: 'Active Sessions', icon: ClipboardList, items: activeSessions.map(s => ({ label: s.title, href: `/attendance?session=${s._id}` })) }];
    case 'committees': return [{ title: 'Committees', icon: UsersRound, items: organizationSections[5].items }];
    default: return [];
  }
};


const MobileSidebarMenu = ({ userData, activeSessions, onNavigate, activeNav, isManualExpanded, setIsManualExpanded }: {
  userData: UserData | null;
  activeSessions: Session[];
  onNavigate: (path: string) => void;
  activeNav: string | null;
  isManualExpanded: boolean;
  setIsManualExpanded: (val: boolean) => void;
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [expandedNestedItem, setExpandedNestedItem] = useState<string | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Expansion happens when any tab is active OR manually toggled via hamburger
  const isExpanded = !!activeTab || isManualExpanded;

  const handleTabClick = (key: string) => {
    if (key === 'dashboard') {
      setActiveTab(null);
      setExpandedNestedItem(null);
      setIsManualExpanded(false);
      onNavigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (key === 'about') {
      setActiveTab(null);
      setTimeout(() => {
        const el = document.getElementById('about');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    if (key === 'signin') {
      setActiveTab(null);
      setExpandedNestedItem(null);
      setIsManualExpanded(false);
      onNavigate(userData ? '/changeDetails' : '/signIn');
      return;
    }
    if (key === 'biblestudy') {
      setActiveTab(null);
      setExpandedNestedItem(null);
      setIsManualExpanded(false);
      onNavigate('/Bs');
      return;
    }
    if (key === 'financials') {
      setActiveTab(null);
      setExpandedNestedItem(null);
      setIsManualExpanded(false);
      onNavigate('/financial');
      return;
    }
    if (key === 'feedback') {
      setActiveTab(null);
      setExpandedNestedItem(null);
      setIsManualExpanded(false);
      onNavigate('/recomendations');
      return;
    }
    if (activeTab === key) {
      setActiveTab(null);
      setExpandedNestedItem(null);
      return;
    }
    if (key === 'winasoul') {
      setActiveTab(null);
      setExpandedNestedItem(null);
      setIsManualExpanded(false);
      onNavigate('/save');
      return;
    }
    if (key === 'library') {
      setActiveTab(null);
      setExpandedNestedItem(null);
      setIsManualExpanded(false);
      onNavigate('/library');
      return;
    }
    if (key === 'filemanager') {
      setActiveTab(null);
      setExpandedNestedItem(null);
      setIsManualExpanded(false);
      onNavigate('/my-docs');
      return;
    }
    if (key === 'requisitions') {
      setActiveTab(null);
      setExpandedNestedItem(null);
      setIsManualExpanded(false);
      onNavigate('/requisitions');
      return;
    }
    if (key === 'attendance') {
      setActiveTab(null);
      setExpandedNestedItem(null);
      setIsManualExpanded(false);
      // Scroll to the inline attendance section on the landing page
      const el = document.getElementById('live-attendance');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Navigate home first, then scroll after render
        onNavigate('/');
        setTimeout(() => {
          const target = document.getElementById('live-attendance');
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 600);
      }
      return;
    }
    setActiveTab(key);
    setIsManualExpanded(true);
    // Scroll to show the dropdown after it renders
    setTimeout(() => {
      const dropdown = dropdownRefs.current[key];
      if (dropdown) {
        dropdown.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        // Fallback: scroll button to top so dropdown appears below
        buttonRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  };

  const closePanel = () => {
    setActiveTab(null);
    setExpandedNestedItem(null);
    setIsManualExpanded(false);
  };

  const sections = activeTab ? getTabSections(activeTab, activeSessions) : [];

  return (
    <div className="md:hidden">
      {/* Backdrop for click-outside collapse */}
      {isExpanded && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99997, background: 'rgba(0,0,0,0.15)' }}
          onClick={closePanel}
        />
      )}

      {/* Icon strip / Sidebar */}
      <div ref={sidebarRef} style={{
        position: 'fixed', top: '64px', left: 0, bottom: 0,
        width: isExpanded ? '180px' : '52px',
        backgroundColor: '#730051',
        display: 'block',
        textAlign: isExpanded ? 'left' : 'center',
        paddingTop: '6px', paddingBottom: '6px',
        paddingLeft: isExpanded ? '6px' : '0',
        overflowY: 'scroll', WebkitOverflowScrolling: 'touch', zIndex: 99999,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease',
        boxShadow: isExpanded ? '4px 0 20px rgba(0,0,0,0.3)' : 'none',
      }}>
        {mobileNavTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key || (activeNav === tab.key && !activeTab);
          const isAttendance = tab.key === 'attendance';
          const hasActiveSessions = activeSessions.length > 0;
          const hasSections = getTabSections(tab.key, activeSessions).length > 0;

          const isUser = tab.key === 'signin' && userData;

          return (
            <Fragment key={tab.key}>
              <button
                ref={el => { buttonRefs.current[tab.key] = el; }}
                onClick={() => handleTabClick(tab.key)}
                title={tab.label}
                style={{
                  width: isExpanded ? '168px' : '46px',
                  minHeight: '38px',
                  marginBottom: '2px',
                  display: 'flex',
                  flexDirection: isExpanded ? 'row' : 'column',
                  alignItems: 'center',
                  justifyContent: isExpanded ? 'flex-start' : 'center',
                  paddingLeft: isExpanded ? '10px' : '0',
                  margin: isExpanded ? '0' : '0 auto',
                  borderRadius: '6px', border: 'none', cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.95)' : 'transparent',
                  color: isActive ? '#730051' : 'rgba(255,255,255,0.85)',
                  gap: isExpanded ? '10px' : '2px',
                  flexShrink: 0, position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px' }}>
                  {isUser ? (
                    userData?.profilePhoto ? (
                      <img
                        src={getImageUrl(userData.profilePhoto)}
                        alt=""
                        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.8)' }}
                      />
                    ) : (
                      <User size={22} />
                    )
                  ) : (
                    <Icon size={22} />
                  )}
                </div>

                {isAttendance && hasActiveSessions && (
                  <span style={{
                    position: 'absolute',
                    top: isExpanded ? '16px' : '6px',
                    left: isExpanded ? '28px' : 'auto',
                    right: isExpanded ? 'auto' : '6px',
                    width: '8px', height: '8px',
                    background: '#ef4444', borderRadius: '50%',
                    boxShadow: '0 0 8px rgba(239,68,68,0.8)',
                    animation: 'pulse 2s infinite',
                  }} />
                )}

                {isExpanded && (
                  <span style={{
                    fontSize: '13px',
                    lineHeight: 1.1,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.1px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease',
                  }}>
                    {isUser ? 'Profile' : tab.label}
                  </span>
                )}

                {hasSections && isExpanded && (
                  <div style={{ marginLeft: 'auto', marginRight: '6px', display: 'flex', alignItems: 'center' }}>
                    <ChevronDown size={12} style={{ opacity: isActive ? 0.8 : 0.4, transform: isActive ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
                  </div>
                )}
              </button>

              {/* Inline dropdown */}
              {isExpanded && isActive && sections.length > 0 && (
                <div
                  ref={el => { dropdownRefs.current[tab.key] = el; }}
                  style={{
                    width: '168px',
                    background: 'rgba(255,255,255,0.98)',
                    borderRadius: '8px',
                    marginTop: '2px',
                    marginBottom: '4px',
                    maxHeight: '45vh',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(115,0,81,0.2)',
                  }}>
                  {sections.map((section, idx) => (
                    <div key={idx} style={{ padding: '4px 0' }}>
                      {(section.title.toLowerCase() !== tab.label.toLowerCase() || sections.length > 1) && (
                        <div style={{
                          padding: '6px 16px 4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#730051',
                          opacity: 0.7,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {section.title}
                        </div>
                      )}

                      {section.items.map((item, i) => (
                        <div key={i}>
                          <Link
                            to={item.href || '#'}
                            onClick={(e) => {
                              if (item.children && item.children.length > 0) {
                                e.preventDefault();
                                setExpandedNestedItem(expandedNestedItem === item.label ? null : item.label);
                              } else {
                                closePanel();
                              }
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '8px 14px', color: '#374151', fontSize: '12px',
                              textDecoration: 'none', transition: 'all 0.15s',
                              fontWeight: 600
                            }}
                          >
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.children && (
                              <ChevronRight
                                size={10}
                                style={{
                                  opacity: 0.5,
                                  transform: expandedNestedItem === item.label ? 'rotate(90deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s'
                                }}
                              />
                            )}
                          </Link>

                          {item.children && (
                            <div style={{
                              paddingLeft: '12px',
                              background: '#fafafa',
                              maxHeight: expandedNestedItem === item.label ? '500px' : '0',
                              overflow: 'hidden',
                              transition: 'all 0.3s ease-in-out'
                            }}>
                              {item.children.map((child, j) => (
                                <Link
                                  key={j}
                                  to={child.href || '#'}
                                  onClick={closePanel}
                                  style={{
                                    display: 'block', padding: '10px 16px',
                                    color: '#6b7280', fontSize: '11px',
                                    textDecoration: 'none',
                                    fontWeight: 400
                                  }}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      <style>{`
        @keyframes accordionDown {
          from { opacity: 0; max-height: 0; }
          to   { opacity: 1; max-height: 45vh; }
        }
      `}</style>
    </div>
  );
};


const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPatron, setIsPatron] = useState(false);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [signingSession, setSigningSession] = useState<Session | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const handleAdminLogout = () => {
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
    localStorage.clear();
    sessionStorage.clear();
    setIsAdmin(false);
    setIsPatron(false);
    setUserData(null);
    navigate('/signIn', { replace: true });
  };
  const location = useLocation();

  // Determine which nav group is active based on current path
  const getActiveNav = (path: string): string | null => {
    if (path === '/') return 'dashboard';
    if (path.startsWith('/news') || path.startsWith('/media')) return 'mediadesk';
    if (path.startsWith('/ministries')) return 'ministries';
    if (path.startsWith('/ets/') || path.startsWith('/e-teams')) return 'eteams';
    if (['/brothersfellowship', '/sistersfellowship', '/fellowships'].some(p => path.startsWith(p))) return 'fellowships';
    if (path.startsWith('/classes') || path.startsWith('/bestpClass')) return 'classes';
    if (path.startsWith('/Bs') || path.startsWith('/biblestudy')) return 'biblestudy';
    if (path.startsWith('/financial')) return 'financials';
    if (path.startsWith('/recomendations')) return 'feedback';
    if (path.startsWith('/compassion-counseling')) return 'compassion';
    if (path.startsWith('/requisitions')) return 'requisitions';
    if (path.startsWith('/my-docs')) return 'filemanager';
    if (path.startsWith('/library')) return 'library';
    if (path.startsWith('/save')) return 'winasoul';
    if (path.startsWith('/boards')) return 'boards';
    if (path.startsWith('/other-committees')) return 'committees';
    if (path.startsWith('/leadership')) return 'leadership';
    if (path.startsWith('/governing-docs')) return 'governingdocs';
    if (path.startsWith('/attendance') || path.startsWith('/session')) return 'attendance';
    return null;
  };
  const activeNav = getActiveNav(location.pathname);
  
  const isPatronDashboard = location.pathname.startsWith('/patron');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch(`${getApiUrl('attendanceSessionStatus')}?t=${timestamp}`, {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading active sessions:', error);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(getApiUrl('users'), { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const firstName = data.username?.split(' ')[0] || data.username;
          setUserData({ ...data, username: firstName });
          setIsAdmin(false);
          setIsPatron(false);
        } else if (localStorage.getItem('adminSession') === 'true') {
          setIsAdmin(true);
          setIsPatron(localStorage.getItem('patronSession') === 'true');
        }
      } catch {
        if (localStorage.getItem('adminSession') === 'true') {
          setIsAdmin(true);
          setIsPatron(localStorage.getItem('patronSession') === 'true');
        }
      }
    };
    fetchUser();

    // Listen for manual user data updates (like profile photo changes)
    window.addEventListener('userDataUpdated', fetchUser);
    return () => window.removeEventListener('userDataUpdated', fetchUser);
  }, [location.pathname]);

  const handleMouseEnter = (key: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const closeDropdown = () => setActiveDropdown(null);

  const renderCascadePanel = (sections: NavSection[], alignRight = false) => (
    <div className={`absolute top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[220px] z-50 ${alignRight ? 'right-0' : 'left-0'}`}>
      {sections.map((section) => (
        <FlyoutItem key={section.title} item={{ label: section.title, children: section.items }} onClose={closeDropdown} />
      ))}
    </div>
  );

  const renderServicesCascade = () => (
    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[220px] z-50">
      {headerNavGroups.services.items.map((item, i) => (
        <FlyoutItem key={i} item={item} onClose={closeDropdown} />
      ))}
    </div>
  );

  const renderJoinUsPanel = () => (
    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[220px] z-50">
      {headerNavGroups.joinUs.map((section) => (
        <FlyoutItem
          key={section.title}
          item={{ label: section.title, children: section.items }}
          onClose={closeDropdown}
        />
      ))}
    </div>
  );

  const renderMediaDeskPanel = () => (
    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[220px] z-50">
      {headerNavGroups.mediaDesk.map((item, i) => (
        <FlyoutItem key={i} item={item} onClose={closeDropdown} />
      ))}
    </div>
  );

  const renderAttendanceDropdown = () => (
    <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 min-w-[240px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-4 py-2 border-b border-gray-50 mb-1">
        <h4 className="text-xs font-black text-[#730051] uppercase tracking-wider">Active Sessions</h4>
      </div>
      {activeSessions.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <AlertCircle size={24} className="mx-auto text-gray-200 mb-2" />
          <p className="text-xs font-bold text-gray-400">No sessions currently open</p>
        </div>
      ) : (
        <div className="max-h-[350px] overflow-y-auto px-2 space-y-0.5">
          {activeSessions.map((s) => (
            <button
              key={s._id}
              onClick={() => {
                closeDropdown();
                const el = document.getElementById(`attendance-session-${s._id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Quick highlight flash
                  el.style.boxShadow = '0 0 0 3px rgba(115,0,81,0.4)';
                  setTimeout(() => { el.style.boxShadow = ''; }, 1500);
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-purple-50 transition-all text-left group"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
              <span className="text-sm font-bold text-gray-800 group-hover:text-[#730051] truncate flex-1">{s.title}</span>
              <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#730051] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b-2 border-[#730051]/15 ${isScrolled ? 'bg-white shadow-lg shadow-black/5' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center h-16 md:h-16 xl:h-20 md:pl-0">
            <button
              onClick={() => {
                if (isPatronDashboard) {
                  window.dispatchEvent(new Event('togglePatronSidebar'));
                } else {
                  setIsSidebarExpanded(!isSidebarExpanded);
                }
              }}
              className="md:hidden p-2 rounded-lg flex-shrink-0 hover:bg-gray-100 transition-colors"
              aria-label="Toggle Menu"
            >
              <Menu size={22} className="text-gray-700" />
            </button>

            <Link to="/" className="md:hidden flex-1 flex items-center justify-center gap-1 min-w-0 pr-1">
              <img src={cuLogo} alt="KSUCU Logo" className="w-8 h-8 object-contain flex-shrink-0" />
              <div className="flex flex-col items-center overflow-hidden min-w-0">
                <span className="font-bold text-gray-900 leading-none text-[10px] tracking-tight truncate w-full text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  KISII UNIVERSITY CHRISTIAN UNION
                </span>
                <div className="flex items-center justify-center gap-1 mt-0.5 w-full">
                  <div className="h-[1px] w-2 bg-[#730051]/30 hidden sm:block"></div>
                  <span className="text-[#730051] text-[9px] truncate" style={{ fontFamily: 'Satisfy, cursive' }}>
                    Transforming Campus, Impacting nations
                  </span>
                  <div className="h-[1px] w-2 bg-[#730051]/30 hidden sm:block"></div>
                </div>
              </div>
            </Link>

            {/* Mobile User/Sign In Button */}
            {!isPatronDashboard && (
              <div className="md:hidden flex-shrink-0">
                {isAdmin && isPatron ? (
                  <button onClick={() => navigate('/patron')} className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-white hover:bg-purple-50 border border-[#730051]/20 rounded-full font-bold text-[#730051] transition-all shadow-sm active:scale-95 whitespace-nowrap">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#730051] text-white">
                      <Crown size={12} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] leading-none tracking-tight">Patron</span>
                  </button>
                ) : isAdmin ? (
                  <button onClick={handleAdminLogout} className="flex items-center gap-1 pl-1 pr-2 py-1 bg-[#730051] text-white rounded-full transition-all shadow-sm active:scale-95 whitespace-nowrap">
                    <LogOut size={12} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold">Log Out</span>
                  </button>
                ) : userData ? (
                  <button onClick={() => navigate('/changeDetails')} className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-white hover:bg-purple-50 border border-[#730051]/20 rounded-full font-bold text-[#730051] transition-all shadow-sm active:scale-95 whitespace-nowrap group">
                    <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-[#730051] flex items-center justify-center bg-[#730051]/5 transition-transform group-hover:scale-110">
                      {userData.profilePhoto ? (
                        <img src={getImageUrl(userData.profilePhoto)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} className="text-[#730051]" strokeWidth={2.5} />
                      )}
                    </div>
                    <span className="text-[10px] capitalize leading-none tracking-tight">{userData.username}</span>
                  </button>
                ) : (
                  <Link to="/signIn" className="flex items-center gap-1 pl-1 pr-2 py-1 bg-purple-50 hover:bg-[#730051]/10 border border-[#730051]/20 rounded-full font-bold text-[#730051] transition-all shadow-sm active:scale-95 whitespace-nowrap">
                    <div className="bg-[#730051] text-white p-0.5 rounded-full flex items-center justify-center">
                      <LogIn size={12} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] leading-none tracking-tight">Log In</span>
                  </Link>
                )}
              </div>
            )}

            <Link to="/" className="hidden md:flex items-center gap-2 xl:gap-3 flex-shrink-0">
              <img src={cuLogo} alt="KSUCU Logo" className="w-10 h-10 xl:w-14 xl:h-14 object-contain flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <div className="font-extrabold text-gray-900 leading-none tracking-tight uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span className="hidden xl:inline text-base">KISII UNIVERSITY CHRISTIAN UNION</span>
                  <span className="xl:hidden text-[11px]">KSUCU</span>
                </div>
                <div className="hidden xl:flex items-center gap-2 mt-1.5 w-full">
                  <div className="h-[1px] flex-1 bg-[#730051]/30"></div>
                  <span className="text-[#730051] text-sm whitespace-nowrap px-1" style={{ fontFamily: 'Satisfy, cursive' }}>
                    Transforming Campus, Impacting nations
                  </span>
                  <div className="h-[1px] flex-1 bg-[#730051]/30"></div>
                </div>
              </div>
            </Link>

            {!isPatronDashboard ? (
              <nav className="hidden md:flex items-center flex-1 min-w-0 md:ml-2 lg:ml-4 xl:ml-8">
                {/* Centered nav links */}
                <div className="flex-1 flex items-center justify-center gap-0.5 lg:gap-1.5 xl:gap-4 min-w-0">
                  <Link to="/" className={`nav-link-underline px-1 lg:px-2 xl:px-3 py-2 font-medium text-[11px] lg:text-xs xl:text-sm whitespace-nowrap ${location.pathname === '/' ? 'text-[#730051] nav-link-active' : 'text-gray-700'}`}>Home</Link>

                  {/* Join Us dropdown */}
                  <div className="relative" onMouseEnter={() => handleMouseEnter('joinUs')} onMouseLeave={handleMouseLeave}>
                    <button className={`nav-link-underline flex items-center gap-0.5 px-1 lg:px-2 xl:px-3 py-2 font-medium text-[11px] lg:text-xs xl:text-sm whitespace-nowrap ${activeDropdown === 'joinUs' || ['ministries', 'boards', 'eteams', 'fellowships', 'biblestudy', 'classes'].includes(activeNav || '') ? 'text-[#730051] nav-link-active' : 'text-gray-700'}`}>
                      Join Us
                      <ChevronDown size={12} className={`xl:w-[14px] xl:h-[14px] transition-transform ${activeDropdown === 'joinUs' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDropdown === 'joinUs' && renderJoinUsPanel()}
                  </div>

                  <div className="relative" onMouseEnter={() => handleMouseEnter('services')} onMouseLeave={handleMouseLeave}>
                    <button className={`nav-link-underline flex items-center gap-0.5 px-1 lg:px-2 xl:px-3 py-2 font-medium text-[11px] lg:text-xs xl:text-sm whitespace-nowrap ${activeDropdown === 'services' || ['financials', 'feedback', 'compassion', 'requisitions', 'filemanager', 'library', 'winasoul'].includes(activeNav || '') ? 'text-[#730051] nav-link-active' : 'text-gray-700'}`}>
                      Services
                      <ChevronDown size={12} className={`xl:w-[14px] xl:h-[14px] transition-transform ${activeDropdown === 'services' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDropdown === 'services' && renderServicesCascade()}
                  </div>

                  <div className="relative" onMouseEnter={() => handleMouseEnter('governance')} onMouseLeave={handleMouseLeave}>
                    <button className={`nav-link-underline flex items-center gap-0.5 px-1 lg:px-2 xl:px-3 py-2 font-medium text-[11px] lg:text-xs xl:text-sm whitespace-nowrap ${activeDropdown === 'governance' || ['leadership', 'governingdocs', 'committees'].includes(activeNav || '') ? 'text-[#730051] nav-link-active' : 'text-gray-700'}`}>
                      Governance
                      <ChevronDown size={12} className={`xl:w-[14px] xl:h-[14px] transition-transform ${activeDropdown === 'governance' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDropdown === 'governance' && renderCascadePanel(headerNavGroups.governance, true)}
                  </div>

                  {/* Media Desk dropdown */}
                  <div className="relative" onMouseEnter={() => handleMouseEnter('mediaDesk')} onMouseLeave={handleMouseLeave}>
                    <button className={`nav-link-underline flex items-center gap-0.5 px-1 lg:px-2 xl:px-3 py-2 font-medium text-[11px] lg:text-xs xl:text-sm whitespace-nowrap ${activeDropdown === 'mediaDesk' || activeNav === 'mediaDesk' ? 'text-[#730051] nav-link-active' : 'text-gray-700'}`}>
                      Media
                      <span className="hidden xl:inline">&nbsp;Desk</span>
                      <ChevronDown size={12} className={`xl:w-[14px] xl:h-[14px] transition-transform ${activeDropdown === 'mediaDesk' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDropdown === 'mediaDesk' && renderMediaDeskPanel()}
                  </div>

                  <div className="relative" onMouseEnter={() => handleMouseEnter('attendance')} onMouseLeave={handleMouseLeave}>
                    <button className={`nav-link-underline flex items-center gap-0.5 xl:gap-2 px-1 lg:px-2 xl:px-3 py-2 font-medium text-[11px] lg:text-xs xl:text-sm transition-all relative whitespace-nowrap ${activeDropdown === 'attendance' || activeNav === 'attendance' ? 'text-[#730051] nav-link-active' : 'text-gray-700'}`}>
                      Attendance
                      {activeSessions.length > 0 && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        </span>
                      )}
                      <ChevronDown size={12} className={`xl:w-[14px] xl:h-[14px] transition-transform duration-300 ${activeDropdown === 'attendance' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDropdown === 'attendance' && renderAttendanceDropdown()}
                  </div>
                </div>

                {/* Sign In / User / Admin Logout / Patron button - always right */}
                <div className="flex-shrink-0 ml-2 xl:ml-4">
                  {isAdmin && isPatron ? (
                    <button onClick={() => navigate('/patron')} className="flex items-center gap-2 pl-1.5 pr-4 py-1.5 bg-white hover:bg-purple-50 border-2 border-[#730051]/10 hover:border-[#730051]/30 rounded-full font-bold text-[#730051] transition-all shadow-md hover:shadow-[#730051]/5 active:scale-95 whitespace-nowrap group">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#730051] text-white transition-all group-hover:ring-2 group-hover:ring-purple-200">
                        <Crown size={16} strokeWidth={2.5} />
                      </div>
                      <span className="text-[12px] xl:text-[13px] leading-none tracking-tight">Patron</span>
                    </button>
                  ) : isAdmin ? (
                    <button onClick={handleAdminLogout} className="flex items-center gap-1.5 px-2.5 xl:px-4 py-1.5 xl:py-2 bg-[#730051] text-white font-medium text-[11px] xl:text-sm rounded-lg hover:bg-[#5a0040] transition-colors shadow-lg shadow-purple-900/10 active:scale-95 transform transition-all whitespace-nowrap">
                      <LogOut size={16} className="xl:w-[18px] xl:h-[18px]" />
                      <span className="hidden xl:inline">Log Out</span>
                    </button>
                  ) : userData ? (
                    <button onClick={() => navigate('/changeDetails')} className="flex items-center gap-2 pl-1.5 pr-4 py-1.5 bg-white hover:bg-purple-50 border-2 border-[#730051]/10 hover:border-[#730051]/30 rounded-full font-bold text-[#730051] transition-all shadow-md hover:shadow-[#730051]/5 active:scale-95 whitespace-nowrap group">
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#730051] flex items-center justify-center bg-[#730051]/5 transition-all group-hover:ring-2 group-hover:ring-purple-200">
                        {userData.profilePhoto ? (
                          <img src={getImageUrl(userData.profilePhoto)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-[#730051]" strokeWidth={2.5} />
                        )}
                      </div>
                      <span className="text-[12px] xl:text-[13px] capitalize leading-none tracking-tight">{userData.username}</span>
                    </button>
                  ) : (
                    <Link to="/signIn" className="flex items-center gap-1.5 pl-1.5 pr-3 py-1 bg-purple-50 hover:bg-[#730051]/10 border border-[#730051]/20 rounded-full font-bold text-[#730051] transition-all shadow-sm active:scale-95 whitespace-nowrap">
                      <div className="bg-[#730051] text-white p-1 rounded-full flex items-center justify-center">
                        <LogIn size={14} className="xl:w-[16px] xl:h-[16px]" strokeWidth={2.5} />
                      </div>
                      <span className="text-[11px] xl:text-sm leading-none tracking-tight">Log In</span>
                    </Link>
                  )}
                </div>
              </nav>
            ) : (
              <div className="hidden md:flex items-center flex-1 justify-end pr-4">
                 <span className="flex items-center gap-2 font-bold text-[#c9a227] tracking-widest text-[11px] uppercase bg-white px-5 py-2 rounded-full border border-[#c9a227]/40 shadow-sm" style={{ letterSpacing: '0.12em' }}>
                   <Crown size={14} strokeWidth={2.5} />
                   <span style={{ color: '#730051', fontWeight: 700, letterSpacing: '0.08em' }}>KSUCU-MC</span>
                   <span style={{ color: '#c9a227', opacity: 0.5, fontSize: '10px' }}>•</span>
                   <span>PATRON PORTAL</span>
                 </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {activeDropdown && <div className="fixed inset-0 z-40 hidden md:block" onClick={closeDropdown} />}

      {!isPatronDashboard && (
        <MobileSidebarMenu
          userData={userData}
          activeSessions={activeSessions}
          onNavigate={(path: string) => navigate(path)}
          activeNav={activeNav}
          isManualExpanded={isSidebarExpanded}
          setIsManualExpanded={setIsSidebarExpanded}
        />
      )}

      {signingSession && (
        <QuickAttendanceSign
          session={signingSession}
          onClose={() => setSigningSession(null)}
        />
      )}

      <style>{`
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-pulse-red {
          animation: pulse-red 2s infinite;
        }
        .nav-link-underline {
          position: relative;
          transition: color 0.2s ease;
        }
        .nav-link-underline::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          transform-origin: center;
          width: 80%;
          height: 3px;
          background: #730051;
          border-radius: 2px;
          transition: transform 0.25s ease;
        }
        .nav-link-underline:hover {
          color: #730051 !important;
        }
        .nav-link-underline:hover::after,
        .nav-link-underline.nav-link-active::after {
          transform: translateX(-50%) scaleX(1);
        }
        .nav-link-underline.nav-link-active {
          color: #730051 !important;
        }
      `}</style>
    </>
  );
};

export default Header;
