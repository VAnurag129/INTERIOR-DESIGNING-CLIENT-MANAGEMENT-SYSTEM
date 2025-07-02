import React, { useState, useEffect, useRef } from "react";
import api from "../services/api.js";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFolder,
  FiPlus,
  FiCalendar,
  FiClock,
  FiFileText,
  FiX,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./Clients.module.css";
import { useDesignerData } from "../contexts/DesignerDataContext";
import { Modal, Button, Form, Tab, Tabs } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

function Clients({ username, role, userId }) {
  const { clients, setClients, projects } = useDesignerData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const hasHandledLocationState = useRef(false);

  // State for the new client form
  const [newClient, setNewClient] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    company: {
      name: "",
      address: "",
    },
    projects: [],
    total_spend: 0,
  });

  // Check if there's a client ID in the location state and open the modal
  useEffect(() => {
    if (!hasHandledLocationState.current) {
      if (location.state?.clientId && clients.length > 0) {
        const client = clients.find(
          (c) => c && c.id === location.state.clientId
        );
        if (client) {
          setSelectedClient(client);
          setShowDetailsModal(true);
          hasHandledLocationState.current = true;
          navigate(location.pathname, { replace: true });
        }
      }

      if (location.state?.openAddModal) {
        setShowAddModal(true);
        hasHandledLocationState.current = true;
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location, clients, navigate]);

  // Function to handle opening client details
  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  // Function to handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setNewClient({
        ...newClient,
        [parent]: {
          ...newClient[parent],
          [child]: value,
        },
      });
    } else {
      setNewClient({
        ...newClient,
        [name]: value,
      });
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format total_spend as a number and add designer_id
      const formattedClient = {
        ...newClient,
        total_spend: parseFloat(newClient.total_spend),
        designer_id: userId, // <-- Add the designer's id here
      };

      // Add client to API
      const response = await api.addClient(formattedClient);

      // Defensive: only add if response is valid and has a name
      if (response && response.name) {
        setClients([...clients, response]);
      }

      // Close modal and reset form
      setShowAddModal(false);
      setNewClient({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        company: {
          name: "",
          address: "",
        },
        projects: [],
        total_spend: 0,
      });
    } catch (error) {
      console.error("Error adding client:", error);
      // Here you would typically show an error message to the user
    }
  };

  if (clients.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col">
            <h1 className="mb-0">Clients</h1>
            <p className="text-muted">Manage your client relationships</p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <FiUser className="me-2" />
              Add New Client
            </button>
          </div>
        </div>
        <div className="alert alert-info m-3">No clients found.</div>

        {/* Add Client Modal */}
        <AddClientModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          newClient={newClient}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="mb-0">Clients</h1>
          <p className="text-muted">Manage your client relationships</p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <FiUser className="me-2" />
            Add New Client
          </button>
        </div>
      </div>

      <div className="row g-4">
        {clients.map((client, idx) => {
          if (!client) return null; // Defensive: skip undefined/null clients
          const initials = client.name
            ? client.name
                .split(" ")
                .map((name) => name[0])
                .join("")
                .toUpperCase()
            : "";

          const projectCount = client.projects ? client.projects.length : 0;

          return (
            <div key={client.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className={`card h-100 shadow-sm ${styles.clientCard}`}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className={`${styles.avatar} me-3`}>
                      {client.avatar ? (
                        <img
                          src={client.avatar}
                          alt={client.name}
                          className="rounded-circle"
                        />
                      ) : (
                        <div className={styles.initialsAvatar}>{initials}</div>
                      )}
                    </div>
                    <div>
                      <h5 className="card-title mb-0">
                        #{idx + 1} {client.name}
                      </h5>
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
                        className={styles.contactLink}
                      >
                        {client.email}
                      </a>
                    </div>

                    {client.phone && (
                      <div className="d-flex align-items-center mb-2">
                        <FiPhone className="text-muted me-2" />
                        <a
                          href={`tel:${client.phone}`}
                          className={styles.contactLink}
                        >
                          {client.phone}
                        </a>
                      </div>
                    )}

                    {client.company?.address && (
                      <div className="d-flex align-items-center mb-2">
                        <FiMapPin className="text-muted me-2" />
                        <span className="small">{client.company.address}</span>
                      </div>
                    )}

                    <div className="d-flex align-items-center">
                      <FiFolder className="text-muted me-2" />
                      <span className="small">
                        {projectCount} Project{projectCount !== 1 ? "s" : ""}
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
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleViewDetails(client)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Client Modal */}
      <AddClientModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        newClient={newClient}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />

      {/* Client Details Modal */}
      {selectedClient && (
        <ClientDetailsModal
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
          client={selectedClient}
          clientProjects={projects.filter(
            (project) => project.client_id === selectedClient.id
          )}
        />
      )}
    </div>
  );
}

// Component for the Add Client Modal
function AddClientModal({
  show,
  onHide,
  newClient,
  handleInputChange,
  handleSubmit,
}) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Client</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Client/Company Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={newClient.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contact Person</Form.Label>
            <Form.Control
              type="text"
              name="contact_person"
              value={newClient.contact_person}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={newClient.email}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={newClient.phone}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Company Name</Form.Label>
            <Form.Control
              type="text"
              name="company.name"
              value={newClient.company.name}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Company Address</Form.Label>
            <Form.Control
              type="text"
              name="company.address"
              value={newClient.company.address}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Total Spend ($)</Form.Label>
            <Form.Control
              type="number"
              name="total_spend"
              value={newClient.total_spend}
              onChange={handleInputChange}
              min="0"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Create Client
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Component for the Client Details Modal
function ClientDetailsModal({ show, onHide, client, clientProjects }) {
  const { clients, setClients } = useDesignerData(); // <-- Added this line
  const [isEditing, setIsEditing] = useState(false);
  const [editClient, setEditClient] = useState(client);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setEditClient(client);
    setIsEditing(false);
    setError("");
    setSuccess("");
  }, [client, show]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("company.")) {
      const [, field] = name.split(".");
      setEditClient((prev) => ({
        ...prev,
        company: { ...prev.company, [field]: value },
      }));
    } else {
      setEditClient((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Don't allow email to be changed
      const { email, ...updateData } = editClient;
      const response = await api.updateClient(client.id, updateData);

      // Update client in state
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, ...updateData, email: c.email } : c
        )
      );

      // Update selectedClient so modal shows new data
      setEditClient((prev) => ({ ...prev, ...updateData }));

      setSuccess("Client updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update client.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const initials = client.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Client Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex align-items-center mb-4">
          <div className={`${styles.avatarLarge} me-3`}>
            {client.avatar ? (
              <img
                src={client.avatar}
                alt={client.name}
                className="rounded-circle"
              />
            ) : (
              <div className={styles.initialsAvatarLarge}>{initials}</div>
            )}
          </div>
          <div>
            <h4 className="mb-1">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editClient.name}
                  onChange={handleEditChange}
                  className="form-control"
                />
              ) : (
                client.name
              )}
            </h4>
            <p className="text-muted mb-0">
              {isEditing ? (
                <input
                  type="text"
                  name="company.name"
                  value={editClient.company?.name || ""}
                  onChange={handleEditChange}
                  className="form-control"
                />
              ) : (
                client.company?.name || ""
              )}
            </p>
          </div>
        </div>

        <Tabs defaultActiveKey="info" className="mb-4">
          <Tab eventKey="info" title="Contact Information">
            <div className="row mt-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold mb-1">Email</label>
                  <div className="d-flex align-items-center">
                    <FiMail className="text-muted me-2" />
                    <span>{client.email}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-bold mb-1">Phone</label>
                  <div className="d-flex align-items-center">
                    <FiPhone className="text-muted me-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        value={editClient.phone || ""}
                        onChange={handleEditChange}
                        className="form-control"
                      />
                    ) : (
                      <span>{client.phone}</span>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-bold mb-1">Contact Person</label>
                  <div className="d-flex align-items-center">
                    <FiUser className="text-muted me-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="contact_person"
                        value={editClient.contact_person || ""}
                        onChange={handleEditChange}
                        className="form-control"
                      />
                    ) : (
                      <span>{client.contact_person}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="fw-bold mb-1">Address</label>
                  <div className="d-flex align-items-center">
                    <FiMapPin className="text-muted me-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="company.address"
                        value={editClient.company?.address || ""}
                        onChange={handleEditChange}
                        className="form-control"
                      />
                    ) : (
                      <span>{client.company?.address}</span>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-bold mb-1">Total Spend</label>
                  <div className="d-flex align-items-center">
                    <FaRupeeSign className="text-muted me-2" />
                    {isEditing ? (
                      <input
                        type="number"
                        name="total_spend"
                        value={editClient.total_spend || 0}
                        onChange={handleEditChange}
                        className="form-control"
                      />
                    ) : (
                      <span>₹{client.total_spend?.toLocaleString() || 0}</span>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-bold mb-1">Projects</label>
                  <div className="d-flex align-items-center">
                    <FiFolder className="text-muted me-2" />
                    <span>
                      {clientProjects.length} Project
                      {clientProjects.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {error && <div className="alert alert-danger mt-2">{error}</div>}
            {success && (
              <div className="alert alert-success mt-2">{success}</div>
            )}
          </Tab>

          <Tab eventKey="projects" title="Projects">
            {clientProjects.length === 0 ? (
              <div className="alert alert-info mt-3">
                No projects found for this client.
              </div>
            ) : (
              <div className="mt-3">
                {clientProjects.map((project) => (
                  <div key={project.id} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="card-title mb-0">{project.title}</h5>
                        <span
                          className={`badge bg-${
                            project.status === "active"
                              ? "success"
                              : project.status === "completed"
                              ? "secondary"
                              : "primary"
                          }`}
                        >
                          {project.status?.charAt(0).toUpperCase() +
                            project.status?.slice(1) || "Active"}
                        </span>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center mb-2">
                            <FiFileText className="text-muted me-2" />
                            <small className="text-muted">
                              ID: {project.id}
                            </small>
                          </div>

                          <div className="d-flex align-items-center mb-2">
                            <FaRupeeSign className="text-muted me-2" />
                            <span>
                              ₹{project.budget?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="d-flex align-items-center mb-2">
                            <FiCalendar className="text-muted me-2" />
                            <span>
                              Start: {formatDate(project.timeline?.start)}
                            </span>
                          </div>

                          {project.timeline?.estimated_end && (
                            <div className="d-flex align-items-center">
                              <FiClock className="text-muted me-2" />
                              <span>
                                Due:{" "}
                                {formatDate(project.timeline.estimated_end)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Close
        </Button>
        {isEditing ? (
          <>
            <Button variant="success" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setIsEditing(false);
                setEditClient(client);
                setError("");
                setSuccess("");
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            Edit Client
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default Clients;
