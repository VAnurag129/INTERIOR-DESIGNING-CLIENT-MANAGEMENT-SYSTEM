import { useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import {
  FiHome,
  FiShoppingBag,
  FiSettings,
  FiMessageSquare,
  FiCalendar,
  FiLogOut,
} from "react-icons/fi";
import styles from "./DesignerLayout.module.css"; // Reusing designer layout styles
import logo from "../assets/Logo.png"; // Updated path with correct casing

function VendorLayout({ onLogout, username = "User" }) {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();

  // Get the first name from the username
  const firstName = username.split(" ")[0];

  // Get initials for the avatar
  function getInitials(name) {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  const userInitials = getInitials(username);

  // Closes the sidebar when clicking outside
  function closeSidebar(e) {
    if (!collapsed && e.target.closest(`.${styles.sidebar}`) === null) {
      setCollapsed(true);
    }
  }

  // Check if the current route is active
  function isActive(path) {
    return location.pathname.includes(path);
  }

  // Handle logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className={styles.layout} onClick={closeSidebar}>
      {/* Header with Logo and Hamburger */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            }}
          >
            <img src={logo} alt="Logo" className={styles.logoButton} />
          </button>
          <span className={styles.logo}>Interiora</span>
        </div>

        {/* Welcome message and avatar */}
        <div className={styles.headerRight}>
          <div className={styles.welcomeMessage}>Welcome, {firstName}!</div>
          <div className={styles.headerAvatar}>
            <div className={styles.avatarInitials}>{userInitials}</div>
          </div>
        </div>
      </header>

      {/* Sidebar (Starts Below Header) */}
      <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        <Sidebar
          collapsed={collapsed}
          width="250px"
          rootStyles={{
            border: "none",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className={styles.sidebarContent}>
            <Menu
              menuItemStyles={{
                button: ({ level, active }) => {
                  return {
                    fontFamily: "Inter, sans-serif",
                    fontWeight: active ? "500" : "400",
                    transition: "all 0.2s ease",
                  };
                },
                icon: {
                  fontSize: "1.25rem",
                },
                label: {
                  fontSize: "0.95rem",
                },
              }}
            >
              <MenuItem
                active={isActive("/vendor/dashboard")}
                onClick={() => setCollapsed(true)}
                component={<Link to="/vendor/dashboard" />}
                icon={<FiHome />}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                active={isActive("/vendor/products")}
                onClick={() => setCollapsed(true)}
                component={<Link to="/vendor/products" />}
                icon={<FiShoppingBag />}
              >
                Products
              </MenuItem>

              <div className={styles.sidebarDivider}></div>

              <MenuItem
                active={isActive("/vendor/messages")}
                onClick={() => setCollapsed(true)}
                component={<Link to="/vendor/messages" />}
                icon={<FiMessageSquare />}
              >
                Messages
              </MenuItem>
              <MenuItem
                active={isActive("/vendor/schedules")}
                onClick={() => setCollapsed(true)}
                component={<Link to="/vendor/schedules" />}
                icon={<FiCalendar />}
              >
                Schedules
              </MenuItem>
              {/* <MenuItem
                active={isActive("/vendor/settings")}
                onClick={() => setCollapsed(true)}
                component={<Link to="/vendor/settings" />}
                icon={<FiSettings />}
              >
                Settings
              </MenuItem> */}
            </Menu>
          </div>

          {/* User Profile Section with Logout */}
          <div className={styles.userProfile}>
            {!collapsed ? (
              <>
                <div className={styles.profileAvatar}>
                  <div className={styles.avatarInitials}>{userInitials}</div>
                </div>
                <div className={styles.profileInfo}>
                  <div className={styles.profileName}>{username}</div>
                  <div className={styles.profileRole}>Vendor</div>
                </div>
                <button className={styles.logoutButton} onClick={handleLogout}>
                  <FiLogOut />
                </button>
              </>
            ) : (
              <button
                className={styles.collapsedLogoutButton}
                onClick={handleLogout}
                title="Logout"
              >
                <FiLogOut />
              </button>
            )}
          </div>
        </Sidebar>
      </div>

      {/* Main Content */}
      <main className={`${styles.content} ${!collapsed ? styles.blurred : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}

export default VendorLayout;
