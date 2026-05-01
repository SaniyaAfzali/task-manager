import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../api";

export default function Signup({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const data = await auth.signup(form);
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
          <h2>Start managing your projects today</h2>
          <p>Join thousands of teams who use TaskFlow to stay organized and ship faster.</p>
          <div className="auth-features">
            {[
              { icon: "🚀", text: "Get started in minutes" },
              { icon: "📋", text: "Unlimited projects and tasks" },
              { icon: "👥", text: "Invite your whole team" },
              { icon: "📊", text: "Real-time dashboard" },
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
          <h1>Create your account</h1>
          <p>Start your free account today</p>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Saniya Afzali"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
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
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>

          <div className="divider" />

          <p style={{ textAlign: "center", color: "var(--text2)", fontSize: "0.85rem" }}>
            Already have an account?{" "}
            <span
              onClick={onSwitch}
              style={{ color: "var(--accent)", cursor: "pointer", fontWeight: "600" }}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}