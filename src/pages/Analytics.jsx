import { useEffect, useState } from "react";
import { fetchDashboardStats, fetchStudents } from "../api";
import StudentModal from "../components/StudentModal";

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
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
        setStudents(studentsData);
      } catch {
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <p className="empty">Gathering performance analytics…</p>
      </div>
    );
  }

  // Calculate top performers
  const sortedStudents = [...students].sort(
    (a, b) => (b.marks || 0) - (a.marks || 0)
  );
  const topPerformers = sortedStudents.slice(0, 5);

  const gradeColors = {
    "Distinction (>=75%)": "#10b981",
    "First Class (60-74%)": "#3b82f6",
    "Second Class (50-59%)": "#f59e0b",
    "Pass Class (40-49%)": "#6366f1",
    "Fail (<40%)": "#ef4444",
  };

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>📈 Performance Analytics & Reports</h1>
          <p>Holistic institutional metrics, score distributions, and ranker leaderboards.</p>
        </div>
      </div>

      {error && <div className="banner error">{error}</div>}

      {/* KPI Highlights */}
      <div className="kpi-grid">
        <div className="kpi-card card-blue">
          <div className="kpi-icon">🎓</div>
          <div className="kpi-details">
            <span className="kpi-label">Total Enrollment</span>
            <span className="kpi-number">{stats?.totalStudents ?? 0}</span>
          </div>
        </div>

        <div className="kpi-card card-amber">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-details">
            <span className="kpi-label">Class Average Score</span>
            <span className="kpi-number">{stats?.averageMarks ?? 0}%</span>
          </div>
        </div>

        <div className="kpi-card card-emerald">
          <div className="kpi-icon">🏆</div>
          <div className="kpi-details">
            <span className="kpi-label">Highest Score</span>
            <span className="kpi-number">{stats?.highestMarks ?? 0}%</span>
          </div>
        </div>

        <div className="kpi-card card-purple">
          <div className="kpi-icon">📊</div>
          <div className="kpi-details">
            <span className="kpi-label">Passing Percentage</span>
            <span className="kpi-number">{stats?.passPercentage ?? 0}%</span>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="dashboard-row">
        {/* Grade Distribution */}
        <div className="card dashboard-card">
          <h3>📊 Academic Grade Distribution</h3>
          <p className="card-sub">Student count classified by score brackets.</p>

          <div className="grade-breakdown" style={{ marginTop: "18px" }}>
            {stats?.gradeDistribution &&
              Object.entries(stats.gradeDistribution).map(([grade, count]) => {
                const total = stats.totalStudents || 1;
                const pct = Math.round((count / total) * 100);
                const color = gradeColors[grade] || "#3b82f6";

                return (
                  <div key={grade} className="grade-row">
                    <div className="grade-info">
                      <span className="grade-name">{grade}</span>
                      <span className="grade-count">
                        <strong>{count}</strong> ({pct}%)
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Top Performers Leaderboard */}
        <div className="card dashboard-card">
          <h3>🏆 Top Academic Rankers</h3>
          <p className="card-sub">Highest scoring students across all departments.</p>

          {topPerformers.length === 0 ? (
            <p className="empty">No student records available.</p>
          ) : (
            <div className="leaderboard" style={{ marginTop: "18px" }}>
              {topPerformers.map((student, idx) => {
                const rankBadges = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
                return (
                  <div
                    key={student.id}
                    className="leaderboard-item"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="leader-left">
                      <span className="rank-badge">{rankBadges[idx]}</span>
                      <div>
                        <strong>{student.name}</strong>
                        <p className="leader-sub">
                          {student.rollNumber} • {student.department}
                        </p>
                      </div>
                    </div>
                    <div className="leader-score">
                      <span className="badge badge-success">{student.marks}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Department Comparison Table */}
      <section className="card">
        <div className="list-header">
          <h2>🏢 Department Performance Breakdown</h2>
        </div>

        {stats?.departmentStats?.length === 0 ? (
          <p className="empty">No department data available.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Department Name</th>
                  <th>Enrolled Students</th>
                  <th>Department Average Marks</th>
                  <th>Performance Level</th>
                </tr>
              </thead>
              <tbody>
                {stats?.departmentStats?.map((dept) => (
                  <tr key={dept.id}>
                    <td>
                      <span className="roll-badge">{dept.code}</span>
                    </td>
                    <td>
                      <strong>{dept.name}</strong>
                    </td>
                    <td>{dept.studentCount} students</td>
                    <td>
                      <strong>{dept.averageMarks}%</strong>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          dept.averageMarks >= 75
                            ? "badge-success"
                            : dept.averageMarks >= 60
                            ? "badge-primary"
                            : "badge-warning"
                        }`}
                      >
                        {dept.averageMarks >= 75
                          ? "High Distinction"
                          : dept.averageMarks >= 60
                          ? "Good Standing"
                          : "Needs Improvement"}
                      </span>
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
