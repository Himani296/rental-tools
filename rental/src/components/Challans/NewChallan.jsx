import "./NewChallan.css";
import React, { useState, useEffect } from "react";
import { addChallan } from "../../Services/challanService";
import { updateOrder } from "../../Services/orderService";
import { normalizeProductInventory } from "../../Services/productservice";

export default function NewChallan({
  customers = [],
  products = [],
  onSave,
  onClose,
  preOrder = null,
}) {
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [items, setItems] = useState([]);
  const [expectedReturn, setExpectedReturn] = useState("");
  const [notes, setNotes] = useState("");
  const [referenceNo, setReferenceNo] = useState("");

  // Deposit
  const [depositOverride, setDepositOverride] = useState(false);
  const [manualDeposit, setManualDeposit] = useState(0);
  const [depositMode, setDepositMode] = useState("Cash");
  const [depositRef, setDepositRef] = useState("");

  // Loading
  const [loadingAmount, setLoadingAmount] = useState(0);
  const [loadingOverride, setLoadingOverride] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState("");
  const [loadingOther, setLoadingOther] = useState("");
  const [loadingRef, setLoadingRef] = useState("");

  // Unloading
  const [unloadingAmount, setUnloadingAmount] = useState(0);
  const [unloadingVehicle, setUnloadingVehicle] = useState("");
  const [unloadingOther, setUnloadingOther] = useState("");
  const [unloadingRef, setUnloadingRef] = useState("");

  // 🔥 IMPORTANT FIX — products se items banana
  useEffect(() => {
    if (preOrder && preOrder.items?.length > 0) {
      const formatted = preOrder.items.map((item) => ({
        _id: item.productId,
        name: item.productName,
        hsn: item.hsnCode || "",
        availableQty: "—",
        price: item.chargePerDay || 0,
        minDays: Math.max(Number(item.minDays ?? 1), 1),
        quantity: item.quantity,
        rentalDays: item.rentalDays,
      }));
      setItems(formatted);
    } else if (products.length > 0) {
      const formatted = products.map((rawProduct) => {
        const p = normalizeProductInventory(rawProduct);
        return {
          _id: p._id,
          name: p.productName || "Unknown product",
          hsn: p.hsnCode || "",
          availableQty: p.availableQty,
          price: p.chargePerDay || 0,
          minDays: p.minDays || 1,
          quantity: 0,
        };
      });
      setItems(formatted);
    } else {
      setItems([]);
    }
  }, [products, preOrder]);

  useEffect(() => {
    if (preOrder?.orderNumber) {
      setReferenceNo(
        (currentRef) => currentRef || `CHL-${preOrder.orderNumber}`,
      );
    }
  }, [preOrder]);

  useEffect(() => {
    if (!preOrder || customers.length === 0) return;
    const matched =
      customers.find((c) => c._id === preOrder.customerId) ||
      customers.find((c) => c.phone && c.phone === preOrder.phone) ||
      customers.find((c) => c.customerName === preOrder.customerName);
    if (matched?._id) {
      setSelectedCustomer(matched._id);
    }
  }, [customers, preOrder]);
  const handleQuantityChange = (id, value) => {
    const numericValue = Number(value);
    setItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: Math.max(
                0,
                Math.min(
                  Number.isFinite(numericValue) ? numericValue : 0,
                  typeof item.availableQty === "number"
                    ? item.availableQty
                    : Number.MAX_SAFE_INTEGER,
                ),
              ),
            }
          : item,
      ),
    );
  };
  const autoDeposit = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const finalDeposit = depositOverride ? manualDeposit : autoDeposit;

  const handleSave = async (e) => {
    e.preventDefault();
    // Customer validation
    if (!selectedCustomer) {
      alert("Please select customer");
      return;
    }
    // Reference validation
    if (!referenceNo) {
      alert("Reference number required");
      return;
    }
    if (!/^[A-Za-z0-9-_\/]+$/.test(referenceNo.trim())) {
      alert("Reference number can only contain letters, numbers, -, _, /");
      return;
    }
    if (!customers.length) {
      alert("No customers available. Please add a customer first.");
      return;
    }
    if (!items.length) {
      alert("No products available. Please add products first.");
      return;
    }
    const selectedItems = items.filter((item) => item.quantity > 0);
    if (selectedItems.length === 0) {
      alert("Please enter quantity");
      return;
    }
    const totalQuantityOut = selectedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    // Selected customer object
    const selectedCustomerObj = customers.find(
      (c) => c._id === selectedCustomer,
    );
    const challanData = {
      customer: selectedCustomer,
      customerName: selectedCustomerObj?.customerName || "",
      referenceNo,
      dispatchDate,
      quantityOut: totalQuantityOut,
      items: selectedItems.map((item) => ({
        product: item._id,
        productName: item.name || "product",
        quantityOut: Number(item.quantity) || 0,
        price: item.price,
      })),
      expectedReturn,
      depositAmount: finalDeposit,
      depositMode,
      depositRef,
      loadingAmount,
      loadingVehicle,
      unloadingAmount,
      unloadingVehicle,
      notes,
    };
    try {
      console.log("Sending to backend:", challanData);
      const saved = await addChallan(challanData);
      if (preOrder?._id) {
        try {
          await updateOrder(preOrder._id, {
            status: "challan_created",
            challanId: saved._id,
            challanRef: saved.referenceNo,
          });
        } catch (orderErr) {
          console.error("Failed to update order status:", orderErr);
        }
      }
      if (onSave) onSave(saved);
      if (onClose) onClose();
    } catch (error) {
      console.error("Save Error:", error.response?.data || error.message);
      alert("Error saving challan");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Challan</h2>
        <button className="close-btn" onClick={onClose}></button>
        {!customers.length ? (
          <div className="customer-state-card error">
            No customers found. Add a customer before creating a challan.
          </div>
        ) : null}
        {!products.length && !preOrder ? (
          <div className="customer-state-card error">
            No products found. Add products to inventory before creating a
            challan.
          </div>
        ) : null}
        {preOrder && (
          <div className="preorder-banner">
            <strong>Pre-filled from Order #{preOrder.orderNumber}</strong>
            <span>
              {preOrder.customerName} &middot; {preOrder.phone}
              {preOrder.address ? ` · ${preOrder.address}` : ""}
            </span>
          </div>
        )}
        <form onSubmit={handleSave}>
          {/* Customer & Dispatch */}
          <div className="form-group">
            <label>Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map((cust) => (
                <option key={cust._id} value={cust._id}>
                  {cust.customerName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Reference No</label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value.trimStart())}
              placeholder="Enter Reference No"
              required
            />
          </div>

          <div className="form-group">
            <label>Dispatch Date</label>
            <input
              type="date"
              value={dispatchDate}
              onChange={(e) => setDispatchDate(e.target.value)}
            />
          </div>
          {/* Products Table */}
          <div className="products-section">
            <h3>Rent Products</h3>
            <table className="products-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>AVAILABLE</th>
                  <th>CHARGE / DAY</th>
                  <th>MIN DAYS</th>
                  <th>QUANTITY</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.name}</strong>
                      <br />
                      <span className="sku">SKU {item.sku}</span>
                    </td>
                    <td>{item.availableQty}</td>
                    <td>₹{item.price}</td>
                    <td>{item.minDays}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={
                          typeof item.availableQty === "number"
                            ? item.availableQty
                            : undefined
                        }
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item._id, e.target.value)
                        }
                        disabled={!customers.length}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Deposit */}

          <h3>Deposit & Expected Return</h3>

          <div className="form-group">
            <label>Expected Return Date (Optional)</label>

            <input
              type="date"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Deposit Amount</label>

            <input
              type="number"
              value={finalDeposit}
              min="0"
              disabled={!depositOverride}
              onChange={(e) => setManualDeposit(Number(e.target.value || 0))}
            />

            <div className="checkbox">
              <input
                type="checkbox"
                checked={depositOverride}
                onChange={(e) => setDepositOverride(e.target.checked)}
              />
              Override auto calculation
            </div>
          </div>

          <div className="form-group">
            <label>Deposit Mode</label>

            <select
              value={depositMode}
              onChange={(e) => setDepositMode(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="form-group">
            <label>Deposit Reference</label>

            <input
              type="text"
              value={depositRef}
              onChange={(e) => setDepositRef(e.target.value)}
              placeholder="Receipt or transaction reference"
            />
          </div>

          {/* Loading & Unloading */}

          <h3>Loading Charges</h3>

          <div className="form-group">
            <label>Loading Amount</label>

            <input
              type="number"
              value={loadingAmount}
              min="0"
              disabled={!loadingOverride}
              onChange={(e) => setLoadingAmount(Number(e.target.value || 0))}
            />

            <div className="checkbox">
              <input
                type="checkbox"
                checked={loadingOverride}
                onChange={(e) => setLoadingOverride(e.target.checked)}
              />
              Override auto calculation
            </div>
          </div>

          <div className="form-group">
            <label>Vehicle Number</label>

            <input
              type="text"
              value={loadingVehicle}
              onChange={(e) => setLoadingVehicle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Other Details</label>

            <input
              type="text"
              value={loadingOther}
              onChange={(e) => setLoadingOther(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Loading Reference</label>

            <input
              type="text"
              value={loadingRef}
              onChange={(e) => setLoadingRef(e.target.value)}
              placeholder="Payment reference"
            />
          </div>
          <h3>Unloading Charges</h3>
          <div className="form-group">
            <label>Unloading Amount</label>

            <input
              type="number"
              value={unloadingAmount}
              min="0"
              onChange={(e) => setUnloadingAmount(Number(e.target.value || 0))}
            />
          </div>
          <div className="form-group">
            <label>Vehicle Number</label>
            <input
              type="text"
              value={unloadingVehicle}
              onChange={(e) => setUnloadingVehicle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Other Details</label>

            <input
              type="text"
              value={unloadingOther}
              onChange={(e) => setUnloadingOther(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Unloading Reference</label>

            <input
              type="text"
              value={unloadingRef}
              onChange={(e) => setUnloadingRef(e.target.value || 0)}
              placeholder="Payment reference"
            />
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>

            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="form-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
