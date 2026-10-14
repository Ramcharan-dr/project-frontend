import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchDashboardStats, fetchStudents } from "../api";
import { useAuth } from "../context/AuthContext";
import StudentModal from "../components/StudentModal";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsData, studentsData] = await Promise.all([
          fetchDashboardStats(),
          fetchStudents(),
        ]);
        setStats(statsData);
        setRecentStudents(studentsData.slice(0, 5));
      } catch (err) {
        setError("Could not load dashboard data. Ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUserSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetchStudents(val);
      setSearchResults(res);
    } catch {
      // Ignore search error
    }
  };

  return (
    <div className="container">
      {/* Welcome Hero */}
      <div className="hero-banner">
        <div className="hero-content">
          <span className="badge-hero">
            {isAdmin ? "👑 Administrator Access" : "👤 Student Portal Access"}
          </span>
          <h1>Welcome back, {user?.name}!</h1>
          <p>
            {isAdmin
              ? "Comprehensive control center for managing students, departments, sections, and performance analytics."
              : "Search student records, explore academic departments and sections, and check performance reports."}
          </p>
        </div>
        <div className="hero-actions">
          {isAdmin ? (
            <>
              <button
                className="btn primary"
                onClick={() => navigate("/students?add=true")}
              >
                ➕ Add Student
              </button>
              <button
                className="btn outline"
                onClick={() => navigate("/departments")}
              >
                🏢 Departments
              </button>
            </>
          ) : (
            <>
              <button
                className="btn primary"
                onClick={() => navigate("/students")}
              >
                🔍 Search Directory
              </button>
              <button
                className="btn outline"
                onClick={() => navigate("/analytics")}
              >
                📈 View Analytics
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="banner error">{error}</div>}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card card-blue">
          <div className="kpi-icon">🎓</div>
          <div className="kpi-details">
            <span className="kpi-label">Total Students</span>
            <span className="kpi-number">{loading ? "..." : stats?.totalStudents ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card card-purple">
          <div className="kpi-icon">🏢</div>
          <div className="kpi-details">
            <span className="kpi-label">Departments</span>
            <span className="kpi-number">{loading ? "..." : stats?.totalDepartments ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card card-emerald">
          <div className="kpi-icon">🏷️</div>
          <div className="kpi-details">
            <span className="kpi-label">Sections</span>
            <span className="kpi-number">{loading ? "..." : stats?.totalSections ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card card-amber">
          <div className="kpi-icon">📊</div>
          <div className="kpi-details">
            <span className="kpi-label">Class Average</span>
            <span className="kpi-number">
              {loading ? "..." : `${stats?.averageMarks ?? 0}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Extra KPIs & Department Breakdown */}
      {isAdmin && stats && (
        <div className="dashboard-row">
          <div className="card dashboard-card">
            <h3>📈 Performance Overview</h3>
            <div className="metrics-pill-grid">
              <div className="metric-pill">
                <span>Highest Score</span>
                <strong>{stats.highestMarks}%</strong>
              </div>
              <div className="metric-pill">
                <span>Lowest Score</span>
                <strong>{stats.lowestMarks}%</strong>
              </div>
              <div className="metric-pill">
                <span>Passing Rate</span>
                <strong className="text-success">{stats.passPercentage}%</strong>
              </div>
              <div className="metric-pill">
                <span>Passed / Failed</span>
                <strong>{stats.passedStudents} / {stats.failedStudents}</strong>
              </div>
            </div>

            <h4 style={{ marginTop: "24px", marginBottom: "12px" }}>Department Distribution</h4>
            <div className="dept-bars">
              {stats.departmentStats?.map((dept) => {
                const pct =
                  stats.totalStudents > 0
                    ? Math.round((dept.studentCount / stats.totalStudents) * 100)
                    : 0;
                return (
                  <div key={dept.id} className="dept-bar-item">
                    <div className="bar-header">
                      <span>{dept.name} ({dept.code})</span>
                      <span>{dept.studentCount} students ({pct}%)</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card dashboard-card">
            <div className="list-header">
              <h3>⚡ Quick Admin Shortcuts</h3>
            </div>
            <div className="shortcuts-grid">
              <Link to="/students" className="shortcut-card">
                <span className="shortcut-icon">🎓</span>
                <strong>Manage Students</strong>
                <p>Add, edit, remove or search student profiles.</p>
              </Link>
              <Link to="/departments" className="shortcut-card">
                <span className="shortcut-icon">🏢</span>
                <strong>Departments</strong>
                <p>Configure academic departments and codes.</p>
              </Link>
              <Link to="/sections" className="shortcut-card">
                <span className="shortcut-icon">🏷️</span>
                <strong>Sections</strong>
                <p>Set up class sections and capacities.</p>
              </Link>
              <Link to="/analytics" className="shortcut-card">
                <span className="shortcut-icon">📊</span>
                <strong>Detailed Analytics</strong>
                <p>Grade distribution, top rankers & charts.</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* User Dashboard: Interactive Search & Directory */}
      {!isAdmin && (
        <div className="card user-search-card">
          <div className="search-header">
            <h3>🔍 Student Search Directory</h3>
            <p>Look up classmates or students across all departments and sections.</p>
          </div>
          <input
            className="search big-search"
            type="search"
            placeholder="Search by name, roll number, course, department, section..."
            value={search}
            onChange={handleUserSearch}
          />

          {search && (
            <div className="search-results-box">
              <h4>Results ({searchResults.length}):</h4>
              {searchResults.length === 0 ? (
                <p className="empty">No matching records found.</p>
              ) : (
                <div className="results-list">
                  {searchResults.map((s) => (
                    <div
                      key={s.id}
                      className="result-row"
                      onClick={() => setSelectedStudent(s)}
                    >
                      <div className="result-main">
                        <strong>{s.name}</strong>
                        <span className="roll-badge">{s.rollNumber}</span>
                        <span className="dept-tag">{s.department}</span>
                        <span className="section-tag">{s.section}</span>
                      </div>
                      <button className="btn small outline">View Details 👁️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Student Records */}
      <section className="card">
        <div className="list-header">
          <h2>🎓 Recent Student Registrations</h2>
          <Link to="/students" className="btn small">
            View All ({stats?.totalStudents ?? 0}) →
          </Link>
        </div>

        {recentStudents.length === 0 ? (
          <p className="empty">No student records registered yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Section</th>
                  <th>Marks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="roll-badge">{s.rollNumber}</span>
                    </td>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>
                      <span className="dept-tag">{s.department}</span>
                    </td>
                    <td>
                      <span className="section-tag">{s.section}</span>
                    </td>
                    <td>
                      <strong>{s.marks}%</strong>
                    </td>
                    <td>
                      <button
                        className="btn small outline"
                        onClick={() => setSelectedStudent(s)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Student Details Modal */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
