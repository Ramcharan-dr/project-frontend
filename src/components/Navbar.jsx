import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/dashboard", label: "📊 Dashboard" },
    { to: "/students", label: "🎓 Students" },
    { to: "/departments", label: "🏢 Departments" },
    { to: "/sections", label: "🏷️ Sections" },
    { to: "/analytics", label: "📈 Analytics" },
    { to: "/profile", label: "👤 Profile" },
  ];

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="brand">
          <Link to="/dashboard" className="brand-link">
            <span className="brand-icon">🎓</span>
            <div className="brand-text">
              <span className="brand-title">StudentMS</span>
              <span className="brand-subtitle">{isAdmin ? "Admin Portal" : "Student Portal"}</span>
            </div>
          </Link>
        </div>

        <nav className="nav-menu">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${location.pathname === item.to ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className={`role-badge ${isAdmin ? "badge-admin" : "badge-user"}`}>
              {user?.role || "USER"}
            </span>
          </div>
          <button className="btn small outline logout-btn" onClick={logout} title="Log Out">
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
