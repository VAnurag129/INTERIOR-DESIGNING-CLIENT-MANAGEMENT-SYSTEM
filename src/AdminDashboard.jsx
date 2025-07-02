import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAdminData } from "../contexts/AdminDataContext";
import {
  FiUser,
  FiUsers,
  FiShoppingBag,
  FiFolder,
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import SummaryCard from "./SummaryCard";
import styles from "./DesignerDashboard.module.css";
import api from "../services/api.js";

function AdminDashboard({ userDetails, userId, role }) {
  const [loading, setLoading] = useState(true);
  const {
    clients,
    setClients,
    designers,
    setDesigners,
    vendors,
    setVendors,
    projects,
    setProjects,
  } = useAdminData();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        console.log("userId:", userId, "role:", role);

        if (userId) {
          // Fetch data from the API
          const data = await api.getUserData(userId, role);
          const projectsData = await api.getData("projects");

          // Save data to context
          setClients(data.clients || []);
          setDesigners(data.designers || []);
          setVendors(data.vendors || []);
          setProjects(projectsData || []);

          console.log("Fetched Admin Data:", data);
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we don't already have data
    if (
      clients.length === 0 ||
      designers.length === 0 ||
      vendors.length === 0 ||
      projects.length === 0
    ) {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [
    userId,
    role,
    clients.length,
    designers.length,
    vendors.length,
    projects.length,
    setClients,
    setDesigners,
    setVendors,
    setProjects,
  ]);

  // Calculate summary statistics
  const clientCount = clients?.length || 0;
  const designerCount = designers?.length || 0;
  const vendorCount = vendors?.length || 0;
  const projectCount = projects?.length || 0;

  // Filter recent projects
  const recentProjects = projects?.slice(0, 4) || [];

  // Filter recent users (combined clients and designers)
  const recentUsers = [...(clients || []), ...(designers || [])].slice(0, 4);

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
  // const calculateProgress = (project) => {
  //   if (project.status === "completed") return 100;
  //   if (project.status === "active" || project.status === "in_progress")
  //     return 50;
  //   return 10;
  // };

  return (
    <>
      <div className={styles.summaryCards}>
        <SummaryCard
          className={styles.card}
          value={clientCount}
          heading={"Total Clients"}
          bgColor={"--clients-bg-color"}
        >
          <FiUsers style={{ color: "var(--clients-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={designerCount}
          heading={"Total Designers"}
          bgColor={"--deadlines-bg-color"}
        >
          <FiUser style={{ color: "var(--deadlines-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={vendorCount}
          heading={"Total Vendors"}
          bgColor={"--appointments-bg-color"}
        >
          <FiShoppingBag style={{ color: "var(--appointments-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={projectCount}
          heading={"Total Projects"}
          bgColor={"--projects-bg-color"}
        >
          <FiFolder style={{ color: "var(--projects-color)" }} />
        </SummaryCard>
      </div>

      {/* Projects Section */}
      <section className="mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0">Recent Projects</h2>
          <Link
            to="/admin/projects"
            className="btn btn-sm btn-outline-primary d-flex align-items-center"
          >
            View All Projects <FiArrowRight className="ms-2" />
          </Link>
        </div>
        <div className="row g-4">
          {recentProjects.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">No projects found.</div>
            </div>
          ) : (
            recentProjects.map((project) => {
              // const progress = calculateProgress(project);

              return (
                <div key={project.id} className="col-md-6 col-lg-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                      <span className="badge bg-primary">
                        {project.status === "completed"
                          ? "Completed"
                          : "In Progress"}
                      </span>
                      <small className="text-muted">ID: {project.id}</small>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title mb-3">{project.title}</h5>

                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <span className="text-muted me-2">Client ID:</span>
                          <strong>{project.client_id}</strong>
                        </div>

                        <div className="d-flex align-items-center mb-2">
                          <span className="text-muted me-2">Designer ID:</span>
                          <strong>{project.designer_id}</strong>
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

                      {/* <div className="mt-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small>Progress</small>
                          <small>{progress}%</small>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${progress}%` }}
                            aria-valuenow={progress} */}
                      {/* aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Users Section */}
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0">Recent Users</h2>
          <Link
            to="/admin/users"
            className="btn btn-sm btn-outline-primary d-flex align-items-center"
          >
            View All Users <FiArrowRight className="ms-2" />
          </Link>
        </div>

        <div className="row g-4">
          {recentUsers.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">No users found.</div>
            </div>
          ) : (
            recentUsers.map((user) => {
              const isDesigner = user.role === "designer" || user.experience;
              const initials = (user.name || user.contact_person || "User")
                .split(" ")
                .map((name) => name[0])
                .join("")
                .toUpperCase();

              return (
                <div key={user.id} className="col-md-6 col-lg-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: isDesigner ? "#6c5ce7" : "#00cec9",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <h5 className="card-title mb-0">
                            {user.name || user.contact_person || "Unknown"}
                          </h5>
                          <p className="card-subtitle text-muted small">
                            {isDesigner ? "Designer" : "Client"}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <FiMail className="text-muted me-2" />
                          <a
                            href={`mailto:${user.email}`}
                            className="text-decoration-none text-muted"
                          >
                            {user.email}
                          </a>
                        </div>

                        {user.phone && (
                          <div className="d-flex align-items-center mb-2">
                            <FiPhone className="text-muted me-2" />
                            <a
                              href={`tel:${user.phone}`}
                              className="text-decoration-none text-muted"
                            >
                              {user.phone}
                            </a>
                          </div>
                        )}

                        {user.company?.address && (
                          <div className="d-flex align-items-center mb-2">
                            <FiMapPin className="text-muted me-2" />
                            <span className="small text-muted">
                              {user.company.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-footer bg-white border-top-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-light text-dark">
                          ID: {user.id}
                        </span>
                        {/* <button className="btn btn-sm btn-outline-primary">
                          View Details
                        </button> */}
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

export default AdminDashboard;
