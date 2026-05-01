import { useState, useEffect } from "react";
import { projects } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Projects({ navigate }) {
  const { user } = useAuth();
  const [projectList, setProjectList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projects.list().then(setProjectList).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name) { setError("Project name is required"); return; }
    try {
      const p = await projects.create(form);
      setProjectList([...projectList, p]);
      setShowModal(false);
      setForm({ name: "", description: "" });
      setError("");
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await projects.delete(id);
      setProjectList(projectList.filter((p) => p.id !== id));
    } catch (e) { alert(e.message); }
  };

  const colors = ["#4f46e5", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

  return (
    <div>
      <div className="topbar">
        <div className="topbar-title">Projects</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      <div className="page-header">
        <div>
          <div className="page-title">All Projects</div>
          <div className="page-subtitle">
            {projectList.length} project{projectList.length !== 1 ? "s" : ""} total
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--text2)" }}>Loading projects...</div>
      ) : projectList.length === 0 ? (
        <div className="empty card">
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn btn-primary" style={{ marginTop: "16px" }} onClick={() => setShowModal(true)}>
            + Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projectList.map((p, i) => (
            <div key={p.id} className="project-card" onClick={() => navigate("project-detail", p)}>
              <div className="project-card-header">
                <div className="project-icon" style={{ background: colors[i % colors.length] + "20" }}>
                  📋
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span className="badge badge-member" style={{ fontSize: "0.7rem" }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                  {user?.role === "admin" && (
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: "4px 8px", fontSize: "0.7rem" }}
                      onClick={(e) => handleDelete(e, p.id)}
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
              <h3>{p.name}</h3>
              <p>{p.description || "No description provided"}</p>
              <div className="project-card-footer">
                <span style={{ fontSize: "0.78rem", color: "var(--text2)" }}>Click to open</span>
                <span style={{ color: "var(--accent)", fontSize: "0.8rem", fontWeight: "600" }}>Open →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <div className="form-group">
              <label>Project Name *</label>
              <input type="text" placeholder="e.g. Website Redesign"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} placeholder="What is this project about?"
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}