import React, { useState, useEffect } from "react";

import { useDesignerData } from "../contexts/DesignerDataContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiFilter,
  FiSearch,
  FiClock,
  FiPaperclip,
  FiMessageSquare,
  FiSend,
} from "react-icons/fi";
import api from "../services/api.js";
import styles from "./Messages.module.css";

function Messages({ username, role, userId }) {
  const { conversations, setConversations, projects, clients, vendors } =
    useDesignerData();
  const [filteredConversations, setFilteredConversations] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, projects, clients, vendors
  const [filterValue, setFilterValue] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we have vendor data from navigation
  useEffect(() => {
    if (location.state?.vendorId) {
      const vendorId = location.state.vendorId;
      const vendorName = location.state.vendorName;

      // Clear the navigation state to prevent re-opening on refresh
      navigate(location.pathname, { replace: true, state: {} });

      // After conversations are loaded, find and set the vendor conversation
      const findVendorConversation = () => {
        if (!isLoading && conversations.length > 0) {
          // Find conversation with this vendor
          const vendorConvo = conversations.find(
            (conv) =>
              conv.participants.includes(vendorId) &&
              conv.participants.includes(userId)
          );

          if (vendorConvo) {
            setActiveConversation(vendorConvo);
            // Set filter to show all conversations
            setFilterType("all");
            setFilterValue("all");
          } else {
            console.log("No conversation found with vendor:", vendorId);
            // Here you could potentially create a new conversation with the vendor
          }
        }
      };

      findVendorConversation();
    }
  }, [location, navigate, conversations, userId, isLoading]);

  // FIX: Only depend on userId and role to avoid infinite loop
  useEffect(() => {
    const fetchDesignerConvos = async () => {
      try {
        setIsLoading(true);

        if (userId && conversations.length === 0) {
          // Fetch data from the API only if context data is empty
          const data = await api.getUserData(userId, role);

          // Save data to context
          setConversations(data.conversations);

          console.log("Fetched Conversations from API:", data.conversations);
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setIsLoading(false); // Ensure loading is set to false after fetching
      }
    };

    fetchDesignerConvos();
  }, [userId, role]);

  // Apply filters when filter type or value changes
  useEffect(() => {
    filterConversations();
  }, [filterType, filterValue, searchTerm, conversations]);

  // Handle filtering conversations
  const filterConversations = () => {
    let filtered = [...conversations];

    // Apply search term filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((conv) => {
        const participantMatches = conv.participants.some((participantId) => {
          // Check if participant is a client
          const client = clients.find((c) => c.id === participantId);
          if (client) {
            return client.name.toLowerCase().includes(searchTerm.toLowerCase());
          }

          // Check if participant is a vendor
          const vendor = vendors.find((v) => v.id === participantId);
          if (vendor) {
            return (
              vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (vendor.contact &&
                vendor.contact.toLowerCase().includes(searchTerm.toLowerCase()))
            );
          }

          return false;
        });

        const contentMatches = conv.messages.some((msg) =>
          msg.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return participantMatches || contentMatches;
      });
    }

    // Apply type filter
    if (filterType === "projects" && filterValue !== "all") {
      filtered = filtered.filter((conv) => conv.project_id === filterValue);
    } else if (filterType === "clients" && filterValue !== "all") {
      filtered = filtered.filter((conv) =>
        conv.participants.includes(filterValue)
      );
    } else if (filterType === "vendors" && filterValue !== "all") {
      filtered = filtered.filter((conv) =>
        conv.participants.includes(filterValue)
      );
    }

    setFilteredConversations(filtered);
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!activeConversation || !newMessage.trim()) return;

    // Create new message object
    const newMessageObj = {
      id: `msg_${Date.now()}`,
      sender: userId,
      timestamp: new Date().toISOString(),
      content: newMessage.trim(),
      attachments: [],
      read_by: [userId],
    };

    // Update the active conversation with the new message in local state
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessageObj],
    };

    const updatedConversations = conversations.map((conv) =>
      conv.id === activeConversation.id ? updatedConversation : conv
    );

    setActiveConversation(updatedConversation);
    setConversations(updatedConversations);
    setNewMessage("");

    // Save to DB
    try {
      await api.addMessageToConversation(activeConversation.id, newMessageObj);
    } catch (error) {
      alert("Failed to send message to server.");
      console.error(error);
    }
  };

  // Get the participant name
  const getParticipantName = (participantId) => {
    if (participantId === userId) return "You";

    // Check if participant is a client
    const client = clients.find((c) => c.id === participantId);
    if (client) return client.name;

    // Check if participant is a vendor
    const vendor = vendors.find((v) => v.id === participantId);
    if (vendor) return vendor.contact || vendor.name;

    return "Unknown User";
  };

  // Get the project name
  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.title : "No Project";
  };

  // Format date for display
  const formatDate = (dateString) => {
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

  // Handle selecting a conversation
  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  // Handle filter type change
  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setFilterValue("all");
  };

  // Handle filter value change
  const handleFilterValueChange = (e) => {
    setFilterValue(e.target.value);
  };

  // Handle key press in message input (send on Enter)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading messages...</div>;
  }

  return (
    <div className={styles.messagesContainer}>
      <h1 className={styles.pageTitle}>Messages</h1>

      <div className={styles.messagesLayout}>
        {/* Sidebar with conversation list */}
        <div className={styles.conversationsSidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.searchContainer}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filtersContainer}>
              <div className={styles.filterTypeContainer}>
                <label htmlFor="filterType" className={styles.filterLabel}>
                  <FiFilter /> Filter by:
                </label>
                <select
                  id="filterType"
                  value={filterType}
                  onChange={handleFilterTypeChange}
                  className={styles.filterSelect}
                >
                  <option value="all">All Messages</option>
                  <option value="projects">By Project</option>
                  <option value="clients">By Client</option>
                  <option value="vendors">By Vendor</option>
                </select>
              </div>

              {filterType !== "all" && (
                <div className={styles.filterValueContainer}>
                  <select
                    value={filterValue}
                    onChange={handleFilterValueChange}
                    className={styles.filterSelect}
                  >
                    <option value="all">All {filterType}</option>
                    {filterType === "projects" &&
                      projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    {filterType === "clients" &&
                      clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    {filterType === "vendors" &&
                      vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.contact || vendor.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className={styles.conversationsList}>
            {filteredConversations && filteredConversations.length === 0 ? (
              <div className={styles.noResults}>No conversations found</div>
            ) : (
              filteredConversations &&
              filteredConversations.map((conversation) => {
                const lastMessage =
                  conversation.messages[conversation.messages.length - 1];
                const otherParticipants = conversation.participants.filter(
                  (p) => p !== userId
                );
                const primaryParticipant = otherParticipants[0];

                return (
                  <div
                    key={conversation.id}
                    className={`${styles.conversationItem} ${
                      activeConversation?.id === conversation.id
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className={styles.participantInfo}>
                      <div className={styles.participantAvatar}>
                        {getParticipantName(primaryParticipant).charAt(0)}
                      </div>
                      <div className={styles.participantDetails}>
                        <div className={styles.participantName}>
                          {getParticipantName(primaryParticipant)}
                        </div>
                        <div className={styles.projectName}>
                          {getProjectName(conversation.project_id)}
                        </div>
                      </div>
                      <div className={styles.messageTime}>
                        {formatDate(lastMessage.timestamp)}
                      </div>
                    </div>
                    <div className={styles.messagePreview}>
                      {lastMessage.content.length > 60
                        ? `${lastMessage.content.substring(0, 60)}...`
                        : lastMessage.content}
                    </div>
                    {lastMessage.attachments.length > 0 && (
                      <div className={styles.attachmentIndicator}>
                        <FiPaperclip /> {lastMessage.attachments.length}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main conversation area */}
        <div className={styles.conversationMain}>
          {activeConversation ? (
            <>
              <div className={styles.conversationHeader}>
                <div className={styles.conversationInfo}>
                  <h2 className={styles.conversationTitle}>
                    {activeConversation.participants
                      .filter((p) => p !== userId)
                      .map((p) => getParticipantName(p))
                      .join(", ")}
                  </h2>
                  <div className={styles.conversationSubtitle}>
                    {getProjectName(activeConversation.project_id)}
                  </div>
                </div>
              </div>

              <div className={styles.messagesArea}>
                {activeConversation.messages.map((message) => {
                  const isSender = message.sender === userId;

                  return (
                    <div
                      key={message.id}
                      className={`${styles.messageItem} ${
                        isSender ? styles.sentMessage : styles.receivedMessage
                      }`}
                    >
                      {!isSender && (
                        <div className={styles.messageAvatar}>
                          {getParticipantName(message.sender).charAt(0)}
                        </div>
                      )}

                      <div className={styles.messageContent}>
                        {!isSender && (
                          <div className={styles.messageSender}>
                            {getParticipantName(message.sender)}
                          </div>
                        )}
                        <div className={styles.messageText}>
                          {message.content}
                        </div>
                        <div className={styles.messageTimestamp}>
                          <FiClock size={12} /> {formatDate(message.timestamp)}
                        </div>

                        {message.attachments.length > 0 && (
                          <div className={styles.messageAttachments}>
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className={styles.attachment}>
                                <FiPaperclip /> Attachment {index + 1}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.messageComposer}>
                <textarea
                  placeholder="Type a message..."
                  className={styles.messageInput}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <div className={styles.messageActions}>
                  <button className={styles.attachButton}></button>
                  <button
                    className={styles.sendButton}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <FiSend />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noConversationSelected}>
              <div className={styles.noConversationMessage}>
                <FiMessageSquare size={48} />
                <h3>No conversation selected</h3>
                <p>Select a conversation from the sidebar to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
