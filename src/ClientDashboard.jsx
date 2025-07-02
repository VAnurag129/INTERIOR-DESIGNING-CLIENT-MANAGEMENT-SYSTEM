import { useState, useEffect } from "react";
import { useClientData } from "../contexts/ClientDataContext";
import { Link } from "react-router-dom";
import {
  FiFolder,
  FiCalendar,
  FiBarChart2,
  FiClock,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import SummaryCard from "./SummaryCard";
import styles from "./DesignerDashboard.module.css";
import api from "../services/api.js";

function ClientDashboard({ userDetails, userId, role }) {
  const { projects, setProjects, designers, setDesigners } = useClientData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        console.log("userId:", userId, "role:", role);

        if (userId && projects.length === 0) {
          // Fetch data from the API only if context data is empty
          const data = await api.getUserData(userId, role);

          // Filter projects to only show those belonging to this client
          const clientProjects = data.projects;
          const clientDesigners = data.designers;

          // Save data to context
          setProjects(clientProjects);
          setDesigners(clientDesigners);

          console.log("Fetched Client Projects from API:", clientProjects);
          console.log("Fetched Client Designers from API:", clientDesigners);
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching
      }
    };

    fetchClientData();
  }, [userId, role, projects.length, setProjects]);

  // Calculate summary statistics
  const projectCount = projects?.length || 0;
  const activeProjects =
    projects?.filter((project) => project.status === "active").length || 0;
  const upcomingDeadlines =
    projects?.filter(
      (project) =>
        project.status === "active" && project.timeline?.estimated_end
    ).length || 0;
  const monthlyAppointments = 8; // This would be calculated from actual data

  // Filter active projects for display
  const activeProjectsList =
    projects?.filter((project) => project.status === "active").slice(0, 4) ||
    [];

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

  // Calculate progress for project
  const calculateProgress = (project) => {
    if (project.status === "completed") return 100;
    if (project.status === "active") return 60;
    if (project.status === "in_progress") return 30;
    return 0;
  };

  return (
    <>
      <div className={styles.summaryCards}>
        <SummaryCard
          className={styles.card}
          value={projectCount}
          heading={"Total Projects"}
          bgColor={"--projects-bg-color"}
        >
          <FiFolder style={{ color: "var(--projects-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={activeProjects}
          heading={"Active Projects"}
          bgColor={"--clients-bg-color"}
        >
          <FiBarChart2 style={{ color: "var(--clients-color)" }} />
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

      {/* Active Projects Section */}
      <section className="mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0">Active Projects</h2>
          <Link
            to="/client/projects"
            className="btn btn-sm btn-outline-primary d-flex align-items-center"
          >
            View All Projects <FiArrowRight className="ms-2" />
          </Link>
        </div>
        <div className="row g-4">
          {activeProjectsList.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">No active projects found.</div>
            </div>
          ) : (
            activeProjectsList.map((project) => {
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
                          <FaRupeeSign className="text-muted me-2" />
                          <span>${project.budget?.toLocaleString() || 0}</span>
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
                      <Link
                        to={`/client/projects/${project.id}`}
                        className="btn btn-sm btn-outline-primary w-100"
                      >
                        View Details
                      </Link>
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

export default ClientDashboard;
