import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
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

type LowAttendanceStudent = {
  key: string;
  student_id: number;
  exam_rollno: number;
  student_name: string;
  department: string;
  year: number;
  subject_id: string;
  subject_name: string;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendancePercentage: number;
};

function TeacherAlerts() {
  const navigate = useNavigate();

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState<
    LowAttendanceStudent[]
  >([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const teacherId = localStorage.getItem("teacherId");
  const teacherName = localStorage.getItem("teacherName") || "";

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    calculateLowAttendance();
  }, [attendanceRecords, selectedMonth]);

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
          remark: data.remark || "",
          date: data.date || "",
          time: data.time || "",
        };
      });

      setAttendanceRecords(records);
    } catch (error) {
      console.error("Low attendance records fetch error:", error);
      alert("Low attendance data fetch nahi ho pa raha. Console check karo.");
    } finally {
      setLoading(false);
    }
  }

 async function calculateLowAttendance() {
  const monthlyRecords = attendanceRecords.filter((record) =>
    record.date.startsWith(selectedMonth)
  );

  const studentMap = new Map<string, LowAttendanceStudent>();

  monthlyRecords.forEach((record) => {
    const key = `${record.student_id}_${record.subject_id}`;

    if (!studentMap.has(key)) {
      studentMap.set(key, {
        key,
        student_id: record.student_id,
        exam_rollno: record.exam_rollno,
        student_name: record.student_name,
        department: record.department,
        year: record.year,
        subject_id: record.subject_id,
        subject_name: record.subject_name,
        totalClasses: 0,
        presentClasses: 0,
        absentClasses: 0,
        attendancePercentage: 0,
      });
    }

    const student = studentMap.get(key);

    if (!student) return;

    student.totalClasses += 1;

    if (record.status === "Present") {
      student.presentClasses += 1;
    } else {
      student.absentClasses += 1;
    }

    student.attendancePercentage =
      student.totalClasses > 0
        ? Math.round((student.presentClasses / student.totalClasses) * 100)
        : 0;
  });

  const defaulters = Array.from(studentMap.values())
    .filter((student) => student.attendancePercentage < 65)
    .sort((a, b) => {
      if (a.subject_id !== b.subject_id) {
        return a.subject_id.localeCompare(b.subject_id);
      }

      return a.attendancePercentage - b.attendancePercentage;
    });

  setLowAttendanceStudents(defaulters);

  if (teacherId && defaulters.length > 0) {
    for (const student of defaulters) {
      const notificationId = `${teacherId}_${selectedMonth}_${student.subject_id}_${student.student_id}`;

      await setDoc(
        doc(db, "notifications", notificationId),
        {
          teacher_id: teacherId,
          teacher_name: teacherName || "",
          type: "LOW_ATTENDANCE",
          title: "Low Attendance Alert",
          message: `${student.student_name} has ${student.attendancePercentage}% attendance in ${student.subject_name}.`,
          student_id: student.student_id,
          student_name: student.student_name,
          subject_id: student.subject_id,
          subject_name: student.subject_name,
          attendancePercentage: student.attendancePercentage,
          month: selectedMonth,
          status: "unread",
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  }
}

  function downloadDefaulterCSV() {
    if (lowAttendanceStudents.length === 0) {
      alert("No low attendance records available to download.");
      return;
    }

    const headers = [
      "Student ID",
      "Exam Roll No",
      "Student Name",
      "Department",
      "Year",
      "Subject ID",
      "Subject Name",
      "Total Classes",
      "Present Classes",
      "Absent Classes",
      "Attendance Percentage",
    ];

    const rows = lowAttendanceStudents.map((student) => [
      student.student_id,
      student.exam_rollno,
      student.student_name,
      student.department,
      student.year,
      student.subject_id,
      student.subject_name,
      student.totalClasses,
      student.presentClasses,
      student.absentClasses,
      `${student.attendancePercentage}%`,
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
    link.download = `low_attendance_defaulters_${selectedMonth}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  const monthlyRecords = attendanceRecords.filter((record) =>
    record.date.startsWith(selectedMonth)
  );

  const totalStudentsChecked = new Set(
    monthlyRecords.map((record) => `${record.student_id}_${record.subject_id}`)
  ).size;

  if (loading) {
    return (
      <div className="student-page-bg">
        <div className="student-loading-card">Loading low attendance data...</div>
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
            <h1>Low Attendance Alerts</h1>
            <p>
              Students whose monthly attendance is below 65% will appear in the
              defaulter list.
            </p>

            <span className="student-status-chip">
              Teacher: {teacherName || teacherId}
            </span>
          </div>
        </div>

       <div className="low-attendance-toolbar">
  <div className="low-month-field">
    <label>Select Month</label>

    <input
      type="month"
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(e.target.value)}
    />
  </div>

  <button
    className="low-download-btn"
    type="button"
    onClick={downloadDefaulterCSV}
  >
    Download Defaulter CSV
  </button>
</div>
        <div className="teacher-alert-summary">
          <div className="teacher-alert-box danger">
            <h3>Defaulters Below 65%</h3>
            <p>{lowAttendanceStudents.length}</p>
          </div>

          <div className="teacher-alert-box neutral">
            <h3>Total Students Checked</h3>
            <p>{totalStudentsChecked}</p>
          </div>

          <div className="teacher-alert-box success">
            <h3>Total Records This Month</h3>
            <p>{monthlyRecords.length}</p>
          </div>
        </div>

        {monthlyRecords.length === 0 ? (
          <div className="student-empty">
            No attendance records found for selected month.
          </div>
        ) : lowAttendanceStudents.length === 0 ? (
          <div className="student-empty">
            No defaulters found. All students are above 65% attendance for this
            month.
          </div>
        ) : (
        <div className="low-subject-sections">
  {Object.entries(
    lowAttendanceStudents.reduce<Record<string, LowAttendanceStudent[]>>(
      (groups, student) => {
        const subjectKey = `${student.subject_name} (${student.subject_id})`;

        if (!groups[subjectKey]) {
          groups[subjectKey] = [];
        }

        groups[subjectKey].push(student);
        return groups;
      },
      {}
    )
  ).map(([subjectName, students]) => (
    <div className="low-subject-card" key={subjectName}>
      <div className="low-subject-header">
        <div>
          <h2>{subjectName}</h2>
          <p>{students.length} defaulter student(s) below 65%</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="record-table low-attendance-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Exam Roll No</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Total Classes</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Attendance %</th>
              <th>Alert</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.key}>
                <td>{student.student_id}</td>
                <td>{student.exam_rollno}</td>
                <td>{student.student_name}</td>
                <td>{student.department}</td>
                <td>{student.year}</td>
                <td>{student.totalClasses}</td>
                <td style={{ color: "#86efac", fontWeight: "bold" }}>
                  {student.presentClasses}
                </td>
                <td style={{ color: "#fecaca", fontWeight: "bold" }}>
                  {student.absentClasses}
                </td>
                <td style={{ color: "#fca5a5", fontWeight: "bold" }}>
                  {student.attendancePercentage}%
                </td>
                <td style={{ color: "#fca5a5", fontWeight: "bold" }}>
                  Defaulter
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ))}
</div>
        )}
      </div>
    </div>
  );
}

export default TeacherAlerts;