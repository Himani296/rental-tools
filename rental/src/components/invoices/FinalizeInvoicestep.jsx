import { useState } from "react";

export default function FinalizeInvoiceStep({
  selectedItems,
  onBack,
  onSave,
  saving = false,
}) {
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Draft");
  const [remarks, setRemarks] = useState("");

  const save = () => {
    if (!issueDate) {
      alert("Issue date is required.");
      return;
    }

    if (!selectedItems.length) {
      alert("Please select at least one challan item.");
      return;
    }

    const invoiceData = {
      issueDate,
      dueDate: dueDate || undefined,
      status,
      remarks: remarks.trim(),
      items: selectedItems,
    };

    if (onSave) {
      onSave(invoiceData);
    }
  };

  return (
    <div>
      <h3>Finalize Invoice</h3>

      <div className="form-group">
        <label>Issue Date</label>

        <input
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Due Date (Optional)</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
        </select>
      </div>

      <div className="form-group">
        <label>Remarks (Optional)</label>
        <textarea
          rows="3"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      <div className="form-buttons">
        <button className="btn-cancel" onClick={onBack} disabled={saving}>
          Back
        </button>

        <button className="btn-save" onClick={save} disabled={saving}>
          {saving ? "Creating..." : "Create Invoice"}
        </button>
      </div>
    </div>
  );
}
