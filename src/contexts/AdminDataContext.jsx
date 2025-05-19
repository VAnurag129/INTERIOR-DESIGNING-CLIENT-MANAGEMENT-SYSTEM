import { createContext, useContext, useState } from "react";

// Create the context
const AdminDataContext = createContext();

// Custom hook to use the admin data context
export function useAdminData() {
  return useContext(AdminDataContext);
}

// Provider component that wraps the app and makes admin data available
export function AdminDataProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Values to be provided to consuming components
  const value = {
    projects,
    setProjects,
    clients,
    setClients,
    designers,
    setDesigners,
    vendors,
    setVendors,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}
