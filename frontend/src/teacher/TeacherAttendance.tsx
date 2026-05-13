import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

type AttendanceRecord = {
  id: string;
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_name: string;
  student_id: number;
  student_name: string;
  exam_rollno: number;
  department: string;
  year: number;
  status: "Present" | "Absent";
  remark: string;
  date: string;
  time: string;
};

function TeacherAttendance() {
  const navigate = useNavigate();

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const teacherId = localStorage.getItem("teacherId");
  const teacherName = localStorage.getItem("teacherName") || "";

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  async function fetchAttendanceRecords() {
    try {
      setLoading(true);

      if (!teacherId) {
        alert("Teacher login data not found. Please login again.");
        navigate("/");
        return;
      }

      const attendanceQuery = query(
        collection(db, "attendance"),
        where("teacher_id", "==", teacherId)
      );

      const snapshot = await getDocs(attendanceQuery);

      const records: AttendanceRecord[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          id: docSnap.id,
          teacher_id: data.teacher_id || "",
          teacher_name: data.teacher_name || "",
          subject_id: data.subject_id || "",
          subject_name: data.subject_name || "",
          student_id: data.student_id || 0,
          student_name: data.student_name || "",
          exam_rollno: data.exam_rollno || 0,
          department: data.department || "",
          year: data.year || 0,
          status: data.status || "Absent",
          remark: data.remark || "Not Marked",
          date: data.date || "",
          time: data.time || "",
        };
      });

      records.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`).getTime();
        const dateB = new Date(`${b.date} ${b.time}`).getTime();
        return dateB - dateA;
      });

      setAttendanceData(records);
    } catch (error) {
      console.error("Teacher attendance fetch error:", error);
      alert("Attendance records fetch nahi ho pa rahe. Console check karo.");
    } finally {
      setLoading(false);
    }
  }

  const totalPresent = attendanceData.filter(
    (record) => record.status === "Present"
  ).length;

  const totalAbsent = attendanceData.filter(
    (record) => record.status === "Absent"
  ).length;

  if (loading) {
    return (
      <div className="student-page-bg">
        <div className="student-loading-card">
          Loading attendance records...
        </div>
      </div>
    );
  }

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
            <p>
              View attendance records saved by the currently logged-in teacher.
            </p>

            <span className="student-status-chip">
              Teacher: {teacherName || teacherId}
            </span>
          </div>
        </div>

        <div className="teacher-report-summary">
          <div className="teacher-report-card">
            <h3>Total Records</h3>
            <p>{attendanceData.length}</p>
          </div>

          <div className="teacher-report-card success">
            <h3>Present</h3>
            <p>{totalPresent}</p>
          </div>

          <div className="teacher-report-card danger">
            <h3>Absent</h3>
            <p>{totalAbsent}</p>
          </div>

          <div className="teacher-report-card">
            <h3>Teacher ID</h3>
            <p>{teacherId}</p>
          </div>
        </div>

        {attendanceData.length === 0 ? (
          <div className="student-empty">
            No attendance records found. First go to Mark Attendance and click
            Save Attendance.
          </div>
        ) : (
          <div className="table-wrapper">
           <table className="record-table teacher-attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Student ID</th>
                  <th>Exam Roll No</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Remark</th>
                </tr>
              </thead>

              <tbody>
                {attendanceData.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.time}</td>
                    <td>
                      {record.subject_name} ({record.subject_id})
                    </td>
                    <td>{record.student_id}</td>
                    <td>{record.exam_rollno}</td>
                    <td>{record.student_name}</td>
                    <td>{record.department}</td>
                    <td>{record.year}</td>

                    <td
                      style={{
                        color:
                          record.status === "Present"
                            ? "#86efac"
                            : "#fecaca",
                        fontWeight: "bold",
                      }}
                    >
                      {record.status}
                    </td>

                    <td>
                      {record.remark && record.remark.trim() !== ""
                        ? record.remark
                        : "Not marked"}
                    </td>
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