import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type RecognizedStudent = {
  student_id: number;
  exam_rollno: number;
  name: string;
  department: string;
  year: number;
  time: string;
  status: "Present";
};

function TeacherFaceMonitor() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [recognizedStudents, setRecognizedStudents] = useState<RecognizedStudent[]>([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Camera access failed. Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  };

  const simulateRecognition = () => {
    const demoStudents: RecognizedStudent[] = [
      {
        student_id: 22501091,
        exam_rollno: 22040501311,
        name: "Tanish Dalal",
        department: "Computer Science",
        year: 4,
        time: new Date().toLocaleTimeString(),
        status: "Present",
      },
      {
        student_id: 22501094,
        exam_rollno: 22040501294,
        name: "Ojasvi",
        department: "Computer Science",
        year: 4,
        time: new Date().toLocaleTimeString(),
        status: "Present",
      },
    ];

    setRecognizedStudents(demoStudents);
    alert("Demo recognition completed. Backend will be connected later.");
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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
            <h1>Face Recognition Monitor</h1>
            <p>
              Start the camera and monitor students marked through face recognition.
            </p>
          </div>
        </div>

        <div className="teacher-face-layout">
          <div className="teacher-camera-card">
            <div className="teacher-camera-header">
              <h3>Live Camera Preview</h3>
              <span className={cameraOn ? "camera-status active" : "camera-status"}>
                {cameraOn ? "Camera Active" : "Camera Off"}
              </span>
            </div>

            <video
              ref={videoRef}
              className="teacher-video"
              autoPlay
              playsInline
              muted
            />

            {!cameraOn && (
              <div className="camera-placeholder">
                Camera preview will appear here after starting camera.
              </div>
            )}

            <div className="teacher-camera-actions">
              <button className="primary-btn" type="button" onClick={startCamera}>
                Start Camera
              </button>

              <button
                className="danger-btn"
                type="button"
                onClick={stopCamera}
              >
                Stop Camera
              </button>

              <button
                className="secondary-btn"
                type="button"
                onClick={simulateRecognition}
              >
                Simulate Recognition
              </button>
            </div>
          </div>

          <div className="teacher-monitor-card">
            <h3>Today’s Recognition Summary</h3>

            <div className="teacher-monitor-stat">
              <span>Recognized Students</span>
              <strong>{recognizedStudents.length}</strong>
            </div>

            <div className="teacher-monitor-stat">
              <span>Status</span>
              <strong>{cameraOn ? "Monitoring" : "Not Started"}</strong>
            </div>

            <p className="hint">
              Backend recognition API will later replace the demo recognition button.
            </p>
          </div>
        </div>

        <div className="teacher-recognition-section">
          <h3>Recognized Students Today</h3>

          {recognizedStudents.length === 0 ? (
            <div className="student-empty">
              No students recognized yet. Start camera and run recognition.
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
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recognizedStudents.map((student) => (
                    <tr key={student.student_id}>
                      <td>{student.student_id}</td>
                      <td>{student.exam_rollno}</td>
                      <td>{student.name}</td>
                      <td>{student.department}</td>
                      <td>{student.year}</td>
                      <td>{student.time}</td>
                      <td style={{ color: "#86efac", fontWeight: "bold" }}>
                        {student.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherFaceMonitor;