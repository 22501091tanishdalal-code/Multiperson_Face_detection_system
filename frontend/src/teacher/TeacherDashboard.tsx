import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

import {
  ClipboardList,
  UserCheck,
  AlertTriangle,
  HelpCircle,
  LogOut,
} from "lucide-react";

function TeacherDashboard() {
  const navigate = useNavigate();
  const teacherName = localStorage.getItem("teacherName") || "Teacher";

    const [totalStudents, setTotalStudents] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);

    useEffect(() => {
    async function loadDashboardStats() {
      try {
        const studentSnapshot = await getDocs(collection(db, "students"));
        const total = studentSnapshot.size;

        setTotalStudents(total);

        const savedAttendance = localStorage.getItem("teacherAttendanceData");

        if (savedAttendance) {
          const attendanceData = JSON.parse(savedAttendance);

          const presentCount = attendanceData.filter(
            (student: any) => student.attendanceStatus === "Present"
          ).length;

          const absentCount = attendanceData.filter(
            (student: any) => student.attendanceStatus === "Absent"
          ).length;

          setPresentToday(presentCount);
          setAbsentToday(absentCount);

          if (attendanceData.length > 0) {
            setAverageAttendance(
              Math.round((presentCount / attendanceData.length) * 100)
            );
          }
        } else {
          setPresentToday(0);
          setAbsentToday(total);
          setAverageAttendance(0);
        }
      } catch (error) {
        console.error("Dashboard stats error:", error);
      }
    }

    loadDashboardStats();
  }, []);

const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("role");
  localStorage.removeItem("teacherId");
  localStorage.removeItem("studentId");
  localStorage.removeItem("studentEmail");
  localStorage.removeItem("teacherName");

  navigate("/", { replace: true });
};

  return (
    <div className="menu-bg">
      <div className="menu-container">
        <div className="menu-header">
          <h1>{teacherName} Dashboard</h1>
          <p>Manage attendance, monitor students, and generate class reports.</p>
        </div>

        <div className="teacher-stats-grid">
          <div className="teacher-stat-card">
            <h3>Total Students</h3>
            <p>{totalStudents}</p>
          </div>

          <div className="teacher-stat-card">
            <h3>Present Today</h3>
            <p>{presentToday}</p>
          </div>

          <div className="teacher-stat-card">
            <h3>Absent Today</h3>
            <p>{absentToday}</p>
          </div>

          <div className="teacher-stat-card">
            <h3>Average Attendance</h3>
           <p>{averageAttendance}%</p>
          </div>
        </div>

        <div className="teacher-menu-grid">
          <button className="menu-card" onClick={() => navigate("/teacher/attendance")}>
            <div>
              <div className="menu-icon">
                <ClipboardList size={30} />
              </div>
              <h3>Attendance Records</h3>
              <p>View class-wise and subject-wise attendance records.</p>
            </div>
          </button>

          <button className="menu-card" onClick={() => navigate("/teacher/mark-attendance")}>
            <div>
              <div className="menu-icon">
                <UserCheck size={30} />
              </div>
              <h3>Mark Attendance</h3>
              <p>Manually mark or correct student attendance.</p>
            </div>
          </button>

          

          <button className="menu-card" onClick={() => navigate("/teacher/alerts")}>
            <div>
              <div className="menu-icon">
                <AlertTriangle size={30} />
              </div>
              <h3>Low Attendance Alerts</h3>
              <p>Check students whose attendance is below the required percentage.</p>
            </div>
          </button>

         

          <button className="menu-card" onClick={() => navigate("/help")}>
            <div>
              <div className="menu-icon">
                <HelpCircle size={30} />
              </div>
              <h3>Help & Support</h3>
              <p>Get help related to attendance and face recognition.</p>
            </div>
          </button>

          <button className="menu-card" onClick={handleLogout}>
            <div>
              <div className="menu-icon">
                <LogOut size={30} />
              </div>
              <h3>Logout</h3>
              <p>Logout from teacher dashboard.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;