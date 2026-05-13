// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import StudentPanel from "./pages/StudentPanel";
import FaceDetector from "./pages/FaceDetector";
import Help from "./pages/Help";
import ProtectedRoute from "./components/ProtectedRoute";
import TeacherDashboard from "./teacher/TeacherDashboard";
import TeacherAttendance from "./teacher/TeacherAttendance";
import TeacherMarkAttendance from "./teacher/TeacherMarkAttendance";
import TeacherReports from "./teacher/TeacherReports";

import TeacherAlerts from "./teacher/TeacherAlerts";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* MENU */}
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />

        {/* STUDENT PANEL */}
        <Route
          path="/student-panel"
          element={
            <ProtectedRoute>
              <StudentPanel />
            </ProtectedRoute>
          }
        />

        {/* FACE DETECTOR */}
        <Route
          path="/face-detector"
          element={
            <ProtectedRoute>
              <FaceDetector />
            </ProtectedRoute>
          }
        />

        {/* HELP PAGE ✅ */}
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />
        <Route
  path="/teacher-dashboard"
  element={
    <ProtectedRoute>
      <TeacherDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/attendance"
  element={
    <ProtectedRoute>
      <TeacherAttendance />
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/mark-attendance"
  element={
    <ProtectedRoute>
      <TeacherMarkAttendance />
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/reports"
  element={
    <ProtectedRoute>
      <TeacherReports />
    </ProtectedRoute>
  }
/>



<Route
  path="/teacher/alerts"
  element={
    <ProtectedRoute>
      <TeacherAlerts />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

