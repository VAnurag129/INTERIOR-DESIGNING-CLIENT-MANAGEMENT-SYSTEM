import React, { useState } from "react";
import styles from "./DesignerLayout.module.css"; // Reusing styles

function VendorSettings({ userId, role }) {
  const [formData, setFormData] = useState({
    name: "My Company Name",
    email: "vendor@example.com",
    phone: "+1 555-123-4567",
    address: "123 Business St, City, State 12345",
    website: "https://mycompany.com",
    description:
      "We provide high-quality materials for interior design projects.",
    minOrderValue: "100",
    shippingTime: "3-5 business days",
    paymentTerms: "Net 30",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to update the user settings
    setSuccessMessage("Settings updated successfully!");
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Account Settings</h1>

      {successMessage && (
        <div className="alert alert-success mb-4" role="alert">
          {successMessage}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <h3 className="mb-3">Company Information</h3>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="name" className="form-label">
                  Company Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="website" className="form-label">
                  Website
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                Business Address
              </label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Company Description
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <h3 className="mb-3 mt-4">Business Terms</h3>
            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="minOrderValue" className="form-label">
                  Minimum Order Value ($)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="minOrderValue"
                  name="minOrderValue"
                  value={formData.minOrderValue}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="shippingTime" className="form-label">
                  Average Shipping Time
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="shippingTime"
                  name="shippingTime"
                  value={formData.shippingTime}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="paymentTerms" className="form-label">
                  Payment Terms
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="paymentTerms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h3 className="mb-3">Security</h3>
          <div className="mb-3">
            <label htmlFor="currentPassword" className="form-label">
              Current Password
            </label>
            <input
              type="password"
              className="form-control"
              id="currentPassword"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <input type="password" className="form-control" id="newPassword" />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
            />
          </div>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button type="button" className="btn btn-primary">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorSettings;
