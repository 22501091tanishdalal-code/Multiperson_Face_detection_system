
// src/pages/FaceDetector.tsx

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FaceDetector() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        setError("Camera access failed. Please allow permission.");
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

    setLoading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to image blob
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), "image/jpeg")
    );

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    try {
      const res = await fetch("http://localhost:8001/recognize", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Backend result:", data);

      if (!data.faces || data.faces.length === 0) {
        alert("❌ No face detected");
        return;
      }

      const face = data.faces[0];

      if (face.status === "recognized") {
        alert(`✅ ${face.name} marked present`);
      } else {
        alert("❌ Face not recognized");
      }
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

        {error && <p className="error-text">{error}</p>}

        <div className="face-layout">
          <div className="face-video-card">
            <video
              ref={videoRef}
              className="face-video"
              autoPlay
              muted
              playsInline
            />

            {/* Hidden canvas for capturing frame */}
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
