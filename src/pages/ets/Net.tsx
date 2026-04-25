import React, { useEffect } from 'react';
import NET_IMG from '../../assets/NET.jpg';
import styles from '../../styles/ET.module.css';
import { Target, Eye, Activity } from 'lucide-react';

const Net: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.etPage}>

            {/* Hero Banner */}
            <section className={styles.etPageHero}>
                <img 
                    src={NET_IMG} 
                    alt="NET" 
                    className={styles.pageHeroImg} 
                    style={{ '--hero-position': 'center 29%' } as React.CSSProperties} 
                />
                <div className={styles.pageHeroContent}>
                    <h1 className={styles.heroTitle}>Nyanza Evangelistic Team</h1>
                </div>
            </section>

            <div className={styles.pageContent}>
                {/* Mission Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Target className="inline-block mr-3 mb-1 text-[#4A90A4]" size={32} />
                        Our Mission
                    </h2>
                    <p className={styles.textContent}>
                        NET (Nyanza Evangelistic Team) is a vibrant ministry in KSUCU-MC, dedicated to evangelizing the Nyanza region.
                        Our mission is to plant seeds of faith across the lakeshore and beyond, transforming lives through the unadulterated
                        Word of God and the power of the Holy Spirit.
                    </p>
                </section>

                {/* Vision Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Eye className="inline-block mr-3 mb-1 text-[#4A90A4]" size={32} />
                        Our Vision
                    </h2>
                    <p className={styles.textContent}>
                        To see a spiritually revived Nyanza region where every community has access to the Gospel
                        and every believer is empowered to live a life that glorifies God.
                    </p>
                </section>

                {/* What We Do Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Activity className="inline-block mr-3 mb-1 text-[#4A90A4]" size={32} />
                        What We Do
                    </h2>
                    <div className={styles.textContent}>
                        <ul className="list-disc pl-5 space-y-4">
                            <li><strong>Open-Air Crusades:</strong> Boldly proclaiming Christ in market centers and public spaces across Nyanza.</li>
                            <li><strong>Village Outreach:</strong> Door-to-door evangelism that brings the message of hope directly to homes.</li>
                            <li><strong>Student Fellowships:</strong> Supporting and establishing Christian student groups within the region.</li>
                            <li><strong>Spiritual Mentorship:</strong> Guiding young believers in their walk of faith through disciplined discipleship.</li>
                        </ul>
                    </div>
                </section>


            </div>

        </div>
    );
};

export default Net;
