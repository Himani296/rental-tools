import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Customers from "./components/pages/customers.jsx";
import Products from "./components/products/Products.jsx";
import Challans from "./components/Challans/Challans.jsx";
import Invoices from "./components/invoices/Invoices.jsx";
import Accountsetting from "./components/Accountsetting";
import CustomerLayout from "./components/customer/CustomerLayout.jsx";
import CustomerPanel from "./components/customer/CustomerPanel.jsx";
import CustomerCart from "./components/customer/CustomerCart.jsx";
import CustomerOrders from "./components/customer/CustomerOrders.jsx";

import "./App.css";

/* -------- Landing Page -------- */
function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="hero-container">
        <nav className="navbar">
         
 <div className="logo">
  <div className="logo-box">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" stroke="white" strokeWidth="1.6" />
      <path d="M12 2V22" stroke="white" strokeWidth="1.6" />
      <path d="M4 6L20 18" stroke="white" strokeWidth="1.6" />
      <path d="M20 6L4 18" stroke="white" strokeWidth="1.6" />
    </svg>
  </div>

  <h4>
    RENTWAALE <span className="beta">BETA</span>
  </h4>
</div>
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login →
          </button>
        </nav>

        <div className="hero-content">
          <p className="subheading">RENTAL MANAGEMENT CONSOLE</p>

          <h1 className="main-heading">
            Run Your Rentals with{" "}
            <span className="highlight">Clarity & Speed</span>
          </h1>

          <p className="description">
            A focused workspace for challans, returns, invoices, and stock
            tracking.<br/>Built for rental businesses who need complete
            visibility—today.
          </p>

          <div className="hero-actions">
            <button className="primary-btn" onClick={() => navigate("/signup")}>
              Start for FREE →
            </button>
            <button
              className="secondary-btn"
              onClick={() => navigate("/customer/products")}
            >
              Open Customer Panel
            </button>
          </div>

          <div className="badges">
            <span className="badge badge-purple">Challans & Returns</span>
            <span className="badge badge-green">Auto Invoicing</span>
            <span className="badge badge-pink">Audit Logs</span>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="page">
        <div className="badge">✨ Feature snapshots</div>

        <h1 className="title">See the product flow</h1>
        <p className="subtitle">
          A quick visual tour of the core workflows teams use every day.
        </p>

        <div className="cards">
          <div className="card blue">
            <div className="preview">
              <span className="preview-label">PREVIEW</span>
              <h3>Challan & Return Timeline</h3>
            </div>

            <h2>Challan & Return Timeline</h2>
            <p>Track each item's movement clearly.</p>
          </div>

          <div className="card green">
            <div className="preview">
              <span className="preview-label">PREVIEW</span>
              <h3>Invoice Builder</h3>
            </div>

            <h2>Invoice Builder</h2>
            <p>Generate invoices with deposit & charges.</p>
          </div>

          <div className="card yellow">
            <div className="preview">
              <span className="preview-label">PREVIEW</span>
              <h3>Inventory Snapshot</h3>
            </div>

            <h2>Inventory Snapshot</h2>
            <p>Check stock and returns instantly.</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* -------- APP ROUTER -------- */
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<CustomerPanel />} />
        <Route path="cart" element={<CustomerCart />} />
        <Route path="orders" element={<CustomerOrders />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Dashboard Layout */}
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<Products />} />
        <Route path="challans" element={<Challans />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="account" element={<Accountsetting />} />
      </Route>
    </Routes>
  );
}

export default App;
