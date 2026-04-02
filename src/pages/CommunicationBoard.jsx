import { useState } from "react";
import { Navigate } from "react-router-dom";
import { boards } from "../data/boardsData";
import boardHeroBg from "../assets/ict_hero_projector_bg.png";
import "./IctBoard.css"; 

function CommunicationBoard() {
  const board = boards.find(b => b.id === 'communication');
  const [showMembers, setShowMembers] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!board) {
    return <Navigate to="/boards" />;
  }

  const cardData = [
    {
      title: "Public Relations",
      icon: "fas fa-bullhorn",
      desc: "Handles all public relations activities on behalf of the union.",
      active: true
    },
    {
      title: "Official Comms",
      icon: "fas fa-envelope-open-text",
      desc: "Keeps all forms of official communication belonging to the union.",
      active: false
    },
    {
      title: "Documentation",
      icon: "fas fa-file-alt",
      desc: "Organizes and structures union communications efficiently.",
      active: false
    },
    {
      title: "Announcements",
      icon: "fas fa-microphone",
      desc: "Broadcasts and regulates regular union announcements.",
      active: false
    }
  ];

  const handleUpload = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fileInput = form.querySelector('input[type="file"]');
    if (!fileInput || !fileInput.files[0]) return;
    if (!applicantName.trim()) { setUploadStatus('Please enter your full name.'); return; }
    setUploading(true);
    setUploadStatus('Uploading application...');
    try {
      const formData = new FormData();
      formData.append('applicationLetter', fileInput.files[0]);
      formData.append('boardId', 'communication');
      formData.append('applicantName', applicantName.trim());
      const res = await fetch('http://localhost:3000/api/board-applications/submit', {
        method: 'POST', body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadStatus('Application submitted successfully! We will contact you shortly.');
      setApplicantName(''); form.reset();
    } catch (err) {
      setUploadStatus(`Error: ${err.message}`);
    } finally { setUploading(false); }
  };

  return (
    <div className="ict-board-container">
      <section className="ict-hero-section" style={{ backgroundImage: `url(${boardHeroBg})` }}>
        <div className="ict-hero-overlay"></div>
        <div className="ict-hero-content">
          <div className="ict-hero-subtitle">Public Relations</div>
          <h1 className="ict-hero-title">
            Information & Outreach <br />
            <span className="ict-hero-title-highlight">Communication Board</span>
          </h1>
          <p className="ict-hero-desc">Connecting and Building the Communication Ecosystem for KSUCU-MC</p>
        </div>
      </section>

      <section className="ict-features-container">
        {cardData.map((card, index) => (
          <div className={`ict-feature-card ${card.active ? 'active-card' : ''}`} key={index}>
            <div className="ict-feature-icon">
              <i className={card.icon}></i>
            </div>
            <h3 className="ict-feature-title">{card.title}</h3>
            <p className="ict-feature-desc">{card.desc}</p>
          </div>
        ))}
      </section>

      <section className="ict-stats-container" style={{paddingTop: 0}}>
        <button className="ict-action-btn" onClick={() => setShowMembers(!showMembers)}>
          {showMembers ? "Hide Leaders" : "Contact Leaders"} <i className="fas fa-arrow-right" style={{ marginLeft: "10px" }}></i>
        </button>
      </section>

      {showMembers && (
        <section className="ict-members-section">
          <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#000" }}>Board Leadership</h2>
          <p style={{ textAlign: "center", color: "#444", marginBottom: "30px" }}>Reach out directly to the heads of our ecosystem.</p>
          <div className="ict-members-grid">
            {board.members.map((member, index) => (
              <div className="ict-member-card" key={index}>
                <img src={member.image} alt={member.name} className="ict-member-img" />
                <span className="ict-member-role">{member.role}</span>
                <h3 className="ict-member-name">{member.name}</h3>
                <a href={`tel:${member.phone}`} className="ict-member-phone">
                  <i className="fas fa-phone-alt"></i> {member.phone}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recruitment Advertisement Section */}
      <section className="ict-recruitment-ad">
        <h2>Ignite Your Communication Career!</h2>
        <p>Are you passionate about public relations, drafting documents, or managing broadcasts? The KSUCU-MC Communication Board is the perfect ecosystem to grow your skills while serving the Lord.</p>
        
        <button className="ict-action-btn" onClick={() => setShowJoin(!showJoin)}>
          {showJoin ? "Close Join Details" : "Join Us Today"} <i className="fas fa-users" style={{ marginLeft: "10px" }}></i>
        </button>

        {showJoin && (
          <div className="ict-join-info">
            <h3>How to Join the Board:</h3>
            <ol>
              <li>Write a formal application letter addressed to the Communication Board Overseer indicating your area of interest.</li>
              <li>Upload a scanned or digital copy of the application letter electronically via the form attached below.</li>
              <li>Shortlisted candidates will be directly invited for a technical and spiritual interview.</li>
            </ol>
            
            <form className="ict-upload-form" onSubmit={handleUpload}>
              <input type="text" className="ict-file-input" placeholder="Your Full Name" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required style={{ marginBottom: "10px" }} />
              <input type="file" className="ict-file-input" required accept=".pdf,.doc,.docx" />
              <button type="submit" className="ict-action-btn" style={{ width: 'fit-content' }} disabled={uploading}>
                <i className="fas fa-upload" style={{ marginRight: "10px" }}></i>{uploading ? "Submitting..." : "Submit Application"}
              </button>
              {uploadStatus && <p style={{ color: uploadStatus.startsWith("Error") ? "#dc2626" : "#0056b3", marginTop: "10px", fontWeight: "bold" }}>{uploadStatus}</p>}
            </form>
          </div>
        )}
      </section>

    </div>
  );
}

export default CommunicationBoard;
