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

function TeacherReports() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const savedData = localStorage.getItem("teacherAttendanceData");

    if (savedData) {
      setStudents(JSON.parse(savedData));
    }
  }, []);

  const filteredStudents = students.filter((student) => {
    const departmentMatch =
      departmentFilter === "All" || student.department === departmentFilter;

    const yearMatch =
      yearFilter === "All" || String(student.year) === yearFilter;

    const statusMatch =
      statusFilter === "All" || student.attendanceStatus === statusFilter;

    return departmentMatch && yearMatch && statusMatch;
  });

  const presentCount = filteredStudents.filter(
    (student) => student.attendanceStatus === "Present"
  ).length;

  const absentCount = filteredStudents.filter(
    (student) => student.attendanceStatus === "Absent"
  ).length;

  const attendancePercentage =
    filteredStudents.length > 0
      ? Math.round((presentCount / filteredStudents.length) * 100)
      : 0;

  const departments = Array.from(
    new Set(students.map((student) => student.department))
  );

  const years = Array.from(new Set(students.map((student) => student.year)));

  const handleDownloadCSV = () => {
    if (filteredStudents.length === 0) {
      alert("No report data available to download.");
      return;
    }

    const headers = [
      "Student ID",
      "Roll No",
      "Student Name",
      "Department",
      "Year",
      "Status",
      "Remark",
    ];

    const rows = filteredStudents.map((student) => [
      student.student_id,
      student.exam_rollno,
      student.name,
      student.department,
      student.year,
      student.attendanceStatus,
      student.remark,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "attendance_report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

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
            <h1>Attendance Reports</h1>
            <p>
              Generate and review attendance reports using department, year, and status filters.
            </p>
          </div>
        </div>

        <div className="teacher-report-summary">
          <div className="teacher-report-card">
            <h3>Total Records</h3>
            <p>{filteredStudents.length}</p>
          </div>

          <div className="teacher-report-card success">
            <h3>Present</h3>
            <p>{presentCount}</p>
          </div>

          <div className="teacher-report-card danger">
            <h3>Absent</h3>
            <p>{absentCount}</p>
          </div>

          <div className="teacher-report-card">
            <h3>Attendance %</h3>
            <p>{attendancePercentage}%</p>
          </div>
        </div>

        <div className="teacher-report-filters">
          <select
            className="field-input"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            className="field-input"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="All">All Years</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>
                Year {year}
              </option>
            ))}
          </select>

          <select
            className="field-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>

          <button className="primary-btn" type="button" onClick={handleDownloadCSV}>
            Download CSV
          </button>

          <button className="primary-btn" type="button" onClick={handlePrint}>
            Print Report
          </button>
        </div>

        {students.length === 0 ? (
          <div className="student-empty">
            No attendance data found. First go to Mark Attendance and click Save Changes.
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="student-empty">
            No records found for the selected filters.
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
                {filteredStudents.map((student) => (
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

export default TeacherReports;