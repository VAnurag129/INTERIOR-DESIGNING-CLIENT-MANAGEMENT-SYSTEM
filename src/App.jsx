import { DesignerDataProvider } from "./contexts/DesignerDataContext.jsx";
import { ClientDataProvider } from "./contexts/ClientDataContext.jsx";
import { AdminDataProvider } from "./contexts/AdminDataContext.jsx";
import { VendorDataProvider } from "./contexts/VendorDataContext.jsx";

import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./components/Login.jsx";
import LandingPage from "./components/LandingPage.jsx";
import DesignerLayout from "./components/DesignerLayout.jsx";
import ClientLayout from "./components/ClientLayout.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import VendorLayout from "./components/VendorLayout.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ClientDashboard from "./components/ClientDashboard.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import VendorDashboard from "./components/VendorDashboard.jsx";
import AdminUsers from "./components/AdminUsers.jsx";
import AdminProjects from "./components/AdminProjects.jsx";
import AdminSettings from "./components/AdminSettings.jsx";
import ClientSettings from "./components/ClientSettings.jsx";
import VendorSettings from "./components/VendorSettings.jsx";
import Clients from "./components/Clients.jsx";
import Projects from "./components/Projects.jsx";
import ClientProjects from "./components/ClientProjects.jsx";
import Messages from "./components/Messages.jsx";
import VendorMessages from "./components/VendorMessages.jsx";
import ClientMessages from "./components/ClientMessages.jsx";
import Schedules from "./components/Schedules.jsx";
import VendorSchedules from "./components/VendorSchedules.jsx";
import ClientSchedules from "./components/ClientSchedules.jsx";
import Vendors from "./components/Vendors.jsx";
import VendorProducts from "./components/VendorProducts.jsx";
import authService from "./services/authService.js";

// Main App Component
function App() {
  return <AppContent />;
}

// AppContent component that handles navigation and authentication
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const navigate = useNavigate(); // For navigation after login

  // Check if user is already authenticated on mount
  useEffect(function () {
    async function checkAuth() {
      const user = authService.getUser(); // Fetch stored user data
      if (user && user.role) {
        setIsAuthenticated(true);
        setUsername(user.username);
        setUserRole(user.role.toLowerCase());
        // Fix: Use user.userId instead of user.id
        setUserId(user.userId);
        setUserDetails(user.details);
      }
    }
    checkAuth();
  }, []);

  function handleLoginSuccess(user, role, id, details) {
    setIsAuthenticated(true);
    setUsername(user);
    setUserRole(role.toLowerCase());
    setUserId(id);
    setUserDetails(details);

    // Redirect to respective dashboard
    navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
  }

  function handleLogout() {
    authService.logout();
    setIsAuthenticated(false);
    setUsername("");
    setUserRole("");
    setUserId("");

    localStorage.clear();

    navigate("/login");
  }

  // Protected Route wrapper
  function ProtectedRoute({ children, allowedRoles }) {
    if (!isAuthenticated || !allowedRoles.includes(userRole)) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          isAuthenticated && userRole ? (
            <Navigate to={`/${userRole}/dashboard`} replace />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      {/* Protected Routes for different roles */}
      <Route
        path="/designer/*"
        element={
          <ProtectedRoute allowedRoles={["designer"]}>
            <DesignerDataProvider>
              <DesignerLayout onLogout={handleLogout} username={username} />
            </DesignerDataProvider>
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <Dashboard
              username={username}
              role={userRole}
              userId={userId}
              userDetails={userDetails}
            />
          }
        />
        <Route
          path="clients"
          element={
            <Clients username={username} role={userRole} userId={userId} />
          }
        />
        <Route
          path="projects"
          element={
            <Projects username={username} role={userRole} userId={userId} />
          }
        />
        <Route
          path="messages"
          element={
            <Messages username={username} role={userRole} userId={userId} />
          }
        />
        <Route
          path="schedules"
          element={
            <Schedules username={username} role={userRole} userId={userId} />
          }
        />
        <Route
          path="vendors"
          element={
            <Vendors username={username} role={userRole} userId={userId} />
          }
        />
        <Route
          path="*"
          element={<Navigate to="/designer/dashboard" replace />}
        />
      </Route>

      {/* Client Routes */}
      <Route
        path="/client/*"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientDataProvider>
              <ClientLayout onLogout={handleLogout} username={username} />
            </ClientDataProvider>
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <ClientDashboard
              username={username}
              role={userRole}
              userId={userId}
              userDetails={userDetails}
            />
          }
        />
        <Route
          path="projects"
          element={
            <ClientProjects
              username={username}
              role={userRole}
              userId={userId}
            />
          }
        />
        <Route
          path="messages"
          element={
            <ClientMessages
              username={username}
              role={userRole}
              userId={userId}
            />
          }
        />
        <Route
          path="schedules"
          element={
            <ClientSchedules
              username={username}
              role={userRole}
              userId={userId}
            />
          }
        />
        <Route
          path="settings"
          element={<ClientSettings userId={userId} role={userRole} />}
        />
        <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDataProvider>
              <AdminLayout onLogout={handleLogout} username={username} />
            </AdminDataProvider>
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <AdminDashboard
              username={username}
              role={userRole}
              userId={userId}
              userDetails={userDetails}
            />
          }
        />
        <Route
          path="users"
          element={<AdminUsers userId={userId} role={userRole} />}
        />
        <Route
          path="projects"
          element={<AdminProjects userId={userId} role={userRole} />}
        />
        <Route
          path="settings"
          element={<AdminSettings userId={userId} role={userRole} />}
        />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Vendor Routes */}
      <Route
        path="/vendor/*"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <VendorDataProvider>
              <VendorLayout onLogout={handleLogout} username={username} />
            </VendorDataProvider>
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <VendorDashboard
              username={username}
              role={userRole}
              userId={userId}
              userDetails={userDetails}
            />
          }
        />
        <Route
          path="products"
          element={
            <VendorProducts
              username={username}
              role={userRole}
              userId={userId}
            />
          }
        />
        <Route
          path="messages"
          element={
            <VendorMessages
              username={username}
              role={userRole}
              userId={userId}
            />
          }
        />
        <Route
          path="schedules"
          element={
            <VendorSchedules
              username={username}
              role={userRole}
              userId={userId}
            />
          }
        />
        <Route
          path="settings"
          element={<VendorSettings userId={userId} role={userRole} />}
        />
        <Route path="*" element={<Navigate to="/vendor/dashboard" replace />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
