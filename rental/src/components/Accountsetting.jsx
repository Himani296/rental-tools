import { useState, useEffect } from "react";
import "./Accountsetting.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";

const LANGUAGE_OPTIONS = ["English", "Hindi", "Gujarati"];
const STATE_OPTIONS = [
  "Andhra Pradesh",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
  "Other",
];
const COUNTRY_OPTIONS = ["India", "Other"];

function AccountSetting() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    email: "",
  });
  const [preferencesForm, setPreferencesForm] = useState({
    language: "English",
  });
  const [companyForm, setCompanyForm] = useState({
    name: "",
    legalName: "",
    email: "",
    phone: "",
    website: "",
    gst: "",
    addressLine1: "",
    city: "",
    state: "Gujarat",
    postalCode: "",
    country: "India",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token"); // clear auth token too
    navigate("/login");
  };
  const handleSave = async () => {
    setFormMessage("");
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setFormMessage("Session expired. Please login again.");
      return;
    }

    const payload = {};

    if (activeTab === "profile") {
      if (!profileForm.displayName.trim()) {
        setFormMessage("Display Name is required.");
        return;
      }
      if (
        profileForm.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)
      ) {
        setFormMessage("Please enter a valid email address.");
        return;
      }
      payload.displayName = profileForm.displayName.trim();
      payload.email = profileForm.email.trim().toLowerCase();
    }

    if (activeTab === "preferences") {
      payload.language = preferencesForm.language;
    }

    if (activeTab === "company") {
      payload.company = {
        name: companyForm.name.trim(),
        legalName: companyForm.legalName.trim(),
        email: companyForm.email.trim().toLowerCase(),
        phone: companyForm.phone.trim(),
        website: companyForm.website.trim(),
        gst: companyForm.gst.trim(),
        address: {
          line1: companyForm.addressLine1.trim(),
          city: companyForm.city.trim(),
          state: companyForm.state,
          postalCode: companyForm.postalCode.trim(),
          country: companyForm.country,
        },
      };
    }

    if (activeTab === "password") {
      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        setFormMessage("Current and new password are required.");
        return;
      }
      if (passwordForm.newPassword.length < 6) {
        setFormMessage("New password must be at least 6 characters.");
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setFormMessage("New password and confirm password do not match.");
        return;
      }
      payload.currentPassword = passwordForm.currentPassword;
      payload.newPassword = passwordForm.newPassword;
    }

    setSaving(true);
    try {
      const response = await axios.put(
        `${API_URL}/user/${userId}`,
        payload,
      );
      setUser(response.data);

      if (activeTab === "password") {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
      setFormMessage("Saved successfully.");
    } catch (error) {
      console.log(error);
      setFormMessage(error.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          setLoadError(true);
          return;
        }

        const response = await axios.get(
          `${API_URL}/user/${userId}`,
        );

        const fetchedUser = response.data;
        setUser(fetchedUser);

        setProfileForm({
          displayName: fetchedUser.displayName || "",
          email: fetchedUser.email || "",
        });

        setPreferencesForm({ language: fetchedUser.language || "English" });

        const company = fetchedUser.company || {};
        const address = company.address || {};
        setCompanyForm({
          name: company.name || fetchedUser.displayName || "",
          legalName: company.legalName || "",
          email: company.email || fetchedUser.email || "",
          phone: company.phone || "",
          website: company.website || "",
          gst: company.gst || "",
          addressLine1: address.line1 || "",
          city: address.city || "",
          state: address.state || "Gujarat",
          postalCode: address.postalCode || "",
          country: address.country || "India",
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoadError(true);
      }
    };

    fetchUser();
  }, []);

  if (loadError)
    return (
      <div style={{ padding: 32 }}>
        <p>
          Could not load account details. Please{" "}
          <a href="/login">log in again</a>.
        </p>
      </div>
    );
  if (!user) return <p style={{ padding: 32 }}>Loading account...</p>;
  return (
    <div className="account-container">
      {/* Header */}
      <div className="account-header">
        <h2>RentWaale</h2>
        <div className="header-actions">
          <span className="company-name">
            {companyForm.name || user.displayName || user.username}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button onClick={() => setActiveTab("profile")}>Profile</button>
        <button onClick={() => setActiveTab("preferences")}>Preferences</button>
        <button onClick={() => setActiveTab("company")}>Company</button>
        <button onClick={() => setActiveTab("password")}>Password</button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {activeTab === "profile" && (
          <div>
            <label>Username (read-only)</label>
            <input type="text" value={user.username} disabled />

            <label>Display Name *</label>
            <input
              type="text"
              value={profileForm.displayName}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  displayName: event.target.value,
                }))
              }
            />

            <label>Email</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
            />
          </div>
        )}

        {activeTab === "preferences" && (
          <div>
            <label>Select Language</label>
            <select
              value={preferencesForm.language}
              onChange={(event) =>
                setPreferencesForm({ language: event.target.value })
              }
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === "company" && (
          <div>
            <label>Company Name (read-only)</label>
            <input type="text" value={companyForm.name || "-"} disabled />

            <label>Legal Name</label>
            <input
              type="text"
              value={companyForm.legalName}
              onChange={(event) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  legalName: event.target.value,
                }))
              }
            />

            <label>Email</label>
            <input
              type="email"
              value={companyForm.email}
              onChange={(event) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
            />

            <label>Phone</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={companyForm.phone}
              onChange={(event) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  phone: event.target.value.replace(/\D/g, ""),
                }))
              }
            />

            <label>Website</label>
            <input
              type="text"
              value={companyForm.website}
              onChange={(event) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  website: event.target.value,
                }))
              }
            />

            <label>GST</label>
            <input
              type="text"
              value={companyForm.gst}
              onChange={(event) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  gst: event.target.value.toUpperCase(),
                }))
              }
            />

            <label>Logo Upload</label>
            <input type="file" accept=".png,.jpg,.jpeg,.svg" disabled />

            <label>Address Line 1</label>
            <input
              type="text"
              value={companyForm.addressLine1}
              onChange={(event) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  addressLine1: event.target.value,
                }))
              }
            />

            <label>City</label>
            <input
              type="text"
              value={companyForm.city}
              onChange={(event) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  city: event.target.value,
                }))
              }
            />

            <label>State</label>
            <select
              value={companyForm.state}
              onChange={(event) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  state: event.target.value,
                }))
              }
            >
              {STATE_OPTIONS.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <label>Postal Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={companyForm.postalCode}
              onChange={(event) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  postalCode: event.target.value.replace(/\D/g, ""),
                }))
              }
            />

            <label>Country</label>
            <select
              value={companyForm.country}
              onChange={(event) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  country: event.target.value,
                }))
              }
            >
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === "password" && (
          <div>
            <label>Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: event.target.value,
                }))
              }
            />

            <label>New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: event.target.value,
                }))
              }
            />

            <label>Confirm Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
            />
          </div>
        )}

        {formMessage ? <p className="help-text">{formMessage}</p> : null}

        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default AccountSetting;
