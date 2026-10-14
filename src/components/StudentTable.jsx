export default function StudentTable({ students, onEdit, onDelete, onView, isAdmin }) {
  if (students.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📂</span>
        <p className="empty">No student records found matching the criteria.</p>
      </div>
    );
  }

  const getMarksBadge = (marks) => {
    const m = Number(marks) || 0;
    if (m >= 75) return <span className="badge badge-success">{m}% (Distinction)</span>;
    if (m >= 60) return <span className="badge badge-primary">{m}% (1st Class)</span>;
    if (m >= 50) return <span className="badge badge-warning">{m}% (2nd Class)</span>;
    if (m >= 40) return <span className="badge badge-info">{m}% (Pass)</span>;
    return <span className="badge badge-danger">{m}% (Fail)</span>;
  };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Section</th>
            <th>Course</th>
            <th>Marks</th>
            <th aria-label="Actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>
                <span className="roll-badge">{s.rollNumber}</span>
              </td>
              <td>
                <strong>{s.name}</strong>
              </td>
              <td>{s.email}</td>
              <td>
                <span className="dept-tag">{s.department}</span>
              </td>
              <td>
                <span className="section-tag">{s.section}</span>
              </td>
              <td>{s.course}</td>
              <td>{getMarksBadge(s.marks)}</td>
              <td className="row-actions">
                <button
                  type="button"
                  className="btn small outline"
                  onClick={() => onView(s)}
                  title="View Student Details"
                >
                  👁️ View
                </button>
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => onEdit(s)}
                      title="Edit Student"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="btn small danger"
                      onClick={() => onDelete(s)}
                      title="Delete Student"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
