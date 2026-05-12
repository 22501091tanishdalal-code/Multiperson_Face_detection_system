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

function TeacherAttendance() {
  const navigate = useNavigate();

  const [attendanceData, setAttendanceData] = useState<AttendanceStudent[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem("teacherAttendanceData");

    if (savedData) {
      setAttendanceData(JSON.parse(savedData));
    }
  }, []);

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
            <h1>Attendance Records</h1>
            <p>View updated attendance records saved by teacher.</p>
          </div>
        </div>

        {attendanceData.length === 0 ? (
          <div className="student-empty">
            No attendance records found. First go to Mark Attendance and click
            Save Changes.
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
                  <th>Remark</th>
                </tr>
              </thead>

              <tbody>
                {attendanceData.map((student) => (
                  <tr key={student.student_id}>
                    <td>{student.student_id}</td>
                    <td>{student.exam_rollno}</td>
                    <td>{student.name}</td>
                    <td>{student.department}</td>
                    <td>{student.year}</td>
                    <td
                      style={{
                        color:
                          student.attendanceStatus === "Present"
                            ? "#86efac"
                            : "#fecaca",
                        fontWeight: "bold",
                      }}
                    >
                      {student.attendanceStatus}
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

export default TeacherAttendance;