import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import { FiCalendar, FiClock, FiUser } from "react-icons/fi";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Projects.module.css";
import { useClientData } from "../contexts/ClientDataContext";
import ProjectDetails from "./ProjectDetails";

function ClientProjects({ username, role, userId }) {
  const { projects, designers, setProjects } = useClientData();
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const fetchClientProjects = async () => {
      try {
        setLoading(true);
        if (userId && projects.length === 0) {
          const data = await api.getUserData(userId, role);
          const clientProjects = data.projects.filter(
            (project) => project.client_id === userId
          );
          setProjects(clientProjects);
        }
      } catch (error) {
        console.error("Error fetching client projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientProjects();
  }, [userId, role, projects.length, setProjects]);

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "active":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "active":
        return "In Progress";
      default:
        return "Pending";
    }
  };

  const getDesignerName = (designerId) => {
    const designer = designers.find((d) => d.id === designerId);
    return designer ? designer.name : "Unassigned Designer";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="alert alert-info m-3">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="alert alert-info m-3">
        No projects found for your account.
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-0">My Projects</h1>
      <p className="text-muted">
        Track the progress of your interior design projects
      </p>
      <div className="row g-4">
        {projects.map((project) => {
          const progress =
            project.status === "completed"
              ? 100
              : project.status === "active"
              ? 60
              : 0;
          return (
            <div key={project.id} className="col-md-6 col-lg-4">
              <div className={`card h-100 shadow-sm ${styles.projectCard}`}>
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span
                    className={`badge ${getStatusBadgeClass(project.status)}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                  <small className="text-muted">
                    Project #{project.id.substring(0, 8)}
                  </small>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">{project.title}</h5>
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FiUser className="text-muted me-2" />
                      <span>
                        <strong>{getDesignerName(project.designer_id)}</strong>
                      </span>
                    </div>
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
                  {project.status !== "pending" && (
                    <div className={styles.progressWrapper}>
                      <div className="d-flex justify-content-between mb-1">
                        <small>Progress</small>
                        <small>{progress}%</small>
                      </div>
                      <div className="progress" style={{ height: "6px" }}>
                        <div
                          className={`progress-bar ${
                            project.status === "completed"
                              ? "bg-success"
                              : "bg-primary"
                          }`}
                          role="progressbar"
                          style={{ width: `${progress}%` }}
                          aria-valuenow={progress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-white border-top-0">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => handleViewDetails(project)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          show={showDetailsModal}
          onClose={handleCloseDetails}
          isClientView={true}
        />
      )}
    </div>
  );
}

export default ClientProjects;
