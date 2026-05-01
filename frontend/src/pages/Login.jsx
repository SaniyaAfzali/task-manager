import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../api";

export default function Login({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await auth.login(form);
      login(data.access_token, data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">
          <div className="logo-icon">⚡</div>
          TaskFlow
        </div>
        <div className="auth-left-content">
          <h2>Manage your team's work in one place</h2>
          <p>A powerful project and task management tool built for modern teams.</p>
          <div className="auth-features">
            {[
              { icon: "📋", text: "Organize projects and tasks" },
              { icon: "👥", text: "Collaborate with your team" },
              { icon: "📊", text: "Track progress in real-time" },
              { icon: "🔒", text: "Role-based access control" },
            ].map((f) => (
              <div key={f.text} className="auth-feature">
                <div className="auth-feature-icon">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <div style={{ color: "#475569", fontSize: "0.78rem" }}>
          © 2026 TaskFlow. All rights reserved.
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>

          <div className="divider" />

          <p style={{ textAlign: "center", color: "var(--text2)", fontSize: "0.85rem" }}>
            Don't have an account?{" "}
            <span
              onClick={onSwitch}
              style={{ color: "var(--accent)", cursor: "pointer", fontWeight: "600" }}
            >
              Create one free
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}