import React, { useEffect } from 'react';
import ESET_IMG from '../../assets/eset.jpg';
import styles from '../../styles/ET.module.css';
import { Target, Eye, Activity } from 'lucide-react';

const Eset: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.etPage}>

            {/* Hero Banner */}
            <section className={styles.etPageHero}>
                <img 
                    src={ESET_IMG} 
                    alt="ESET" 
                    className={styles.pageHeroImg} 
                    style={{ '--hero-position': 'center 35%' } as React.CSSProperties} 
                />
                <div className={styles.pageHeroContent}>
                    <h1 className={styles.heroTitle}>Eastern Evangelistic Team</h1>
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
                        ESET (Eastern Evangelistic Team) is a dedicated ministry in KSUCU-MC, focused on spreading the Gospel across
                        the Eastern, Coastal, and North Eastern regions. We are committed to reaching diverse communities with
                        the message of salvation and unity in Christ.
                    </p>
                </section>

                {/* Vision Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Eye className="inline-block mr-3 mb-1 text-[#4A90A4]" size={32} />
                        Our Vision
                    </h2>
                    <p className={styles.textContent}>
                        To raise a community of Christ-centered leaders who will bring hope and transformation
                        to the furthest reaches of Eastern and Coastal regions.
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
                            <li><strong>Coast Missions:</strong> Strategic outreaches to the coastal towns and interior communities.</li>
                            <li><strong>North Eastern Frontier:</strong> Reaching out to the unique cultural contexts of the North Eastern region.</li>
                            <li><strong>Social Ministry:</strong> Combining evangelism with empathy through community support and prayer.</li>
                            <li><strong>Cross-Cultural Training:</strong> Equipping members to share the Gospel effectively in diverse cultural settings.</li>
                        </ul>
                    </div>
                </section>


            </div>

        </div>
    );
};

export default Eset;
