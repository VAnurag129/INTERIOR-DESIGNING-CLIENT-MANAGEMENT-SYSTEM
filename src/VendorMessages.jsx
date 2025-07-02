import React, { useState, useEffect } from "react";
import { useVendorData } from "../contexts/VendorDataContext";
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
import styles from "./Messages.module.css"; // Reusing existing styles

function VendorMessages({ username, role, userId }) {
  const { conversations, setConversations, products, designers, setDesigners } =
    useVendorData();
  const [filteredConversations, setFilteredConversations] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, products
  const [filterValue, setFilterValue] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we have a direct link to a designer conversation
  useEffect(() => {
    if (location.state?.designerId) {
      const designerId = location.state.designerId;

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

  // Fetch conversations and designers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (userId) {
          // Fetch conversations from the API if context data is empty
          if (conversations.length === 0) {
            const data = await api.getUserData(userId, role);
            setConversations(data.conversations || []);
            console.log("Fetched Conversations from API:", data.conversations);
          }

          // Fetch designer data if empty
          if (designers.length === 0) {
            try {
              const designerData = await api.getDesigners();
              if (designerData) {
                setDesigners(designerData);
                console.log("Fetched Designers from API:", designerData);
              }
            } catch (error) {
              console.error("Error fetching designers:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    userId,
    role,
    conversations.length,
    designers.length,
    setConversations,
    setDesigners,
  ]);

  // Apply filters when filter type or value changes
  useEffect(() => {
    filterConversations();
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
        // Check message content
        const contentMatches = conv.messages.some((msg) =>
          msg.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return contentMatches;
      });
    }

    // Apply type filter
    if (filterType === "products" && filterValue !== "all") {
      filtered = filtered.filter((conv) => conv.product_id === filterValue);
    }

    setFilteredConversations(filtered);
  };

  // Handle sending a new message
  const handleSendMessage = () => {
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
  };

  // Get the participant name (designer or client)
  const getParticipantName = (participantId) => {
    if (participantId === userId) return "You";

    // Try to find the designer by ID
    const designer = designers.find((d) => d.id === participantId);
    if (designer) {
      return designer.name;
    }

    // If no match found, use a generic name based on ID
    const idParts = participantId.split("_");
    const role = idParts[0].charAt(0).toUpperCase() + idParts[0].slice(1);
    return `${role} ${idParts[1] || ""}`;
  };

  // Get the product name if related to a product
  const getProductName = (productId) => {
    if (!productId) return "General";

    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Unknown Product";
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
                  <option value="products">By Product</option>
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
                    {filterType === "products" &&
                      products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
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
                          {getProductName(conversation.product_id)}
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
                    {getProductName(activeConversation.product_id)}
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

export default VendorMessages;
