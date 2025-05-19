import React, { createContext, useContext, useState, useEffect } from "react";

const VendorDataContext = createContext();

export function useVendorData() {
  const context = useContext(VendorDataContext);
  if (!context) {
    throw new Error("useVendorData must be used within a VendorDataProvider");
  }
  return context;
}

export function VendorDataProvider({ children }) {
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

  // State for storing data from API
  const [products, setProducts] = useState(safeParse("vendorProducts"));
  const [conversations, setConversations] = useState(
    safeParse("vendorConversations")
  );
  const [schedules, setSchedules] = useState(safeParse("vendorSchedules"));
  const [designers, setDesigners] = useState(safeParse("vendorDesigners"));

  // Sync data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("vendorProducts", JSON.stringify(products));
    console.log("Updated Products in localStorage:", products);
  }, [products]);

  useEffect(() => {
    localStorage.setItem("vendorConversations", JSON.stringify(conversations));
    console.log("Updated Conversations in localStorage:", conversations);
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("vendorSchedules", JSON.stringify(schedules));
    console.log("Updated Schedules in localStorage:", schedules);
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem("vendorDesigners", JSON.stringify(designers));
    console.log("Updated Designers in localStorage:", designers);
  }, [designers]);

  // Values to provide through the context
  const value = {
    // Data states
    products,
    setProducts,
    conversations,
    setConversations,
    schedules,
    setSchedules,
    designers,
    setDesigners,
  };

  return (
    <VendorDataContext.Provider value={value}>
      {children}
    </VendorDataContext.Provider>
  );
}
