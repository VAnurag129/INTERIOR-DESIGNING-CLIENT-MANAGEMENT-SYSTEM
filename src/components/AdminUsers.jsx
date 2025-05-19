import { useState, useEffect } from "react";
import { useAdminData } from "../contexts/AdminDataContext";
import {
  FiSearch,
  FiUser,
  FiUsers,
  FiShoppingBag,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import styles from "./Clients.module.css";
import api from "../services/api.js";

function AdminUsers({ userId, role }) {
  const [loading, setLoading] = useState(true);
  const { clients, setClients, designers, setDesigners, vendors, setVendors } =
    useAdminData();
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const data = await api.getUserData(userId, role);

        // Save data to context
        setClients(data.clients || []);
        setDesigners(data.designers || []);
        setVendors(data.vendors || []);

        // Process users for display
        const allUsers = {
          clients: data.clients || [],
          designers: data.designers || [],
          vendors: data.vendors || [],
        };
        processUsers(allUsers, searchTerm, userTypeFilter);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we don't already have data
    if (
      clients.length === 0 ||
      designers.length === 0 ||
      vendors.length === 0
    ) {
      fetchUsers();
    } else {
      setLoading(false);
      const allUsers = {
        clients,
        designers,
        vendors,
      };
      processUsers(allUsers, searchTerm, userTypeFilter);
    }
  }, [
    userId,
    role,
    clients.length,
    designers.length,
    vendors.length,
    setClients,
    setDesigners,
    setVendors,
  ]);

  // Process and filter users whenever searchTerm or userTypeFilter changes
  useEffect(() => {
    const allUsers = {
      clients,
      designers,
      vendors,
    };
    processUsers(allUsers, searchTerm, userTypeFilter);
  }, [searchTerm, userTypeFilter, clients, designers, vendors]);

  const processUsers = (users, search, filter) => {
    let combined = [];

    // Add clients
    if (filter === "all" || filter === "clients") {
      const processedClients = users.clients.map((client) => ({
        ...client,
        userType: "client",
        displayName: client.name || client.contact_person || "Unknown Client",
        email: client.email || "N/A",
        phone: client.phone || "N/A",
        address: client.company?.address || "N/A",
      }));
      combined = [...combined, ...processedClients];
    }

    // Add designers
    if (filter === "all" || filter === "designers") {
      const processedDesigners = users.designers.map((designer) => ({
        ...designer,
        userType: "designer",
        displayName: designer.name || "Unknown Designer",
        email: designer.email || "N/A",
        phone: designer.phone || "N/A",
        address: designer.address || "N/A",
      }));
      combined = [...combined, ...processedDesigners];
    }

    // Add vendors
    if (filter === "all" || filter === "vendors") {
      const processedVendors = users.vendors.map((vendor) => ({
        ...vendor,
        userType: "vendor",
        displayName: vendor.contact || "Unknown Vendor",
        email: vendor.email || "N/A",
        phone: vendor.phone || "N/A",
        address: vendor.address || "N/A",
      }));
      combined = [...combined, ...processedVendors];
    }

    // Apply search filter
    if (search) {
      const lowercaseSearch = search.toLowerCase();
      combined = combined.filter((user) => {
        return (
          user.displayName.toLowerCase().includes(lowercaseSearch) ||
          user.email.toLowerCase().includes(lowercaseSearch) ||
          user.phone.toLowerCase().includes(lowercaseSearch) ||
          user.address.toLowerCase().includes(lowercaseSearch) ||
          user.userType.toLowerCase().includes(lowercaseSearch) ||
          (user.id && user.id.toString().includes(lowercaseSearch))
        );
      });
    }

    // Calculate pagination
    const totalResults = combined.length;
    const calculatedTotalPages = Math.ceil(totalResults / usersPerPage);
    setTotalPages(calculatedTotalPages || 1);

    // Adjust current page if needed
    if (currentPage > calculatedTotalPages) {
      setCurrentPage(1);
    }

    // Get users for current page
    const startIndex = (currentPage - 1) * usersPerPage;
    const paginatedUsers = combined.slice(
      startIndex,
      startIndex + usersPerPage
    );

    setDisplayedUsers(paginatedUsers);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

    // Recalculate displayed users for the new page
    const startIndex = (newPage - 1) * usersPerPage;
    let combined = [];

    if (userTypeFilter === "all" || userTypeFilter === "clients") {
      combined = [
        ...combined,
        ...clients.map((client) => ({
          ...client,
          userType: "client",
          displayName: client.name || client.contact_person || "Unknown Client",
          email: client.email || "N/A",
          phone: client.phone || "N/A",
          address: client.company?.address || "N/A",
        })),
      ];
    }

    if (userTypeFilter === "all" || userTypeFilter === "designers") {
      combined = [
        ...combined,
        ...designers.map((designer) => ({
          ...designer,
          userType: "designer",
          displayName: designer.name || "Unknown Designer",
          email: designer.email || "N/A",
          phone: designer.phone || "N/A",
          address: designer.address || "N/A",
        })),
      ];
    }

    if (userTypeFilter === "all" || userTypeFilter === "vendors") {
      combined = [
        ...combined,
        ...vendors.map((vendor) => ({
          ...vendor,
          userType: "vendor",
          displayName: vendor.company_name || "Unknown Vendor",
          email: vendor.email || "N/A",
          phone: vendor.phone || "N/A",
          address: vendor.address || "N/A",
        })),
      ];
    }

    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      combined = combined.filter((user) => {
        return (
          user.displayName.toLowerCase().includes(lowercaseSearch) ||
          user.email.toLowerCase().includes(lowercaseSearch) ||
          user.phone.toLowerCase().includes(lowercaseSearch) ||
          user.address.toLowerCase().includes(lowercaseSearch) ||
          user.userType.toLowerCase().includes(lowercaseSearch) ||
          (user.id && user.id.toString().includes(lowercaseSearch))
        );
      });
    }

    const paginatedUsers = combined.slice(
      startIndex,
      startIndex + usersPerPage
    );
    setDisplayedUsers(paginatedUsers);
  };

  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case "client":
        return <FiUsers className="text-primary" />;
      case "designer":
        return <FiUser className="text-success" />;
      case "vendor":
        return <FiShoppingBag className="text-warning" />;
      default:
        return <FiUser />;
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading users...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-4">User Management</h1>

      {/* Filters and Search Bar */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="btn-group" role="group">
            <button
              className={`btn ${
                userTypeFilter === "all" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setUserTypeFilter("all")}
            >
              All Users
            </button>
            <button
              className={`btn ${
                userTypeFilter === "clients"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setUserTypeFilter("clients")}
            >
              Clients
            </button>
            <button
              className={`btn ${
                userTypeFilter === "designers"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setUserTypeFilter("designers")}
            >
              Designers
            </button>
            <button
              className={`btn ${
                userTypeFilter === "vendors"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setUserTypeFilter("vendors")}
            >
              Vendors
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <FiSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No users found
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
                  <tr key={`${user.userType}-${user.id}`}>
                    <td>{user.id}</td>
                    <td>
                      <span className="d-flex align-items-center gap-2">
                        {getUserTypeIcon(user.userType)}
                        <span className="text-capitalize">{user.userType}</span>
                      </span>
                    </td>
                    <td>{user.displayName}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td className="text-truncate" style={{ maxWidth: "200px" }}>
                      {user.address}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary">
                          <FiEdit size={16} />
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer d-flex justify-content-center">
            <nav>
              <ul className="pagination mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>

                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
