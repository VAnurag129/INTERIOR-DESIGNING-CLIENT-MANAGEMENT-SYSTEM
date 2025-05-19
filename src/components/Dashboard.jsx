import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";

import "bootstrap/dist/css/bootstrap.min.css";
import DesignerDashboard from "./DesignerDashboard.jsx";
import ClientDashboard from "./ClientDashboard.jsx";

function Dashboard({ username, role, userId, userDetails }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerTitle}>
          <h1>Dashboard</h1>
          <p>
            Welcome back, {username}! Here's an overview of your{" "}
            {role === "client" ? "projects" : "projects and clients"}.
          </p>
        </div>
      </header>
      {role === "designer" && (
        <DesignerDashboard
          userDetails={userDetails}
          userId={userId}
          role={role}
        />
      )}
      {role === "client" && (
        <ClientDashboard
          userDetails={userDetails}
          userId={userId}
          role={role}
        />
      )}
    </div>
  );
}

export default Dashboard;
