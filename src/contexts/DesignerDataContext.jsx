import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const DesignerDataContext = createContext();

// Custom hook to use the DesignerDataContext
export function useDesignerData() {
  const context = useContext(DesignerDataContext);
  if (!context) {
    throw new Error(
      "useDesignerData must be used within a DesignerDataProvider"
    );
  }
  return context;
}

// Provider component
export const DesignerDataProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

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
    const storedProjects = safeParse("projects");
    const storedClients = safeParse("clients");
    const storedSchedules = safeParse("schedules");
    const storedConversations = safeParse("conversations");
    const storedVendors = safeParse("vendors");
    const storedProducts = safeParse("products");

    if (storedProjects.length > 0) {
      setProjects(storedProjects);
      console.log("Initialized Projects from localStorage:", storedProjects);
    }

    if (storedClients.length > 0) {
      setClients(storedClients);
      console.log("Initialized Clients from localStorage:", storedClients);
    }
    if (storedSchedules.length > 0) {
      setSchedules(storedSchedules);
      console.log("Initialized Schedules from localStorage:", storedSchedules);
    }

    if (storedConversations.length > 0) {
      setConversations(storedConversations);
      console.log(
        "Initialized Conversations from localStorage:",
        storedConversations
      );
    }

    if (storedVendors.length > 0) {
      setVendors(storedVendors);
      console.log("Initialized Vendors from localStorage:", storedVendors);
    }

    if (storedProducts.length > 0) {
      setProducts(storedProducts);
      console.log("Initialized Products from localStorage:", storedProducts);
    }
  }, []);

  // Sync data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
    console.log("Updated Projects in localStorage:", projects);
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(clients));
    console.log("Updated Clients in localStorage:", clients);
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("schedules", JSON.stringify(schedules));
    console.log("Updated Schedules in localStorage:", schedules);
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
    console.log("Updated Conversations in localStorage:", conversations);
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("vendors", JSON.stringify(vendors));
    console.log("Updated Vendors in localStorage:", vendors);
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
    console.log("Updated Products in localStorage:", products);
  }, [products]);

  return (
    <DesignerDataContext.Provider
      value={{
        projects,
        setProjects,
        clients,
        setClients,
        schedules,
        setSchedules,
        conversations,
        setConversations,
        vendors,
        setVendors,
        products,
        setProducts,
      }}
    >
      {children}
    </DesignerDataContext.Provider>
  );
};
