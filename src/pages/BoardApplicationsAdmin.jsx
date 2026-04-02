import { useState, useEffect, useCallback } from "react";
import "./BoardApplicationsAdmin.css";

const BOARDS = [
  { id: "all", label: "All Boards" },
  { id: "ict", label: "ICT Board" },
  { id: "media", label: "Media Board" },
  { id: "communication", label: "Communication Board" },
  { id: "editorial", label: "Editorial Board" },
];

const STATUS_COLORS = {
  pending: "#f59e0b",
  reviewed: "#3b82f6",
  shortlisted: "#10b981",
  rejected: "#ef4444",
};

const API_BASE = "http://localhost:3000/api/board-applications";

function BoardApplicationsAdmin() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState([]);
  const [activeBoard, setActiveBoard] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [search, setSearch] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = activeBoard !== "all" ? `?boardId=${activeBoard}` : "";
      const res = await fetch(`${API_BASE}/admin/all${query}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeBoard]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [fetchApplications, fetchStats]);

  const handleStatusChange = async (id, status) => {
    setStatusUpdating(id);
    try {
      const res = await fetch(`${API_BASE}/admin/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
      fetchStats();
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application permanently?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setApplications((prev) => prev.filter((a) => a._id !== id));
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownload = (id) => {
    window.open(`${API_BASE}/admin/download/${id}`, "_blank");
  };

  const filtered = applications.filter((a) =>
    a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
    a.boardId.toLowerCase().includes(search.toLowerCase())
  );

  const totalByBoard = (boardId) => {
    const s = stats.find((s) => s._id === boardId);
    return s ? s.total : 0;
  };

  return (
    <div className="baa-container">
      {/* Header */}
      <header className="baa-header">
        <div className="baa-header-inner">
          <div className="baa-logo">
            <i className="fas fa-file-alt"></i>
            <div>
              <h1>Board Applications</h1>
              <span>Admin Dashboard</span>
            </div>
          </div>
          <button className="baa-refresh-btn" onClick={() => { fetchApplications(); fetchStats(); }}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="baa-stats-row">
        {BOARDS.filter((b) => b.id !== "all").map((board) => {
          const s = stats.find((st) => st._id === board.id) || {};
          return (
            <div className="baa-stat-card" key={board.id} onClick={() => setActiveBoard(board.id)}>
              <div className="baa-stat-title">{board.label}</div>
              <div className="baa-stat-total">{s.total || 0}</div>
              <div className="baa-stat-details">
                <span style={{ color: STATUS_COLORS.pending }}>{s.pending || 0} pending</span>
                <span style={{ color: STATUS_COLORS.shortlisted }}>{s.shortlisted || 0} shortlisted</span>
                <span style={{ color: STATUS_COLORS.rejected }}>{s.rejected || 0} rejected</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="baa-toolbar">
        <div className="baa-board-tabs">
          {BOARDS.map((b) => (
            <button
              key={b.id}
              className={`baa-tab ${activeBoard === b.id ? "active" : ""}`}
              onClick={() => setActiveBoard(b.id)}
            >
              {b.label}
              {b.id !== "all" && (
                <span className="baa-tab-count">{totalByBoard(b.id)}</span>
              )}
            </button>
          ))}
        </div>
        <input
          className="baa-search"
          type="text"
          placeholder="Search by name or board..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="baa-table-wrapper">
        {loading ? (
          <div className="baa-loading">
            <i className="fas fa-spinner fa-spin"></i> Loading applications...
          </div>
        ) : error ? (
          <div className="baa-error">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="baa-empty">
            <i className="fas fa-inbox"></i>
            <p>No applications found</p>
          </div>
        ) : (
          <table className="baa-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Applicant</th>
                <th>Board</th>
                <th>File</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, index) => (
                <tr key={app._id}>
                  <td className="baa-num">{index + 1}</td>
                  <td>
                    <div className="baa-applicant">
                      <strong>{app.applicantName}</strong>
                      {app.applicantEmail && (
                        <span>{app.applicantEmail}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="baa-board-badge">
                      {BOARDS.find((b) => b.id === app.boardId)?.label || app.boardId}
                    </span>
                  </td>
                  <td className="baa-filename" title={app.originalName}>
                    <i className="fas fa-file-pdf"></i> {app.originalName}
                  </td>
                  <td>{new Date(app.submittedAt).toLocaleDateString("en-KE", {
                    day: "2-digit", month: "short", year: "numeric"
                  })}</td>
                  <td>
                    <select
                      className="baa-status-select"
                      value={app.status}
                      style={{ borderColor: STATUS_COLORS[app.status] }}
                      disabled={statusUpdating === app._id}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    <div className="baa-actions">
                      <button
                        className="baa-btn baa-btn-download"
                        onClick={() => handleDownload(app._id)}
                        title="Download Application"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      <button
                        className="baa-btn baa-btn-delete"
                        onClick={() => handleDelete(app._id)}
                        title="Delete Application"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default BoardApplicationsAdmin;
