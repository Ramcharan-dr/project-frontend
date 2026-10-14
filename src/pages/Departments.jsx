import { useEffect, useState } from "react";
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  fetchStudents,
  updateDepartment,
} from "../api";
import { useAuth } from "../context/AuthContext";

export default function Departments() {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [deptData, studentData] = await Promise.all([
        fetchDepartments(),
        fetchStudents(),
      ]);
      setDepartments(deptData);
      setStudents(studentData);
    } catch {
      setMessage({ type: "error", text: "Failed to load departments." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateDepartment(editing.id, form);
        setMessage({ type: "success", text: "Department updated successfully." });
      } else {
        await createDepartment(form);
        setMessage({ type: "success", text: "Department created successfully." });
      }
      setEditing(null);
      setForm({ name: "", code: "", description: "" });
      setShowForm(false);
      loadAll();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Operation failed.",
      });
    }
  };

  const handleEdit = (dept) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete department "${dept.name}" (${dept.code})?`)) return;
    try {
      await deleteDepartment(dept.id);
      setMessage({ type: "success", text: "Department deleted." });
      loadAll();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete department.",
      });
    }
  };

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>🏢 Department Management</h1>
          <p>
            {isAdmin
              ? "Create, update, and manage academic departments and faculties."
              : "Explore academic departments, course codes, and enrolled student counts."}
          </p>
        </div>
        {isAdmin && (
          <button
            className={`btn ${showForm ? "" : "primary"}`}
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditing(null);
                setForm({ name: "", code: "", description: "" });
              } else {
                setShowForm(true);
                setEditing(null);
                setForm({ name: "", code: "", description: "" });
              }
            }}
          >
            {showForm ? "✕ Close Form" : "➕ Add Department"}
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

      {/* Admin Add / Edit Department Form */}
      {isAdmin && showForm && (
        <form className="card form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>{editing ? "✏️ Edit Department" : "➕ Add Department"}</h2>
            <span className="form-tip">Specify the department title, shorthand code, and curriculum overview.</span>
          </div>
          <div className="grid">
            <label className="field">
              <span>Department Name *</span>
              <input
                name="name"
                type="text"
                placeholder="e.g. Computer Science & Engineering"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span>Department Code *</span>
              <input
                name="code"
                type="text"
                placeholder="e.g. CSE"
                value={form.code}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field" style={{ gridColumn: "1 / -1" }}>
              <span>Description / Overview</span>
              <input
                name="description"
                type="text"
                placeholder="Brief summary of department courses and faculties"
                value={form.description}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="actions">
            <button type="submit" className="btn primary">
              {editing ? "Update Department" : "Create Department"}
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

      {/* Departments Grid */}
      <section className="card">
        <div className="list-header">
          <h2>Registered Departments ({departments.length})</h2>
        </div>

        {loading ? (
          <p className="empty">Loading departments...</p>
        ) : departments.length === 0 ? (
          <p className="empty">No departments configured yet.</p>
        ) : (
          <div className="dept-grid">
            {departments.map((dept) => {
              const enrolled = students.filter(
                (s) => s.department?.toLowerCase() === dept.name?.toLowerCase()
              ).length;
              return (
                <div key={dept.id} className="dept-card">
                  <div className="dept-card-header">
                    <span className="dept-code-pill">{dept.code}</span>
                    <span className="dept-enrolled-count">
                      👥 {enrolled} {enrolled === 1 ? "Student" : "Students"}
                    </span>
                  </div>
                  <h3>{dept.name}</h3>
                  <p className="dept-desc">
                    {dept.description || "No description provided."}
                  </p>
                  {isAdmin && (
                    <div className="dept-actions">
                      <button
                        className="btn small"
                        onClick={() => handleEdit(dept)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn small danger"
                        onClick={() => handleDelete(dept)}
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
