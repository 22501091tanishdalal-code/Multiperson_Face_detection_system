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

  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
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

  const subjects = [
  "All",
  ...Array.from(
    new Set(
      attendanceData
        .map((record) => record.subject_name)
        .filter((subject) => subject.trim() !== "")
    )
  ),
];

function isDateInSelectedWeek(recordDate: string, selectedWeekValue: string) {
  if (!recordDate || !selectedWeekValue) return true;

  const record = new Date(recordDate);
  const [year, week] = selectedWeekValue.split("-W").map(Number);

  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7;

  const weekStart = new Date(firstDayOfYear);
  weekStart.setDate(firstDayOfYear.getDate() + daysOffset);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return record >= weekStart && record <= weekEnd;
}

const filteredAttendanceData = attendanceData.filter((record) => {
  const subjectMatch =
    selectedSubject === "All" || record.subject_name === selectedSubject;

  const dateMatch = selectedDate === "" || record.date === selectedDate;

  const monthMatch =
    selectedMonth === "" || record.date.startsWith(selectedMonth);

  const weekMatch =
    selectedWeek === "" || isDateInSelectedWeek(record.date, selectedWeek);

  return subjectMatch && dateMatch && monthMatch && weekMatch;
});

const filteredPresent = filteredAttendanceData.filter(
  (record) => record.status === "Present"
).length;

const filteredAbsent = filteredAttendanceData.filter(
  (record) => record.status === "Absent"
).length;

function downloadCSV(data: AttendanceRecord[], fileName: string) {
  if (data.length === 0) {
    alert("No records available to download.");
    return;
  }

  const headers = [
    "Date",
    "Time",
    "Subject",
    "Student ID",
    "Exam Roll No",
    "Student Name",
    "Department",
    "Year",
    "Status",
    "Remark",
  ];

  const rows = data.map((record) => [
    record.date,
    record.time,
    `${record.subject_name} (${record.subject_id})`,
    record.student_id,
    record.exam_rollno,
    record.student_name,
    record.department,
    record.year,
    record.status,
    record.remark || "Not Marked",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

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
          <p>{filteredAttendanceData.length}</p>
          </div>

          <div className="teacher-report-card success">
            <h3>Present</h3>
           <p>{filteredPresent}</p>
          </div>

          <div className="teacher-report-card danger">
            <h3>Absent</h3>
            <p>{filteredAbsent}</p>
          </div>

          <div className="teacher-report-card">
            <h3>Teacher ID</h3>
            <p>{teacherId}</p>
          </div>
        </div>

        <div className="attendance-filter-card">
  <div className="attendance-filter-field">
    <label>Subject</label>
    <select
      value={selectedSubject}
      onChange={(e) => setSelectedSubject(e.target.value)}
    >
      {subjects.map((subject) => (
        <option key={subject} value={subject}>
          {subject}
        </option>
      ))}
    </select>
  </div>

  <div className="attendance-filter-field">
    <label>Date</label>
    <input
      type="date"
      value={selectedDate}
      onChange={(e) => {
        setSelectedDate(e.target.value);
        setSelectedMonth("");
        setSelectedWeek("");
      }}
    />
  </div>

  <div className="attendance-filter-field">
    <label>Month</label>
    <input
      type="month"
      value={selectedMonth}
      onChange={(e) => {
        setSelectedMonth(e.target.value);
        setSelectedDate("");
        setSelectedWeek("");
      }}
    />
  </div>

  <div className="attendance-filter-field">
    <label>Week</label>
    <input
      type="week"
      value={selectedWeek}
      onChange={(e) => {
        setSelectedWeek(e.target.value);
        setSelectedDate("");
        setSelectedMonth("");
      }}
    />
  </div>

  <button
    className="attendance-download-btn"
    type="button"
    onClick={() =>
      downloadCSV(
        filteredAttendanceData,
        `attendance-records-${selectedSubject}-${
          selectedDate || selectedMonth || selectedWeek || "all"
        }.csv`
      )
    }
  >
    Download CSV
  </button>
</div>

        {filteredAttendanceData.length === 0 ? (
          <div className="student-empty">
            No attendance records found for the selected filters.
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
                {filteredAttendanceData.map((record) => (
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