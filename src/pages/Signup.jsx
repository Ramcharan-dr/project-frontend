import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      setError(
        data?.message ||
          (err.response ? "Signup failed." : "Could not reach the server. Is the backend running?")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, type = "text", placeholder = "", autoComplete = "") => (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={form[name]}
        onChange={handleChange}
        required
        minLength={type === "password" ? 6 : undefined}
      />
      {fieldErrors[name] && <small className="error">{fieldErrors[name]}</small>}
    </label>
  );

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <div className="auth-header">
          <div className="auth-badge">🎓 SMS Registration</div>
          <h1>Create Account</h1>
          <p className="auth-sub">Register to access student records and features.</p>
        </div>

        {error && <div className="banner error" role="alert">{error}</div>}

        {field("name", "Full Name", "text", "John Doe", "name")}
        {field("email", "Email Address", "email", "john@example.com", "email")}

        <label className="field">
          <span>Account Role</span>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="select-input"
          >
            <option value="USER">Standard User (Student / Staff)</option>
            <option value="ADMIN">Administrator (Full Access)</option>
          </select>
        </label>

        {field("password", "Password (min. 6 characters)", "password", "••••••••", "new-password")}
        {field("confirmPassword", "Confirm Password", "password", "••••••••", "new-password")}

        <button type="submit" className="btn primary block" disabled={submitting}>
          {submitting ? "Creating Account…" : "Register Now"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </form>
    </div>
  );
}
