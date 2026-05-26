import { useState } from "react";
import { addCustomer } from "../../Services/Customerservice";
import "./NewCustomer.css";

function NewCustomer({ closeModal, onCustomerAdded }) {
  const [formData, setFormData] = useState({
    customerName: "",
    contactName: "",
    email: "",
    phone: "",
    billingAddress: "",
    shippingAddress: "",
    gstNumber: "",
    aadhaarNumber: "",
    panNumber: "",
    status: "Active",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting...", formData);

    try {
      await addCustomer(formData);
      onCustomerAdded();
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h2>Add New Customer</h2>
          <button className="close-btn" onClick={closeModal}>
            ×
          </button>
        </div>

        {/* Form */}
        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>
                Customer Name <span className="required">*</span>
              </label>
              <input name="customerName" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Contact Name</label>
              <input name="contactName" onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input name="email" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input name="phone" onChange={handleChange} />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Billing Address</label>
            <textarea name="billingAddress" onChange={handleChange}></textarea>
          </div>

          <div className="form-group full-width">
            <label>Shipping Address</label>
            <textarea name="shippingAddress" onChange={handleChange}></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>GST Number</label>
              <input name="gstNumber" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Aadhaar Number</label>
              <input
                name="aadhaarNumber"
                placeholder="0000-0000-0000-0000"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>PAN Number</label>
              <input name="panNumber" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Notes</label>
            <textarea name="notes" onChange={handleChange}></textarea>
          </div>

          <div className="button-row">
            <button type="button" className="btn-cancel" onClick={closeModal}>
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

export default NewCustomer;
