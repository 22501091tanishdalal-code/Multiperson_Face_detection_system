import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

type Student = {
  student_id: number;
  exam_rollno: number;
  name: string;
  email_id: string;
  department: string;
  year: number;
  status: string;
};

type AttendanceStudent = Student & {
  attendanceStatus: "Present" | "Absent";
  remark: string;
};

function TeacherMarkAttendance() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const savedData = localStorage.getItem("teacherAttendanceData");

        if (savedData) {
          setStudents(JSON.parse(savedData));
          setLoading(false);
          return;
        }

        const snapshot = await getDocs(collection(db, "students"));

        const studentList: AttendanceStudent[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Student;

          return {
            ...data,
            attendanceStatus: "Absent",
            remark: "",
          };
        });

        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching students:", error);
        alert("Students data fetch nahi ho pa raha. Console check karo.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

 const toggleStatus = (studentId: number) => {
  setStudents((prevStudents) =>
    prevStudents.map((student) =>
      student.student_id === studentId
        ? {
            ...student,
            attendanceStatus:
              student.attendanceStatus === "Present" ? "Absent" : "Present",
          }
        : student
    )
  );
};

  const updateRemark = (studentId: number, value: string) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.student_id === studentId
          ? {
              ...student,
              remark: value,
            }
          : student
      )
    );
  };

  const saveChanges = () => {
    localStorage.setItem("teacherAttendanceData", JSON.stringify(students));
    alert("Attendance changes saved successfully");
  };

  if (loading) {
    return (
      <div className="student-page-bg">
        <div className="student-loading-card">Loading students...</div>
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
            <h1>Mark / Correct Attendance</h1>
            <p>Manually update attendance using actual student records.</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="record-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Current Status</th>
                <th>Remark</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
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
                  <td>
                   <input
                   className="field-input"
                   type="text"
                   value={
                         student.remark === "Not marked" || student.remark === "Not Marked"
                           ? ""
                              : student.remark
                    }
                    placeholder="Not Marked"
                    onChange={(e) =>
                         updateRemark(student.student_id, e.target.value)
                     }
                 />
                  </td>
                  <td>
                    <button
                      className="primary-btn"
                      type="button"
                      onClick={() => toggleStatus(student.student_id)}
                    >
                      {student.attendanceStatus === "Present"
                        ? "Mark Absent"
                        : "Mark Present"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="primary-btn" type="button" onClick={saveChanges}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default TeacherMarkAttendance;