import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HELP_FORM_SENT_KEY = "helpFormSent";

export default function Help() {
  const navigate = useNavigate();

  const [toEmail, setToEmail] = useState("info@lb.du.ac.in");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function clearForm() {
    setToEmail("info@lb.du.ac.in");
    setSubject("");
    setMessage("");
  }

  useEffect(() => {
    const shouldClear = sessionStorage.getItem(HELP_FORM_SENT_KEY);

    if (shouldClear === "true") {
      clearForm();
      sessionStorage.removeItem(HELP_FORM_SENT_KEY);
    }

    function handleWindowFocus() {
      const sentFlag = sessionStorage.getItem(HELP_FORM_SENT_KEY);
      if (sentFlag === "true") {
        clearForm();
        sessionStorage.removeItem(HELP_FORM_SENT_KEY);
      }
    }

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  function handleSend() {
  if (!toEmail.trim() || !subject.trim() || !message.trim()) {
    alert("Please fill To, Subject and Message.");
    return;
  }

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(toEmail)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(message)}`;

  sessionStorage.setItem(HELP_FORM_SENT_KEY, "true");
  window.open(gmailUrl, "_blank", "noopener,noreferrer");
}

 function handleBack() {
  const role = localStorage.getItem("role");

  if (role === "teacher") {
    navigate("/teacher-dashboard");
  } else if (role === "admin") {
    navigate("/admin-dashboard");
  } else {
    navigate("/menu");
  }
}

  return (
    <div className="help-page">
      <button
        className="student-back-btn"
        onClick={handleBack}
        type="button"
      >
        ← Back
      </button>

      <div className="help-header">
        <img
          src="/logo.png"
          alt="Lakshmibai College"
          className="help-logo"
        />

        <div>
          <h1>Lakshmibai College</h1>
          <h1>University of Delhi</h1>
        </div>
      </div>

      <div className="help-card">
        <div className="help-left">
          <h2>Contact Us</h2>

          <p>📍 Ashok Vihar III, Delhi - 110052</p>
          <p>📞 Call : +91-11-27308598</p>
          <p>📠 Fax : +91-11-27304076</p>

          <p><b>Administrative Officer</b></p>
          <p>✉ ao@lb.du.ac.in</p>

          <p><b>S.O. (Admin)</b></p>
          <p>✉ soadmin@lb.du.ac.in</p>

          <p><b>S.O. (Accounts)</b></p>
          <p>✉ soaccounts@lb.du.ac.in</p>

          <p><b>General Support</b></p>
          <p>✉ info@lb.du.ac.in</p>

          <p>🌐 http://lakshmibaicollege.in</p>
        </div>

        <div className="help-right">
          <h2>Send a Message</h2>

        <p style={{
  fontSize: "13px",
  color: "#64748b",
  background: "#f1f5f9",
  padding: "8px 10px",
  borderRadius: "8px",
  marginBottom: "12px"
}}>
  ⚠️ Email will be sent from your currently logged-in Gmail account
</p>
          <div className="help-form-group">
            <label>To</label>
            <input
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="Enter receiver email"
              className="help-input"
            />
          </div>

          <div className="help-form-group">
            <label>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              className="help-input"
            />
          </div>

          <div className="help-form-group">
            <label>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here"
              className="help-textarea"
              rows={6}
            />
          </div>

          <button
            type="button"
            className="help-send-btn"
            onClick={handleSend}
          >
            Send via Gmail
          </button>
        </div>
      </div>
    </div>
  );
}