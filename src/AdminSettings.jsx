import { useState } from "react";
import {
  FiSave,
  FiLock,
  FiMail,
  FiGlobe,
  FiUser,
  FiPhone,
} from "react-icons/fi";
import styles from "./DesignerDashboard.module.css";

function AdminSettings({ userId, role }) {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@interiora.com",
    phone: "+1 (555) 987-6543",
    jobTitle: "System Administrator",
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);

    // Simulate saving
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="container-fluid py-4">
      <h1 className="h3 mb-4">Admin Settings</h1>

      <div className="row">
        <div className="col-md-3 mb-4 mb-md-0">
          <div className="card shadow-sm">
            <div className="list-group list-group-flush">
              {/* <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                  activeTab === "general" ? "active" : ""
                }`}
                onClick={() => setActiveTab("general")}
              >
                <FiGlobe />
                General Settings
              </button> */}
              {/* <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <FiUser />
                Profile
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                  activeTab === "password" ? "active" : ""
                }`}
                onClick={() => setActiveTab("password")}
              >
                <FiLock />
                Password
              </button> */}
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card shadow-sm">
            <div className="card-body">
              {activeTab === "general" && (
                <form onSubmit={handleSave}>
                  <h5 className="mb-4">General Settings</h5>

                  <div className="mb-3">
                    <label htmlFor="siteName" className="form-label">
                      Site Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="siteName"
                      defaultValue="Interiora Admin"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="siteUrl" className="form-label">
                      Site URL
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      id="siteUrl"
                      defaultValue="https://interiora.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="contactEmail" className="form-label">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="contactEmail"
                      defaultValue="admin@interiora.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="timezone" className="form-label">
                      Timezone
                    </label>
                    <select className="form-select" id="timezone">
                      <option value="UTC">UTC</option>
                      <option value="America/New_York" selected>
                        America/New_York
                      </option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              )}

              {activeTab === "profile" && (
                <form onSubmit={handleSave}>
                  <h5 className="mb-4">Profile Information</h5>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="fullName" className="form-label">
                        Full Name
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiUser />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          id="fullName"
                          value={profile.name}
                          onChange={(e) =>
                            setProfile({ ...profile, name: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiMail />
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={profile.email}
                          onChange={(e) =>
                            setProfile({ ...profile, email: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="phone" className="form-label">
                        Phone
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiPhone />
                        </span>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          value={profile.phone}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="jobTitle" className="form-label">
                        Job Title
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="jobTitle"
                        value={profile.jobTitle}
                        onChange={(e) =>
                          setProfile({ ...profile, jobTitle: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Save Profile
                      </>
                    )}
                  </button>
                </form>
              )}

              {activeTab === "password" && (
                <form onSubmit={handleSave}>
                  <h5 className="mb-4">Change Password</h5>

                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      required
                    />
                    <div className="form-text">
                      Password must be at least 8 characters and include a mix
                      of letters, numbers, and symbols.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
