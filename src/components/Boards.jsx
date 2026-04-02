import { useState } from "react";
import { Link } from "react-router-dom";
import { boards } from "../data/boardsData";
import "./Boards.css";

import logoImg from "../assets/KSUCU logo updated.png";


function Boards() {
  // track which board's upload modal is open, selected file, and contact dropdown
  const [activeModal, setActiveModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeContact, setActiveContact] = useState(null);

  return (
    <>
      <div className="boards-page-heading" style={{ textAlign: "center", padding: "3rem 1rem 1rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#000" }}>BOARDS</h1>
      </div>

      {/* ========== BOARDS SECTION ========== */}
      <main className="boards-container">
        {boards.map((board) => (
          <div className="board-card" key={board.id}>
            <div className="board-image">
              <img src={board.image} alt={board.title} />
              <i className={board.icon}></i>
            </div>

            <div className="board-content">
              <h2 className="board-title">{board.title}</h2>

              <p className="board-description">{board.description}</p>

              {/* social icons */}
              {board.social && (
                <div className="board-social-icons">
                  {board.social.map((s, idx) => (
                    <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer">
                      <i className={s.icon}></i>
                    </a>
                  ))}
                </div>
              )}

              <div className="board-actions">
                {activeContact === board.id && (
                  <div className="contact-container">
                    {board.members.map((member, index) => (
                      <div className="contact-box" key={index}>
                        <img src={member.image} alt={member.name} />
                        <div className="contact-details">
                          <strong>{member.role}:</strong> {member.name}
                          <br />
                          <a href={`tel:${member.phone}`}>{member.phone}</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link to={`/boards/${board.id}`} state={{ board }} className="upload-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                  <i className="fas fa-eye"></i> View Full Page
                </Link>

                <button
                  className="upload-btn"
                  onClick={() => {
                    setSelectedFile(null); // reset previous selection
                    setActiveModal(board.id);
                  }}
                >
                  <i className="fas fa-upload"></i> Upload
                </button>

                <button
                  className={`contact-btn ${activeContact === board.id ? "active" : ""}`}
                  onClick={() =>
                    setActiveContact(activeContact === board.id ? null : board.id)
                  }
                >
                  <i className="fas fa-users"></i> Contact Board
                </button>
              </div>

            </div>
          </div>
        ))}
      </main>

      {/* ========== UPLOAD MODAL ========== */}
      {activeModal && (
        <div className="modal" onClick={() => setActiveModal(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Upload Image</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setSelectedFile(e.target.files[0]);
              }}
            />

            {selectedFile && (
              <div className="preview">
                <p>Selected file: {selectedFile.name}</p>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="preview"
                  style={{ maxWidth: '100%', marginTop: '10px' }}
                />
              </div>
            )}

            <div className="modal-actions">
              <button
                disabled={!selectedFile}
                onClick={async () => {
                  if (!selectedFile) return;
                  try {
                    const form = new FormData();
                    form.append('file', selectedFile);
                    form.append('board', activeModal);
                    // example upload endpoint; replace with real URL
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: form,
                    });
                    if (res.ok) {
                      alert('Upload successful');
                    } else {
                      alert('Upload failed');
                    }
                  } catch (err) {
                    console.error('upload error', err);
                    alert('Upload error');
                  }
                  setActiveModal(null);
                }}
              >
                Send
              </button>
              <button onClick={() => setActiveModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== FOOTER ========== */}
      <footer className="footer" style={{ textAlign: "center", padding: "1.5rem", backgroundColor: "#fff", color: "#000" }}>
        <p className="footer-text" style={{ fontSize: "1.2rem", margin: 0, color: "#000" }}>
          Come all let's serve the Lord
        </p>
      </footer>
    </>
  );
}

export default Boards;
