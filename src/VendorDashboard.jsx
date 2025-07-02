import { useState, useEffect } from "react";
import { useVendorData } from "../contexts/VendorDataContext";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPlus,
  FiCalendar,
  FiBarChart2,
  FiClock,
  FiMessageSquare,
  FiShoppingBag,
  FiArrowRight,
  FiBox,
} from "react-icons/fi";
import SummaryCard from "./SummaryCard";
import styles from "./DesignerDashboard.module.css"; // Reusing designer dashboard styles
import api from "../services/api.js";

function VendorDashboard({ userDetails, userId, role }) {
  const {
    products,
    setProducts,
    conversations,
    setConversations,
    schedules,
    setSchedules,
    designers,
    setDesigners,
  } = useVendorData();
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        console.log("userId:", userId, "role:", role);

        if (
          userId &&
          (products.length === 0 ||
            conversations.length === 0 ||
            schedules.length === 0)
        ) {
          // Fetch data from the API only if context data is empty
          const data = await api.getUserData(userId, role);

          // Save data to context
          setProducts(data.products || []);
          setConversations(data.conversations || []);
          setSchedules(data.schedules || []);
          setDesigners(data.designers || []);

          console.log("Fetched Vendor Data from API:", data);
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [
    userId,
    role,
    products.length,
    conversations.length,
    schedules.length,
    setProducts,
    setConversations,
    setSchedules,
  ]);

  // Calculate summary statistics
  const productCount = products?.length || 0;
  const monthlyAppointments = schedules?.length || 0;
  const messageCount = conversations?.length || 0;

  // Get recent conversations
  const recentConversations =
    conversations
      ?.sort((a, b) => {
        const lastMessageA = a.messages[a.messages.length - 1].timestamp;
        const lastMessageB = b.messages[b.messages.length - 1].timestamp;
        return new Date(lastMessageB) - new Date(lastMessageA);
      })
      .slice(0, 3) || [];

  // Get upcoming schedules
  const upcomingSchedules =
    schedules
      ?.filter((schedule) => new Date(schedule.start_time) > new Date())
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 3) || [];

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

  // Helper function for time formatting
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Format date for conversations
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Today - show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // This week - show day name
    else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    // Older - show date
    else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <>
      <div className={styles.summaryCards}>
        <SummaryCard
          className={styles.card}
          value={productCount}
          heading={"Products"}
          bgColor={"--projects-bg-color"}
        >
          <FiBox style={{ color: "var(--projects-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={messageCount}
          heading={"Messages"}
          bgColor={"--clients-bg-color"}
        >
          <FiMessageSquare style={{ color: "var(--clients-color)" }} />
        </SummaryCard>
        <SummaryCard
          value={monthlyAppointments}
          heading={"Appointments"}
          bgColor={"--appointments-bg-color"}
        >
          <FiCalendar style={{ color: "var(--appointments-color)" }} />
        </SummaryCard>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          className={styles.newProjectBtn}
          onClick={() => navigate("/vendor/products")}
        >
          <FiPlus />
          Add New Product
        </button>
      </div>

      {/* Recent Conversations Section */}
      <section className="mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0">Recent Conversations</h2>
          <Link
            to="/vendor/messages"
            className="btn btn-sm btn-outline-primary d-flex align-items-center"
          >
            View All Messages <FiArrowRight className="ms-2" />
          </Link>
        </div>

        {recentConversations.length === 0 ? (
          <div className="alert alert-info">No recent conversations found.</div>
        ) : (
          <div className="row">
            {recentConversations.map((conversation) => {
              const lastMessage =
                conversation.messages[conversation.messages.length - 1];
              const otherParticipantId = conversation.participants.find(
                (p) => p !== userId
              );

              return (
                <div key={conversation.id} className="col-md-4 mb-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0">Conversation</h5>
                        <span className="badge bg-light text-dark">
                          {formatMessageDate(lastMessage.timestamp)}
                        </span>
                      </div>
                      <p className="card-text text-truncate mb-3">
                        {lastMessage.content}
                      </p>
                      <div className="d-flex justify-content-end">
                        <Link
                          to="/vendor/messages"
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Conversation
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upcoming Schedules Section */}
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0">Upcoming Schedules</h2>
          <Link
            to="/vendor/schedules"
            className="btn btn-sm btn-outline-primary d-flex align-items-center"
          >
            View All Schedules <FiArrowRight className="ms-2" />
          </Link>
        </div>

        {upcomingSchedules.length === 0 ? (
          <div className="alert alert-info">No upcoming schedules found.</div>
        ) : (
          <div className="row">
            {upcomingSchedules.map((schedule) => (
              <div key={schedule.id} className="col-md-4 mb-3">
                <div className="card h-100 shadow-sm">
                  <div className="card-header bg-white d-flex align-items-center">
                    <FiCalendar className="me-2 text-primary" />
                    <span>{formatDate(schedule.start_time)}</span>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{schedule.title}</h5>
                    {schedule.description && (
                      <p className="card-text small text-muted mb-3">
                        {schedule.description}
                      </p>
                    )}
                    <div className="d-flex align-items-center mb-2">
                      <FiClock className="me-2 text-muted" />
                      <span>
                        {formatTime(schedule.start_time)} -{" "}
                        {formatTime(schedule.end_time)}
                      </span>
                    </div>
                    {schedule.location && (
                      <div className="d-flex align-items-center">
                        <span className="text-muted me-2">Location:</span>
                        <span>{schedule.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="card-footer bg-white border-top-0">
                    <Link
                      to="/vendor/schedules"
                      className="btn btn-sm btn-outline-primary w-100"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default VendorDashboard;
