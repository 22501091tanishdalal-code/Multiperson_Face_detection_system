import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Login() {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

async function handleLogin(e: React.FormEvent) {
  e.preventDefault();

  const numericStudentId = parseInt(studentId, 10);

  if (isNaN(numericStudentId)) {
    alert("Invalid Student ID");
    return;
  }

  try {
    const q = query(
      collection(db, "students"),
      where("student_id", "==", numericStudentId) 
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("Student ID not found");
      return;
    }

    const studentData = snapshot.docs[0].data();

    if (studentData.password === password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("studentId", numericStudentId.toString());
      localStorage.setItem("studentEmail", studentData.email_id); 
      navigate("/menu");
    } else {
      alert("Incorrect password");
    }

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    alert("Login failed. Check console.");
  }
}


  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleLogin}>
        <img
  src="/logo-no-bg.png"
  alt="College Logo-no-bg"
  className="login-logo"
/>

        <h2>ATTENDIFY LOGIN</h2>

        <div className="login-field">
          <label>Student ID</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
        </div>

        <div className="login-field">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁️‍🗨️
            </span>
          </div>
        </div>

        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
}