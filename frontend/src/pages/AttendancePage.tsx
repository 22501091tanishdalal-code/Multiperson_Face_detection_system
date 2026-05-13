import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";

type AttendanceRecord = {
  id: string;
  student_id: number;
  student_name: string;
  subject_id: string;
  subject_name: string;
  teacher_name: string;
  status: string;
  date: string;
  time: string;
  createdAt?: unknown;
};

export default function AttendancePage() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  async function fetchAttendance() {
    try {
      setLoading(true);
      setErrorMessage("");

      const studentId = localStorage.getItem("studentId");

      if (!studentId) {
        setErrorMessage("Student login data not found. Please login again.");
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "attendance"),
        where("student_id", "==", Number(studentId))
      );

      const snapshot = await getDocs(q);

      const records: AttendanceRecord[] = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          student_id: data.student_id || 0,
          student_name: data.student_name || "",
          subject_id: data.subject_id || "",
          subject_name: data.subject_name || "Not Assigned",
          teacher_name: data.teacher_name || "Not Assigned",
          status: data.status || "Present",
          date: data.date || "",
          time: data.time || "",
          createdAt: data.createdAt,
        };
      });

      records.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`).getTime();
        const dateB = new Date(`${b.date} ${b.time}`).getTime();
        return dateB - dateA;
      });

      setAttendance(records);
    } catch (error) {
      console.error("Attendance load error:", error);
      setErrorMessage("Attendance records load nahi ho paaye. Firebase data ya permission issue ho sakta hai.");
    } finally {
      setLoading(false);
    }
  }

  function getSubjectText(record: AttendanceRecord) {
  if (record.subject_id) {
    return `${record.subject_name} (${record.subject_id})`;
  }

  return record.subject_name || "Not Assigned";
}

  function downloadCSV() {
    if (attendance.length === 0) {
      alert("No attendance records available to download.");
      return;
    }

    const headers = [
      "Student ID",
      "Student Name",
      "Date",
      "Time",
      "Subject",
      "Teacher Name",
      "Status",
    ];

   const rows = attendance.map((record) => [
  record.student_id,
  record.student_name,
  record.date,
  record.time,
  getSubjectText(record),
  record.teacher_name,
  record.status,
]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "student_attendance_report.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="attendance-page-bg">
      <div className="attendance-page-wrapper">
        <button className="attendance-back-btn" onClick={() => navigate("/menu")}>
          ← Back to Dashboard
        </button>

        <div className="attendance-header-card">
          <div>
            <span className="attendance-chip">Student Attendance</span>
            <h1>Attendance Records</h1>
            <p>
              View your attendance history with date, time, subject and teacher details.
            </p>
          </div>

          <button className="attendance-download-btn" onClick={downloadCSV}>
            Download CSV
          </button>
        </div>

        <div className="attendance-summary-grid">
          <div className="attendance-summary-card">
            <h3>Total Records</h3>
            <p>{attendance.length}</p>
          </div>

          <div className="attendance-summary-card">
            <h3>Latest Date</h3>
            <p>{attendance[0]?.date || "--"}</p>
          </div>

          <div className="attendance-summary-card">
            <h3>Latest Time</h3>
            <p>{attendance[0]?.time || "--"}</p>
          </div>

          <div className="attendance-summary-card">
            <h3>Latest Subject</h3>
           <p>{attendance[0] ? getSubjectText(attendance[0]) : "--"}</p>
          </div>
        </div>

        {loading ? (
          <div className="attendance-empty-card">
            <h2>Loading Attendance...</h2>
            <p>Please wait while we fetch your records.</p>
          </div>
        ) : errorMessage ? (
          <div className="attendance-empty-card attendance-error-card">
            <h2>Unable to Load Attendance</h2>
            <p>{errorMessage}</p>
          </div>
        ) : attendance.length === 0 ? (
          <div className="attendance-empty-card">
            <h2>No Attendance Found</h2>
            <p>Your attendance will appear here after face scan.</p>
          </div>
        ) : (
          <div className="attendance-table-card">
            <div className="attendance-table-title">
              <h2>Attendance History</h2>
              <p>Showing records only for the currently logged-in student.</p>
            </div>

            <div className="attendance-table-scroll">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>S. No.</th>
                    <th>Student Name</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map((record, index) => (
                    <tr key={record.id}>
                      <td>{index + 1}</td>
                      <td>{record.student_name}</td>
                      <td>{record.date}</td>
                      <td>{record.time}</td>
                      <td>{getSubjectText(record)}</td>
                      <td>{record.teacher_name}</td>
                      <td>
                        <span className="attendance-status-pill">
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
