import { useState, useEffect } from "react";
import { dashboard, tasks, projects } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard({ navigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState(null); // which panel is open

  useEffect(() => {
    Promise.all([dashboard.get(), tasks.list(), projects.list()])
      .then(([s, t, p]) => {
        setStats(s);
        setAllTasks(t);
        setAllProjects(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const getFilteredTasks = () => {
    if (!panel) return [];
    if (panel === "total") return allTasks;
    if (panel === "todo") return allTasks.filter((t) => t.status === "todo");
    if (panel === "in_progress") return allTasks.filter((t) => t.status === "in_progress");
    if (panel === "done") return allTasks.filter((t) => t.status === "done");
    if (panel === "overdue") return allTasks.filter((t) => t.due_date && new Date(t.due_date) < now && t.status !== "done");
    return [];
  };

  const panelTitles = {
    total: "All Tasks",
    todo: "To Do Tasks",
    in_progress: "In Progress Tasks",
    done: "Completed Tasks",
    overdue: "Overdue Tasks",
    projects: "All Projects",
  };

  const statCards = [
    { key: "total", label: "Total Tasks", value: stats?.total_tasks ?? 0, icon: "📋", color: "purple" },
    { key: "todo", label: "To Do", value: stats?.todo ?? 0, icon: "🔵", color: "blue" },
    { key: "in_progress", label: "In Progress", value: stats?.in_progress ?? 0, icon: "🟡", color: "orange" },
    { key: "done", label: "Completed", value: stats?.done ?? 0, icon: "✅", color: "green" },
    { key: "overdue", label: "Overdue", value: stats?.overdue ?? 0, icon: "⚠️", color: "red" },
    ...(user?.role === "admin"
      ? [
          { key: "projects", label: "Projects", value: stats?.total_projects ?? 0, icon: "📁", color: "purple" },
        ]
      : []),
  ];

  const filteredTasks = getFilteredTasks();

  if (loading)
    return (
      <div style={{ color: "var(--text2)", padding: "48px", textAlign: "center" }}>
        Loading dashboard...
      </div>
    );

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-title">Dashboard</div>
        <div className="user-chip">
          <div className="avatar sm">{user?.name?.[0]?.toUpperCase()}</div>
          <span>{user?.name}</span>
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
        </div>
      </div>

      {/* Welcome */}
      <div style={{ marginBottom: "24px" }}>
        <div className="page-title">Good day, {user?.name?.split(" ")[0]} 👋</div>
        <div className="page-subtitle">
          Click any card below to see the details.
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div
            key={s.key}
            className="stat-card"
            onClick={() => setPanel(panel === s.key ? null : s.key)}
            style={{
              cursor: "pointer",
              border: panel === s.key ? "2px solid var(--accent)" : "1px solid var(--border)",
              transition: "all 0.2s",
            }}
          >
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-number">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{
              marginTop: "10px",
              fontSize: "0.72rem",
              color: panel === s.key ? "var(--accent)" : "var(--muted)",
              fontWeight: "600",
            }}>
              {panel === s.key ? "▲ Hide" : "▼ View details"}
            </div>
          </div>
        ))}
      </div>

      {/* Slide-open Panel */}
      {panel && (
        <div
          className="card"
          style={{
            marginBottom: "24px",
            animation: "modalIn 0.2s ease",
            border: "1.5px solid var(--accent)",
          }}
        >
          {/* Panel header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}>
            <div>
              <div style={{ fontWeight: "800", fontSize: "1rem", color: "var(--text)" }}>
                {panelTitles[panel]}
              </div>
              <div style={{ color: "var(--text2)", fontSize: "0.78rem", marginTop: "2px" }}>
                {panel === "projects"
                  ? `${allProjects.length} project${allProjects.length !== 1 ? "s" : ""}`
                  : `${filteredTasks.length} task${filteredTasks.length !== 1 ? "s" : ""}`}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPanel(null)}
            >
              ✕ Close
            </button>
          </div>

          {/* Projects panel */}
          {panel === "projects" && (
            allProjects.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📁</div>
                <h3>No projects yet</h3>
                <p>Create your first project</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {allProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate("project-detail", p)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: "var(--surface2)",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "36px", height: "36px",
                        background: "var(--accent-light)",
                        borderRadius: "9px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem",
                      }}>📋</div>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{p.name}</div>
                        <div style={{ color: "var(--text2)", fontSize: "0.78rem" }}>
                          {p.description || "No description"}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: "var(--accent)", fontSize: "0.8rem", fontWeight: "600" }}>
                      Open →
                    </span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Tasks panel */}
          {panel !== "projects" && (
            filteredTasks.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">✅</div>
                <h3>No tasks here</h3>
                <p>Nothing to show for this category</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const isOverdue =
                      task.due_date &&
                      new Date(task.due_date) < now &&
                      task.status !== "done";
                    return (
                      <tr key={task.id}>
                        <td style={{ fontWeight: "500" }}>{task.title}</td>
                        <td>
                          <span className={`badge badge-${task.status === "todo" ? "todo" : task.status === "in_progress" ? "inprog" : "done"}`}>
                            {task.status.replace("_", " ")}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${task.priority}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          {task.assignee ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div className="avatar sm">
                                {task.assignee.name?.[0]?.toUpperCase()}
                              </div>
                              <span style={{ fontSize: "0.82rem" }}>{task.assignee.name}</span>
                            </div>
                          ) : (
                            <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{
                          color: isOverdue ? "var(--danger)" : "var(--text2)",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "0.78rem",
                        }}>
                          {task.due_date
                            ? new Date(task.due_date).toLocaleDateString()
                            : "—"}
                          {isOverdue && " ⚠️"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          )}
        </div>
      )}

      {/* Recent tasks summary */}
      <div className="card">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}>
          <div>
            <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text)" }}>
              Recent Activity
            </div>
            <div style={{ color: "var(--text2)", fontSize: "0.78rem", marginTop: "2px" }}>
              Your 5 most recent tasks
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("projects")}
          >
            View all projects →
          </button>
        </div>

        {allTasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Head to a project to create your first task</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {allTasks.slice(0, 5).map((task) => {
                const isOverdue =
                  task.due_date &&
                  new Date(task.due_date) < now &&
                  task.status !== "done";
                return (
                  <tr key={task.id}>
                    <td style={{ fontWeight: "500" }}>{task.title}</td>
                    <td>
                      <span className={`badge badge-${task.status === "todo" ? "todo" : task.status === "in_progress" ? "inprog" : "done"}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{
                      color: isOverdue ? "var(--danger)" : "var(--text2)",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.8rem",
                    }}>
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString()
                        : "—"}
                      {isOverdue && " ⚠️"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}