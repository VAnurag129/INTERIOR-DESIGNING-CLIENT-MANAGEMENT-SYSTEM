import React, { useState } from "react";
import { Modal, Button, Row, Col, Badge, Form } from "react-bootstrap";
import { FiCalendar, FiClock, FiDollarSign, FiPlus, FiX } from "react-icons/fi";
import styles from "./ProjectDetails.module.css";

function ProjectDetails({ project, client, onClose, show }) {
  const [moodboardUrls, setMoodboardUrls] = useState(project.moodboard || []);
  const [newImageUrl, setNewImageUrl] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "active":
        return "primary";
      default:
        return "secondary";
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

  const addImage = () => {
    if (newImageUrl && newImageUrl.trim() !== "") {
      setMoodboardUrls([...moodboardUrls, newImageUrl]);
      setNewImageUrl("");

      // In a real implementation, this would be saved to your backend
      // api.updateProject(project.id, { moodboard: [...moodboardUrls, newImageUrl] });
    }
  };

  const removeImage = (index) => {
    const updatedUrls = [...moodboardUrls];
    updatedUrls.splice(index, 1);
    setMoodboardUrls(updatedUrls);

    // In a real implementation, this would be saved to your backend
    // api.updateProject(project.id, { moodboard: updatedUrls });
  };

  // Calculate progress percentage
  let progress = 0;
  if (project.status === "completed") {
    progress = 100;
  } else if (project.status === "active") {
    // Mock value, would be calculated based on timeline/tasks
    progress = 30;
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
      className={styles.detailsModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {project.title}
          <Badge bg={getStatusBadgeClass(project.status)} className="ms-2">
            {getStatusLabel(project.status)}
          </Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <h5 className="mb-3">Project Details</h5>
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <span className="text-muted me-2">Client:</span>
                <strong>{client?.name || "Unknown Client"}</strong>
              </div>

              <div className="d-flex align-items-center mb-2">
                <FiDollarSign className="text-muted me-2" />
                <span>Budget: ${project.budget?.toLocaleString() || 0}</span>
              </div>

              <div className="d-flex align-items-center mb-2">
                <FiCalendar className="text-muted me-2" />
                <span>Start Date: {formatDate(project.timeline?.start)}</span>
              </div>

              {project.timeline?.estimated_end && (
                <div className="d-flex align-items-center mb-2">
                  <FiClock className="text-muted me-2" />
                  <span>
                    Due Date: {formatDate(project.timeline.estimated_end)}
                  </span>
                </div>
              )}

              {project.timeline?.actual_end && (
                <div className="d-flex align-items-center mb-2">
                  <FiClock className="text-muted me-2" />
                  <span>
                    Completed: {formatDate(project.timeline.actual_end)}
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
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className={`progress-bar bg-${getStatusBadgeClass(
                      project.status
                    )}`}
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            )}

            <h5 className="mb-3 mt-4">Notes</h5>
            <p className="text-muted">
              {project.notes || "No notes have been added to this project."}
            </p>
          </Col>
          <Col md={6}>
            <h5 className="mb-3">Mood Board</h5>

            <div className={styles.moodboardContainer}>
              {moodboardUrls.length > 0 ? (
                <div className={styles.moodboardGrid}>
                  {moodboardUrls.map((url, index) => (
                    <div key={index} className={styles.moodboardImageWrapper}>
                      <Button
                        variant="danger"
                        size="sm"
                        className={styles.removeImageBtn}
                        onClick={() => removeImage(index)}
                      >
                        <FiX />
                      </Button>
                      <img
                        src={url}
                        alt={`Reference ${index + 1}`}
                        className={styles.moodboardImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150?text=Invalid+Image";
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-light rounded">
                  <p className="text-muted mb-0">
                    No reference images added yet
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3">
              <Form.Group className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Paste image URL here"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <Button variant="primary" className="ms-2" onClick={addImage}>
                  <FiPlus />
                </Button>
              </Form.Group>
              <Form.Text className="text-muted">
                Add reference images to create a mood board for this project
              </Form.Text>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary">Edit Project</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProjectDetails;
