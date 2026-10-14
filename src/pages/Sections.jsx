import { useEffect, useState } from "react";
import {
  createSection,
  deleteSection,
  fetchDepartments,
  fetchSections,
  fetchStudents,
  updateSection,
} from "../api";
import { useAuth } from "../context/AuthContext";

export default function Sections() {
  const { isAdmin } = useAuth();
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    department: "",
    capacity: 60,
    academicYear: "2026-2027",
  });
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sectData, deptData, studData] = await Promise.all([
        fetchSections(),
        fetchDepartments(),
        fetchStudents(),
      ]);
      setSections(sectData);
      setDepartments(deptData);
      setStudents(studData);
      if (deptData.length > 0 && !form.department) {
        setForm((f) => ({ ...f, department: deptData[0].name }));
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load sections." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "capacity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateSection(editing.id, form);
        setMessage({ type: "success", text: "Section updated successfully." });
      } else {
        await createSection(form);
        setMessage({ type: "success", text: "Section created successfully." });
      }
      setEditing(null);
      setForm({
        name: "",
        department: departments.length > 0 ? departments[0].name : "",
        capacity: 60,
        academicYear: "2026-2027",
      });
      setShowForm(false);
      loadAll();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Operation failed.",
      });
    }
  };

  const handleEdit = (sec) => {
    setEditing(sec);
    setForm({
      name: sec.name,
      department: sec.department,
      capacity: sec.capacity || 60,
      academicYear: sec.academicYear || "2026-2027",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (sec) => {
    if (!window.confirm(`Delete section "${sec.name}" (${sec.department})?`)) return;
    try {
      await deleteSection(sec.id);
      setMessage({ type: "success", text: "Section deleted." });
      loadAll();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete section.",
      });
    }
  };

  const filteredSections = filterDept
    ? sections.filter((s) => s.department.toLowerCase() === filterDept.toLowerCase())
    : sections;

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>🏷️ Section Management</h1>
          <p>
            {isAdmin
              ? "Organize student batches, assign sections to departments, and set capacities."
              : "Explore classroom sections, assigned departments, and enrollment statistics."}
          </p>
        </div>
        {isAdmin && (
          <button
            className={`btn ${showForm ? "" : "primary"}`}
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditing(null);
              } else {
                setShowForm(true);
                setEditing(null);
                setForm({
                  name: "",
                  department: departments.length > 0 ? departments[0].name : "",
                  capacity: 60,
                  academicYear: "2026-2027",
                });
              }
            }}
          >
            {showForm ? "✕ Close Form" : "➕ Add Section"}
          </button>
        )}
      </div>

      {message && (
        <div
          className={`banner ${message.type}`}
          role="status"
          onClick={() => setMessage(null)}
        >
          {message.text}
        </div>
      )}

      {/* Admin Add / Edit Section Form */}
      {isAdmin && showForm && (
        <form className="card form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>{editing ? "✏️ Edit Section" : "➕ Add Section"}</h2>
            <span className="form-tip">Assign section name, department association, and student limits.</span>
          </div>

          <div className="grid">
            <label className="field">
              <span>Section Name *</span>
              <input
                name="name"
                type="text"
                placeholder="e.g. Section A"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span>Department *</span>
              {departments.length > 0 ? (
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className="select-input"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="department"
                  type="text"
                  placeholder="e.g. Computer Science & Engineering"
                  value={form.department}
                  onChange={handleChange}
                  required
                />
              )}
            </label>

            <label className="field">
              <span>Class Capacity (Students) *</span>
              <input
                name="capacity"
                type="number"
                min="1"
                max="200"
                value={form.capacity}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span>Academic Year / Semester</span>
              <input
                name="academicYear"
                type="text"
                placeholder="e.g. 2026-2027"
                value={form.academicYear}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="actions">
            <button type="submit" className="btn primary">
              {editing ? "Update Section" : "Create Section"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter by Department */}
      <section className="card">
        <div className="list-header">
          <h2>Registered Sections ({filteredSections.length})</h2>
          <div className="filter-selects">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="select-input"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="empty">Loading sections...</p>
        ) : filteredSections.length === 0 ? (
          <p className="empty">No sections found.</p>
        ) : (
          <div className="section-grid">
            {filteredSections.map((sec) => {
              const enrolled = students.filter(
                (s) =>
                  s.section?.toLowerCase() === sec.name?.toLowerCase() &&
                  s.department?.toLowerCase() === sec.department?.toLowerCase()
              ).length;
              const cap = sec.capacity || 60;
              const fillPct = Math.min(Math.round((enrolled / cap) * 100), 100);

              return (
                <div key={sec.id} className="section-card">
                  <div className="section-card-header">
                    <span className="section-tag-big">{sec.name}</span>
                    <span className="year-pill">{sec.academicYear || "2026-2027"}</span>
                  </div>

                  <h4 className="sec-dept-title">{sec.department}</h4>

                  <div className="occupancy-wrap">
                    <div className="occupancy-labels">
                      <span>Enrollment</span>
                      <strong>
                        {enrolled} / {cap} seats ({fillPct}%)
                      </strong>
                    </div>
                    <div className="progress-track">
                      <div
                        className={`progress-fill ${
                          fillPct > 90 ? "fill-danger" : fillPct > 60 ? "fill-warning" : ""
                        }`}
                        style={{ width: `${fillPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="dept-actions" style={{ marginTop: "16px" }}>
                      <button className="btn small" onClick={() => handleEdit(sec)}>
                        ✏️ Edit
                      </button>
                      <button
                        className="btn small danger"
                        onClick={() => handleDelete(sec)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
