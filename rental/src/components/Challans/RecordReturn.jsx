import { useState } from "react";
import axios from "axios";
import "./NewChallan.css";

function RecordReturn({ challan, onClose, onSuccess }) {
  const [returnDate, setReturnDate] = useState("");
  const [items, setItems] = useState(
    (challan.items || []).map((p) => ({
      productName: p.productName,
      good: 0,
      damaged: 0,
      broken: 0,
      lost: 0,
      notes: "",
    })),
  );

  const handleChange = (index, field, value) => {
    const updated = [...items];
    if (field === "notes") {
      updated[index][field] = value;
    } else {
      updated[index][field] = Math.max(0, Number(value || 0));
    }
    setItems(updated);
  };

  const handleSave = async () => {
    if (!returnDate) {
      alert("Please select return date.");
      return;
    }

    if (!items.length) {
      alert("No challan items available to return.");
      return;
    }

    const hasReturnQty = items.some(
      (item) =>
        (item.good || 0) +
          (item.damaged || 0) +
          (item.broken || 0) +
          (item.lost || 0) >
        0,
    );

    if (!hasReturnQty) {
      alert("Enter at least one returned quantity.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/returns", {
        challanId: challan._id,
        returnDate,
        items,
      });

      alert("Return recorded");
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Record Returns</h2>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="form-group">
          <label>Return Date</label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>

        {items.length === 0 ? (
          <div className="customer-state-card">
            No items found in this challan.
          </div>
        ) : null}

        {items.map((item, index) => (
          <div key={index} className="return-row">
            <h4>{item.productName}</h4>

            <input
              type="number"
              placeholder="Good"
              min="0"
              onChange={(e) => handleChange(index, "good", e.target.value)}
            />

            <input
              type="number"
              placeholder="Damaged"
              min="0"
              onChange={(e) => handleChange(index, "damaged", e.target.value)}
            />

            <input
              type="number"
              placeholder="Broken"
              min="0"
              onChange={(e) => handleChange(index, "broken", e.target.value)}
            />

            <input
              type="number"
              placeholder="Lost"
              min="0"
              onChange={(e) => handleChange(index, "lost", e.target.value)}
            />

            <textarea
              placeholder="Notes"
              onChange={(e) => handleChange(index, "notes", e.target.value)}
            />
          </div>
        ))}

        <div className="form-buttons">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave}>
            Record Returns
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecordReturn;
