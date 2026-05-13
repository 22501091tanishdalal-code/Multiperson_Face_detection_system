import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function FaceDetector() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🎥 Start Camera
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("⚠️ Camera permission denied or camera not available.");
      }
    })();

    return () => {
      const tracks =
        (videoRef.current?.srcObject as MediaStream | null)?.getTracks() || [];

      tracks.forEach((t) => t.stop());
    };
  }, []);

  // 📸 Capture + Send to Backend
  async function handleMark() {
    if (!videoRef.current || !canvasRef.current) return;

    const loggedInStudentId = localStorage.getItem("studentId");

    if (!loggedInStudentId) {
      alert("Student login data not found. Please login again.");
      navigate("/");
      return;
    }

    setLoading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setLoading(false);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg")
    );

    if (!blob) {
      alert("⚠️ Failed to capture image.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    try {
     const res = await fetch("http://localhost:8001/recognize", {
  method: "POST",
  body: formData,
});

if (!res.ok) {
  const errorText = await res.text();
  console.error("Backend HTTP error:", res.status, errorText);
  alert(`Backend error: ${res.status}. Check backend terminal.`);
  return;
}

const data = await res.json();
console.log("Backend result:", data);

      if (!data.faces || data.faces.length === 0) {
        alert("❌ No face detected");
        return;
      }

      const face = data.faces[0];

      if (face.status !== "recognized") {
        alert("❌ Face not recognized");
        return;
      }

      // Logged-in student details from Firebase
      const studentQuery = query(
        collection(db, "students"),
        where("student_id", "==", Number(loggedInStudentId))
      );

      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        alert(
          "Student record not found in Firebase. Please check students collection and student_id field."
        );
        return;
      }

      const studentData = studentSnapshot.docs[0].data();

      const firebaseStudentName =
        studentData.name ||
        studentData.student_name ||
        studentData.fullName ||
        "";

      // Safety check: attendance sirf logged-in student ki lage
      if (
        face.student_id &&
        Number(face.student_id) !== Number(loggedInStudentId)
      ) {
        alert("❌ This face does not match the logged-in student.");
        return;
      }

      // Agar backend student_id nahi bhej raha, to name se check hoga
      if (
        !face.student_id &&
        face.name &&
        firebaseStudentName &&
        String(face.name).toLowerCase().trim() !==
          String(firebaseStudentName).toLowerCase().trim()
      ) {
        alert("❌ Recognized face does not match the logged-in student.");
        return;
      }

      const subject = prompt("Enter subject name:");

      if (!subject || subject.trim() === "") {
        alert("Subject name required.");
        return;
      }

      const teacherName = prompt("Enter teacher name:");

      if (!teacherName || teacherName.trim() === "") {
        alert("Teacher name required.");
        return;
      }

      const now = new Date();

      const date = now.toLocaleDateString("en-CA");

      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      await addDoc(collection(db, "attendance"), {
        student_id: Number(loggedInStudentId),
        student_name: firebaseStudentName || face.name || "",
        subject: subject.trim(),
        teacher_name: teacherName.trim(),
        status: "Present",
        date: date,
        time: time,
        createdAt: now,
      });

      alert(`✅ ${firebaseStudentName || face.name} marked present`);
    } catch (err) {
      console.error(err);
      alert("⚠️ Server error. Is backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="student-page-bg">
      <div className="student-page-wrapper">
        <button className="back-button" onClick={() => navigate("/menu")}>
          ← Back
        </button>

        <h1 className="student-page-title">Face Detection</h1>

        <div className="face-layout">
          <div className="face-video-card">
            <video
              ref={videoRef}
              className="face-video"
              autoPlay
              muted
              playsInline
            />

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <p className="hint">
              Align your face properly before marking attendance.
            </p>
          </div>

          <div className="face-side-card">
            <button
              className="primary-btn"
              onClick={handleMark}
              disabled={loading}
            >
              {loading ? "Processing..." : "Mark Attendance"}
            </button>

            <p className="hint">
              Attendance will be marked using face recognition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
