import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { useCustomerCart } from "./CustomerContext";
import { createOrder } from "../../Services/orderService";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const getLineTotals = (item) => {
  const effectiveDays = Math.max(
    Number(item.rentalDays),
    Number(item.minDays || 1),
  );

  return {
    effectiveDays,
    rentalTotal: item.quantity * effectiveDays * item.chargePerDay,
    depositTotal: item.quantity * item.depositCharges,
    logisticsTotal:
      item.quantity * (item.loadingCharges + item.unloadingCharges),
  };
};

export default function CustomerCart() {
  const { cartItems, updateCartItem, removeFromCart, clearCart, summary } =
    useCustomerCart();

  const billNumberRef = useRef(
    `RW-${String(Date.now()).slice(-6)}-${new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "")}`,
  );
  const billNumber = billNumberRef.current;

  const [view, setView] = useState("cart");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    rentalStartDate: "",
    rentalEndDate: "",
    notes: "",
  });

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        rentalStartDate: formData.rentalStartDate || undefined,
        rentalEndDate: formData.rentalEndDate || undefined,
        notes: formData.notes.trim(),
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: item.productName,
          quantity: item.quantity,
          rentalDays: item.rentalDays,
          chargePerDay: item.chargePerDay,
          depositCharges: item.depositCharges,
          loadingCharges: item.loadingCharges,
          unloadingCharges: item.unloadingCharges,
        })),
        grandTotal: summary.grandTotal,
      };

      const saved = await createOrder(payload);
      setConfirmedOrder(saved);
      clearCart();
      setView("confirmation");
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (view === "confirmation") {
    return (
      <section className="customer-page-section customer-container">
        <div className="order-confirmation-card">
          <FiCheckCircle className="confirmation-icon" />
          <h1>Order Placed Successfully!</h1>
          <p>
            Your order has been received. Our team will review it and get in
            touch with you shortly.
          </p>

          {confirmedOrder && (
            <div className="confirmation-details">
              <div className="confirmation-row">
                <span>Order Number</span>
                <strong>{confirmedOrder.orderNumber}</strong>
              </div>
              <div className="confirmation-row">
                <span>Name</span>
                <strong>{confirmedOrder.customerName}</strong>
              </div>
              <div className="confirmation-row">
                <span>Phone</span>
                <strong>{confirmedOrder.phone}</strong>
              </div>
              <div className="confirmation-row">
                <span>Grand Total</span>
                <strong>
                  ₹
                  {Number(confirmedOrder.grandTotal || 0).toLocaleString(
                    "en-IN",
                  )}
                </strong>
              </div>
            </div>
          )}

          <p className="confirmation-hint">
            Save your order number to track status later.
          </p>

          <div className="confirmation-actions">
            <Link to="/customer/orders" className="customer-solid-button">
              Track My Order
            </Link>
            <Link to="/customer/products" className="customer-outline-button">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (view === "form") {
    return (
      <section className="customer-page-section customer-container">
        <div className="customer-page-heading">
          <button
            type="button"
            className="customer-outline-button icon-leading"
            onClick={() => setView("cart")}
          >
            <FiArrowLeft /> Back to Cart
          </button>
        </div>

        <div className="order-form-layout">
          <div className="order-form-card">
            <p className="customer-kicker">PLACE ORDER</p>
            <h2>Enter your details</h2>
            <p>
              We&apos;ll use these details to confirm your order and create a
              challan.
            </p>

            <form onSubmit={handleSubmitOrder} className="order-form">
              <div className="order-form-row">
                <div className="order-form-field">
                  <label htmlFor="customerName">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={handleFormChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="order-form-field">
                  <label htmlFor="phone">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
              </div>

              <div className="order-form-row">
                <div className="order-form-field">
                  <label htmlFor="email">Email (optional)</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="order-form-row">
                <div className="order-form-field">
                  <label htmlFor="rentalStartDate">
                    Rental Start Date (optional)
                  </label>
                  <input
                    id="rentalStartDate"
                    name="rentalStartDate"
                    type="date"
                    value={formData.rentalStartDate}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="order-form-field">
                  <label htmlFor="rentalEndDate">
                    Rental End Date (optional)
                  </label>
                  <input
                    id="rentalEndDate"
                    name="rentalEndDate"
                    type="date"
                    value={formData.rentalEndDate}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="order-form-field full-width">
                <label htmlFor="address">Delivery Address (optional)</label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Street, city, pincode"
                />
              </div>

              <div className="order-form-field full-width">
                <label htmlFor="notes">Notes (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Any special instructions or requirements"
                />
              </div>

              <div className="order-form-summary">
                <span>
                  {summary.itemCount} item(s) · Grand total:{" "}
                  <strong>₹{summary.grandTotal.toLocaleString("en-IN")}</strong>
                </span>
              </div>

              <div className="order-form-actions">
                <button
                  type="button"
                  className="customer-outline-button"
                  onClick={() => setView("cart")}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="customer-solid-button"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Place Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="customer-page-section customer-container">
      <div className="customer-page-heading">
        <div>
          <p className="customer-kicker">CART AND BILLING</p>
          <h1>Review cart items and generate the customer bill.</h1>
          <p>
            The bill uses product pricing maintained from the admin side,
            including rental charges, deposits, and handling costs.
          </p>
        </div>

        {cartItems.length > 0 ? (
          <button
            type="button"
            className="customer-outline-button"
            onClick={clearCart}
          >
            Clear cart
          </button>
        ) : null}
      </div>

      {cartItems.length === 0 ? (
        <div className="customer-empty-state">
          <h2>Your cart is empty.</h2>
          <p>Add products from the customer panel to generate a bill.</p>
          <Link to="/customer/products" className="customer-solid-button">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="billing-layout-grid">
          <div className="billing-items-panel">
            {cartItems.map((item) => {
              const lineTotals = getLineTotals(item);

              return (
                <article key={item.id} className="billing-line-card">
                  <div className="billing-line-head">
                    <div>
                      <h3>{item.productName}</h3>
                      <p>
                        {item.description ||
                          "Rental item added from live admin inventory."}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.productName} from cart`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="billing-controls-grid">
                    <div className="control-block">
                      <span>Quantity</span>
                      <div className="quantity-stepper">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItem(item.id, {
                              quantity: Math.max(item.quantity - 1, 1),
                            })
                          }
                        >
                          <FiMinus />
                        </button>
                        <strong>{item.quantity}</strong>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItem(item.id, {
                              quantity: Math.min(
                                item.quantity + 1,
                                item.availableQty || item.quantity + 1,
                              ),
                            })
                          }
                        >
                          <FiPlus />
                        </button>
                      </div>
                      <small>{item.availableQty} units available</small>
                    </div>

                    <div className="control-block">
                      <span>Rental days</span>
                      <input
                        type="number"
                        min={item.minDays || 1}
                        value={item.rentalDays}
                        onChange={(event) =>
                          updateCartItem(item.id, {
                            rentalDays: Number(
                              event.target.value || item.minDays || 1,
                            ),
                          })
                        }
                      />
                      <small>Minimum {item.minDays || 1} day(s)</small>
                    </div>

                    <div className="control-block compact">
                      <span>Daily rent</span>
                      <strong>
                        {currencyFormatter.format(item.chargePerDay)}
                      </strong>
                    </div>

                    <div className="control-block compact">
                      <span>Line total</span>
                      <strong>
                        {currencyFormatter.format(
                          lineTotals.rentalTotal +
                            lineTotals.depositTotal +
                            lineTotals.logisticsTotal,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="line-breakdown-grid">
                    <div>
                      <span>Rental</span>
                      <strong>
                        {currencyFormatter.format(lineTotals.rentalTotal)}
                      </strong>
                    </div>
                    <div>
                      <span>Deposit</span>
                      <strong>
                        {currencyFormatter.format(lineTotals.depositTotal)}
                      </strong>
                    </div>
                    <div>
                      <span>Loading + unloading</span>
                      <strong>
                        {currencyFormatter.format(lineTotals.logisticsTotal)}
                      </strong>
                    </div>
                    <div>
                      <span>Effective billing days</span>
                      <strong>{lineTotals.effectiveDays}</strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="billing-summary-panel">
            <div className="billing-summary-card">
              <p className="customer-kicker">ESTIMATED BILL</p>
              <h2>Bill summary</h2>

              <div className="bill-meta-grid">
                <div>
                  <span>Bill number</span>
                  <strong>{billNumber}</strong>
                </div>
                <div>
                  <span>Date</span>
                  <strong>{new Date().toLocaleDateString("en-IN")}</strong>
                </div>
              </div>

              <div className="bill-row">
                <span>Items in cart</span>
                <strong>{summary.itemCount}</strong>
              </div>
              <div className="bill-row">
                <span>Rental subtotal</span>
                <strong>
                  {currencyFormatter.format(summary.rentalSubtotal)}
                </strong>
              </div>
              <div className="bill-row">
                <span>Deposit subtotal</span>
                <strong>
                  {currencyFormatter.format(summary.depositSubtotal)}
                </strong>
              </div>
              <div className="bill-row">
                <span>Handling charges</span>
                <strong>
                  {currencyFormatter.format(summary.logisticsSubtotal)}
                </strong>
              </div>

              <div className="bill-total-row">
                <span>Grand total</span>
                <strong>{currencyFormatter.format(summary.grandTotal)}</strong>
              </div>

              <p className="billing-note">
                This bill is generated from the current cart and live admin
                pricing. Final confirmation can still be adjusted by your
                operations team.
              </p>

              <Link
                to="/customer/products"
                className="customer-solid-button full-width"
              >
                Add more products
              </Link>

              <button
                type="button"
                className="customer-solid-button full-width place-order-btn"
                onClick={() => setView("form")}
              >
                Proceed to Place Order
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
