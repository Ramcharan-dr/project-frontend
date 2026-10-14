import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createStudent,
  deleteStudent,
  fetchDepartments,
  fetchSections,
  fetchStudents,
  updateStudent,
} from "../api";
import { useAuth } from "../context/AuthContext";
import StudentForm from "../components/StudentForm";
import StudentTable from "../components/StudentTable";
import StudentModal from "../components/StudentModal";

export default function Students() {
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [editing, setEditing] = useState(null);
  const [showAddForm, setShowAddForm] = useState(searchParams.get("add") === "true");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [deptList, sectList] = await Promise.all([
        fetchDepartments(),
        fetchSections(),
      ]);
      setDepartments(deptList);
      setSections(sectList);
    } catch {
      // Ignore
    }
  }, []);

  const loadStudents = useCallback(async (keyword) => {
    setLoading(true);
    try {
      const data = await fetchStudents(keyword);
      setStudents(data);
    } catch (err) {
      if (err.response?.status !== 401) {
        setMessage({
          type: "error",
          text: "Could not reach the server. Is the backend running?",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => loadStudents(search), 300);
    return () => clearTimeout(t);
  }, [search, loadStudents]);

  const handleSubmit = async (form) => {
    setFieldErrors({});
    try {
      if (editing) {
        await updateStudent(editing.id, form);
        setMessage({ type: "success", text: `Student ${form.name} updated successfully.` });
      } else {
        await createStudent(form);
        setMessage({ type: "success", text: `Student ${form.name} added successfully.` });
      }
      setEditing(null);
      setShowAddForm(false);
      loadStudents(search);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setFieldErrors(data.errors);
      setMessage({
        type: "error",
        text: data?.message || "Something went wrong while saving student.",
      });
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Are you sure you want to delete student "${student.name}" (Roll: ${student.rollNumber})?`)) {
      return;
    }
    try {
      await deleteStudent(student.id);
      setMessage({ type: "success", text: "Student deleted successfully." });
      if (editing?.id === student.id) {
        setEditing(null);
        setShowAddForm(false);
      }
      loadStudents(search);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Delete failed.",
      });
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ["Roll Number", "Name", "Email", "Phone", "Course", "Department", "Section", "Marks"];
    const rows = filteredStudents.map((s) => [
      `"${s.rollNumber}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.phone || ""}"`,
      `"${s.course}"`,
      `"${s.department}"`,
      `"${s.section}"`,
      s.marks,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `students_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client-side filtering by department & section
  const filteredStudents = students.filter((s) => {
    if (selectedDept && s.department.toLowerCase() !== selectedDept.toLowerCase()) return false;
    if (selectedSection && s.section.toLowerCase() !== selectedSection.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1>🎓 Student Management</h1>
          <p>
            {isAdmin
              ? "Add, view, update, delete, and search student academic records."
              : "Search, filter, and view student records across all departments."}
          </p>
        </div>
        <div className="user-box">
          {isAdmin && (
            <button
              className={`btn ${showAddForm ? "" : "primary"}`}
              onClick={() => {
                if (showAddForm) {
                  setShowAddForm(false);
                  setEditing(null);
                } else {
                  setShowAddForm(true);
                  setEditing(null);
                }
              }}
            >
              {showAddForm ? "✕ Hide Form" : "➕ Add Student"}
            </button>
          )}
          <button className="btn outline" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`banner ${message.type}`}
          role="status"
          onClick={() => setMessage(null)}
        >
          {message.text} (Click to dismiss)
        </div>
      )}

      {/* Admin Add / Edit Form */}
      {isAdmin && (showAddForm || editing) && (
        <StudentForm
          editing={editing}
          errors={fieldErrors}
          departments={departments}
          sections={sections}
          onSubmit={handleSubmit}
          onCancel={() => {
            setEditing(null);
            setShowAddForm(false);
            setFieldErrors({});
          }}
        />
      )}

      {/* Search & Filter Bar */}
      <section className="card">
        <div className="filter-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search"
              type="search"
              placeholder="Search by name, roll number, email, course, department, section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="select-input"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="select-input"
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.department})
                </option>
              ))}
            </select>

            {(search || selectedDept || selectedSection) && (
              <button
                className="btn small"
                onClick={() => {
                  setSearch("");
                  setSelectedDept("");
                  setSelectedSection("");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="list-header" style={{ marginTop: "12px" }}>
          <h2>
            Students ({filteredStudents.length} of {students.length})
          </h2>
        </div>

        {loading ? (
          <p className="empty">Loading student records…</p>
        ) : (
          <StudentTable
            students={filteredStudents}
            isAdmin={isAdmin}
            onView={(s) => setSelectedStudent(s)}
            onEdit={(s) => {
              setEditing(s);
              setShowAddForm(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onDelete={handleDelete}
          />
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
