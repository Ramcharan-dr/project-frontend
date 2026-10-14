import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  rollNumber: "",
  email: "",
  phone: "",
  course: "B.Tech Computer Science",
  department: "",
  section: "",
  marks: "",
};

export default function StudentForm({ editing, onSubmit, onCancel, errors, departments = [], sections = [] }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editing) {
      setForm({
        ...emptyForm,
        ...editing,
        marks: editing.marks !== null && editing.marks !== undefined ? editing.marks : "",
      });
    } else {
      setForm({
        ...emptyForm,
        department: departments.length > 0 ? departments[0].name : "",
        section: sections.length > 0 ? sections[0].name : "",
      });
    }
  }, [editing, departments, sections]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      marks: form.marks !== "" ? parseFloat(form.marks) : 0.0,
    };
    onSubmit(payload);
  };

  // Filter sections by selected department
  const filteredSections = form.department
    ? sections.filter((s) => s.department.toLowerCase() === form.department.toLowerCase())
    : sections;

  return (
    <form className="card form student-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{editing ? "✏️ Edit Student Record" : "➕ Add New Student"}</h2>
        <span className="form-tip">Fill in all student academic & contact credentials.</span>
      </div>

      <div className="grid">
        <label className="field">
          <span>Student Full Name *</span>
          <input
            name="name"
            type="text"
            placeholder="e.g. Aarav Sharma"
            value={form.name || ""}
            onChange={handleChange}
            required
          />
          {errors?.name && <small className="error">{errors.name}</small>}
        </label>

        <label className="field">
          <span>Roll Number / Student ID *</span>
          <input
            name="rollNumber"
            type="text"
            placeholder="e.g. CS2026001"
            value={form.rollNumber || ""}
            onChange={handleChange}
            required
          />
          {errors?.rollNumber && <small className="error">{errors.rollNumber}</small>}
        </label>

        <label className="field">
          <span>Email Address *</span>
          <input
            name="email"
            type="email"
            placeholder="e.g. aarav@example.com"
            value={form.email || ""}
            onChange={handleChange}
            required
          />
          {errors?.email && <small className="error">{errors.email}</small>}
        </label>

        <label className="field">
          <span>Phone Number</span>
          <input
            name="phone"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={form.phone || ""}
            onChange={handleChange}
          />
          {errors?.phone && <small className="error">{errors.phone}</small>}
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
              placeholder="e.g. Computer Science"
              value={form.department || ""}
              onChange={handleChange}
              required
            />
          )}
          {errors?.department && <small className="error">{errors.department}</small>}
        </label>

        <label className="field">
          <span>Section *</span>
          {filteredSections.length > 0 ? (
            <select
              name="section"
              value={form.section}
              onChange={handleChange}
              required
              className="select-input"
            >
              <option value="">-- Select Section --</option>
              {filteredSections.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.department})
                </option>
              ))}
            </select>
          ) : (
            <input
              name="section"
              type="text"
              placeholder="e.g. Section A"
              value={form.section || ""}
              onChange={handleChange}
              required
            />
          )}
          {errors?.section && <small className="error">{errors.section}</small>}
        </label>

        <label className="field">
          <span>Course *</span>
          <input
            name="course"
            type="text"
            placeholder="e.g. B.Tech Computer Science"
            value={form.course || ""}
            onChange={handleChange}
            required
          />
          {errors?.course && <small className="error">{errors.course}</small>}
        </label>

        <label className="field">
          <span>Marks / Score (0 - 100) *</span>
          <input
            name="marks"
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="e.g. 88.5"
            value={form.marks}
            onChange={handleChange}
            required
          />
          {errors?.marks && <small className="error">{errors.marks}</small>}
        </label>
      </div>

      <div className="actions">
        <button type="submit" className="btn primary">
          {editing ? "💾 Update Student" : "➕ Save Student"}
        </button>
        {editing && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
