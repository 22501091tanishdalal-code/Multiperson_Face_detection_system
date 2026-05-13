import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
  type DocumentReference,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

type SubjectOption = {
  id: string;
  subject_id: string;
  subject_name: string;
  ref: DocumentReference;
};

type Student = {
  student_id: number;
  exam_rollno: number;
  name: string;
  email_id: string;
  department: string;
  year: number;
  status: string;
  subjects?: DocumentReference[];
};

type AttendanceStudent = Student & {
  attendanceStatus: "Present" | "Absent";
  remark: string;
};

function TeacherMarkAttendance() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  const teacherId = localStorage.getItem("teacherId");
  const teacherName = localStorage.getItem("teacherName") || "";

  const selectedSubject = subjects.find(
  (subject) => subject.subject_id === selectedSubjectId
 );

  useEffect(() => {
    loadTeacherSubjects();
  }, []);

  useEffect(() => {
  if (selectedSubjectId && subjects.length > 0) {
    loadStudentsBySubject(selectedSubjectId);
  } else {
    setStudents([]);
  }
}, [selectedSubjectId, subjects]);

  async function loadTeacherSubjects() {
    try {
      setLoading(true);

      if (!teacherId) {
        alert("Teacher login data not found. Please login again.");
        navigate("/");
        return;
      }

      let teacherSnap = await getDoc(doc(db, "teachers", teacherId));

      if (!teacherSnap.exists()) {
        const teacherQuery = query(
          collection(db, "teachers"),
          where("teacher_id", "==", teacherId)
        );

        const teacherQuerySnap = await getDocs(teacherQuery);

        if (teacherQuerySnap.empty) {
          alert("Teacher record not found in Firebase.");
          return;
        }

        teacherSnap = teacherQuerySnap.docs[0];
      }

      const teacherData = teacherSnap.data() as {
  subjects?: DocumentReference[];
};

const teacherSubjectRefs = teacherData.subjects || [];

      if (!Array.isArray(teacherSubjectRefs) || teacherSubjectRefs.length === 0) {
        alert("No subjects assigned to this teacher.");
        return;
      }

      const subjectList: SubjectOption[] = [];

      for (const subjectRef of teacherSubjectRefs) {
        const subjectSnap = await getDoc(subjectRef);

        if (subjectSnap.exists()) {
         const subjectData = subjectSnap.data() as {
  subject_id?: string;
  subject_name?: string;
};

subjectList.push({
  id: subjectSnap.id,
  subject_id: subjectData.subject_id || subjectSnap.id,
  subject_name: subjectData.subject_name || subjectSnap.id,
  ref: subjectRef,
});
        }
      }

      setSubjects(subjectList);

      if (subjectList.length > 0) {
        setSelectedSubjectId(subjectList[0].subject_id);
      }
    } catch (error) {
      console.error("Teacher subjects load error:", error);
      alert("Teacher subjects load nahi ho paaye. Console check karo.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStudentsBySubject(subjectId: string) {
    try {
      setStudentsLoading(true);

      const selectedSubject = subjects.find(
        (subject) => subject.subject_id === subjectId
      );

      if (!selectedSubject) {
        setStudents([]);
        return;
      }

      const studentQuery = query(
        collection(db, "students"),
        where("subjects", "array-contains", selectedSubject.ref)
      );

      const studentSnapshot = await getDocs(studentQuery);

      const studentList: AttendanceStudent[] = studentSnapshot.docs.map(
        (docSnap) => {
          const data = docSnap.data() as Student;

          return {
            student_id: data.student_id,
            exam_rollno: data.exam_rollno,
            name: data.name,
            email_id: data.email_id,
            department: data.department,
            year: data.year,
            status: data.status,
            subjects: data.subjects,
            attendanceStatus: "Absent",
            remark: "",
          };
        }
      );

      studentList.sort((a, b) => Number(a.student_id) - Number(b.student_id));

      setStudents(studentList);
    } catch (error) {
      console.error("Students by subject fetch error:", error);
      alert("Subject ke students fetch nahi ho pa rahe. Console check karo.");
    } finally {
      setStudentsLoading(false);
    }
  }

  function toggleStatus(studentId: number) {
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
  }

  function updateRemark(studentId: number, value: string) {
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
  }

  async function saveChanges() {
    try {
      if (!teacherId) {
        alert("Teacher login data not found.");
        return;
      }

      if (!selectedSubjectId) {
        alert("Please select a subject.");
        return;
      }

      const selectedSubject = subjects.find(
        (subject) => subject.subject_id === selectedSubjectId
      );

      if (!selectedSubject) {
        alert("Selected subject not found.");
        return;
      }

      if (students.length === 0) {
        alert("No students found for this subject.");
        return;
      }

      const now = new Date();

      const date = now.toLocaleDateString("en-CA");

      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      for (const student of students) {
        const attendanceDocId = `${teacherId}_${selectedSubject.subject_id}_${date}_${student.student_id}`;

        await setDoc(doc(db, "attendance", attendanceDocId), {
          teacher_id: teacherId,
          teacher_name: teacherName,
          subject_id: selectedSubject.subject_id,
          subject_name: selectedSubject.subject_name,
          student_id: student.student_id,
          student_name: student.name,
          exam_rollno: student.exam_rollno,
          department: student.department,
          year: student.year,
          status: student.attendanceStatus,
          remark: student.remark || "Not Marked",
          date: date,
          time: time,
          createdAt: serverTimestamp(),
        });
      }

      alert("Attendance saved successfully.");
    } catch (error) {
      console.error("Attendance save error:", error);
      alert("Attendance save nahi ho paayi. Console check karo.");
    }
  }

  if (loading) {
    return (
      <div className="student-page-bg">
        <div className="student-loading-card">Loading teacher subjects...</div>
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
            <p>
              Select a subject. Only students enrolled in that subject will be
              shown.
            </p>

            <span className="student-status-chip">
              Teacher: {teacherName || teacherId}
            </span>
          </div>
        </div>

     <div className="teacher-subject-selector">
  <label className="teacher-subject-label">Select Subject</label>

  <div className="custom-subject-dropdown">
    <button
      type="button"
      className="custom-subject-trigger"
      onClick={() => setSubjectDropdownOpen((prev) => !prev)}
    >
      <span>
        {selectedSubject
          ? `${selectedSubject.subject_name} (${selectedSubject.subject_id})`
          : "Select Subject"}
      </span>

      <span className={subjectDropdownOpen ? "dropdown-arrow open" : "dropdown-arrow"}>
        ▾
      </span>
    </button>

    {subjectDropdownOpen && (
      <div className="custom-subject-menu">
        {subjects.map((subject) => (
          <button
            key={subject.subject_id}
            type="button"
            className={
              selectedSubjectId === subject.subject_id
                ? "custom-subject-option active"
                : "custom-subject-option"
            }
            onClick={() => {
              setSelectedSubjectId(subject.subject_id);
              setSubjectDropdownOpen(false);
            }}
          >
            <span className="subject-option-name">
              {subject.subject_name}
            </span>

            <span className="subject-option-code">
              {subject.subject_id}
            </span>
          </button>
        ))}
      </div>
    )}
  </div>
</div>

        {studentsLoading ? (
          <div className="student-empty">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="student-empty">
            No students found for selected subject.
          </div>
        ) : (
          <>
            <div className="teacher-report-summary">
              <div className="teacher-report-card">
                <h3>Total Students</h3>
                <p>{students.length}</p>
              </div>

              <div className="teacher-report-card success">
                <h3>Present</h3>
                <p>
                  {
                    students.filter(
                      (student) => student.attendanceStatus === "Present"
                    ).length
                  }
                </p>
              </div>

              <div className="teacher-report-card danger">
                <h3>Absent</h3>
                <p>
                  {
                    students.filter(
                      (student) => student.attendanceStatus === "Absent"
                    ).length
                  }
                </p>
              </div>

              <div className="teacher-report-card">
                <h3>Subject</h3>
                <p>{selectedSubjectId}</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="record-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Exam Roll No</th>
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
                            student.remark === "Not marked" ||
                            student.remark === "Not Marked"
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
              Save Attendance
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TeacherMarkAttendance;