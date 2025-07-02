import React, { useState, useEffect } from "react";
import { useDesignerData } from "../contexts/DesignerDataContext";
import styles from "./Schedules.module.css";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiClock,
  FiMapPin,
  FiEdit,
  FiTrash2,
  FiEye,
  FiX,
  FiSave,
  FiCalendar,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";
import api from "../services/api";

function Schedules({ username, role, userId }) {
  const { schedules, setSchedules, projects, clients } = useDesignerData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // 'month', 'week', or 'day'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editSchedule, setEditSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    client_id: "",
    project_id: "",
    status: "scheduled",
    designer_id: userId,
  });

  // Fetch schedules on component mount
  useEffect(() => {
    const fetchDesignerSchedules = async () => {
      try {
        setLoading(true);

        if (userId && schedules.length === 0) {
          // Fetch data from the API only if context data is empty
          const data = await api.getUserData(userId, role);

          // Save data to context
          setSchedules(data.schedules);

          console.log("Fetched Schedules from API:", data.schedules);
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching
      }
    };

    fetchDesignerSchedules();
    // }, [userId, role, schedules, setSchedules]);
  }, [userId, role]);

  // Handle input change for new schedule form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new schedule
  const handleAddSchedule = () => {
    // Validate form
    if (
      !newSchedule.title ||
      !newSchedule.start_time ||
      !newSchedule.end_time
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Create new schedule with a unique ID
    const scheduleToAdd = {
      ...newSchedule,
      id: `schedule_${Date.now()}`,
      designer_id: userId,
    };

    // Add to schedules state
    setSchedules((prev) => [...prev, scheduleToAdd]);

    // Close modal and reset form
    setShowAddModal(false);
    setNewSchedule({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      client_id: "",
      project_id: "",
      status: "scheduled",
      designer_id: userId,
    });
  };

  // Handle viewing a schedule
  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowViewModal(true);
  };

  // Handle editing a schedule
  const handleEditSchedule = (schedule) => {
    // Convert date strings to input-compatible format (YYYY-MM-DDThh:mm)
    const formatDateForInput = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    setEditSchedule({
      ...schedule,
      start_time: formatDateForInput(schedule.start_time),
      end_time: formatDateForInput(schedule.end_time),
    });
    setShowEditModal(true);
  };

  // Handle deleting a schedule
  const handleDeleteSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteConfirm(true);
  };

  // Confirm schedule deletion
  const confirmDeleteSchedule = async () => {
    try {
      // Delete from database
      await api.deleteSchedule(selectedSchedule.id);

      // Remove from local state
      setSchedules(schedules.filter((s) => s.id !== selectedSchedule.id));
      setShowDeleteConfirm(false);
      setSelectedSchedule(null);
    } catch (error) {
      alert("Failed to delete schedule.");
      console.error(error);
    }
  };

  // Handle input change for edit schedule form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditSchedule((prev) => ({ ...prev, [name]: value }));
  };

  // Save edited schedule
  const saveEditedSchedule = async () => {
    // Validate form
    if (
      !editSchedule.title ||
      !editSchedule.start_time ||
      !editSchedule.end_time
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Update in database
      await api.updateSchedule(editSchedule.id, editSchedule);

      // Update schedule in state
      setSchedules(
        schedules.map((s) => (s.id === editSchedule.id ? editSchedule : s))
      );

      // Close modal
      setShowEditModal(false);
      setEditSchedule(null);
    } catch (error) {
      alert("Failed to update schedule.");
      console.error(error);
    }
  };

  // Helper function to format date (e.g., "Mon, Mar 31")
  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to format date (e.g., "March 2025")
  const formatMonthAndYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Helper function to format time (e.g., "9:00 AM")
  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get client name from client ID
  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "N/A";
  };

  // Get project name from project ID
  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "N/A";
  };

  // Calculate days for the current month view
  const getDaysInMonthGrid = () => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    // Previous month days to display
    const previousMonthDays = [];
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );
    const daysInPreviousMonth = previousMonth.getDate();

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      previousMonthDays.push({
        date: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          daysInPreviousMonth - i
        ),
        outsideMonth: true,
      });
    }

    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        outsideMonth: false,
      });
    }

    // Next month days to display
    const nextMonthDays = [];
    const totalDaysDisplayed =
      previousMonthDays.length + currentMonthDays.length;
    const daysToAdd = 42 - totalDaysDisplayed; // 6 rows of 7 days

    for (let i = 1; i <= daysToAdd; i++) {
      nextMonthDays.push({
        date: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          i
        ),
        outsideMonth: true,
      });
    }

    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Navigate to previous month/week/day
  const goToPreviousMonth = () => {
    if (view === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    } else if (view === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else if (view === "day") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  // Navigate to next month/week/day
  const goToNextMonth = () => {
    if (view === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    } else if (view === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else if (view === "day") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Get events for a specific day
  const getEventsForDay = (date) => {
    return schedules.filter((event) => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = getDaysInMonthGrid();
    const rows = [];
    const today = new Date();

    for (let i = 0; i < days.length; i += 7) {
      const week = days.slice(i, i + 7);
      rows.push(
        <tr key={i}>
          {week.map((day, index) => {
            const dayEvents = getEventsForDay(day.date);
            const isCurrentDay = isToday(day.date);

            return (
              <td
                key={index}
                className={`${day.outsideMonth ? styles.outsideMonth : ""} ${
                  isCurrentDay ? styles.today : ""
                }`}
              >
                <div className={styles.dayNumber}>{day.date.getDate()}</div>
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`${styles.calendarEvent} ${
                      styles[
                        `event${
                          event.status.charAt(0).toUpperCase() +
                          event.status.slice(1)
                        }`
                      ]
                    }`}
                    title={event.title}
                    onClick={() => handleViewSchedule(event)}
                  >
                    {formatTime(event.start_time)} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className={styles.moreEvents}>
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </td>
            );
          })}
        </tr>
      );
    }

    return rows;
  };

  // Get days of the current week
  const getDaysInWeek = () => {
    const date = new Date(currentDate);
    const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.

    // Set to the beginning of the week (Sunday)
    date.setDate(date.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(date);
      days.push(newDate);
      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  // Format date for week/day view headers
  const formatShortDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  };

  // Get hour slots for day/week view
  const getHourSlots = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(
        i === 0
          ? "12 AM"
          : i < 12
          ? `${i} AM`
          : i === 12
          ? "12 PM"
          : `${i - 12} PM`
      );
    }
    return hours;
  };

  // Check if an event is in a specific hour slot
  const isEventInHourSlot = (event, date, hour) => {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);

    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);

    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return eventStart < slotEnd && eventEnd > slotStart;
  };

  // Render week view
  const renderWeekView = () => {
    const days = getDaysInWeek();
    const hours = getHourSlots();

    return (
      <div className={styles.weekViewContainer}>
        <div className={styles.weekHeader}>
          <div className={styles.weekTimeColumn}></div>
          {days.map((day, index) => (
            <div
              key={index}
              className={`${styles.weekDayColumn} ${
                isToday(day) ? styles.todayColumn : ""
              }`}
            >
              <div className={styles.weekDayName}>
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className={styles.weekDayDate}>
                {day.toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.weekBody}>
          {hours.map((hour, hourIndex) => (
            <div key={hourIndex} className={styles.weekRow}>
              <div className={styles.weekTimeColumn}>{hour}</div>

              {days.map((day, dayIndex) => {
                const eventsInHour = schedules.filter((event) =>
                  isEventInHourSlot(event, day, hourIndex)
                );

                return (
                  <div
                    key={dayIndex}
                    className={`${styles.weekDayCell} ${
                      isToday(day) ? styles.todayCell : ""
                    }`}
                  >
                    {eventsInHour.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`${styles.weekEvent} ${
                          styles[event.status]
                        }`}
                        onClick={() => handleViewSchedule(event)}
                      >
                        <div className={styles.weekEventTime}>
                          {formatTime(event.start_time)} -{" "}
                          {formatTime(event.end_time)}
                        </div>
                        <div className={styles.weekEventTitle}>
                          {event.title}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const hours = getHourSlots();
    const dayEvents = getEventsForDay(currentDate);

    const formatDayHeader = (date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    };

    return (
      <div className={styles.dayViewContainer}>
        <div className={styles.dayHeader}>
          <div className={styles.dayTitle}>{formatDayHeader(currentDate)}</div>
        </div>

        <div className={styles.dayBody}>
          {hours.map((hour, hourIndex) => {
            const eventsInHour = dayEvents.filter((event) =>
              isEventInHourSlot(event, currentDate, hourIndex)
            );

            return (
              <div key={hourIndex} className={styles.dayRow}>
                <div className={styles.dayTimeColumn}>{hour}</div>
                <div className={styles.dayEventColumn}>
                  {eventsInHour.map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`${styles.dayEvent} ${styles[event.status]}`}
                      onClick={() => handleViewSchedule(event)}
                    >
                      <div className={styles.dayEventTitle}>{event.title}</div>
                      <div className={styles.dayEventTime}>
                        {formatTime(event.start_time)} -{" "}
                        {formatTime(event.end_time)}
                      </div>
                      {event.location && (
                        <div className={styles.dayEventLocation}>
                          <FiMapPin /> {event.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  function renderAddScheduleModal() {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>Add New Schedule</h3>
            <button
              className={styles.closeButton}
              onClick={() => setShowAddModal(false)}
            >
              <FiX />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>Title*</label>
              <input
                type="text"
                name="title"
                value={newSchedule.title}
                onChange={handleInputChange}
                placeholder="Meeting title"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                name="description"
                value={newSchedule.description}
                onChange={handleInputChange}
                placeholder="Add details about this meeting"
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Start Time*</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={newSchedule.start_time}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>End Time*</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={newSchedule.end_time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={newSchedule.location}
                onChange={handleInputChange}
                placeholder="Meeting location"
              />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Project</label>
                <select
                  name="project_id"
                  value={newSchedule.project_id || ""}
                  onChange={handleInputChange}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name || project.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Client</label>
                <select
                  name="client_id"
                  value={newSchedule.client_id || ""}
                  onChange={handleInputChange}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                name="status"
                value={newSchedule.status}
                onChange={handleInputChange}
              >
                <option value="scheduled">Scheduled</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button
              className={styles.cancelButton}
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button
              className={styles.saveButton}
              onClick={async () => {
                // Validate form
                if (
                  !newSchedule.title ||
                  !newSchedule.start_time ||
                  !newSchedule.end_time
                ) {
                  alert("Please fill in all required fields");
                  return;
                }
                try {
                  // Add to DB
                  const scheduleToAdd = {
                    ...newSchedule,
                    id: `schedule_${Date.now()}`,
                    designer_id: userId,
                  };
                  const response = await api.addSchedule(scheduleToAdd);
                  setSchedules((prev) => [...prev, response.data]);
                  setShowAddModal(false);
                  setNewSchedule({
                    title: "",
                    description: "",
                    start_time: "",
                    end_time: "",
                    location: "",
                    client_id: "",
                    project_id: "",
                    status: "scheduled",
                    designer_id: userId,
                  });
                } catch (error) {
                  alert("Failed to add schedule.");
                  console.error(error);
                }
              }}
              disabled={
                !newSchedule.title ||
                !newSchedule.start_time ||
                !newSchedule.end_time
              }
            >
              <FiSave />
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render view schedule modal
  const renderViewScheduleModal = () => {
    if (!selectedSchedule) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>Schedule Details</h3>
            <button
              className={styles.closeButton}
              onClick={() => setShowViewModal(false)}
            >
              <FiX />
            </button>
          </div>
          <div className={styles.modalBody}>
            <h2 className={styles.viewTitle}>{selectedSchedule.title}</h2>

            <div className={styles.viewDetail}>
              <FiCalendar />
              <div>
                <div className={styles.viewLabel}>Date & Time</div>
                <div>
                  {formatDate(selectedSchedule.start_time)} at{" "}
                  {formatTime(selectedSchedule.start_time)} -{" "}
                  {formatTime(selectedSchedule.end_time)}
                </div>
              </div>
            </div>

            <div className={styles.viewDetail}>
              <FiMapPin />
              <div>
                <div className={styles.viewLabel}>Location</div>
                <div>
                  {selectedSchedule.location || "No location specified"}
                </div>
              </div>
            </div>

            {selectedSchedule.client_id && (
              <div className={styles.viewDetail}>
                <FiUser />
                <div>
                  <div className={styles.viewLabel}>Client</div>
                  <div>{getClientName(selectedSchedule.client_id)}</div>
                </div>
              </div>
            )}

            {selectedSchedule.project_id && (
              <div className={styles.viewDetail}>
                <FiBriefcase />
                <div>
                  <div className={styles.viewLabel}>Project</div>
                  <div>{getProjectName(selectedSchedule.project_id)}</div>
                </div>
              </div>
            )}

            <div className={styles.viewDescription}>
              <div className={styles.viewLabel}>Description</div>
              <p>
                {selectedSchedule.description || "No description provided."}
              </p>
            </div>

            <div className={styles.viewStatus}>
              <div className={styles.viewLabel}>Status</div>
              <div
                className={`${styles.statusBadge} ${
                  styles[selectedSchedule.status]
                }`}
              >
                {selectedSchedule.status.charAt(0).toUpperCase() +
                  selectedSchedule.status.slice(1)}
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button
              className={styles.cancelButton}
              onClick={() => setShowViewModal(false)}
            >
              Close
            </button>
            <button
              className={styles.editButton}
              onClick={() => {
                setShowViewModal(false);
                handleEditSchedule(selectedSchedule);
              }}
            >
              <FiEdit /> Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render edit schedule modal
  const renderEditScheduleModal = () => {
    if (!editSchedule) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>Edit Schedule</h3>
            <button
              className={styles.closeButton}
              onClick={() => setShowEditModal(false)}
            >
              <FiX />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>Title*</label>
              <input
                type="text"
                name="title"
                value={editSchedule.title}
                onChange={handleEditInputChange}
                placeholder="Meeting title"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                name="description"
                value={editSchedule.description}
                onChange={handleEditInputChange}
                placeholder="Add details about this meeting"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Start Time*</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={editSchedule.start_time}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>End Time*</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={editSchedule.end_time}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={editSchedule.location}
                onChange={handleEditInputChange}
                placeholder="Meeting location"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Project</label>
                <select
                  name="project_id"
                  value={editSchedule.project_id || ""}
                  onChange={handleEditInputChange}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name || project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Client</label>
                <select
                  name="client_id"
                  value={editSchedule.client_id || ""}
                  onChange={handleEditInputChange}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                name="status"
                value={editSchedule.status}
                onChange={handleEditInputChange}
              >
                <option value="scheduled">Scheduled</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button
              className={styles.cancelButton}
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button
              className={styles.saveButton}
              onClick={saveEditedSchedule}
              disabled={
                !editSchedule.title ||
                !editSchedule.start_time ||
                !editSchedule.end_time
              }
            >
              <FiSave />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render delete confirmation modal
  const renderDeleteConfirmModal = () => {
    if (!selectedSchedule) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>Delete Schedule</h3>
            <button
              className={styles.closeButton}
              onClick={() => setShowDeleteConfirm(false)}
            >
              <FiX />
            </button>
          </div>
          <div className={styles.modalBody}>
            <p className={styles.confirmText}>
              Are you sure you want to delete "{selectedSchedule.title}"? This
              action cannot be undone.
            </p>
          </div>
          <div className={styles.modalFooter}>
            <button
              className={styles.cancelButton}
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </button>
            <button
              className={styles.deleteButton}
              onClick={confirmDeleteSchedule}
            >
              <FiTrash2 />
              Delete Schedule
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.container}>Loading schedules...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Schedules</h2>
        <div className={styles.actions}>
          <button
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus /> Add Schedule
          </button>
        </div>
      </div>

      <div className={styles.calendarView}>
        <div className={styles.navigationHeader}>
          <div className={styles.navigationControls}>
            <button className={styles.navButton} onClick={goToPreviousMonth}>
              <FiChevronLeft />
            </button>
            <button className={styles.navButton} onClick={goToToday}>
              Today
            </button>
            <button className={styles.navButton} onClick={goToNextMonth}>
              <FiChevronRight />
            </button>
            <div className={styles.currentDate}>
              {formatMonthAndYear(currentDate)}
            </div>
          </div>
          <div className={styles.viewControls}>
            <button
              className={`${styles.viewButton} ${
                view === "month" ? styles.active : ""
              }`}
              onClick={() => setView("month")}
            >
              Month
            </button>
            <button
              className={`${styles.viewButton} ${
                view === "week" ? styles.active : ""
              }`}
              onClick={() => setView("week")}
            >
              Week
            </button>
            <button
              className={`${styles.viewButton} ${
                view === "day" ? styles.active : ""
              }`}
              onClick={() => setView("day")}
            >
              Day
            </button>
          </div>
        </div>

        {view === "month" && (
          <table className={styles.calendar}>
            <thead>
              <tr>
                <th>Sunday</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
              </tr>
            </thead>
            <tbody>{renderCalendarDays()}</tbody>
          </table>
        )}

        {/* Week View will be implemented here */}
        {view === "week" && (
          <div className={styles.weekView}>{renderWeekView()}</div>
        )}

        {/* Day View will be implemented here */}
        {view === "day" && (
          <div className={styles.dayView}>{renderDayView()}</div>
        )}
      </div>

      <div className={styles.eventsList}>
        <div className={styles.eventsHeader}>Upcoming Events</div>
        {schedules.length === 0 ? (
          <div className={styles.eventItem}>No scheduled events yet.</div>
        ) : (
          schedules
            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
            .map((event, index) => (
              <div key={index} className={styles.eventItem}>
                <div
                  className={`${styles.eventColor} ${styles[event.status]}`}
                ></div>
                <div className={styles.eventDetails}>
                  <div className={styles.eventTitle}>{event.title}</div>
                  <div className={styles.eventInfo}>
                    <div className={styles.eventInfoItem}>
                      <FiClock />
                      {formatDate(event.start_time)} at{" "}
                      {formatTime(event.start_time)} -{" "}
                      {formatTime(event.end_time)}
                    </div>
                    <div className={styles.eventInfoItem}>
                      <FiMapPin />
                      {event.location || "No location specified"}
                    </div>
                  </div>
                </div>
                <div className={styles.eventActions}>
                  <button
                    className={styles.actionButton}
                    title="View"
                    onClick={() => handleViewSchedule(event)}
                  >
                    <FiEye />
                  </button>
                  <button
                    className={styles.actionButton}
                    title="Edit"
                    onClick={() => handleEditSchedule(event)}
                  >
                    <FiEdit />
                  </button>
                  <button
                    className={styles.actionButton}
                    title="Delete"
                    onClick={() => handleDeleteSchedule(event)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {showAddModal && renderAddScheduleModal()}
      {showViewModal && renderViewScheduleModal()}
      {showEditModal && renderEditScheduleModal()}
      {showDeleteConfirm && renderDeleteConfirmModal()}
    </div>
  );
}

export default Schedules;
