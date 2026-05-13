import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FaceDetector() {

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🎥 START CAMERA
  useEffect(() => {

    (async () => {

      try {

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: 640,
            height: 480,
          },
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
        (videoRef.current?.srcObject as MediaStream | null)
          ?.getTracks() || [];

      tracks.forEach((t) => t.stop());
    };

  }, []);

  // 📸 CAPTURE + SEND TO BACKEND
  async function handleMark() {

    if (loading) return;

    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);

    try {

      const video = videoRef.current;
      const canvas = canvasRef.current;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setLoading(false);
        return;
      }

      // ✅ FIXED SMALLER CANVAS SIZE
      canvas.width = 640;
      canvas.height = 480;

      // ✅ DRAW RESIZED FRAME
      ctx.drawImage(video, 0, 0, 640, 480);

      // ✅ COMPRESSED IMAGE
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(
          (b) => resolve(b),
          "image/jpeg",
          0.7
        )
      );

      if (!blob) {

        alert("⚠️ Failed to capture image.");

        setLoading(false);

        return;
      }

      const formData = new FormData();

      formData.append("file", blob, "frame.jpg");

      // ✅ BACKEND REQUEST
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

      // ✅ SMALL DELAY TO PREVENT SPAM
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  }

  return (

    <div className="student-page-bg">

      <div className="student-page-wrapper">

        <button
          className="back-button"
          onClick={() => navigate("/menu")}
        >
          ← Back
        </button>

        <h1 className="student-page-title">
          Face Detection
        </h1>

        <div className="face-layout">

          <div className="face-video-card">

            <video
              ref={videoRef}
              className="face-video"
              autoPlay
              muted
              playsInline
            />

            {/* Hidden canvas */}
            <canvas
              ref={canvasRef}
              style={{ display: "none" }}
            />

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

              {loading
                ? "Processing..."
                : "Mark Attendance"}

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