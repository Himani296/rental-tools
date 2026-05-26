import { useState } from "react";
import {
  FiSearch,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiEye,
} from "react-icons/fi";
import { getOrdersByPhone } from "../../Services/orderService";
import { getInvoices } from "../../Services/invoiceService";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const STATUS_META = {
  pending: {
    label: "Pending Review",
    icon: <FiClock />,
    className: "status-pending",
  },
  confirmed: {
    label: "Confirmed",
    icon: <FiCheckCircle />,
    className: "status-confirmed",
  },
  challan_created: {
    label: "Dispatched",
    icon: <FiPackage />,
    className: "status-dispatched",
  },
  cancelled: {
    label: "Cancelled",
    icon: <FiXCircle />,
    className: "status-cancelled",
  },
};

export default function CustomerOrders() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [invoicesByChallanRef, setInvoicesByChallanRef] = useState({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    try {
      const data = await getOrdersByPhone(trimmed);
      setOrders(data || []);
      setSearched(true);

      // Load invoices for viewing
      const invoiceList = await getInvoices();
      const byChallan = {};
      (invoiceList || []).forEach((inv) => {
        const refs = Array.isArray(inv.challanRefs) ? inv.challanRefs : [];
        refs.forEach((r) => {
          if (r) byChallan[r] = inv;
        });
        if (inv.challanRef) byChallan[inv.challanRef] = inv;
      });
      setInvoicesByChallanRef(byChallan);
    } catch (err) {
      console.error(err);
      setError("Could not load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const findInvoiceForOrder = (order) => {
    const ref =
      order.challanRef ||
      (order.challanId && order.challanId.referenceNo) ||
      "";
    if (!ref) return null;
    return invoicesByChallanRef[ref] || null;
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  return (
    <section className="customer-page-section customer-container">
      <div className="customer-page-heading">
        <div>
          <p className="customer-kicker">ORDER TRACKING</p>
          <h1>Track your orders</h1>
          <p>
            Enter your mobile number to view your order status and challan
            details.
          </p>
        </div>
      </div>

      <form className="order-search-form" onSubmit={handleSearch}>
        <div className="order-search-row">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your mobile number"
            className="order-search-input"
          />
          <button
            type="submit"
            className="customer-solid-button"
            disabled={loading}
          >
            <FiSearch /> {loading ? "Searching…" : "Search Orders"}
          </button>
        </div>
      </form>

      {error && <p className="order-error">{error}</p>}

      {searched && !loading && orders.length === 0 && (
        <div className="customer-empty-state">
          <h2>No orders found.</h2>
          <p>
            We couldn&apos;t find any orders linked to this number. Check the
            number and try again.
          </p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => {
            const meta = STATUS_META[order.status] || STATUS_META.pending;
            const challan = order.challanId;
            const invoiceForOrder = findInvoiceForOrder(order);
            return (
              <div key={order._id} className="order-track-card">
                <div className="order-track-head">
                  <div>
                    <span className="customer-kicker">{order.orderNumber}</span>
                    <h3>{order.customerName}</h3>
                    <small>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </small>
                  </div>
                  <span className={`order-status-badge ${meta.className}`}>
                    {meta.icon} {meta.label}
                  </span>
                </div>

                <div className="order-items-table-wrap">
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Rental Days</th>
                        <th>Daily Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{item.productName}</strong>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{item.rentalDays}</td>
                          <td>{currencyFormatter.format(item.chargePerDay)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="order-track-footer">
                  <span>
                    Grand Total:{" "}
                    <strong>
                      {currencyFormatter.format(order.grandTotal)}
                    </strong>
                  </span>
                </div>

                {challan && (
                  <div className="challan-info-section">
                    <p className="customer-kicker">CHALLAN DETAILS</p>
                    <div className="challan-info-grid">
                      <div>
                        <span>Reference No</span>
                        <strong>
                          {challan.referenceNo || order.challanRef || "—"}
                        </strong>
                      </div>
                      <div>
                        <span>Status</span>
                        <strong>{challan.status || "Active"}</strong>
                      </div>
                      {challan.dispatchDate && (
                        <div>
                          <span>Dispatch Date</span>
                          <strong>
                            {new Date(challan.dispatchDate).toLocaleDateString(
                              "en-IN",
                            )}
                          </strong>
                        </div>
                      )}
                      {challan.expectedReturn && (
                        <div>
                          <span>Expected Return</span>
                          <strong>
                            {new Date(
                              challan.expectedReturn,
                            ).toLocaleDateString("en-IN")}
                          </strong>
                        </div>
                      )}
                      {invoiceForOrder && (
                        <div>
                          <span>Invoice</span>
                          <button
                            className="customer-solid-button small"
                            onClick={() => handleViewInvoice(invoiceForOrder)}
                          >
                            <FiEye /> View Invoice
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!challan && order.status === "pending" && (
                  <p className="order-pending-note">
                    Your order is under review. A challan will be created once
                    our team confirms your booking.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showInvoiceModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Invoice Details</h2>
            <button className="close-btn" onClick={() => setShowInvoiceModal(false)}>×</button>
            <div className="invoice-details">
              <p><strong>Invoice Number:</strong> {selectedInvoice.number || selectedInvoice.invoiceNumber}</p>
              <p><strong>Customer:</strong> {selectedInvoice.customerName}</p>
              <p><strong>Issue Date:</strong> {selectedInvoice.issueDate ? new Date(selectedInvoice.issueDate).toLocaleDateString("en-IN") : "—"}</p>
              <p><strong>Total Amount:</strong> ₹{Number(selectedInvoice.totalAmount || selectedInvoice.finalAmount || 0).toLocaleString("en-IN")}</p>
              <p><strong>Challan Refs:</strong> {Array.isArray(selectedInvoice.challanRefs) ? selectedInvoice.challanRefs.join(", ") : selectedInvoice.challanRef || "—"}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
