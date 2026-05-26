import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./Dashboard.css"; // same CSS use kar sakte ho
import { useNavigate } from "react-router-dom";
import { FiSettings, FiHome, FiUsers, FiBox, FiRefreshCcw, FiFileText } from "react-icons/fi";
function Layout() {

  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="brand">RENTWAALE</h2>

           <nav className="menu">
          <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "active" : ""}>
            <FiHome className="menu-icon" /> Dashboard
          </NavLink>
          <NavLink to="/dashboard/customers" className={({ isActive }) => isActive ? "active" : ""}>
            <FiUsers className="menu-icon" /> Customers
          </NavLink>
          <NavLink to="/dashboard/products" className={({ isActive }) => isActive ? "active" : ""}>
            <FiBox className="menu-icon" /> Products
          </NavLink>
          <NavLink to="/dashboard/challans" className={({ isActive }) => isActive ? "active" : ""}>
            <FiRefreshCcw className="menu-icon" /> Challans
          </NavLink>
          <NavLink to="/dashboard/invoices" className={({ isActive }) => isActive ? "active" : ""}>
            <FiFileText className="menu-icon" /> Invoices
          </NavLink>
          
           </nav>
        <div className="sidebar-footer">
          <div className="org-card">
    <div className="org-info">
      <p className="org-name">nandsoft</p>
      <span className="org-role">ADMIN</span>
    </div>

    <button
      className="account-btn"
      onClick={() => navigate("/dashboard/account")}
    >
      <FiSettings className="icon" />
      Account Settings
    </button>

  </div>
        </div>
       
      </aside>

      {/* Main Content Change Hoga */}
      <main className="dashboard">
        <Outlet />
      </main>
      
    </div>
  );
}

export default Layout;
