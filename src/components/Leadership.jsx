import myPhoto from '../assets/KSUCU logo updated.png';
import OmbogoImg from '../assets/FB_IMG_1769696349668.jpg';
import TomImg from '../assets/IMG-20260129-WA0039.jpg';
import tembaImg from '../assets/IMG-20260129-WA0048.jpg';
import kamamiaImg from '../assets/IMG-20260129-WA0040.jpg';
import harrietImg from '../assets/IMG-20260129-WA0053.jpg';
import rachelImg from '../assets/IMG-20260130-WA0003.jpg';
import stanImg from '../assets/IMG-20260130-WA0047.jpg';
import umojaImg from '../assets/IMG-20260130-WA0046.jpg';
import lyndraImg from '../assets/IMG-20260130-WA0045.jpg';
import williamImg from '../assets/IMG-20260129-WA0063.jpg';
import victoriaImg from '../assets/IMG-20260129-WA0058.jpg';
import ookoImg from '../assets/IMG-20260130-WA0050.jpg';
import React from 'react';
import { Link } from 'react-router-dom';
import './Leadership.css'
import { FaYoutube, FaInstagram, FaXTwitter, FaTiktok, FaFacebook, FaWhatsapp } from "react-icons/fa6";
const Leadership = () => {
  const executiveCommittee = [
    {
      title: 'Chairperson',
      name: 'Stanley Otieno',
      phone: '+254 718 519 242',
      role: 'stanleyotieno10836@gmail.com',
      image: stanImg
    },
    {
      title: 'Vice Chairperson',
      name: 'Munde Alice Harriet',
      phone: '+254 110 473 947',
      role: 'aliceharriet757@gmail.com',
      image: harrietImg
    },
    {
      title: 'Secretary',
      name: 'Odliah Temba',
      phone: '+254 758 816 535',
      role: 'odliahtemba@gmail.com',
      image: tembaImg
    },
    {
      title: 'Public Secretary',
      name: 'Emmanuel Ombogo',
      phone: '+254 717 481 883',
      role: 'emmanuelombongo@gmail.com',
      image: OmbogoImg
    },
    {
      title: 'Treasurer',
      name: 'Rachel Kitivi',
      phone: '+254 719 400 686',
      role: 'rachelkitivi@gamil.com',
      image: rachelImg
    },
    {
      title: 'Worship Coordinator',
      name: 'David Ooko',
      phone: '+254 714 684 714',
      role: 'odurdavid629@gamil.com',
      image: ookoImg
    },
    {
      title: 'Boards Coordinator',
      name: 'Faith Halima',
      phone: '+254 706 434 348',
      role: 'Ministry Coordination',
      image: 'https://via.placeholder.com/120/730051/FFFFFF?text=BC'
    },
    {
      title: 'Bible Study Coordinator',
      name: 'Victor Kamamia',
      phone: '+254 111 554 776',
      role: 'kamamiavictor@gmail.com',
      image: kamamiaImg
    },
    {
      title: 'Prayer Coordinator',
      name: 'William Ochieng',
      phone: '+254 111 436 995',
      role: 'williamchieng54@gmail.com',
      image: williamImg
    },
    {
      title: 'Missions Coordinator',
      name: 'Tom Muasya',
      phone: '+254 115 875 390',
      role: 'tommuasya65@gmail.com',
      image: TomImg
    },
    {
      title: 'Discipleship Coordinator',
      name: 'Victoria Naserian',
      phone: '+254 100 504 608',
      role: 'ntikoisanaserian@gmail.com',
      image: victoriaImg
    }
  ];

  const patron = {
    title: 'Patron',
    name: 'Dr. Rhoda Auni',
    role: 'Patron, KSUCU-MC',
    image: 'https://via.placeholder.com/150/730051/FFFFFF?text=Patron'
  };

  const cmf = {
    title: 'CMF',
    name: 'Joylyne Njagi',
    role: 'CMF, KSUCU-MC',
    image: 'https://via.placeholder.com/150/730051/FFFFFF?text=CMF'
  };

  const stemStaff = [
    {
      title: 'STEM Staff',
      name: 'Lyndra Melanie',
      phone: '+254 746 341 088',
      role: 'lyndramalanie@gmail.com',
      image: lyndraImg
    },
    {
      title: 'STEM Staff',
      name: 'Oda Umoja Utvik',
      phone: '+47 940 87357',
      role: 'odaautvik@gmail.com',
      image: umojaImg
    }
  ];

  const roles = [
    { title: 'Strategic Direction', description: 'Drive the execution of KSUCU-MC\'s constitutional goals and vision for the union.' },
    { title: 'Speaker and Minister Coordination', description: 'Identify and invite qualified speakers and ministers for union events and religious services, with appropriate vetting.' },
    { title: 'Program Management', description: 'Develop, launch, and refine union programs to meet the spiritual and social needs of the membership.' },
    { title: 'Invitation Authority', description: 'Retain discretion to withdraw speaking or ministry invitations when circumstances warrant.' },
    { title: 'Organizational Structure', description: 'Establish, recognize, or dissolve fellowships and committees as needed to serve union interests.' },
    { title: 'Discipline and Conduct', description: 'Address member conduct issues in accordance with constitutional standards.' },
    { title: 'Fiscal Oversight', description: 'Monitor and approve all union expenditures to maintain financial integrity and compliance.' },
    { title: 'Curriculum Guidance', description: 'Determine teaching priorities aligned with the union\'s development needs.' },
    { title: 'Property Stewardship', description: 'Safeguard union property and resources on behalf of the membership.' },
    { title: 'Leadership Appointments', description: 'Fill leadership vacancies through interim or emergency appointment procedures when required.' },
    { title: 'Advisory Appointments', description: 'Select members for advisory roles to support union operations.' },
    { title: 'Financial Reporting', description: 'Submit audited financial statements during Annual General Meetings or as required.' },
    { title: 'Committee Approval', description: 'Approve all committee members across the union.' }
  ];

  return (
    <div className="leadership-page">
      {/* Page Content */}
      <div className="page-content">
        {/* Hero Section */}
        <div className="hero">
          <h1>Leadership & Structure</h1>
          <p>Dedicated servants leading with faith, wisdom, and compassion</p>
        </div>

        {/* Main Content */}
        <div className="container">

          {/* Leadership Hierarchy Block */}
          <section className="section">
            <div className="section-container">
              <div className="committee-grid">
                {[patron, cmf, ...stemStaff].map((member, index) => (
                  <div key={index} className="profile-card">
                    <img src={member.image} alt={member.title} className="profile-image"
                      style={{ objectFit: 'cover', objectPosition: 'top' }} />
                    <h3>{member.title}</h3>
                    <p className="profile-name">{member.name}</p>
                    {member.phone && (
                      <p className="profile-phone">
                        <i className="fas fa-phone"></i> {member.phone}
                      </p>
                    )}
                    <p className="role">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Executive Committee Section */}
          <section className="section">
            <div className="section-header">
              <h2>Executive Committee</h2>
              <p style={{ color: '#2d2d2d' }}>Our elected leadership team guiding the spiritual journey of our community</p>
            </div>

            <div className="section-container">
              <div className="committee-grid">
                {executiveCommittee.map((member, index) => (
                  <div key={index} className="profile-card">
                    <img src={member.image} alt={member.title} className="profile-image"
                      style={{ objectFit: 'cover', objectPosition: 'top' }} />
                    <h3>{member.title}</h3>
                    <p className="profile-name">{member.name}</p>
                    <p className="profile-phone">
                      <i className="fas fa-phone"></i> {member.phone}
                    </p>
                    <p className="role">{member.role}</p>
                  </div>
                ))}
              </div>

              {/* Executive Committee Roles */}
              <div className="roles-section">
                <h3>Executive Committee General Roles</h3>
                <p style={{ marginBottom: '2rem', color: 'var(--text-light)', fontSize: '1.05rem' }}>
                  The Executive Committee is responsible for advancing the union's mission and governance:
                </p>
                {roles.map((role, index) => (
                  <div key={index} className="role-item">
                    <strong>{role.title}:</strong> {role.description}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sub-Committee Section */}
          <section className="section">
            <div className="section-header">
              <h2>Sub-Committee</h2>
            </div>

            <div className="section-container">
              <div className="subcommittee-box">
                <h3>Sub-Committee</h3>
                <p>
                  <strong>Composition:</strong> All executive committee leaders, all chairs and secretaries of ministries, classes, boards and permanent committees, all evangelistic team leaders, all fellowship leaders, and all ushering ministry leaders.
                </p>
                <p style={{ marginTop: '1.5rem' }}>
                  <strong>General Duties:</strong> The sub-committee harmonizes every functional unit of the union to achieve KSUCU-MC objectives. They ensure effective implementation of the strategic plan and constitution, collaborate with the executive committee, ensure effective running of weekly programs, create awareness of union activities, and maintain responsibility and accountability for all union assets. They meet twice per semester for coordination, with the chairperson serving as the chair of this committee.
                </p>
                <p style={{ marginTop: '1.5rem' }}>
                  <strong>Note:</strong> None of the office bearers or members shall be entitled to any kind of remuneration.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Button */}
          <div className="cta-section">
            <Link to="/other-committees" className="cta-button">
              <span>Other Committees</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Leadership;
