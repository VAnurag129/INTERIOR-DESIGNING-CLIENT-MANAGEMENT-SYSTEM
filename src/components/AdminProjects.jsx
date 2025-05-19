import { useState, useEffect } from "react";
import { useAdminData } from "../contexts/AdminDataContext";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";
import styles from "./Projects.module.css";
import api from "../services/api.js";

function AdminProjects({ userId, role }) {
  const [loading, setLoading] = useState(true);
  const {
    clients,
    setClients,
    designers,
    setDesigners,
    projects,
    setProjects,
  } = useAdminData();
  const [displayedProjects, setDisplayedProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const projectsPerPage = 10;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        // Fetch data from API
        const projectsData = await api.getData("projects");
        const data = await api.getUserData(userId, role);

        // Save data to context
        setProjects(projectsData || []);
        setClients(data.clients || []);
        setDesigners(data.designers || []);

        // Process projects for display
        processProjects(
          projectsData,
          data.clients,
          data.designers,
          searchTerm,
          statusFilter
        );
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we don't already have data
    if (
      projects.length === 0 ||
      clients.length === 0 ||
      designers.length === 0
    ) {
      fetchProjects();
    } else {
      setLoading(false);
      processProjects(projects, clients, designers, searchTerm, statusFilter);
    }
  }, [
    userId,
    role,
    projects.length,
    clients.length,
    designers.length,
    setProjects,
    setClients,
    setDesigners,
  ]);

  // Process and filter projects whenever searchTerm or statusFilter changes
  useEffect(() => {
    processProjects(projects, clients, designers, searchTerm, statusFilter);
  }, [searchTerm, statusFilter, projects, clients, designers]);

  const processProjects = (
    allProjects,
    allClients,
    allDesigners,
    search,
    filter
  ) => {
    let filtered = [...allProjects];

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((project) => project.status === filter);
    }

    // Apply search filter
    if (search) {
      const lowercaseSearch = search.toLowerCase();
      filtered = filtered.filter((project) => {
        const clientName = getClientName(project.client_id, allClients);
        const designerName = getDesignerName(project.designer_id, allDesigners);

        return (
          project.title.toLowerCase().includes(lowercaseSearch) ||
          (project.description &&
            project.description.toLowerCase().includes(lowercaseSearch)) ||
          clientName.toLowerCase().includes(lowercaseSearch) ||
          designerName.toLowerCase().includes(lowercaseSearch) ||
          (project.id && project.id.toString().includes(lowercaseSearch))
        );
      });
    }

    // Calculate pagination
    const totalResults = filtered.length;
    const calculatedTotalPages = Math.ceil(totalResults / projectsPerPage);
    setTotalPages(calculatedTotalPages || 1);

    // Adjust current page if needed
    if (currentPage > calculatedTotalPages) {
      setCurrentPage(1);
    }

    // Get projects for current page
    const startIndex = (currentPage - 1) * projectsPerPage;
    const paginatedProjects = filtered.slice(
      startIndex,
      startIndex + projectsPerPage
    );

    setDisplayedProjects(paginatedProjects);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

    // Recalculate displayed projects for the new page
    let filtered = [...projects];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((project) => {
        const clientName = getClientName(project.client_id, clients);
        const designerName = getDesignerName(project.designer_id, designers);

        return (
          project.title.toLowerCase().includes(lowercaseSearch) ||
          (project.description &&
            project.description.toLowerCase().includes(lowercaseSearch)) ||
          clientName.toLowerCase().includes(lowercaseSearch) ||
          designerName.toLowerCase().includes(lowercaseSearch) ||
          (project.id && project.id.toString().includes(lowercaseSearch))
        );
      });
    }

    // Get projects for new page
    const startIndex = (newPage - 1) * projectsPerPage;
    const paginatedProjects = filtered.slice(
      startIndex,
      startIndex + projectsPerPage
    );

    setDisplayedProjects(paginatedProjects);
  };

  // Helper function to get client name
  const getClientName = (clientId, allClients) => {
    const client = allClients.find((c) => c.id === clientId);
    return client
      ? client.name || client.contact_person || "Unknown Client"
      : "Unknown Client";
  };

  // Helper function to get designer name
  const getDesignerName = (designerId, allDesigners) => {
    const designer = allDesigners.find((d) => d.id === designerId);
    return designer ? designer.name || "Unknown Designer" : "Unknown Designer";
  };

  // Helper function for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-success";
      case "active":
      case "in_progress":
        return "bg-primary";
      case "pending":
        return "bg-warning";
      case "cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading projects...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-4">Project Management</h1>

      {/* Filters and Search Bar */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="btn-group" role="group">
            <button
              className={`btn ${
                statusFilter === "all" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setStatusFilter("all")}
            >
              All Projects
            </button>
            <button
              className={`btn ${
                statusFilter === "active"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setStatusFilter("active")}
            >
              Active
            </button>
            <button
              className={`btn ${
                statusFilter === "completed"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </button>
            <button
              className={`btn ${
                statusFilter === "pending"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <FiSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Project Title</th>
                <th>Client</th>
                <th>Designer</th>
                <th>Status</th>
                <th>Budget</th>
                <th>Start Date</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedProjects.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No projects found
                  </td>
                </tr>
              ) : (
                displayedProjects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.id}</td>
                    <td className="fw-medium">{project.title}</td>
                    <td>{getClientName(project.client_id, clients)}</td>
                    <td>{getDesignerName(project.designer_id, designers)}</td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(
                          project.status
                        )}`}
                      >
                        {project.status
                          ?.replace("_", " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FiDollarSign className="text-muted me-1" size={14} />
                        <span>{project.budget?.toLocaleString() || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FiCalendar className="text-muted me-1" size={14} />
                        <span>{formatDate(project.timeline?.start)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FiClock className="text-muted me-1" size={14} />
                        <span>
                          {formatDate(project.timeline?.estimated_end)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-info"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Edit Project"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete Project"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer d-flex justify-content-center">
            <nav>
              <ul className="pagination mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>

                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProjects;
