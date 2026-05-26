import { useState } from "react";
import SelectChallanStep from "./SelectChallanstep";
import FinalizeInvoiceStep from "./FinalizeInvoicestep";
import "./CreateInvoicemodal.css";

export default function CreateInvoiceModal({ onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    // Reset all state before closing
    setStep(1);
    setSelectedItems([]);
    setSaving(false);
    onClose();
  };

  const handleSave = async (invoiceData) => {
    if (saving) return;

    try {
      setSaving(true);

      if (onSave) {
        await onSave(invoiceData);
      }

      handleClose();
    } catch (err) {
      setSaving(false);
      // Error already handled in parent (Invoices.jsx)
    }
  };

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal">
        <div className="invoice-header">
          <h2>Create Invoice</h2>

          <button className="close-btn" onClick={handleClose} disabled={saving}>
            ×
          </button>
        </div>

        <div className="step-indicator">
          <div className={`step ${step === 1 ? "active" : ""}`}>
            <span>1</span>
            SELECT CHALLANS
          </div>

          <div className={`step ${step === 2 ? "active" : ""}`}>
            <span>2</span>
            FINALIZE INVOICE
          </div>
        </div>

        <div className="invoice-body">
          {step === 1 && (
            <SelectChallanStep
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <FinalizeInvoiceStep
              selectedItems={selectedItems}
              onBack={() => setStep(1)}
              onSave={handleSave}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}
