import { useParams, Link, Navigate } from "react-router-dom";
import { boards } from "../data/boardsData";
import "./Boards.css";

function BoardDetails() {
  const { boardId } = useParams();
  const board = boards.find(b => b.id === boardId);

  if (!board) {
    return <Navigate to="/boards" />;
  }

  return (
    <>
      <div className="boards-page-heading" style={{ textAlign: "center", padding: "3rem 1rem 1rem", marginTop: '5rem' }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#000" }}>{board.title}</h1>
      </div>

      <main className="boards-container">
        <div className="board-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div className="board-image" style={{ height: '300px' }}>
            <img src={board.image} alt={board.title} style={{ height: '100%', objectFit: 'cover' }} />
            <i className={board.icon}></i>
          </div>
          <div className="board-content">
            <h2 className="board-title">{board.title}</h2>
            <p className="board-description" style={{ fontSize: '1.2rem', lineHeight: '1.6', marginTop: '1rem' }}>{board.description}</p>
            
            {board.social && (
              <div className="board-social-icons" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                {board.social.map((s, idx) => (
                  <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer">
                    <i className={s.icon}></i>
                  </a>
                ))}
              </div>
            )}

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Board Members</h3>
            <div className="contact-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {board.members.map((member, index) => (
                <div className="contact-box" key={index} style={{ padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <img src={member.image} alt={member.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', display: 'inline-block' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '0.5rem', color: '#0056b3' }}>{member.role}</strong> 
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{member.name}</span>
                    <br />
                    <a href={`tel:${member.phone}`} style={{ display: 'inline-block', marginTop: '0.5rem', color: '#555', textDecoration: 'none', fontWeight: '500' }}>
                      <i className="fas fa-phone-alt"></i> {member.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
               <Link to="/boards" className="upload-btn" style={{ textDecoration: 'none', display: 'inline-block', padding: '10px 20px', borderRadius: '5px' }}>
                 <i className="fas fa-arrow-left"></i> Back to Boards
               </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer" style={{ textAlign: "center", padding: "1.5rem", backgroundColor: "#fff", color: "#000", marginTop: "4rem" }}>
        <p className="footer-text" style={{ fontSize: "1.2rem", margin: 0, color: "#000" }}>
          Come all let's serve the Lord
        </p>
      </footer>
    </>
  );
}

export default BoardDetails;
