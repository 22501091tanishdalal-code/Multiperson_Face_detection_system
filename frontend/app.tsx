import { BrowserRouter, Routes, Route } from "react-router-dom";
import FaceDetector from "./pages/FaceDetector";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/face" element={<FaceDetector />} />
      </Routes>
    </BrowserRouter>
  );
}
