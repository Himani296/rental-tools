import { NavLink, Outlet } from "react-router-dom";
import { FiHome, FiShoppingCart, FiList } from "react-icons/fi";
import { CustomerCartProvider, useCustomerCart } from "./CustomerContext";
import "./CustomerPanel.css";

function CustomerHeader() {
  const { summary } = useCustomerCart();

  return (
    <header className="customer-header-shell">
      <div className="customer-header customer-container">
        <NavLink to="/customer/products" className="customer-brand-link">
          <span className="customer-brand-mark">RW</span>
          <span>
            <strong>RENTWAALE</strong>
            <small>Customer Panel</small>
          </span>
        </NavLink>

        <nav className="customer-nav-links">
          <NavLink
            to="/customer/products"
            className={({ isActive }) =>
              isActive ? "customer-nav-link active" : "customer-nav-link"
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/customer/cart"
            className={({ isActive }) =>
              isActive ? "customer-nav-link active" : "customer-nav-link"
            }
          >
            Cart & Billing
            <span className="customer-cart-badge">{summary.itemCount}</span>
          </NavLink>
          <NavLink
            to="/customer/orders"
            className={({ isActive }) =>
              isActive ? "customer-nav-link active" : "customer-nav-link"
            }
          >
            My Orders
          </NavLink>
        </nav>

        <div className="customer-header-actions">
          <NavLink to="/" className="customer-header-link muted">
            <FiHome /> Home
          </NavLink>
          <NavLink to="/customer/cart" className="customer-header-link solid">
            <FiShoppingCart /> View Bill
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export default function CustomerLayout() {
  return (
    <CustomerCartProvider>
      <div className="customer-app-shell">
        <CustomerHeader />
        <main className="customer-main-shell">
          <Outlet />
        </main>
      </div>
    </CustomerCartProvider>
  );
}
