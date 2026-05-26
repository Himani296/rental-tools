import React, { useState, useEffect } from "react";
import "./Invoices.css";
import CreateInvoiceModal from "./CreateInvoicemodal";
import {
  getInvoices,
  deleteInvoice,
  createInvoice,
  updateInvoice,
} from "../../Services/invoiceService";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [quickStatusOpen, setQuickStatusOpen] = useState(null);

  const filteredInvoices = invoices.filter((inv) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const challanRefText = Array.isArray(inv.challanRefs)
      ? inv.challanRefs.join(" ")
      : inv.challanRef || "";
    return (
      String(inv.number || inv.invoiceNumber || "")
        .toLowerCase()
        .includes(term) ||
      String(inv.customerName || "")
        .toLowerCase()
        .includes(term) ||
      String(challanRefText).toLowerCase().includes(term)
    );
  });

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      const invoiceList = Array.isArray(data)
        ? data
        : Array.isArray(data.invoices)
          ? data.invoices
          : [];
      setInvoices(invoiceList);
    } catch (err) {
      console.log("Error loading invoices", err);
      setInvoices([]);
    }
  };

  const handleCreate = async (invoiceData) => {
    try {
      await createInvoice(invoiceData);
      await new Promise((r) => setTimeout(r, 200)); // Small delay to ensure DB write
      setShowModal(false);
      await loadInvoices();
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to create invoice right now.";
      alert(message);
      // Don't re-throw - let modal stay open for retry
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id);
        await loadInvoices();
      } catch (error) {
        alert("Failed to delete invoice");
      }
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setEditStatus(invoice.status || "Draft");
    setShowViewModal(true);
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;
    if (editStatus === selectedInvoice.status) {
      setUpdateMessage("No changes to update");
      return;
    }
    try {
      setUpdating(true);
      setUpdateMessage("");
      await updateInvoice(selectedInvoice._id, { status: editStatus });
      setUpdateMessage(`Status updated to ${editStatus} successfully`);
      await new Promise((r) => setTimeout(r, 1000)); // Show success message for 1 second
      await loadInvoices();
      setShowViewModal(false);
      setSelectedInvoice(null);
      setUpdateMessage("");
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Failed to update invoice status";
      setUpdateMessage(errMsg);
      console.error("Update error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickStatusUpdate = async (invoiceId, newStatus) => {
    try {
      await updateInvoice(invoiceId, { status: newStatus });
      await loadInvoices();
      setQuickStatusOpen(null);
    } catch (error) {
      alert("Failed to update status");
      console.error("Quick update error:", error);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        quickStatusOpen &&
        !e.target.closest(".status-cell") &&
        !e.target.closest(".status-dropdown")
      ) {
        setQuickStatusOpen(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [quickStatusOpen]);

  return (
    <div className="invoices-page">
      {/* Header */}
      <div className="page-header">
        <h1>Invoices</h1>
        <p>Generate invoices based on completed product movements.</p>
      </div>

      <div className="invoice-card">
        {/* Toolbar */}
        <div className="invoice-toolbar">
          <input
            placeholder="Search by invoice number, customer or challan"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="primary">Search</button>
          <button onClick={loadInvoices}>Refresh</button>

          <div className="spacer" />

          <button className="primary" onClick={() => setShowModal(true)}>
            New Invoice
          </button>
        </div>

        {/* Table */}
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Challan Ref</th>
              <th>Issue Date</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices?.length > 0 ? (
              filteredInvoices.map((inv, idx) => (
                <tr key={inv._id}>
                  <td>{idx + 1}</td>
                  <td>
                    <strong>{inv.number || inv.invoiceNumber || "-"}</strong>
                  </td>
                  <td>{inv.customerName}</td>
                  <td>
                    {Array.isArray(inv.challanRefs)
                      ? inv.challanRefs.join(", ")
                      : inv.challanRef || "-"}
                  </td>
                  <td>
                    {inv.issueDate
                      ? new Date(inv.issueDate).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td>
                    <div className="status-cell">
                      <span
                        className={`status ${(inv.status || "Draft").toLowerCase()}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickStatusOpen(
                            quickStatusOpen === inv._id ? null : inv._id,
                          );
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {inv.status || "Draft"}
                      </span>
                      {quickStatusOpen === inv._id && (
                        <div
                          className="status-dropdown"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStatusUpdate(inv._id, "Draft");
                            }}
                          >
                            Draft
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStatusUpdate(inv._id, "Sent");
                            }}
                          >
                            Sent
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStatusUpdate(inv._id, "Paid");
                            }}
                          >
                            Paid
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    ₹{" "}
                    {Number(
                      inv.totalAmount ?? inv.finalAmount ?? 0,
                    ).toLocaleString("en-IN")}
                  </td>
                  <td className="action-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewInvoice(inv)}
                      >
                        View
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(inv._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty">
                  {searchTerm
                    ? `No invoices match "${searchTerm}"`
                    : "No invoices found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showModal && (
        <CreateInvoiceModal
          onClose={() => setShowModal(false)}
          onSave={handleCreate}
        />
      )}

      {/* View/Edit Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invoice Details</h2>
              <button
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>

            <div className="invoice-view-details">
              <div className="detail-row">
                <span className="label">Invoice Number:</span>
                <span className="value">
                  <strong>
                    {selectedInvoice.number ||
                      selectedInvoice.invoiceNumber ||
                      "—"}
                  </strong>
                </span>
              </div>

              <div className="detail-row">
                <span className="label">Customer:</span>
                <span className="value">{selectedInvoice.customerName}</span>
              </div>

              <div className="detail-row">
                <span className="label">Challan References:</span>
                <span className="value">
                  {Array.isArray(selectedInvoice.challanRefs)
                    ? selectedInvoice.challanRefs.join(", ")
                    : selectedInvoice.challanRef || "—"}
                </span>
              </div>

              <div className="detail-row">any message given

                <span className="label">Issue Date:</span>
                <span className="value">
                  {selectedInvoice.issueDate
                    ? new Date(selectedInvoice.issueDate).toLocaleDateString(
                        "en-IN",
                      )
                    : "—"}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">Due Date:</span>
                <span className="value">
                  {selectedInvoice.dueDate
                    ? new Date(selectedInvoice.dueDate).toLocaleDateString(
                        "en-IN",
                      )
                    : "—"}
                </span>
              </div>

              <div className="detail-section">
                <h3>Amount Details</h3>
                <div className="detail-row">
                  <span className="label">Subtotal:</span>
                  <span className="value">
                    ₹
                    {Number(selectedInvoice.subtotal || 0).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="label">GST:</span>
                  <span className="value">
                    ₹{Number(selectedInvoice.gstTotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="label">Loading Charges:</span>
                  <span className="value">
                    ₹
                    {Number(selectedInvoice.loadingCharges || 0).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="label">Unloading Charges:</span>
                  <span className="value">
                    ₹
                    {Number(
                      selectedInvoice.unloadingCharges || 0,
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="label">Discount:</span>
                  <span className="value">
                    ₹
                    {Number(selectedInvoice.discountTotal || 0).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>

                <div className="detail-row final">
                  <span className="label">Final Amount:</span>
                  <span className="value">
                    <strong>
                      ₹
                      {Number(
                        selectedInvoice.finalAmount ||
                          selectedInvoice.totalAmount ||
                          0,
                      ).toLocaleString("en-IN")}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Status</h3>
                <div className="status-selector">
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              {selectedInvoice.remarks && (
                <div className="detail-section">
                  <h3>Remarks</h3>
                  <p>{selectedInvoice.remarks}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {updateMessage && (
                <span
                  className={`update-message ${
                    updateMessage.toLowerCase().includes("failed") ||
                    updateMessage.toLowerCase().includes("no changes")
                      ? "error"
                      : "success"
                  }`}
                >
                  {updateMessage}
                </span>
              )}
              <div className="button-group">
                <button
                  className="btn-secondary"
                  onClick={() => setShowViewModal(false)}
                  disabled={updating}
                >
                  Close
                </button>
                <button
                  className="btn-primary"
                  onClick={handleUpdateInvoice}
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
