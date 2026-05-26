import { useState, useEffect } from "react";
import "./Products.css";
import { addProduct, updateProduct } from "../../Services/productservice";

function NewProductModal({ closeModal, onProductAdded, product }) {
  const isEdit = Boolean(product);

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    quantity: "",
    AvailableQty: "",
    hsnCode: "",
    chargePerDay: "",
    costPrice: "",
    minDays: "",
    displayOrder: "",
    loadingCharges: "",
    unloadingCharges: "",
    depositCharges: "",
    includeOutDate: false,
    includeInDate: false,
    status: "Active",
    ...(product
      ? {
          productName: product.productName || "",
          description: product.description || "",
          quantity: product.quantity ?? "",
          AvailableQty: product.AvailableQty ?? "",
          hsnCode: product.hsnCode || "",
          chargePerDay: product.chargePerDay ?? "",
          costPrice: product.costPrice ?? "",
          minDays: product.minDays ?? "",
          displayOrder: product.displayOrder ?? "",
          loadingCharges: product.loadingCharges ?? "",
          unloadingCharges: product.unloadingCharges ?? "",
          depositCharges: product.depositCharges ?? "",
          includeOutDate: product.includeOutDate ?? false,
          includeInDate: product.includeInDate ?? false,
          status: product.status || "Active",
        }
      : {}),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await updateProduct(product._id, formData);
      } else {
        await addProduct(formData);
      }
      onProductAdded();
      closeModal();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={closeModal}>
          ✕
        </button>
        <h2>{isEdit ? "Edit Product" : "Add New Product"}</h2>

        <div className="form-grid">
          <div className="form-group">
            <label>
              Product Name <span>*</span>
            </label>
            <input
              name="productName"
              value={formData.productName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>SKU</label>
            <input
              disabled
              placeholder="Will be generated automatically after saving."
            />
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Quantity <span>*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>
              Available Quantity <span>*</span>
            </label>
            <input
              type="number"
              name="AvailableQty"
              value={formData.AvailableQty}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>HSN Code</label>
            <input
              name="hsnCode"
              value={formData.hsnCode}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Charge per Day (INR) <span>*</span>
            </label>
            <input
              type="number"
              name="chargePerDay"
              value={formData.chargePerDay}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Cost Price (INR) <span>*</span>
            </label>
            <input
              type="number"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Min. Days Charge for Challan <span>*</span>
            </label>
            <input
              type="number"
              name="minDays"
              value={formData.minDays}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Display Order</label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Loading Charges (INR)</label>
            <input
              type="number"
              name="loadingCharges"
              value={formData.loadingCharges}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Unloading Charges (INR)</label>
            <input
              type="number"
              name="unloadingCharges"
              value={formData.unloadingCharges}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Deposit Charges per Unit</label>
            <input
              type="number"
              name="depositCharges"
              value={formData.depositCharges}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Include Out Challan Date</label>
            <select
              name="includeOutDate"
              value={formData.includeOutDate}
              onChange={handleChange}
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>

          <div className="form-group">
            <label>Include In Challan Date</label>
            <select
              name="includeInDate"
              value={formData.includeInDate}
              onChange={handleChange}
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="modal-buttons">
          <button type="button" className="btn-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button type="button" className="btn-save" onClick={handleSubmit}>
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewProductModal;
