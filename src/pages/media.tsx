import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Media.module.css';
import loadingAnime from '../assets/Animation - 1716747954931.gif';
import { FaYoutube, FaFacebook, FaTiktok, FaTwitter, FaImage, FaNewspaper, FaBook, FaSearch, FaCamera, FaArrowLeft } from 'react-icons/fa';
import { getApiUrl, getImageUrl, getBaseUrl, isDevMode } from '../config/environment';
import heroImg from '../assets/praise-and-worship.jpg';

interface MediaItem {
  _id?: string;
  id?: string;
  event: string;
  date: string;
  link: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Media: React.FC = () => {
  const [showMediaEvents, setShowMediaEvents] = useState(false);
  const [error, setError] = useState('');
  const [generalLoading, setGeneralLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Default events as fallback
  const defaultEvents: MediaItem[] = [
    { event: "Subcomm photos", date: "2025-01-20", link: "https://photos.app.goo.gl/PrxWoMuyRNEet22b7" },
    { event: "Sunday service", date: "2025-02-13", link: "https://photos.app.goo.gl/Vt6HDo1xEtgA3Nmn9" },
    { event: "Worship Weekend", date: "2025-02-10", link: "https://photos.app.goo.gl/wbNV3coJREGEUSZX7" },
    { event: "Bible Study weekend", date: "2025-01-26", link: "https://photos.app.goo.gl/otVcso25sG6fkxjR8" },
    { event: "Evangelism photos", date: "2025-02-02", link: "https://photos.app.goo.gl/JvqV19BaGGZwrVFS7" },
    { event: "Weekend Photos", date: "2025-02-09", link: "https://photos.app.goo.gl/HkBvW67gyDSvLqgS7" },
    { event: "KSUCU-MC MEGA HIKE", date: "2025-02-15", link: "https://photos.app.goo.gl/RaNP4ikjEjXLHBmbA" },
    { event: "Creative Night photos", date: "2025-02-11", link: "https://photos.app.goo.gl/qYjukQAuWAdzBpaA7" },
    { event: "Valentine's concert ", date: "2025-02-17", link: "https://photos.app.goo.gl/BvYon9KCNPL1uMu87" },
    { event: "Weekend Photos", date: "2025-02-17", link: "https://photos.app.goo.gl/gMuMfKPvCx3rTRRn8" },
    { event: "Worship Weekend", date: "14th - 16th march", link: "https://photos.app.goo.gl/t2uVjvUSepDBcx3LA" },
    { event: "Prayer Week", date: "7th - 9th March", link: "https://photos.app.goo.gl/24sm1zdBxdUege3Y6" },
    { event: "Elders Day", date: "22nd March", link: "https://photos.app.goo.gl/L9Hkr8BxnVP1MSsD6" },
    { event: "Hymn Sunday", date: "23nd March", link: "https://photos.app.goo.gl/RWWRM2zp9LkmVgtU6" },
    { event: "Sunday service", date: "24nd March", link: "https://photos.app.goo.gl/UnA7f6Aqp3kHtsxaA" },
    { event: "Missions Trip", date: "2025-03-30", link: "https://photos.app.goo.gl/example123" },
  ];

  useEffect(() => {
    // Environment debugging  
    console.log('🔧 Media Environment Debug:');
    console.log('  - isDev:', isDevMode());
    console.log('  - baseUrl:', getBaseUrl());
    console.log('  - hostname:', window.location.hostname);
    console.log('  - sample imageUrl:', getImageUrl('/uploads/media/test.png'));
    
    fetchUserData();
    loadMediaItems();
    
    // Refresh media items when the page gains focus (when user returns from admin)
    const handleFocus = () => {
      loadMediaItems();
    };
    
    // Listen for localStorage changes (when admin updates items in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ksucu-media-items' && e.newValue) {
        try {
          const updatedItems = JSON.parse(e.newValue);
          console.log('📱 Media: Storage changed, updating with', updatedItems.length, 'items');
          setEvents(updatedItems);
        } catch (error) {
          console.error('📱 Media: Error parsing storage data:', error);
        }
      }
    };
    
    // Listen for custom media items update event (same-tab synchronization)
    const handleMediaItemsUpdated = (e: CustomEvent) => {
      const updatedItems = e.detail;
      console.log('📱 Media: Media items updated event received with', updatedItems?.length, 'items');
      if (Array.isArray(updatedItems)) {
        setEvents(updatedItems);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mediaItemsUpdated', handleMediaItemsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mediaItemsUpdated', handleMediaItemsUpdated as EventListener);
    };
  }, []);

  const loadMediaItems = async () => {
    try {
      // Add timestamp to completely bypass all caching
      const timestamp = new Date().getTime();
      const apiUrl = `${getApiUrl('api/media-items')}?t=${timestamp}`;
      console.log('📱 Media: Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('📱 Media: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const apiItems = data.data || [];
        console.log('📱 Media: Received', apiItems.length, 'items from API');
        
        // Merge API items with default events (API items take priority)
        const mergedItems = [...apiItems];
        
        // Add default events that aren't already in the database
        defaultEvents.forEach(defaultItem => {
          const exists = apiItems.some((apiItem: MediaItem) => 
            apiItem.event === defaultItem.event && 
            apiItem.link === defaultItem.link
          );
          if (!exists) {
            mergedItems.push(defaultItem);
          }
        });
        
        console.log('📱 Media: Total items after merge:', mergedItems.length);
        setEvents(mergedItems);
        localStorage.setItem('ksucu-media-items', JSON.stringify(mergedItems));
      } else {
        console.log('📱 Media: API failed, using cached or default items');
        // Try localStorage first
        const savedItems = localStorage.getItem('ksucu-media-items');
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems);
          console.log('📱 Media: Using cached items:', parsedItems.length);
          setEvents(parsedItems);
        } else {
          console.log('📱 Media: Using default events:', defaultEvents.length);
          setEvents(defaultEvents);
          localStorage.setItem('ksucu-media-items', JSON.stringify(defaultEvents));
        }
      }
    } catch (error) {
      console.error('📱 Media: Error loading from API:', error);
      // Try localStorage first
      const savedItems = localStorage.getItem('ksucu-media-items');
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems);
        console.log('📱 Media: Using cached items:', parsedItems.length);
        setEvents(parsedItems);
      } else {
        console.log('📱 Media: Using default events:', defaultEvents.length);
        setEvents(defaultEvents);
        localStorage.setItem('ksucu-media-items', JSON.stringify(defaultEvents));
      }
    }
  };
  

  const fetchUserData = async () => {
    // Offline check disabled - always try to fetch
    // if (!navigator.onLine) {
    //   setError('Check your internet and try again...');
    //   return;
    // }

    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });
    
    try {
      setGeneralLoading(true);
      document.body.style.overflow = 'hidden';            

      const apiUrl = getApiUrl('users');
      console.log('📱 Media: Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });

      if (!response.ok) {
        // Check if patron is logged in
        if (localStorage.getItem('patronSession') === 'true') {
          setIsAuthenticated(true);
          return;
        }
        setError('You need to login or sign up to access this page');
        return;
      }

      setIsAuthenticated(true);

    } catch (error) {
      console.error('Error fetching user data:', error);
      // Check if patron is logged in
      if (localStorage.getItem('patronSession') === 'true') {
        setIsAuthenticated(true);
        return;
      }
      setError('You need to login or sign up to access this page');
    } finally {    
      document.body.style.overflow = '';  
      setGeneralLoading(false);      
    }
  };
  // Helper to parse messy date strings
  const parseManualDate = (dateStr: string) => {
    if (!dateStr) return 0;
    
    // Check for standard YYYY-MM-DD
    const standardDate = new Date(dateStr);
    if (!isNaN(standardDate.getTime())) return standardDate.getTime();
    
    const lower = dateStr.toLowerCase();
    const months: { [key: string]: number } = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, 
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    
    let year = 2025; // Default for these items
    let month = -1;
    let day = 1;
    
    // Extract month
    for (const [mName, mIndex] of Object.entries(months)) {
      if (lower.includes(mName)) {
        month = mIndex;
        break;
      }
    }
    
    // Extract first number found as day
    const dayMatch = dateStr.match(/\d+/);
    if (dayMatch) day = parseInt(dayMatch[0]);
    
    if (month !== -1) {
      return new Date(year, month, day).getTime();
    }
    
    return 0;
  };

  // Sort and filter events
  const sortedEvents = [...events]
    .filter(item => 
      item.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // First, prioritize items with createdAt timestamps (from backend)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      if (a.createdAt) return -1;
      if (b.createdAt) return 1;
      
      // Fallback to manual date parsing
      const timeA = parseManualDate(a.date);
      const timeB = parseManualDate(b.date);
      
      if (timeA !== timeB) return timeB - timeA;
      
      // Then prioritize items with newer IDs (recently added locally)
      const aId = parseInt(a.id || '0');
      const bId = parseInt(b.id || '0');
      
      return bId - aId;
    });
  
  return (
    <>
      
      {generalLoading && (
        <div className={styles['loading-screen']}>
          <p className={styles['loading-text']}>Please wait...🤗</p>
          <img src={loadingAnime} alt="animation gif" />
        </div>
      )}

      {error && !isAuthenticated && (
        <div style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            maxWidth: '480px',
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #730051, #a0006e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.8rem' }}>
              🖼️
            </div>
            <h2 style={{ color: '#730051', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Sign In to View Gallery
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Please sign in to your account to access the media gallery and photo albums.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signIn" style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #730051, #a0006e)',
                color: 'white',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}>
                Sign In
              </Link>
              <Link to="/" style={{
                padding: '10px 24px',
                background: '#f3f4f6',
                color: '#374151',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}>
                Go Home
              </Link>
            </div>
          </div>
        </div>
      )}
      {error && isAuthenticated && <div className={styles.error}>{error}</div>}

      {isAuthenticated && (
        <main className={styles.main}>

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <img src={heroImg} alt="KSUCU-MC Community" className={styles.heroBgImage} />
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <Link to="/" className={styles.backButton}>
              <FaArrowLeft /> <span>Home</span>
            </Link>
            <div className={styles.heroBadge}>
              <FaCamera />
              <span>Media Hub</span>
            </div>
            <h1 className={styles.heroTitle}>
              Capturing Our <br /><span className={styles.heroHighlight}>Moments Together</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Relive the worship, fellowship, and community through our gallery
            </p>
            <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search events, photos or dates..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Content Categories */}
        <section className={styles.contentSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Explore Our Content</h2>
            <div className={styles.contentGrid}>
              <div onClick={() => setShowMediaEvents(true)} className={styles.contentCard}>
                <div className={styles.contentIcon} style={{backgroundColor: '#6f42c1'}}>
                  <FaImage />
                </div>
                <h3>Photo Gallery</h3>
                <p>Browse photos from our events and activities</p>
              </div>
              
              <Link to="/library" className={styles.contentCard}>
                <div className={styles.contentIcon} style={{backgroundColor: '#fd7e14'}}>
                  <FaBook />
                </div>
                <h3>E-Library</h3>
                <p>Access our digital library resources</p>
              </Link>
              
              <Link to="/news" className={styles.contentCard}>
                <div className={styles.contentIcon} style={{backgroundColor: '#28a745'}}>
                  <FaNewspaper />
                </div>
                <h3>Latest News</h3>
                <p>Stay updated with KSUCU-MC news and announcements</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Events */}
        <section className={styles.eventsSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Recent Events</h2>
            <div className={styles.eventsPreview}>
              {sortedEvents.slice(0, 6).map((event, index) => (
                <div key={event._id || event.id || index} className={styles.eventCard}>
                  <div className={styles.eventImage}>
                    {event.imageUrl ? (
                      <img 
                        src={getImageUrl(event.imageUrl)} 
                        alt={event.event}
                        onLoad={() => {
                          console.log('✅ Event image loaded:', event.event, 'URL:', getImageUrl(event.imageUrl || ''));
                        }}
                        onError={(e) => {
                          console.error('Event image load error:', event.imageUrl, 'Full URL:', getImageUrl(event.imageUrl || ''));
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector('.fallback-icon')) {
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'fallback-icon';
                            fallbackDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 50px;';
                            fallbackDiv.innerHTML = '📷';
                            parent.appendChild(fallbackDiv);
                          }
                        }}
                      />
                    ) : (
                      <FaImage />
                    )}
                  </div>
                  <div className={styles.eventContent}>
                    <h4>{event.event}</h4>
                    <p className={styles.eventDate}>{event.date}</p>
                    <a href={event.link} target="_blank" rel="noopener noreferrer" className={styles.viewPhotosBtn}>
                      View Photos
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.viewAllContainer}>
              <button onClick={() => setShowMediaEvents(true)} className={styles.viewAllBtn}>
                View All Events
              </button>
            </div>
          </div>
        </section>

        {/* Social Media Platforms */}
        <section className={styles.socialSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Follow Us On Social Media</h2>
            <div className={styles.socialGrid}>
              <a href="https://www.youtube.com/@KSUCU-MC" target='_blank' rel="noopener noreferrer" className={styles.socialCard}>
                <div className={styles.socialIcon} style={{backgroundColor: '#FF0000'}}>
                  <FaYoutube />
                </div>
                <h3>YouTube</h3>
                <p>Watch our sermons, testimonies and events</p>
              </a>
              
              <a href="https://web.facebook.com/ksucumc" target='_blank' rel="noopener noreferrer" className={styles.socialCard}>
                <div className={styles.socialIcon} style={{backgroundColor: '#1877F2'}}>
                  <FaFacebook />
                </div>
                <h3>Facebook</h3>
                <p>Connect with our community</p>
              </a>
              
              <a href="https://www.tiktok.com/@ksucumc" target='_blank' rel="noopener noreferrer" className={styles.socialCard}>
                <div className={styles.socialIcon} style={{backgroundColor: '#000000'}}>
                  <FaTiktok />
                </div>
                <h3>TikTok</h3>
                <p>Short inspirational videos</p>
              </a>
              
              <a href="https://x.com/@Ksucu_mc" target='_blank' rel="noopener noreferrer" className={styles.socialCard}>
                <div className={styles.socialIcon} style={{backgroundColor: '#1DA1F2'}}>
                  <FaTwitter />
                </div>
                <h3>Twitter/X</h3>
                <p>Latest updates and announcements</p>
              </a>
            </div>
          </div>
        </section>

        {/* Enhanced Gallery Modal */}
        {showMediaEvents && (
          <div className={styles.modalOverlay} onClick={() => setShowMediaEvents(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Photo Gallery</h3>
                <div className={styles.modalSearchWrapper}>
                  <FaSearch className={styles.modalSearchIcon} />
                  <input
                    type="text"
                    placeholder="Search gallery..."
                    className={styles.modalSearchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.galleryGrid}>
                  {sortedEvents.map((event, index) => (
                    <div key={event._id || event.id || index} className={styles.galleryItem}>
                      <div className={styles.galleryImagePlaceholder}>
                        {event.imageUrl ? (
                          <img 
                            src={getImageUrl(event.imageUrl)} 
                            alt={event.event}
                            onLoad={() => {
                              console.log('✅ Gallery image loaded:', event.event, 'URL:', getImageUrl(event.imageUrl || ''));
                            }}
                            onError={(e) => {
                              console.error('Gallery image load error:', event.imageUrl, 'Full URL:', getImageUrl(event.imageUrl || ''));
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('.fallback-icon')) {
                                const fallbackDiv = document.createElement('div');
                                fallbackDiv.className = 'fallback-icon';
                                fallbackDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 50px;';
                                fallbackDiv.innerHTML = '📷';
                                parent.appendChild(fallbackDiv);
                              }
                            }}
                          />
                        ) : (
                          <FaImage />
                        )}
                      </div>
                      <div className={styles.galleryItemContent}>
                        <h4>{event.event}</h4>
                        <p className={styles.galleryDate}>{event.date}</p>
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className={styles.galleryViewBtn}>
                          View Photos
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        </main>
      )}
    </>
  );
};

export default Media;
