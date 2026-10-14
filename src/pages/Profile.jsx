import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, isAdmin, logout } = useAuth();
  const [notificationPref, setNotificationPref] = useState(true);
  const [defaultTab, setDefaultTab] = useState("dashboard");
  const [savedMessage, setSavedMessage] = useState(null);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedMessage("Preferences saved successfully!");
    setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>👤 User Profile & Settings</h1>
          <p>Manage your account credentials, preferences, and personal portal features.</p>
        </div>
      </div>

      {savedMessage && <div className="banner success">{savedMessage}</div>}

      <div className="dashboard-row">
        {/* User Account Card */}
        <div className="card dashboard-card">
          <div className="profile-header-box">
            <div className="profile-avatar-circle">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <h2>{user?.name}</h2>
              <span className={`role-badge ${isAdmin ? "badge-admin" : "badge-user"}`}>
                {user?.role === "ADMIN" ? "Administrator" : "Standard User / Student"}
              </span>
            </div>
          </div>

          <div className="modal-grid" style={{ marginTop: "20px" }}>
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user?.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Registered Email</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Access Level</span>
              <span className="detail-value">{isAdmin ? "Full Read / Write / Delete" : "Read-Only / Search Directory"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Authentication Token</span>
              <span className="detail-value text-success">Active Bearer JWT Session</span>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <button className="btn danger" onClick={logout}>
              Log Out of Account
            </button>
          </div>
        </div>

        {/* Manage Own Available Features */}
        <div className="card dashboard-card">
          <h3>⚙️ Manage Available Features</h3>
          <p className="card-sub">Customize your system workflow preferences.</p>

          <form onSubmit={handleSavePreferences} style={{ marginTop: "18px" }}>
            <label className="field" style={{ marginBottom: "16px" }}>
              <span>Default Landing Page</span>
              <select
                value={defaultTab}
                onChange={(e) => setDefaultTab(e.target.value)}
                className="select-input"
              >
                <option value="dashboard">Dashboard Overview</option>
                <option value="students">Students Directory</option>
                <option value="departments">Departments</option>
                <option value="analytics">Performance Analytics</option>
              </select>
            </label>

            <label className="toggle-field" style={{ marginBottom: "16px" }}>
              <input
                type="checkbox"
                checked={notificationPref}
                onChange={(e) => setNotificationPref(e.target.checked)}
              />
              <span>Enable system alert banners and record update notifications</span>
            </label>

            <button type="submit" className="btn primary">
              Save Preferences
            </button>
          </form>

          <div className="sys-info-box" style={{ marginTop: "24px" }}>
            <h4>💻 System Architecture Environment</h4>
            <ul>
              <li><strong>Frontend:</strong> React 18 + Vite Single Page Application</li>
              <li><strong>Backend:</strong> Java 17 + Spring Boot REST APIs</li>
              <li><strong>Database:</strong> MySQL 8 Relational Database</li>
              <li><strong>Security:</strong> BCrypt Hash + JSON Web Tokens (JWT)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
