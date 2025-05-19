import React, { useState, useEffect } from "react";
import { useClientData } from "../contexts/ClientDataContext";
import styles from "./Schedules.module.css";
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiMapPin,
  FiEye,
  FiX,
  FiCalendar,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";
import api from "../services/api";

function ClientSchedules({ username, role, userId }) {
  const { schedules, setSchedules, projects, designers } = useClientData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // 'month', 'week', or 'day'
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Fetch schedules on component mount
  useEffect(() => {
    const fetchClientSchedules = async () => {
      try {
        setLoading(true);

        if (userId && schedules.length === 0) {
          // Fetch data from the API only if context data is empty
          const data = await api.getUserData(userId, role);

          // Filter schedules for this client
          const clientSchedules = data.schedules.filter(
            (schedule) => schedule.client_id === userId
          );

          // Save data to context
          setSchedules(clientSchedules);

          console.log("Fetched Client Schedules from API:", clientSchedules);
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
        setError("Failed to load schedules. Please try again later.");
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching
      }
    };

    fetchClientSchedules();
  }, [userId, role, schedules.length, setSchedules]);

  // Handle viewing a schedule
  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowViewModal(true);
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

  // Get designer name from designer ID
  const getDesignerName = (designerId) => {
    const designer = designers.find((d) => d.id === designerId);
    return designer ? designer.name : "N/A";
  };

  // Get project name from project ID
  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.title : "N/A";
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

  // Render view schedule modal
  const renderViewScheduleModal = () => {
    if (!selectedSchedule) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>Appointment Details</h3>
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

            {selectedSchedule.designer_id && (
              <div className={styles.viewDetail}>
                <FiUser />
                <div>
                  <div className={styles.viewLabel}>Designer</div>
                  <div>{getDesignerName(selectedSchedule.designer_id)}</div>
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
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.container}>Loading appointments...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Appointments</h2>
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

        {view === "week" && (
          <div className={styles.weekView}>{renderWeekView()}</div>
        )}

        {view === "day" && (
          <div className={styles.dayView}>{renderDayView()}</div>
        )}
      </div>

      <div className={styles.eventsList}>
        <div className={styles.eventsHeader}>Upcoming Appointments</div>
        {schedules.length === 0 ? (
          <div className={styles.eventItem}>No scheduled appointments yet.</div>
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
                    <div className={styles.eventInfoItem}>
                      <FiUser />
                      Designer: {getDesignerName(event.designer_id)}
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
                </div>
              </div>
            ))
        )}
      </div>

      {showViewModal && renderViewScheduleModal()}
    </div>
  );
}

export default ClientSchedules;
