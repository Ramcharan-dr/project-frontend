import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response ? "Invalid email or password." : "Could not reach the server. Is the backend running?")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setForm({ email, password });
    setError("");
    setSubmitting(true);
    login({ email, password })
      .then(() => navigate(redirectTo, { replace: true }))
      .catch((err) => {
        setError(err.response?.data?.message || "Quick login failed.");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="auth-header">
          <div className="auth-badge">🎓 SMS Portal</div>
          <h1>Welcome Back</h1>
          <p className="auth-sub">Log in to access the Student Management System.</p>
        </div>

        {error && <div className="banner error" role="alert">{error}</div>}

        <label className="field">
          <span>Email Address</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@example.com"
            value={form.email}
            onChange={handleChange}
            required
            autoFocus
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="btn primary block" disabled={submitting}>
          {submitting ? "Authenticating…" : "Log In"}
        </button>

        <div className="demo-credentials">
          <p className="demo-title">⚡ Quick Demo Login:</p>
          <div className="demo-btns">
            <button
              type="button"
              className="btn small demo-btn"
              onClick={() => handleQuickLogin("admin@example.com", "admin123")}
            >
              👑 Admin (admin@example.com)
            </button>
            <button
              type="button"
              className="btn small demo-btn"
              onClick={() => handleQuickLogin("user@example.com", "user123")}
            >
              👤 User (user@example.com)
            </button>
          </div>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Register here</Link>
        </p>
      </form>
    </div>
  );
}
