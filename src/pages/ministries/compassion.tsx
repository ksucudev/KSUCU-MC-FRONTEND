import React, { useEffect, useRef, useState } from 'react';
import styles from './compassion.module.css';
import { Link } from 'react-router-dom';
import compassionImg from '../../assets/compassion.jpg';
import MinistryRegistrationModal from '../../components/MinistryRegistrationModal';

const CompassionPage: React.FC = () => {
  const contentRef1 = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Simple scroll animation observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible || 'visible');
        }
      });
    }, observerOptions);

    // Observe elements if they exist
    if (contentRef1.current) observer.observe(contentRef1.current);

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className={styles.heroSection} style={{ '--hero-bg': `url(${compassionImg})` } as React.CSSProperties}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Compassion & Counseling</h1>
          <p className={styles.subtitle}>Being the hands and feet of Jesus to those in need</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={`${styles.contentSection} ${styles.animate}`} ref={contentRef1}>
          <div className={styles.sectionBlock}>
            <h2>About Compassion & Counseling</h2>
            <p>
              The Compassion and Counseling Ministry is committed to demonstrating Christ’s love through meaningful care and practical support. Guided by a calling to serve, we reach out to individuals and families within our church and the wider community, addressing their physical, emotional, and spiritual needs with compassion, dignity, and respect.
            </p>

            <h3>Our Mission</h3>
            <p>
              To bring hope to the hurting, comfort to the brokenhearted, and help to those facing life's challenges. We are committed to demonstrating the love of Christ in tangible ways.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2>What We Do</h2>
            <ul className={styles.activitiesList}>
              <li data-number="01">Provision of Toiletries</li>
              <li data-number="02">Distribution of Meal Cards</li>
              <li data-number="03">Supply of Food Items</li>
              <li data-number="04">Guidance and Counseling Sessions</li>
              <li data-number="05">Clothing Donations</li>
              <li data-number="06">Provide spiritual encouragement to the hurting</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2>Join Our Mission</h2>
            <p>
              If you feel called to make a difference, join us in this transformative ministry as we work together to reflect God's compassion and bring His light into the lives of others. Every act of kindness has the power to change lives.
            </p>
            <p>
              We are looking for:
            </p>

            <div className={styles.requirements}>
              <ul>
                <li>A heart for serving others and showing Christ's love</li>
                <li>Willingness to volunteer time for outreach activities</li>
                <li>Compassionate spirit and a listening ear</li>
                <li>Commitment to maintaining confidentiality and dignity</li>
                <li>Desire to grow in understanding and service</li>
                <li>Availability for both planned events and emergency responses</li>
              </ul>
            </div>

            <div className={styles.actionButtons}>
              <Link 
                to="#" 
                className={styles.commitmentButton}
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
              >
                Join Compassion
              </Link>
              <Link to="/compassion-counseling" className={styles.commitmentButton}>
                Give Support
              </Link>
              <Link to="/contact-us" className={styles.contactButton}>
                Contact Overseer
              </Link>
            </div>
          </div>
        </div>

        <MinistryRegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          ministryName="Compassion and Counseling Ministry"
        />
      </div>
    </>
  );
};

export default CompassionPage;