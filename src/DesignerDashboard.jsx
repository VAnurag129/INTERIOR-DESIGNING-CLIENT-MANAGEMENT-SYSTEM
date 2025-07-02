import { useState, useEffect } from "react";
import { useDesignerData } from "../contexts/DesignerDataContext";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPlus,
  FiUsers,
  FiCalendar,
  FiBarChart2,
  FiClock,
  FiFolder,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import SummaryCard from "./SummaryCard";
import styles from "./DesignerDashboard.module.css";
import api from "../services/api.js";

function DesignerDashboard({ userDetails, userId, role }) {
  const { projects, setProjects, clients, setClients } = useDesignerData();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDesignerData = async () => {
      try {
        setLoading(true);
        console.log("userId:", userId, "role:", role);

        if (userId && projects.length === 0 && clients.length === 0) {
          // Fetch data from the API only if context data is empty
          const data = await api.getUserData(userId, role);

          // Save data to context
          setProjects(data.projects);
          setClients(data.clients);

          console.log("Fetched Projects from API:", data.projects);
          console.log("Fetched Clients from API:", data.clients);
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching
      }
    };

    fetchDesignerData();
  }, [userId, role, projects.length, clients.length, setProjects, setClients]);

  // Calculate summary statistics
  const projectCount = projects?.length || 0;
  const clientCount = clients?.length || 0;

  // --- Dynamic Upcoming Deadlines (next 30 days) ---
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  const upcomingDeadlines =
    projects?.filter(
      (project) =>
        project.status === "active" &&
        project.timeline?.estimated_end &&
        new Date(project.timeline.estimated_end) >= now &&
        new Date(project.timeline.estimated_end) <= in30Days
    ).length || 0;

  // --- Dynamic Monthly Appointments ---
  // Assumes each project has an array: project.appointments = [{ date: "YYYY-MM-DD", ... }]
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyAppointments =
    projects
      ?.flatMap((project) => project.appointments || [])
      .filter((appt) => {
        if (!appt.date) return false;
        const date = new Date(appt.date);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      }).length || 0;

  // Filter active projects
  const activeProjects =
    projects?.filter((project) => project.status === "active").slice(0, 4) ||
    [];
  // Filter recent clients
  const recentClients = clients?.slice(0, 4) || [];

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to get client name
  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  // Calculate progress for project
  const calculateProgress = (project) => {
    // Use project.progress if it exists, otherwise fallback to status-based logic
    if (typeof project.progress === "number") return project.progress;
    if (project.status === "completed") return 100;
    if (project.status === "in_progress" || project.status === "active")
      return 30; // Mock value if no progress field
    return 0;
  };

  // Handler for viewing project details
  const handleViewProjectDetails = (project) => {
    navigate("/designer/projects", {
      state: { projectId: project.id },
    });
  };

  // Handler for viewing client details
  const handleViewClientDetails = (client) => {
    navigate("/designer/clients", {
      state: { clientId: client.id },
    });
  };

  return (
    <>
      <div className={styles.summaryCards}>
        <SummaryCard
          className={styles.card}
          value={projectCount}
          heading={"Projects"}
          bgColor={"--projects-bg-color"}
        >
          <FiBarChart2 style={{ color: "var(--projects-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={clientCount}
          heading={"Clients"}
          bgColor={"--clients-bg-color"}
        >
          <FiUsers style={{ color: "var(--clients-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={upcomingDeadlines}
          heading={"Upcoming Deadlines"}
          bgColor={"--deadlines-bg-color"}
        >
          <FiCalendar style={{ color: "var(--deadlines-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={monthlyAppointments}
          heading={"Monthly Appointments"}
          bgColor={"--appointments-bg-color"}
        >
          <FiClock style={{ color: "var(--appointments-color)" }} />
        </SummaryCard>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          className={styles.newProjectBtn}
          onClick={() =>
            navigate("/designer/projects", { state: { openAddModal: true } })
          }
        >
          <FiPlus />
          New Project
        </button>
        <button
          className={styles.addClientBtn}
          onClick={() =>
            navigate("/designer/clients", { state: { openAddModal: true } })
          }
        >
          <FiUser />
          Add Client
        </button>
      </div>

      {/* Active Projects Section */}
      <section className="mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0">Active Projects</h2>
          <Link
            to="/designer/projects"
            className="btn btn-sm btn-outline-primary d-flex align-items-center"
          >
            View All Projects <FiArrowRight className="ms-2" />
          </Link>
        </div>
        <div className="row g-4">
          {activeProjects.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">No active projects found.</div>
            </div>
          ) : (
            activeProjects.map((project) => {
              const progress = calculateProgress(project);

              return (
                <div key={project.id} className="col-md-6 col-lg-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                      <span className="badge bg-primary">In Progress</span>
                      <small className="text-muted">ID: {project.id}</small>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title mb-3">{project.title}</h5>

                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <span className="text-muted me-2">Client:</span>
                          <strong>{getClientName(project.client_id)}</strong>
                        </div>

                        <div className="d-flex align-items-center mb-2">
                          <FaRupeeSign className="text-muted me-2" />
                          <span>₹{project.budget?.toLocaleString() || 0}</span>
                        </div>

                        <div className="d-flex align-items-center mb-2">
                          <FiCalendar className="text-muted me-2" />
                          <span>{formatDate(project.timeline?.start)}</span>
                        </div>

                        {project.timeline?.estimated_end && (
                          <div className="d-flex align-items-center">
                            <FiClock className="text-muted me-2" />
                            <span>
                              Due: {formatDate(project.timeline.estimated_end)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small>Progress</small>
                          <small>{progress}%</small>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${progress}%` }}
                            aria-valuenow={progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer bg-white border-top-0">
                      <button
                        onClick={() => handleViewProjectDetails(project)}
                        className="btn btn-sm btn-outline-primary w-100"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Active Clients Section */}
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0">Recent Clients</h2>
          <Link
            to="/designer/clients"
            className="btn btn-sm btn-outline-primary d-flex align-items-center"
          >
            View All Clients <FiArrowRight className="ms-2" />
          </Link>
        </div>

        <div className="row g-4">
          {clients.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">No clients found.</div>
            </div>
          ) : (
            recentClients.map((client) => {
              const initials = client.contact_person
                .split(" ")
                .map((name) => name[0])
                .join("")
                .toUpperCase();

              const projectCount = client.projects ? client.projects.length : 0;

              return (
                <div key={client.id} className="col-md-6 col-lg-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: "#6c5ce7",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <h5 className="card-title mb-0">{client.name}</h5>
                          <p className="card-subtitle text-muted small">
                            {client.company?.name || ""}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <FiMail className="text-muted me-2" />
                          <a
                            href={`mailto:${client.email}`}
                            className="text-decoration-none text-muted"
                          >
                            {client.email}
                          </a>
                        </div>

                        {client.phone && (
                          <div className="d-flex align-items-center mb-2">
                            <FiPhone className="text-muted me-2" />
                            <a
                              href={`tel:${client.phone}`}
                              className="text-decoration-none text-muted"
                            >
                              {client.phone}
                            </a>
                          </div>
                        )}

                        {client.company?.address && (
                          <div className="d-flex align-items-center mb-2">
                            <FiMapPin className="text-muted me-2" />
                            <span className="small text-muted">
                              {client.company.address}
                            </span>
                          </div>
                        )}

                        <div className="d-flex align-items-center">
                          <FiFolder className="text-muted me-2" />
                          <span className="small text-muted">
                            {projectCount} Project
                            {projectCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer bg-white border-top-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-light text-dark">
                          ₹{client.total_spend?.toLocaleString() || 0}
                        </span>
                        <button
                          onClick={() => handleViewClientDetails(client)}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}

export default DesignerDashboard;
