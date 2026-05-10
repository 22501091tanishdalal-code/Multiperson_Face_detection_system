import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  DocumentReference,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Building2, Hash, BadgeCheck, BookOpen } from "lucide-react";

type Student = {
  student_id: number;
  exam_rollno: number;
  name: string;
  email_id: string;
  department: string;
  year: number;
  status: string;
  subjects: DocumentReference[];
};

type Subject = {
  subject_name: string;
};

export default function StudentPanel() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    async function fetchStudent() {
      if (!studentId) return;

      const q = query(
        collection(db, "students"),
        where("student_id", "==", Number(studentId))
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const studentData = snapshot.docs[0].data() as Student;
        setStudent(studentData);

        const subjectNames: string[] = [];

        for (const ref of studentData.subjects) {
          const snap = await getDoc(ref);
          if (snap.exists()) {
            subjectNames.push((snap.data() as Subject).subject_name);
          }
        }

        setSubjects(subjectNames);
      }
    }

    fetchStudent();
  }, [studentId]);

  if (!student) {
    return (
      <div className="student-page-bg">
        <div className="student-loading-card">Loading student profile...</div>
      </div>
    );
  }

  return (
    <div className="student-page-bg">
      <button
        className="student-back-btn"
        onClick={() => navigate("/menu")}
        type="button"
      >
        ← Back
      </button>

      <div className="student-page-wrapper student-panel-shell">
        <div className="student-profile-hero">
          <div className="student-profile-left">
            <div className="student-avatar student-avatar-premium">
              <GraduationCap size={52} />
            </div>

            <div className="student-hero-text">
              <h1>{student.name}</h1>
              <p>Student profile overview</p>

              <div className="student-status-chip">
                <BadgeCheck size={16} />
                <span>{student.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="student-info-grid">
          <InfoCard
            icon={<Hash size={18} />}
            label="Student ID"
            value={student.student_id}
          />
          <InfoCard
            icon={<Hash size={18} />}
            label="Roll No"
            value={student.exam_rollno}
          />
          <InfoCard
            icon={<Mail size={18} />}
            label="Email"
            value={student.email_id}
          />
          <InfoCard
            icon={<Building2 size={18} />}
            label="Department"
            value={student.department}
          />
          <InfoCard
            icon={<GraduationCap size={18} />}
            label="Year"
            value={student.year}
          />
          <InfoCard
            icon={<BadgeCheck size={18} />}
            label="Status"
            value={student.status}
          />
        </div>

        <div className="student-subjects-card">
          <div className="student-section-title">
            <BookOpen size={18} />
            <h3>Subjects Enrolled</h3>
          </div>

          <div className="student-subjects-list">
            {subjects.length ? (
              subjects.map((subject, index) => (
                <span key={`${subject}-${index}`} className="student-subject-chip">
                  {subject}
                </span>
              ))
            ) : (
              <span className="student-empty-text">No subjects available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="student-info-card">
      <div className="student-info-label">
        <span className="student-info-icon">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="student-info-value">{value}</div>
    </div>
  );
}