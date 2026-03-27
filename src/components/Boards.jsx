import { useState } from "react";
import "./Boards.css";

import ictBoardImg from "../assets/Screenshot 2026-01-28 185706.png";
import editorialBoardImg from "../assets/IMG-20260129-WA0046.jpg";
import commBoardImg from "../assets/comm board.jpg";
import mediaBoardImg from "../assets/professional-camera-blurred-background-with-laptop.jpg";
import logoImg from "../assets/KSUCU logo updated.png";


function Boards() {
  // track which board's upload modal is open, selected file, and contact dropdown
  const [activeModal, setActiveModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeContact, setActiveContact] = useState(null);

  const boards = [
    {
      id: "ict",
      title: "ICT Board",
      icon: "fas fa-laptop-code",
      image: ictBoardImg,
      description:
        "Consists of the public secretary as the overseer, with chairperson and secretary to the board nominated by the board members. Other members are approved by the board. Prepares and updates the KSUCU-MC database. Manages the Facebook account and the union website. Projects all the union activities.",
      social: [
        { icon: "fab fa-facebook", url: "https://www.facebook.com/ksucumc/" },
      ],
      members: [
        {
          role: "Overseer",
          name: "Emmanuel Ombogo",
          phone: "+254 701 234 567",
          image: "https://via.placeholder.com/80?text=ICT",
        },
        {
          role: "Chairperson",
          name: "Jonah Rubia",
          phone: "+254 702 345 678",
          image: "https://via.placeholder.com/80?text=ICT2",
        },
        {
          role: "Secretary",
          name: "Emily Mbugua",
          phone: "+254 715 472 857",
          image: "https://via.placeholder.com/80?text=ICT3",
        },
      ],
    },

    {
      id: "Editorial",
      title: "Editorial Board",
      icon: "fas fa-pen-fancy",
      image: editorialBoardImg,
      description:
        "Consists of the board coordinator as overseer with chairperson and secretary nominated by the board members. Responsible for Beyond Horizon magazine and approved publications.",
      social: [
        { icon: "fab fa-instagram", url: "https://www.instagram.com/ksucumc/" },
      ],
      members: [
        {
          role: "Overseer",
          name: "Faith Halima",
          phone: "+254 703 456 789",
          image: "https://via.placeholder.com/80?text=ED",
        },
        {
          role: "Chairperson",
          name: "Morgan Joseph",
          phone: "+254 794 292 751",
          image: "https://via.placeholder.com/80?text=ED2",
        },
        {
          role: "Secretary",
          name: "Faith Ndegwa",
          phone: "+254 705 678 901",
          image: "https://via.placeholder.com/80?text=ED3",
        },
      ],
    },

    {
      id: "communication",
      title: "Communication Board",
      icon: "fas fa-comments",
      image: commBoardImg,
      description:
        "Consists of the boards co-ordinator as the overseer with chairperson and secretary to the board nominated by the board members. Other members approved by the board members. Two default members pursuing computer related courses and two defaults pursuing literature. Responsible for publishing the beyond horizon magazine and any publication approved by executive. Responsible for any sell of publications.",
      social: [
        { icon: "fab fa-tiktok", url: "https://www.tiktok.com/@kisiiuniversitycu" }
      ],
      members: [
        {
          role: "overseer",
          name: "Emmanuel Ombogo",
          phone: "+254 705 678 901",
          image: "https://via.placeholder.com/80?text=COM",
        },
        {
          role: "Chairperson",
          name: "Euphracia Awour",
          phone: "+254 715 397 903",
          image: "https://via.placeholder.com/80?text=COM2",
        },
        {
          role: "Secretary",
          name: "Christian Likhanga",
          phone: "+254 707 890 123",
          image: "https://via.placeholder.com/80?text=COM3",
        },
      ],
    },

    {
      id: "media",
      title: "Media Board",
      icon: "fas fa-camera-retro",
      image: mediaBoardImg,
      description:
        "Responsible for photography, videography, livestreaming, editing, and documenting Christian Union activities and events Consists of the public secretary as the overseer to the board, chairperson and secretary nominated by the board members.Other members appproved by the board.Responsible for: Covering all union events through photography and videography.Managing KSUCU-MC YouTube channel.Advice the executive on buying, maitaining and didposing of board's assets.",
      social: [
        { icon: "fab fa-youtube", url: "https://www.youtube.com/@KSUCU-MC" }
      ],
      members: [
        {
          role: "Overseer",
          name: "Emmanuel Ombogo",
          phone: "+254 707 890 123",
          image: "https://via.placeholder.com/80?text=MED",
        },
        {
          role: "chairperson",
          name: "Emmanuel John",
          phone: "+254 792 988 599",
          image: "https://via.placeholder.com/80?text=MED2",
        },
        {
          role: "secretary",
          name: "Roda Mutiso",
          phone: "+254 758 675 015",
          image: "https://via.placeholder.com/80?text=MED3",
        },
      ],
    },
  ];

  return (
    <>
      {/* ========== HEADER ========== */}
      <header className="header">
        <div className="logo-section">
          <div className="logo">
            <img src={logoImg} alt="KSUCU Logo" className="logo-image" />
          </div>
          {/* kisucu AI icon placed next to text */}
          <i className="fas fa-robot ksucu-ai-icon" title="KSUCU AI"></i>
          <div className="logo-text">
            Kisii University Christian Union
          </div>
        </div>
        <nav>
          <a href="#">Home</a>
          <a href="#" className="active">Boards</a>
          <a href="#">Contact</a>
        </nav>
      </header>

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
      <footer className="footer">
        <div className="footer-social-icons">
          <a href="#"><i className="fab fa-facebook"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-youtube"></i></a>
          <a href="#"><i className="fab fa-linkedin"></i></a>
        </div>
        <p className="footer-text">
          &copy; 2026 Kisii University Christian Union.
        </p>
      </footer>
    </>
  );
}

export default Boards;
