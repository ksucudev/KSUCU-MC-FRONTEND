import React, { useEffect } from 'react';
import WESO_IMG from '../../assets/WESO.jpg';
import styles from '../../styles/ET.module.css';
import { Target, Eye, Activity } from 'lucide-react';

const Weso: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.etPage}>

            {/* Hero Banner */}
            <section className={styles.etPageHero}>
                <img 
                    src={WESO_IMG} 
                    alt="WESO" 
                    className={styles.pageHeroImg} 
                    style={{ '--hero-position': 'center 50%' } as React.CSSProperties} 
                />
                <div className={styles.pageHeroContent}>
                    <h1 className={styles.heroTitle}>Western Evangelistic Students Outreach</h1>
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
                        WESO is a passionate evangelistic ministry dedicated to spreading the Gospel across the Western region.
                        Through outreach, discipleship, and mission work, WESO seeks to transform lives and expand God’s kingdom.
                    </p>
                </section>

                {/* Vision Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Eye className="inline-block mr-3 mb-1 text-[#4A90A4]" size={32} />
                        Our Vision
                    </h2>
                    <p className={styles.textContent}>
                        To see every soul in the Western region experience the saving grace of Jesus Christ
                        and to empower students to be life-long ambassadors of the Kingdom.
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
                            <li><strong>School Outreach:</strong> Reaching out to primary and secondary schools with the Gospel.</li>
                            <li><strong>Market Evangelism:</strong> Sharing the message of Christ in local markets and community centers.</li>
                            <li><strong>Leadership Training:</strong> Developing spiritual and administrative leaders for the vineyard.</li>
                            <li><strong>Revival Meetings:</strong> Hosting prayer and worship events that stir spiritual hunger in the hearts of people.</li>
                        </ul>
                    </div>
                </section>


            </div>

        </div>
    );
};

export default Weso;
