import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const ClientDataContext = createContext();

// Custom hook to use the ClientDataContext
export function useClientData() {
  const context = useContext(ClientDataContext);
  if (!context) {
    throw new Error("useClientData must be used within a ClientDataProvider");
  }
  return context;
}

// Provider component
export const ClientDataProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [designers, setDesigners] = useState([]);

  // Safely parse data from localStorage
  const safeParse = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return [];
    }
  };

  // Initialize data from localStorage when the provider is mounted
  useEffect(() => {
    const storedProjects = safeParse("client_projects");
    const storedSchedules = safeParse("client_schedules");
    const storedConversations = safeParse("client_conversations");
    const storedDesigners = safeParse("designers");

    if (storedProjects.length > 0) {
      setProjects(storedProjects);
      console.log(
        "Initialized Client Projects from localStorage:",
        storedProjects
      );
    }

    if (storedSchedules.length > 0) {
      setSchedules(storedSchedules);
      console.log(
        "Initialized Client Schedules from localStorage:",
        storedSchedules
      );
    }

    if (storedConversations.length > 0) {
      setConversations(storedConversations);
      console.log(
        "Initialized Client Conversations from localStorage:",
        storedConversations
      );
    }

    if (storedDesigners.length > 0) {
      setDesigners(storedDesigners);
      console.log("Initialized Designers from localStorage:", storedDesigners);
    }
  }, []);

  // Sync data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("client_projects", JSON.stringify(projects));
    // console.log("Updated Client Projects in localStorage:", projects);
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("client_schedules", JSON.stringify(schedules));
    // console.log("Updated Client Schedules in localStorage:", schedules);
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem("client_conversations", JSON.stringify(conversations));
    // console.log("Updated Client Conversations in localStorage:", conversations);
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("designers", JSON.stringify(designers));
    // console.log("Updated Designers in localStorage:", designers);
  }, [designers]);

  return (
    <ClientDataContext.Provider
      value={{
        projects,
        setProjects,
        schedules,
        setSchedules,
        conversations,
        setConversations,
        designers,
        setDesigners,
      }}
    >
      {children}
    </ClientDataContext.Provider>
  );
};
