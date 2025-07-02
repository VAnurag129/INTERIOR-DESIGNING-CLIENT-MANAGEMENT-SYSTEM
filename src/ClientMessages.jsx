import React, { useState, useEffect } from "react";

import { useClientData } from "../contexts/ClientDataContext";
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

function ClientMessages({ username, role, userId }) {
  const { conversations, setConversations, projects, designers } =
    useClientData();
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, projects, designers
  const [filterValue, setFilterValue] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we have designer data from navigation
  useEffect(() => {
    if (location.state?.designerId) {
      const designerId = location.state.designerId;
      const designerName = location.state.designerName;

      // Clear the navigation state to prevent re-opening on refresh
      navigate(location.pathname, { replace: true, state: {} });

      // After conversations are loaded, find and set the designer conversation
      const findDesignerConversation = () => {
        if (!isLoading && conversations.length > 0) {
          // Find conversation with this designer
          const designerConvo = conversations.find(
            (conv) =>
              conv.participants.includes(designerId) &&
              conv.participants.includes(userId)
          );

          if (designerConvo) {
            setActiveConversation(designerConvo);
            // Set filter to show all conversations
            setFilterType("all");
            setFilterValue("all");
          } else {
            console.log("No conversation found with designer:", designerId);
            // Here you could potentially create a new conversation with the designer
          }
        }
      };

      findDesignerConversation();
    }
  }, [location, navigate, conversations, userId, isLoading]);

  useEffect(() => {
    const fetchClientConvos = async () => {
      try {
        setIsLoading(true);

        if (userId && conversations.length === 0) {
          // Fetch data from the API only if context data is empty
          const data = await api.getUserData(userId, role);

          // Filter conversations where this client is a participant
          const clientConversations = data.conversations.filter((conv) =>
            conv.participants.includes(userId)
          );

          // Save data to context
          setConversations(clientConversations);

          console.log(
            "Fetched Client Conversations from API:",
            clientConversations
          );
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setIsLoading(false); // Ensure loading is set to false after fetching
      }
    };

    fetchClientConvos();
  }, [userId, role, conversations.length, setConversations]);

  // Apply filters when filter type or value changes
  useEffect(() => {
    if (conversations) {
      filterConversations();
    }
  }, [filterType, filterValue, searchTerm, conversations]);

  // Handle filtering conversations
  const filterConversations = () => {
    if (!conversations || conversations.length === 0) {
      setFilteredConversations([]);
      return;
    }

    let filtered = [...conversations];

    // Apply search term filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((conv) => {
        const participantMatches = conv.participants.some((participantId) => {
          if (participantId === userId) return false; // Skip self

          const designer = designers.find((d) => d.id === participantId);
          if (designer) {
            return designer.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
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
    } else if (filterType === "designers" && filterValue !== "all") {
      filtered = filtered.filter((conv) =>
        conv.participants.includes(filterValue)
      );
    }

    setFilteredConversations(filtered);
  };

  // Get the other participant in the conversation (not the client)
  const getOtherParticipant = (conversation) => {
    // Filter out the current user (client) to get the other participants
    const otherParticipants = conversation.participants.filter(
      (participantId) => participantId !== userId
    );

    // Return the first other participant (typically the designer)
    return otherParticipants[0] || null;
  };

  // Get the participant name
  const getParticipantName = (participantId) => {
    if (participantId === userId) return "You";

    const designer = designers.find((d) => d.id === participantId);
    if (designer) return designer.name;

    return "Unknown User";
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!activeConversation || !newMessage.trim()) return;

    // Create new message object
    const newMessageObj = {
      id: `msg_${Date.now()}`, // Generate a unique ID
      sender: userId,
      timestamp: new Date().toISOString(),
      content: newMessage.trim(),
      attachments: [],
      read_by: [userId],
    };

    // Update the active conversation with the new message
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessageObj],
    };

    // Update the conversations state by replacing the active conversation
    const updatedConversations = conversations.map((conv) =>
      conv.id === activeConversation.id ? updatedConversation : conv
    );

    // Update state
    setActiveConversation(updatedConversation);
    setConversations(updatedConversations);
    setNewMessage(""); // Clear input

    // Save to DB
    try {
      await api.addMessageToConversation(activeConversation.id, newMessageObj);
    } catch (error) {
      alert("Failed to send message to server.");
      console.error(error);
    }
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
      <h1 className={styles.pageTitle}>My Messages</h1>

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
                  <option value="designers">By Designer</option>
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
                    {filterType === "designers" &&
                      designers.map((designer) => (
                        <option key={designer.id} value={designer.id}>
                          {designer.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className={styles.conversationsList}>
            {!filteredConversations || filteredConversations.length === 0 ? (
              <div className={styles.noResults}>No conversations found</div>
            ) : (
              filteredConversations.map((conversation) => {
                const lastMessage =
                  conversation.messages[conversation.messages.length - 1];
                // Get the other participant (not the client) for display
                const otherParticipantId = getOtherParticipant(conversation);

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
                        {otherParticipantId
                          ? getParticipantName(otherParticipantId).charAt(0)
                          : "?"}
                      </div>
                      <div className={styles.participantDetails}>
                        <div className={styles.participantName}>
                          {otherParticipantId
                            ? getParticipantName(otherParticipantId)
                            : "Unknown"}
                        </div>
                        <div className={styles.projectName}>
                          {getProjectName(conversation.project_id)}
                        </div>
                      </div>
                      <div className={styles.messageTime}>
                        {lastMessage ? formatDate(lastMessage.timestamp) : ""}
                      </div>
                    </div>
                    <div className={styles.messagePreview}>
                      {lastMessage
                        ? lastMessage.content.length > 60
                          ? `${lastMessage.content.substring(0, 60)}...`
                          : lastMessage.content
                        : "No messages yet"}
                    </div>
                    {lastMessage &&
                      lastMessage.attachments &&
                      lastMessage.attachments.length > 0 && (
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
                    {/* Show all participants except the current user (client) */}
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

                        {message.attachments &&
                          message.attachments.length > 0 && (
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
                  <button className={styles.attachButton}>
                    <FiPaperclip />
                  </button>
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

export default ClientMessages;
