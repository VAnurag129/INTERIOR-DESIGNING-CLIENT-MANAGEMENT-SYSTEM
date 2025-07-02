import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Badge, Form } from "react-bootstrap";
import { FiCalendar, FiClock, FiPlus, FiX } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import styles from "./ProjectDetails.module.css";
import api from "../services/api";

function ProjectDetails({
  project,
  client,
  onClose,
  show,
  onProjectUpdate,
  readOnly = false,
}) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...project });
  const [moodboardUrls, setMoodboardUrls] = useState(project.moodboard || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [progress, setProgress] = useState(
    project.status === "completed" ? 100 : project.progress ?? 30
  );

  useEffect(() => {
    setFormData({ ...project });
    setMoodboardUrls(project.moodboard || []);
    setProgress(project.status === "completed" ? 100 : project.progress ?? 30);
    setEditMode(false);
  }, [project, show]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProgressChange = (e) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    let newStatus = formData.status;
    if (newProgress === 100) newStatus = "completed";
    else if (newProgress > 0) newStatus = "active";
    else newStatus = "pending";
    setFormData((prev) => ({
      ...prev,
      progress: newProgress,
      status: newStatus,
    }));
  };

  const handleSave = async () => {
    const updatedProject = {
      ...formData,
      moodboard: moodboardUrls,
      budget: parseFloat(formData.budget || 0),
      progress,
    };
    try {
      const updated = await api.updateProject(project.id, updatedProject);
      if (onProjectUpdate) onProjectUpdate(updated);
      setEditMode(false);
      onClose();
    } catch (err) {
      console.error("Failed to update project:", err);
    }
  };

  const addImage = () => {
    if (newImageUrl && newImageUrl.trim() !== "") {
      setMoodboardUrls([...moodboardUrls, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index) => {
    const updatedUrls = [...moodboardUrls];
    updatedUrls.splice(index, 1);
    setMoodboardUrls(updatedUrls);
  };

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
          {editMode ? (
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={readOnly}
            />
          ) : (
            project.title
          )}
          <Badge bg={getStatusBadgeClass(formData.status)} className="ms-2">
            {getStatusLabel(formData.status)}
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
                <FaRupeeSign className="text-muted me-2" />
                {editMode ? (
                  <Form.Control
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                ) : (
                  <span>Budget: ₹{project.budget?.toLocaleString() || 0}</span>
                )}
              </div>

              <div className="d-flex align-items-center mb-2">
                <FiCalendar className="text-muted me-2" />
                {editMode ? (
                  <Form.Control
                    type="date"
                    name="timeline.start"
                    value={
                      formData.timeline?.start
                        ? new Date(formData.timeline.start)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                ) : (
                  <span>Start Date: {formatDate(project.timeline?.start)}</span>
                )}
              </div>

              {project.timeline?.estimated_end && (
                <div className="d-flex align-items-center mb-2">
                  <FiClock className="text-muted me-2" />
                  {editMode ? (
                    <Form.Control
                      type="date"
                      name="timeline.estimated_end"
                      value={
                        formData.timeline?.estimated_end
                          ? new Date(formData.timeline.estimated_end)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={handleChange}
                      disabled={readOnly}
                    />
                  ) : (
                    <span>
                      Due Date: {formatDate(project.timeline.estimated_end)}
                    </span>
                  )}
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

            {/* Always show progress bar, editable in edit mode */}
            <div className={styles.progressWrapper}>
              <div className="d-flex justify-content-between mb-1">
                <small>
                  {progress === 100
                    ? "Completed"
                    : progress === 0
                    ? "Pending"
                    : "In Progress"}
                </small>
                <small>{progress}%</small>
              </div>
              {editMode && !readOnly ? (
                <Form.Range
                  min={0}
                  max={100}
                  value={progress}
                  onChange={handleProgressChange}
                />
              ) : (
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className={`progress-bar bg-${getStatusBadgeClass(
                      formData.status
                    )}`}
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              )}
            </div>

            <h5 className="mb-3 mt-4">Notes</h5>
            {editMode && !readOnly ? (
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            ) : (
              <p className="text-muted">
                {project.notes || "No notes have been added to this project."}
              </p>
            )}
          </Col>
          <Col md={6}>
            <h5 className="mb-3">Mood Board</h5>

            <div className={styles.moodboardContainer}>
              {moodboardUrls.length > 0 ? (
                <div className={styles.moodboardGrid}>
                  {moodboardUrls.map((url, index) => (
                    <div key={index} className={styles.moodboardImageWrapper}>
                      {editMode && !readOnly && (
                        <Button
                          variant="danger"
                          size="sm"
                          className={styles.removeImageBtn}
                          onClick={() => removeImage(index)}
                        >
                          <FiX />
                        </Button>
                      )}
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

            {editMode && !readOnly && (
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
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {!readOnly &&
          (editMode ? (
            <Button variant="success" onClick={handleSave}>
              Save Changes
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setEditMode(true)}>
              Edit Project
            </Button>
          ))}
      </Modal.Footer>
    </Modal>
  );
}

export default ProjectDetails;
