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
  subjects?: any[];
};

type AttendanceStudent = Student & {
  attendanceStatus: "Present" | "Absent";
  remark: string;
};

function TeacherMarkAttendance() {

  const navigate = useNavigate();

  const [students, setStudents] =
    useState<AttendanceStudent[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function fetchStudents() {

      try {

        // =========================
        // TEACHER ID
        // =========================

        const teacherId =
          localStorage.getItem("teacherId");

        if (!teacherId) {

          alert("Teacher not logged in");

          return;
        }

        // =========================
        // FETCH TEACHERS
        // =========================

        const teacherSnapshot =
          await getDocs(
            collection(db, "teachers")
          );

        const teacher =
          teacherSnapshot.docs
            .map((doc) => doc.data())
            .find(
              (t: any) =>
                t.teacher_id === teacherId
            );

        if (!teacher) {

          alert("Teacher not found");

          return;
        }

        // =========================
        // TEACHER SUBJECTS
        // =========================

        const teacherSubjects =
          teacher.subjects || [];

        console.log(
          "Teacher Subjects:",
          teacherSubjects
        );

        // =========================
        // FETCH STUDENTS
        // =========================

        const snapshot =
          await getDocs(
            collection(db, "students")
          );

        console.log(
          "Students:",
          snapshot.docs.map((doc) =>
            doc.data()
          )
        );

        // =========================
        // FILTER STUDENTS
        // =========================

        const studentList: AttendanceStudent[] =
          snapshot.docs
            .map((doc) => {

              const data =
                doc.data() as Student;

              return {
                ...data,
                attendanceStatus:
                  "Absent",
                remark:
                  "Not marked",
              };
            })
            .filter((student: any) => {

  // STUDENT SUBJECTS
  if (
    !student.subjects ||
    student.subjects.length === 0
  ) {
    return false;
  }

  // MATCH SUBJECTS
  return student.subjects.some(
    (studentSubject: any) => {

      return teacherSubjects.some(
        (teacherSubject: any) => {

          return (
            studentSubject?.id ===
            teacherSubject?.id
          );
        }
      );
    }
  );
})

        console.log(
          "Filtered Students:",
          studentList
        );

        setStudents(studentList);

      } catch (error) {

        console.error(
          "Error fetching students:",
          error
        );

        alert(
          "Students data fetch nahi ho pa raha"
        );

      } finally {

        setLoading(false);
      }
    }

    fetchStudents();

  }, []);

  // =========================
  // TOGGLE STATUS
  // =========================

  const toggleStatus = (
    studentId: number
  ) => {

    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.student_id === studentId
          ? {
              ...student,

              attendanceStatus:
                student.attendanceStatus ===
                "Present"
                  ? "Absent"
                  : "Present",

              remark:
                student.attendanceStatus ===
                "Present"
                  ? "Manually marked absent by teacher"
                  : "Manually marked present by teacher",
            }
          : student
      )
    );
  };

  // =========================
  // UPDATE REMARK
  // =========================

  const updateRemark = (
    studentId: number,
    value: string
  ) => {

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

  // =========================
  // SAVE
  // =========================

  const saveChanges = () => {

    localStorage.setItem(
      "teacherAttendanceData",
      JSON.stringify(students)
    );

    alert(
      "Attendance changes saved successfully"
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div className="student-page-bg">
        <div className="student-loading-card">
          Loading students...
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (

    <div className="student-page-bg">

      <button
        className="student-back-btn"
        onClick={() =>
          navigate("/teacher-dashboard")
        }
        type="button"
      >
        ← Back
      </button>

      <div className="student-page-wrapper student-panel-shell">

        <div className="student-profile-hero">

          <div className="student-hero-text">

            <h1>
              Mark / Correct Attendance
            </h1>

            <p>
              Manually update attendance
              using actual student records.
            </p>

          </div>
        </div>

        {students.length === 0 ? (

          <div className="student-empty">
            No students assigned to this teacher.
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
                          student.attendanceStatus ===
                          "Present"
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
                        value={student.remark}
                        onChange={(e) =>
                          updateRemark(
                            student.student_id,
                            e.target.value
                          )
                        }
                      />

                    </td>

                    <td>

                      <button
                        className="primary-btn"
                        type="button"
                        onClick={() =>
                          toggleStatus(
                            student.student_id
                          )
                        }
                      >

                        {student.attendanceStatus ===
                        "Present"
                          ? "Mark Absent"
                          : "Mark Present"}

                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

        <button
          className="primary-btn"
          type="button"
          onClick={saveChanges}
        >
          Save Changes
        </button>

      </div>
    </div>
  );
}

export default TeacherMarkAttendance;