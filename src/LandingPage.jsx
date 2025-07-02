import React from "react";
import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";

function LandingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to Interiora</h1>
        {/* <p className={styles.description}>
          A simple React application with role-based authentication.
        </p> */}
        <Link to="/login" className={styles.button}>
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
