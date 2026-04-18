import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './OtherCommittees.css';
import {
  FaPrayingHands,
  FaSeedling,
  FaBrain,
  FaHandsHelping,
  FaBookOpen,
  FaGlobeAfrica,
  FaMusic,
  FaCalculator,
  FaChartLine,
  FaTasks,
  FaUserGraduate,
  FaUserTie
} from "react-icons/fa";

// Image Imports
import heroBg from '../assets/IMG_0513.jpg';
import prayerImg from '../assets/prayer.jpg';
import discipleshipImg from '../assets/discipleship1.jpeg';
import christianMindsImg from '../assets/overseer_christianminds.jpg';
import bestpImg from '../assets/Best-p.png';
import bibleStudyImg from '../assets/class.png';
import missionsImg from '../assets/high-school.jpg';
import worshipImg from '../assets/choir.jpg';
import eldersImg from '../assets/elders-Attire.jpg';
import orientationImg from '../assets/fellowship.png';

const OtherCommittees = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const location = useLocation();

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const committees = [
    {
      slug: 'prayer',
      icon: <FaPrayingHands />,
      image: prayerImg,
      title: 'Prayer Committee',
      led: 'Prayer Coordinator with Intercessory Chairperson as Secretary, plus up to 8 members.',
      responsibilities: 'Establishes and manages prayer points, organizes prayer meetings and vigils, mobilizes members for intercession, and promotes corporate prayer and fasting initiatives.'
    },
    {
      slug: 'discipleship',
      icon: <FaSeedling />,
      image: discipleshipImg,
      title: 'Discipleship Committee',
      led: 'Discipleship Coordinator with 8 other members from the discipleship class.',
      responsibilities: 'Coordinates new believer follow-up, develops personal devotion habits, organizes baptism training, and manages discipleship classes for spiritual growth.'
    },
    {
      slug: 'christian-minds',
      icon: <FaBrain />,
      image: christianMindsImg,
      title: 'Christian Minds Committee',
      led: 'KSUCU-MC Chairperson (Overseer) with chair, secretary, treasurer, and 5+ members.',
      responsibilities: 'Equips members with life skills for campus and beyond, promotes leadership development, advocates on student issues, and integrates faith with academics.'
    },
    {
      slug: 'best-p',
      icon: <FaHandsHelping />,
      image: bestpImg,
      title: 'BEST-P Committee',
      led: 'Bible Study Coordinator with chair, secretary, and 6 members.',
      responsibilities: 'Trains members in Bible exposition and self-study, develops thorough students of God\'s Word, and equips believers for effective ministry.'
    },
    {
      slug: 'bible-study',
      icon: <FaBookOpen />,
      image: bibleStudyImg,
      title: 'Bible Study Committee',
      led: 'Bible Study Coordinator with BEST-P leaders, class fellowship leaders, and 4 members.',
      responsibilities: 'Develops semester study guides, organizes and manages study groups, trains group leaders, and coordinates Bible study weekends and events.'
    },
    {
      slug: 'missions',
      icon: <FaGlobeAfrica />,
      image: missionsImg,
      title: 'Missions Committee',
      led: 'Missions Coordinator with chair, welfare in-charge, high school leader, discipleship in-charge, treasurer, outreach leader, and compassion representative.',
      responsibilities: 'Coordinates up to two missions per year outside campus, organizes high school ministry, handles mission follow-up, and identifies outreach opportunities.'
    },
    {
      slug: 'worship',
      icon: <FaMusic />,
      image: worshipImg,
      title: 'Worship Committee',
      led: 'Worship Coordinator with choir leader, praise leader, publicity secretary, instrumentalist leader, prayer coordinator, and 3 members.',
      responsibilities: 'Organizes Friday and Sunday services, coordinates worship meetings and conferences, provides ministry training, and advises on choir matters.'
    },
    {
      slug: 'accounts',
      icon: <FaCalculator />,
      title: 'Accounts Committee',
      led: 'KSUCU-MC Treasurer with chair and 7 members with accounting skills (max 9 total).',
      responsibilities: 'Maintains financial records, prepares financial statements, manages asset register, and recommends asset disposal when necessary.'
    },
    {
      slug: 'development',
      icon: <FaChartLine />,
      title: 'Development Committee',
      led: 'Appointed chair with treasurer, instrumentalist secretary, usher in-charge, ICT chair, and others (min 9 members).',
      responsibilities: 'Mobilizes funds for asset improvement, coordinates with strategic plan oversight, and advises on development projects.'
    },
    {
      slug: 'strategic-plan',
      icon: <FaTasks />,
      title: 'Strategic Plan Oversight Committee',
      led: 'KSUCU-MC Chairperson with chair, secretary, development chair, FOCUS staff, and others (min 9 members).',
      responsibilities: 'Harmonizes FOCUS and KSUCU-MC strategic plans, oversees implementation, advises on Ministry Annual Plans, and coordinates with development committee.'
    },
    {
      slug: 'orientation',
      icon: <FaUserGraduate />,
      image: orientationImg,
      title: 'Orientation Committee',
      led: 'Discipleship Coordinator with 11 members including ICT board representatives and discipleship committee.',
      responsibilities: 'Runs the Anza Fit Program, welcomes first-year students, introduces them to union activities and ministries, and registers them in the database.'
    },
    {
      slug: 'elders',
      icon: <FaUserTie />,
      image: eldersImg,
      title: 'Elders Committee',
      led: '8 active finalists, finalists\' class leaders (ex-officio), and one third-year representative.',
      responsibilities: 'Links finalists to Associates Fellowship, prepares them for post-campus life, mobilizes participation in farewell activities, and coordinates fund mobilization.'
    }
  ];

  // Scroll to committee if URL has a hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      // Small delay to let page render
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // On mobile, auto-expand the matching accordion card
          const idx = committees.findIndex(c => c.slug === hash);
          if (idx !== -1 && window.innerWidth <= 1024) {
            setExpandedIndex(idx);
          }
        }
      }, 300);
    }
  }, [location.hash]);

  return (
    <div className="other-committees-page">
      <div className="page-content">
        <div className="committees-hero" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="committees-hero-overlay">
            <h1>Other Committees</h1>
            <p>Specialized teams serving specific areas of ministry and operations</p>
          </div>
        </div>

        <div className="committees-container">
          {/* Desktop: Zigzag Layout */}
          <div className="committees-list desktop-list">
            {committees.map((committee, index) => (
              <div key={index} id={committee.slug} className="committee-row">
                <div className="committee-image-container">
                  {committee.image ? (
                    <img src={committee.image} alt={committee.title} className="committee-image" />
                  ) : (
                    <div className="committee-icon-placeholder">
                      <span className="placeholder-initial">{committee.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="committee-details">
                  <div className="title-wrapper">
                    <h3>{committee.title}</h3>
                  </div>
                  <div className="details-content">
                    <p className="led-by"><strong>Led by:</strong> {committee.led}</p>
                    <p className="responsibilities"><strong>Responsibilities:</strong> {committee.responsibilities}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Accordion Layout */}
          <div className="committees-list mobile-list">
            {committees.map((committee, index) => {
              const isOpen = expandedIndex === index;
              return (
                <div key={index} id={`m-${committee.slug}`} className={`mobile-card ${isOpen ? 'mobile-card--open' : ''}`}>
                  <button
                    className="mobile-card-header"
                    onClick={() => toggleExpand(index)}
                    aria-expanded={isOpen}
                  >
                    <div className="mobile-card-thumb">
                      {committee.image ? (
                        <img src={committee.image} alt="" />
                      ) : (
                        <span className="mobile-card-initial">{committee.title.charAt(0)}</span>
                      )}
                    </div>
                    <span className="mobile-card-title">{committee.title}</span>
                    <span className={`mobile-card-chevron ${isOpen ? 'mobile-card-chevron--open' : ''}`}>
                      &#9662;
                    </span>
                  </button>
                  <div className={`mobile-card-body ${isOpen ? 'mobile-card-body--open' : ''}`}>
                    {committee.image && (
                      <div className="mobile-card-image">
                        <img src={committee.image} alt={committee.title} />
                      </div>
                    )}
                    <div className="mobile-card-content">
                      <p className="led-by"><strong>Led by:</strong> {committee.led}</p>
                      <p className="responsibilities"><strong>Responsibilities:</strong> {committee.responsibilities}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="back-section">
            <Link to="/" className="back-button">
              <i className="fas fa-arrow-left"></i>
              <span>Back to Main Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherCommittees;
