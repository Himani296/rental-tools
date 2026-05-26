import { useState } from "react";
import Papa from "papaparse";
import { addCustomersBulk } from "../../Services/Customerservice";
import "./CustomerCSVImport.css";

export default function CustomerCSVImport({ closeModal, onCustomerAdded }) {
  const [preview, setPreview] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const normalizeRows = (rows) =>
    rows
      .map((row) => ({
        customerName: String(
          row["Customer Name"] || row.customerName || row.Name || "",
        ).trim(),
        contactName: String(
          row["Contact Name"] || row.contactName || "",
        ).trim(),
        phone: String(row.Phone || row.phone || "").trim(),
        email: String(row.Email || row.email || "").trim(),
        billingAddress: String(
          row["Billing Address"] || row.billingAddress || "",
        ).trim(),
        shippingAddress: String(
          row["Shipping Address"] || row.shippingAddress || "",
        ).trim(),
        gstNumber: String(row.GST || row.gstNumber || "").trim(),
        aadhaarNumber: String(row.Aadhaar || row.aadhaarNumber || "").trim(),
        panNumber: String(row.PAN || row.panNumber || "").trim(),
        notes: String(row.Notes || row.notes || "").trim(),
        status: String(row.Status || row.status || "Active").trim() || "Active",
      }))
      .filter((row) => row.customerName);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = normalizeRows(results.data).slice(0, 500);
        setPreview(data.slice(0, 5));
        setFullData(data);

        if (!data.length) {
          setMessage(
            "No valid customer rows found. Ensure customerName column is present.",
          );
        }
      },
    });
  };

  const handleSampleDownload = () => {
    const sample = [
      {
        "Customer Name": "Ankit Traders",
        "Contact Name": "Ankit Shah",
        Phone: "9876543210",
        Email: "ankit@example.com",
        "Billing Address": "SG Highway, Ahmedabad",
        "Shipping Address": "SG Highway, Ahmedabad",
        GST: "24ABCDE1234F1Z5",
        Aadhaar: "123412341234",
        PAN: "ABCDE1234F",
        Status: "Active",
        Notes: "Regular bulk customer",
      },
    ];

    const csv = Papa.unparse(sample);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_customers.csv";
    link.click();
  };

  const handleImport = async () => {
    if (!fullData.length) {
      setMessage("No data to import.");
      return;
    }

    setIsImporting(true);
    try {
      await addCustomersBulk(fullData);
      onCustomerAdded();
      closeModal();
    } catch (error) {
      setMessage(error.response?.data?.message || "Import failed.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="csv-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Import Customers</h2>
          <button className="close-btn" onClick={closeModal}>
            ×
          </button>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <div>
            Download the sample CSV to see the required format. Import always
            creates new parties and never updates existing records.
          </div>
          <button className="download-btn" onClick={handleSampleDownload}>
            Download sample CSV
          </button>
        </div>

        {/* File Upload */}
        <div className="form-group">
          <label>CSV File</label>

          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".csv"
              id="csvUpload"
              onChange={handleCSVUpload}
              hidden
            />
            <label htmlFor="csvUpload" className="file-btn">
              Choose file
            </label>
            <span className="file-name">{fileName || "No file chosen"}</span>
          </div>

          <small>Maximum 500 rows per import.</small>
        </div>

        {message ? <p className="help-text">{message}</p> : null}

        {/* Preview Table */}
        {preview.length > 0 ? (
          <div className="preview-table">
            <table>
              <thead>
                <tr>
                  {Object.keys(preview[0]).map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="customer-state-card">
            Upload a CSV file to preview rows.
          </div>
        )}

        {/* Buttons */}
        <div className="button-row">
          <button className="cancel-btn" onClick={closeModal}>
            Close
          </button>
          <button
            className="import-btn"
            onClick={handleImport}
            disabled={!fullData.length || isImporting}
          >
            {isImporting ? "Importing..." : "Import Customers"}
          </button>
        </div>
      </div>
    </div>
  );
}
