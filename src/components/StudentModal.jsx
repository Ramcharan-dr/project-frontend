export default function StudentModal({ student, onClose }) {
  if (!student) return null;

  const marks = Number(student.marks) || 0;
  const grade =
    marks >= 75
      ? "Distinction (A+)"
      : marks >= 60
      ? "First Class (A)"
      : marks >= 50
      ? "Second Class (B)"
      : marks >= 40
      ? "Pass (C)"
      : "Fail (F)";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-avatar">🎓</span>
            <div>
              <h3>{student.name}</h3>
              <p className="modal-subtitle">Roll No: {student.rollNumber}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{student.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone Number</span>
              <span className="detail-value">{student.phone || "Not Provided"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Course</span>
              <span className="detail-value">{student.course}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Department</span>
              <span className="detail-value dept-highlight">{student.department}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Section</span>
              <span className="detail-value section-highlight">{student.section}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Academic Marks</span>
              <span className="detail-value marks-highlight">{marks} / 100</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Academic Standing</span>
              <span className="detail-value grade-highlight">{grade}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Result Status</span>
              <span
                className={`detail-value status-badge ${
                  marks >= 40 ? "status-pass" : "status-fail"
                }`}
              >
                {marks >= 40 ? "PASSED" : "FAILED"}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
