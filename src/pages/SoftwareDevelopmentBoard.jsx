import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { boards } from "../data/boardsData";
import "./SoftwareDevelopmentBoard.css";

/* ─── 15 board members ─── */
const sdMembers = [
  { role: "Overseer",           name: "Eng. Emmanuel Ombogo",   portfolio: null },
  { role: "Lead Developer",     name: "Eng. Kennedy Mutuku",    portfolio: null },
  { role: "Secretary",          name: "Eng. Fancy Nateku",      portfolio: "https://fancymegiri.co.ke" },
  { role: "Accounts Rep",       name: "Eng. Kelvin",            portfolio: null },
  { role: "Ex-Official Member", name: "Eng. Justus Kimutai",    portfolio: null },
  { role: "Member",             name: "Eng. Henry Maina",       portfolio: "https://enghenryportfolio.vercel.app/" },
  { role: "Member",             name: "Eng. Brian Wasike",      portfolio: "https://brianwasike.tech" },
  { role: "Member",             name: "Eng. Edmond Otieno",     portfolio: "https://my-portfolio-flame-alpha-67.vercel.app/" },
  { role: "Member",             name: "Eng. Peter Githinji",    portfolio: "https://portfolio-ysru.vercel.app/" },
  { role: "Member",             name: "Eng. Ann Muchiri",       portfolio: "https://annmosh88-github-io.vercel.app/" },
  { role: "Member",             name: "Eng. Lewis Muriu",       portfolio: "https://portfolio-iota-flax-74.vercel.app/" },
  { role: "Member",             name: "Eng. Effie Ochieng",     portfolio: "https://myportfolio-alpha-six-71.vercel.app/" },
  { role: "Member",             name: "Eng. Khamala",           portfolio: "https://khamalah.tech/" },
  { role: "Member",             name: "Eng. Pendo Ruth",        portfolio: "https://pendoruth.vercel.app/" },
];

/* Initial letter helper */
const initials = (name) =>
  name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

/* Role-function cards (what the board does) */
const roleCards = [
  { icon: "fas fa-code",                title: "Software Development", desc: "Build and maintain all KSUCU-MC internal web and mobile platforms.", featured: false },
  { icon: "fas fa-tools",               title: "System Maintenance",   desc: "Keep every union system running smoothly 24 / 7.",             featured: true  },
  { icon: "fas fa-shield-alt",          title: "Cybersecurity",        desc: "Protect member data and union assets from digital threats.",    featured: false },
  { icon: "fas fa-database",            title: "Database Management",  desc: "Design, optimise, and secure the union's central databases.",  featured: false },
  { icon: "fas fa-lightbulb",           title: "Innovation & Research", desc: "Explore emerging tech to continuously grow the union.",       featured: false },
];

function SoftwareDevelopmentBoard() {
  const board = boards.find((b) => b.id === "software");
  const [showJoin, setShowJoin] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const stackRef = useRef(null);

  /* ── Stacking scale effect using IntersectionObserver ── */
  useEffect(() => {
    const items = stackRef.current?.querySelectorAll(".sdb-stack-item");
    if (!items || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transform = "scale(1)";
            entry.target.style.opacity = "1";
          } else {
            // Cards that have "scrolled past" (not intersecting from the top)
            const rect = entry.boundingClientRect;
            if (rect.top < 0) {
              entry.target.style.transform = "scale(0.96)";
              entry.target.style.opacity = "0.88";
            }
          }
        });
      },
      {
        threshold: [0, 0.1, 0.3, 0.5],
        rootMargin: "0px 0px -10% 0px",
      }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  if (!board) return <Navigate to="/boards" />;

  const handleUpload = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fileInput = form.querySelector('input[type="file"]');
    if (!fileInput || !fileInput.files[0]) return;
    if (!applicantName.trim()) {
      setUploadStatus("error:Please enter your full name.");
      return;
    }
    setUploading(true);
    setUploadStatus("");
    try {
      const formData = new FormData();
      formData.append("applicationLetter", fileInput.files[0]);
      formData.append("boardId", "software");
      formData.append("applicantName", applicantName.trim());
      const res = await fetch(
        "http://localhost:3000/api/board-applications/submit",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUploadStatus("success:Application submitted! We'll contact you regarding interview dates.");
      setApplicantName("");
      form.reset();
    } catch (err) {
      setUploadStatus(`error:${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const statusType = uploadStatus.startsWith("success") ? "success" : "error";
  const statusText = uploadStatus.replace(/^(success|error):/, "");

  return (
    <div className="sdb-wrapper">

      {/* ══════════════ HERO ══════════════ */}
      <section className="sdb-hero">
        <div className="sdb-hero-bg" />
        <div className="sdb-hero-stripe" />

        <div className="sdb-hero-content">
          <div className="sdb-hero-eyebrow">Technology Board</div>

          <h1 className="sdb-hero-title">
            Software Development<br />
            <span>&amp; Maintenance Board</span>
          </h1>

          <p className="sdb-hero-subtitle">
            Building and sustaining the digital backbone of KSUCU-MC — one commit
            at a time, for the glory of God.
          </p>


        </div>
      </section>

      {/* ══════════════ ROLE CARDS ══════════════ */}
      <section>
        <div className="sdb-section-header">
          <h2>What We Do</h2>
          <p>
            Our board covers every facet of the union's technology stack — from
            design to deployment.
          </p>
          <div className="sdb-divider" />
        </div>

        <div className="sdb-roles-grid">
          {roleCards.map((card, i) => (
            <div className={`sdb-role-card ${card.featured ? "featured" : ""}`} key={i}>
              <i className={`${card.icon} sdb-role-icon`}></i>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ STACKING MEMBERS ══════════════ */}
      <section className="sdb-stacking-section">
        <div className="sdb-stacking-intro">
          <h2>Meet the Team</h2>
          <p>
            15 passionate technologists serving the Lord through code, design,
            and innovation.
          </p>
          <div className="sdb-divider" />
        </div>

        {/* Stacking sticky cards container */}
        <div className="sdb-stack-container" ref={stackRef}>
          {sdMembers.map((member, index) => (
            <div
              className="sdb-stack-item"
              data-index={index}
              key={index}
              style={{ transition: "transform 0.5s ease, opacity 0.5s ease" }}
            >
              <div className="sdb-member-card-inner">
                {/* Avatar placeholder with initials */}
                <div
                  className="sdb-member-avatar-placeholder"
                  style={{ backgroundColor: "#730051" }}
                >
                  {initials(member.name)}
                </div>

                {/* Info */}
                <div className="sdb-member-info">
                  <span className="sdb-member-role-badge">{member.role}</span>
                  <div className="sdb-member-name">{member.name}</div>
                  {member.portfolio && (
                    <a href={member.portfolio.startsWith('http') ? member.portfolio : `https://${member.portfolio}`} target="_blank" rel="noopener noreferrer" className="sdb-member-phone-link">
                      <i className="fas fa-globe"></i>
                      View Portfolio
                    </a>
                  )}
                </div>

                {/* Card number badge */}
                <div className="sdb-member-number-badge">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ RECRUITMENT ══════════════ */}
      <section style={{ padding: "0 20px 20px" }}>
        <div className="sdb-recruitment">
          <div className="sdb-recruitment__inner">
            <h2>Build for the Kingdom 🚀</h2>
            <p>
              Passionate about software, design, or systems? Join the KSUCU-MC
              Software Development &amp; Maintenance Board and put your skills
              to Kingdom use.
            </p>

            <div>
              <button
                className="sdb-btn sdb-btn-primary"
                onClick={() => setShowJoin(!showJoin)}
              >
                {showJoin ? "Close" : "Apply Now"}
                <i className={`fas ${showJoin ? "fa-times" : "fa-rocket"}`} style={{ marginLeft: "10px" }}></i>
              </button>
              <button
                className="sdb-btn sdb-btn-outline"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Learn More
              </button>
            </div>

            {showJoin && (
              <div className="sdb-join-panel">
                <h3>How to Join</h3>
                <ol>
                  <li>Write a formal application letter to the Software Board Overseer, stating your technical background and area of interest.</li>
                  <li>Upload a scanned or digital copy of your letter via the form below.</li>
                  <li>Shortlisted candidates will be contacted for a technical &amp; spiritual interview.</li>
                </ol>

                <form className="sdb-form-row" onSubmit={handleUpload}>
                  <input
                    type="text"
                    className="sdb-input"
                    placeholder="Your Full Name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                  />
                  <input
                    type="file"
                    className="sdb-input"
                    required
                    accept=".pdf,.doc,.docx"
                  />
                  <button
                    type="submit"
                    className="sdb-submit-btn"
                    disabled={uploading}
                  >
                    <i className="fas fa-upload" style={{ marginRight: "10px" }}></i>
                    {uploading ? "Submitting…" : "Submit Application"}
                  </button>

                  {uploadStatus && (
                    <p className={`sdb-upload-status ${statusType}`}>
                      {statusText}
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER STRIP ══════════════ */}
      <div className="sdb-footer-strip">
        KSUCU-MC Software Development &amp; Maintenance Board — Transforming
        Campus, Impacting Nations through Technology.
      </div>
    </div>
  );
}

export default SoftwareDevelopmentBoard;
