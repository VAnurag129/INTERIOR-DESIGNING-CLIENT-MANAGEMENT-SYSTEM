import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import styles from "./Login.module.css";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

function ClientSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setSuccess("");
    try {
      // Only send email and password for signup
      await api.clientSignup({ email, password });
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      // Show specific messages based on backend response
      if (
        err.message === "You are not invited. Contact your designer." ||
        err.message.toLowerCase().includes("not invited")
      ) {
        setError(
          "You are not invited. Please contact your designer to be added."
        );
      } else if (
        err.message === "Account already exists. Please login." ||
        err.message.toLowerCase().includes("already exists")
      ) {
        setError("Account already exists. Please log in instead.");
      } else {
        setError(err.message || "Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div>
          <h2 className={styles.title}>Sign up as a Client</h2>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <div>
              <label htmlFor="name" className={styles.label}>
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className={styles.label}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              <AlertCircle className={styles.errorIcon} />
              {error}
            </div>
          )}
          {success && <div className={styles.success}>{success}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`${styles.button} button`}
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </form>
        <p style={{ marginTop: "1rem" }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default ClientSignup;
