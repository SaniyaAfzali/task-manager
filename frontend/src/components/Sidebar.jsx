import { useAuth } from "../context/AuthContext";

export default function Sidebar({ currentPage, navigate }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: "dashboard", icon: "⚡", label: "Dashboard" },
    { id: "projects", icon: "📁", label: "Projects" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⚡</div>
        <span className="sidebar-logo-text">TaskFlow</span>
      </div>

      <div style={{ padding: "8px 12px 4px" }}>
        <div className="sidebar-section-label">Main Menu</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${
              currentPage === item.id ||
              (currentPage === "project-detail" && item.id === "projects")
                ? "active"
                : ""
            }`}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", color: "#94a3b8", borderColor: "#1e293b" }}
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}