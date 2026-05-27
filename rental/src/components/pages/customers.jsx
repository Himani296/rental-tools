import "./customers.css";
import { useState, useEffect } from "react";
import NewCustomer from "./NewCustomer";
import CustomerCSVImport from "./CustomerCSVImport";
import { getCustomers, deleteCustomer } from "../../Services/Customerservice";
import { getOrders } from "../../Services/orderService";
import { useNavigate } from "react-router-dom";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("customers");
  const [showModal, setShowModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

  const filteredCustomers = customers.filter(
    (c) =>
      c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(id);
        fetchCustomers();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
    setActiveMenu(null);
  };

  useEffect(() => {
    fetchCustomers();
    fetchOrders();
  }, []);

  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Customers</h1>
        <p>Keep customer master data up to date for accurate invoicing.</p>
      </div>

      <div className="customers-tabs">
        <button
          className={`tab-btn${activeTab === "customers" ? " active" : ""}`}
          onClick={() => setActiveTab("customers")}
        >
          Customer Master
        </button>
        <button
          className={`tab-btn${activeTab === "orders" ? " active" : ""}`}
          onClick={() => {
            setActiveTab("orders");
            fetchOrders();
          }}
        >
          Pending Orders
          {pendingCount > 0 && (
            <span className="tab-badge">{pendingCount}</span>
          )}
        </button>
      </div>

      {activeTab === "orders" && (
        <div className="customer-card">
          <div className="customer-toolbar">
            <span style={{ fontWeight: 600 }}>Customer Orders from Panel</span>
            <div className="spacer" />
            <button onClick={fetchOrders}>Refresh</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Order #</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order, i) => (
                  <tr key={order._id}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{order.orderNumber}</strong>
                    </td>
                    <td>{order.customerName}</td>
                    <td>{order.phone}</td>
                    <td>{order.items?.length || 0}</td>
                    <td>₹{order.grandTotal?.toLocaleString("en-IN")}</td>
                    <td>
                      <span
                        className={`status ${order.status === "challan_created" ? "active" : order.status === "cancelled" ? "inactive" : "active"}`}
                      >
                        {order.status === "pending"
                          ? "Pending"
                          : order.status === "confirmed"
                            ? "Confirmed"
                            : order.status === "challan_created"
                              ? "Dispatched"
                              : "Cancelled"}
                      </span>
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      {order.status !== "challan_created" &&
                        order.status !== "cancelled" && (
                          <button
                            className="action-btn edit-btn"
                            onClick={() =>
                              navigate("/dashboard/challans", {
                                state: { preOrder: order },
                              })
                            }
                          >
                            Create Challan
                          </button>
                        )}
                      {order.status === "challan_created" && (
                        <span
                          style={{
                            color: "var(--color-success)",
                            fontSize: "0.85rem",
                          }}
                        >
                          ✓ Challan Created
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "customers" && (
        <div className="customer-card">
          <div className="customer-toolbar">
            <input
              placeholder="Search by name, contact, email or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="primary">Search</button>
            <button onClick={fetchCustomers}>Refresh</button>
            <div className="spacer" />
            <button onClick={() => setShowCSVModal(true)}>
              Import Customers
            </button>
            <button className="primary" onClick={() => setShowModal(true)}>
              New Customer
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Pending Returns</th>
                <th>Pending Challans</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c, i) => {
                  const customerId = c.id || c._id;
                  return (
                    <tr key={customerId}>
                      <td>{i + 1}</td>
                      <td>
                        <strong>{c.customerName}</strong>
                      </td>
                      <td>{c.pendingReturns || 0}</td>
                      <td>{c.pendingChallans || 0}</td>
                      <td>
                        <span className="status active">
                          {c.status || "Active"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(
                              activeMenu === customerId ? null : customerId,
                            );
                          }}
                        >
                          ⋮
                        </button>
                        {activeMenu === customerId && (
                          <div className="dropdown">
                            <div
                              className="dropdown-item"
                              onClick={() => handleViewCustomer(c)}
                            >
                              View
                            </div>
                            <div
                              className="dropdown-item delete"
                              onClick={() => {
                                handleDelete(customerId);
                                setActiveMenu(null);
                              }}
                            >
                              Delete
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <NewCustomer
          closeModal={() => setShowModal(false)}
          onCustomerAdded={fetchCustomers}
        />
      )}

      {showCSVModal && (
        <CustomerCSVImport
          closeModal={() => setShowCSVModal(false)}
          onCustomerAdded={fetchCustomers}
        />
      )}

      {showViewModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div
            className="modal-content customer-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Name:</strong> {selectedCustomer.customerName}
              </p>
              <p>
                <strong>Email:</strong> {selectedCustomer.email || "-"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedCustomer.phone || "-"}
              </p>
              <p>
                <strong>Status:</strong> {selectedCustomer.status || "Active"}
              </p>
              <p>
                <strong>Pending Returns:</strong> {selectedCustomer.pendingReturns || 0}
              </p>
              <p>
                <strong>Pending Challans:</strong> {selectedCustomer.pendingChallans || 0}
              </p>
              {selectedCustomer.address && (
                <p>
                  <strong>Address:</strong> {selectedCustomer.address}
                </p>
              )}
              {selectedCustomer.createdAt && (
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(selectedCustomer.createdAt).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
