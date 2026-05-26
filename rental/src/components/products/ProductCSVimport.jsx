import { useState } from "react";
import Papa from "papaparse";
import "./Products.css";
import { bulkImportProducts } from "../../Services/productservice";

export default function ImportProductsModal({ closeModal, onImportSuccess }) {
  const [previewData, setPreviewData] = useState([]);
  const [fileData, setFileData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPreviewData([]);
      setFileData([]);
      setMessage("");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        if (results.data.length > 500) {
          alert("Maximum 500 rows allowed.");
          return;
        }

        setFileData(results.data);
        setPreviewData(results.data.slice(0, 5));
        setMessage("");
      },
    });
  };

  const handleImport = async () => {
    if (!fileData.length) {
      setMessage("Please upload a CSV file with at least one row.");
      return;
    }

    setIsImporting(true);
    try {
      const result = await bulkImportProducts(fileData);
      const createdCount = result.created.length;
      const skippedCount = result.skipped;

      setMessage(
        `Import completed. Created ${createdCount} product(s), skipped ${skippedCount}.`,
      );
      onImportSuccess();
      closeModal();
    } catch (err) {
      console.error("Import failed", err);
      setMessage(
        err.response?.data?.message ||
          "Import failed. Please check CSV format.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = [
      {
        "Product Name": "Chair",
        Description: "Plastic chair",
        "HSN Code": "9401",
        Quantity: 10,
        "Cost Price": 500,
        "Charge Per Day": 50,
        "Min Days Charge For Order": 1,
        "Include Out Date For Calculations": "Yes",
        "Include In Date For Calculations": "No",
        "Loading Charges": 20,
        "Unloading Charges": 20,
        "Deposit Charge Per Unit": 100,
        "Display Order": 1,
      },
    ];

    const csv = Papa.unparse(sample);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_products.csv";
    link.click();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={closeModal}>
          ✕
        </button>
        <h2>Import Products (CSV)</h2>

        <div className="info-box">
          <div>
            • Max 500 rows allowed · Only new products will be created · First 5
            rows preview will be shown
          </div>
          <button onClick={downloadSampleCSV} className="download-btn">
            Download Sample CSV
          </button>
        </div>

        <div className="form-group">
          <label>CSV File</label>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
        </div>

        {message ? <p className="help-text">{message}</p> : null}

        {previewData.length > 0 && (
          <>
            <h4>Preview (First 5 Rows)</h4>
            <div className="preview-table">
              <table>
                <thead>
                  <tr>
                    {Object.keys(previewData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, idx) => (
                        <td key={idx}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="modal-buttons">
          <button onClick={closeModal} className="btn-cancel">
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="btn-save"
            disabled={!fileData.length || isImporting}
          >
            {isImporting ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
