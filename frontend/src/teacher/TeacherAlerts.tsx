import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type AttendanceStudent = {
  student_id: number;
  exam_rollno: number;
  name: string;
  email_id: string;
  department: string;
  year: number;
  status: string;
  attendanceStatus: "Present" | "Absent";
  remark: string;
};

function TeacherAlerts() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<AttendanceStudent[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem("teacherAttendanceData");

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setStudents(parsedData);
    }
  }, []);

  const absentStudents = students.filter(
    (student) => student.attendanceStatus === "Absent"
  );

  const presentStudents = students.filter(
    (student) => student.attendanceStatus === "Present"
  );

  return (
    <div className="student-page-bg">
      <button
        className="student-back-btn"
        onClick={() => navigate("/teacher-dashboard")}
        type="button"
      >
        ← Back
      </button>

      <div className="student-page-wrapper student-panel-shell">
        <div className="student-profile-hero">
          <div className="student-hero-text">
            <h1>Low Attendance Alerts</h1>
            <p>
              Students marked absent or not yet marked are shown here for teacher review.
            </p>
          </div>
        </div>

        <div className="teacher-alert-summary">
          <div className="teacher-alert-box danger">
            <h3>Absent / Alert Students</h3>
            <p>{absentStudents.length}</p>
          </div>

          <div className="teacher-alert-box success">
            <h3>Present Students</h3>
            <p>{presentStudents.length}</p>
          </div>

          <div className="teacher-alert-box neutral">
            <h3>Total Students</h3>
            <p>{students.length}</p>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="student-empty">
            No attendance data found. First go to Mark Attendance and click Save Changes.
          </div>
        ) : absentStudents.length === 0 ? (
          <div className="student-empty">
            No low attendance alerts. All saved students are marked present.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="record-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Alert</th>
                  <th>Remark</th>
                </tr>
              </thead>

              <tbody>
                {absentStudents.map((student) => (
                  <tr key={student.student_id}>
                    <td>{student.student_id}</td>
                    <td>{student.exam_rollno}</td>
                    <td>{student.name}</td>
                    <td>{student.department}</td>
                    <td>{student.year}</td>
                    <td style={{ color: "#fecaca", fontWeight: "bold" }}>
                      {student.attendanceStatus}
                    </td>
                    <td style={{ color: "#fca5a5", fontWeight: "bold" }}>
                      Review Required
                    </td>
                    <td>{student.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherAlerts;