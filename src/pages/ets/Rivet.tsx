import React, { useEffect } from 'react';
import RIVET_IMG from '../../assets/RIVET.jpg';
import styles from '../../styles/ET.module.css';
import { Target, Eye, Activity } from 'lucide-react';

const Rivet: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.etPage}>

            {/* Hero Banner */}
            <section className={styles.etPageHero}>
                <img 
                    src={RIVET_IMG} 
                    alt="RIVET" 
                    className={styles.pageHeroImg} 
                    style={{ '--hero-position': 'center 35%' } as React.CSSProperties} 
                />
                <div className={styles.pageHeroContent}>
                    <h1 className={styles.heroTitle}>Rift Valley Evangelistic Team</h1>
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
                        RIVET is a dedicated evangelistic ministry within KSUCU-MC, focused on spreading the Gospel across the Rift Valley region.
                        We exist to proclaim the message of Christ, building communities of faith that are rooted in the Word and
                        driven by the love of God. Our heart is to see every student and resident in the Rift Valley transformed by the truth of Jesus Christ.
                    </p>
                </section>

                {/* Vision Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Eye className="inline-block mr-3 mb-1 text-[#4A90A4]" size={32} />
                        Our Vision
                    </h2>
                    <p className={styles.textContent}>
                        To be a catalyst for spiritual awakening in the Rift Valley, raising a generation of believers
                        who are bold in their witness, compassionate in their service, and unwavering in their commitment to the Great Commission.
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
                            <li><strong>Regional Missions:</strong> Organizing annual and short-term missions to various towns and villages in the Rift Valley.</li>
                            <li><strong>Evangelism Training:</strong> Equipping our members with practical tools and biblical foundations for effective personal and mass evangelism.</li>
                            <li><strong>Follow-up & Discipleship:</strong> Nurturing new converts and fostering their growth through regular fellowships and mentorship.</li>
                            <li><strong>Community Outreach:</strong> Engaging in charitable acts and social service projects that demonstrate the love of Christ in tangible ways.</li>
                        </ul>
                    </div>
                </section>


            </div>

        </div>
    );
};

export default Rivet;
