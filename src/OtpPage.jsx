import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Shield, AlertCircle } from "lucide-react";
import styles from "./OtpPage.module.css";

function OtpPage({ onOtpSuccess }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, userId, role, sessionId } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5005/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, code: otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (onOtpSuccess) onOtpSuccess();
        navigate(`/${role}/dashboard`);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.title}>Enter OTP</div>
        <p className={styles.subtitle}>
          {email
            ? `OTP sent to ${email}`
            : "Please enter the OTP sent to your email."}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="otp" className={styles.label}>
              OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={styles.input}
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={otp.length !== 6 || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OtpPage;
