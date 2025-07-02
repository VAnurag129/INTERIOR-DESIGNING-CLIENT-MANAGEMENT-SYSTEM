import { useState, useEffect } from "react";
import { useAdminData } from "../contexts/AdminDataContext";
import {
  FiSearch,
  FiUser,
  FiUsers,
  FiShoppingBag,
  FiEdit,
  FiTrash2,
  FiPlus,
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

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editFormError, setEditFormError] = useState("");
  const [editFormSuccess, setEditFormSuccess] = useState("");
  const [editFormLoading, setEditFormLoading] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);

  // Form state for new designer/vendor
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    company_name: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const data = await api.getUserData(userId, role);

        setClients(data.clients || []);
        setDesigners(data.designers || []);
        setVendors(data.vendors || []);

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

    if (filter === "all" || filter === "clients") {
      const processedClients = users.clients.map((client) => ({
        ...client,
        userType: "client",
        displayName: client.name || client.contact_person || "Unknown Client",
        email: client.email || "N/A",
        phone: client.phone || "N/A",
        address: client.company?.address || client.address || "N/A",
      }));
      combined = [...combined, ...processedClients];
    }

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

    if (filter === "all" || filter === "vendors") {
      const processedVendors = users.vendors.map((vendor) => ({
        ...vendor,
        userType: "vendor",
        displayName: vendor.company_name || "Unknown Vendor",
        email: vendor.email || "N/A",
        phone: vendor.phone || "N/A",
        address: vendor.address || "N/A",
      }));
      combined = [...combined, ...processedVendors];
    }

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

    const totalResults = combined.length;
    const calculatedTotalPages = Math.ceil(totalResults / usersPerPage);
    setTotalPages(calculatedTotalPages || 1);

    if (currentPage > calculatedTotalPages) {
      setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * usersPerPage;
    const paginatedUsers = combined.slice(
      startIndex,
      startIndex + usersPerPage
    );

    setDisplayedUsers(paginatedUsers);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

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
          address: client.company?.address || client.address || "N/A",
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

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormLoading(true);

    try {
      if (!newUser.name || !newUser.email || !newUser.password) {
        setFormError("Name, email, and password are required.");
        setFormLoading(false);
        return;
      }

      if (userTypeFilter === "designers") {
        await api.registerDesigner(
          {
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            address: newUser.address,
          },
          newUser.password
        );
        setFormSuccess("Designer created successfully!");
      } else if (userTypeFilter === "vendors") {
        await api.registerVendor(
          {
            company_name: newUser.company_name,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            address: newUser.address,
          },
          newUser.password
        );
        setFormSuccess("Vendor created successfully!");
      }

      setNewUser({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        company_name: "",
      });
      setShowCreateModal(false);
      // Optionally refresh here
    } catch (err) {
      setFormError(err.message || "Failed to create user.");
    } finally {
      setFormLoading(false);
    }
  };

  // --- EDIT HANDLERS ---
  const handleEditClick = (user) => {
    setEditUser({ ...user });
    setShowEditModal(true);
    setEditFormError("");
    setEditFormSuccess("");
  };

  const handleEditInputChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditFormError("");
    setEditFormSuccess("");
    setEditFormLoading(true);

    try {
      if (!editUser.displayName || !editUser.email) {
        setEditFormError("Name and email are required.");
        setEditFormLoading(false);
        return;
      }

      if (editUser.userType === "designer") {
        await api.updateDesigner(editUser.id, {
          name: editUser.displayName,
          email: editUser.email,
          phone: editUser.phone,
          address: editUser.address,
        });
        setEditFormSuccess("Designer updated successfully!");
        setDesigners((prev) => {
          const updated = prev.map((d) =>
            d.id === editUser.id
              ? {
                  ...d,
                  name: editUser.displayName,
                  email: editUser.email,
                  phone: editUser.phone,
                  address: editUser.address,
                }
              : d
          );
          localStorage.setItem("designers", JSON.stringify(updated));
          return updated;
        });
      } else if (editUser.userType === "vendor") {
        await api.updateVendor(editUser.id, {
          company_name: editUser.company_name,
          name: editUser.displayName,
          email: editUser.email,
          phone: editUser.phone,
          address: editUser.address,
        });
        setEditFormSuccess("Vendor updated successfully!");
        setVendors((prev) => {
          const updated = prev.map((v) =>
            v.id === editUser.id
              ? {
                  ...v,
                  company_name: editUser.company_name,
                  name: editUser.displayName,
                  email: editUser.email,
                  phone: editUser.phone,
                  address: editUser.address,
                }
              : v
          );
          localStorage.setItem("vendors", JSON.stringify(updated));
          return updated;
        });
      } else if (editUser.userType === "client") {
        // Update both top-level address and company.address
        await api.updateClient(editUser.id, {
          name: editUser.displayName,
          email: editUser.email,
          phone: editUser.phone,
          address: editUser.address,
          company: editUser.company
            ? { ...editUser.company, address: editUser.address }
            : { address: editUser.address },
        });
        setEditFormSuccess("Client updated successfully!");
        setClients((prev) => {
          const updated = prev.map((c) =>
            c.id === editUser.id
              ? {
                  ...c,
                  name: editUser.displayName,
                  email: editUser.email,
                  phone: editUser.phone,
                  address: editUser.address,
                  company: c.company
                    ? { ...c.company, address: editUser.address }
                    : { address: editUser.address },
                }
              : c
          );
          localStorage.setItem("clients", JSON.stringify(updated));
          return updated;
        });
      }

      setTimeout(() => {
        setEditFormSuccess("");
        setShowEditModal(false);
      }, 1500);
    } catch (err) {
      setEditFormError(err.message || "Failed to update user.");
    } finally {
      setEditFormLoading(false);
    }
  };

  // --- DELETE HANDLERS ---
  const handleDeleteClick = (user) => {
    setDeleteUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;
    try {
      // Call appropriate API based on user type
      if (deleteUser.userType === "designer") {
        await api.deleteDesigner(deleteUser.id);
        setDesigners((prev) => prev.filter((d) => d.id !== deleteUser.id));
      } else if (deleteUser.userType === "vendor") {
        await api.deleteVendor(deleteUser.id);
        setVendors((prev) => prev.filter((v) => v.id !== deleteUser.id));
      } else if (deleteUser.userType === "client") {
        await api.deleteClient(deleteUser.id);
        setClients((prev) => prev.filter((c) => c.id !== deleteUser.id));
      }
    } catch (err) {
      alert("Failed to delete user.");
    } finally {
      setShowDeleteModal(false);
      setDeleteUser(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteUser(null);
  };

  if (loading) {
    return <div className="text-center py-5">Loading users...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-4">User Management</h1>

      {/* Filters, Create Button, and Search Bar */}
      <div className="row mb-4 align-items-center">
        {/* Filters */}
        <div className="col-md-4 mb-3 mb-md-0">
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

        {/* Create Button */}
        <div className="col-md-3 mb-3 mb-md-0 d-flex justify-content-center">
          {(userTypeFilter === "designers" || userTypeFilter === "vendors") && (
            <button
              className="btn btn-success"
              onClick={() => setShowCreateModal(true)}
              type="button"
            >
              <FiPlus />{" "}
              {userTypeFilter === "designers"
                ? "Create Designer"
                : "Create Vendor"}
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="col-md-5">
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

      {/* Modal for creating designer/vendor */}
      {showCreateModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {userTypeFilter === "designers"
                    ? "Create Designer"
                    : "Create Vendor"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateUser}>
                  {userTypeFilter === "vendors" && (
                    <div className="mb-3">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="company_name"
                        value={newUser.company_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={newUser.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={newUser.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={newUser.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  {formError && (
                    <div className="alert alert-danger">{formError}</div>
                  )}
                  {formSuccess && (
                    <div className="alert alert-success">{formSuccess}</div>
                  )}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={formLoading}
                    >
                      {formLoading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Edit{" "}
                  {editUser.userType.charAt(0).toUpperCase() +
                    editUser.userType.slice(1)}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditUser}>
                  {editUser.userType === "vendor" && (
                    <div className="mb-3">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="company_name"
                        value={editUser.company_name || ""}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="displayName"
                      value={editUser.displayName || ""}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editUser.email || ""}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={editUser.phone || ""}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={editUser.address || ""}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  {editFormError && (
                    <div className="alert alert-danger">{editFormError}</div>
                  )}
                  {editFormSuccess && (
                    <div className="alert alert-success">{editFormSuccess}</div>
                  )}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={editFormLoading}
                    >
                      {editFormLoading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteUser && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelDelete}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditClick(user)}
                        >
                          <FiEdit size={20} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <FiTrash2 size={20} />
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
