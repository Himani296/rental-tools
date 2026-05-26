import { useEffect, useState } from "react";
import { getEligibleChallans } from "../../Services/invoiceService";

export default function SelectChallanStep({
  selectedItems,
  setSelectedItems,
  onNext,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getEligibleChallans();

      if (Array.isArray(data.rows)) {
        setRows(data.rows);
      } else {
        const challans = data.challans || [];
        const tableRows = [];

        challans.forEach((challan) => {
          (challan.items || []).forEach((item) => {
            const quantityOut = Number(item.quantityOut || 0);
            const quantityReturned = Number(item.quantityReturned || 0);
            const outstandingQty = Math.max(quantityOut - quantityReturned, 0);
            if (outstandingQty <= 0) return;

            tableRows.push({
              challanId: challan._id,
              challanRef: challan.referenceNo,
              customer: challan.customerName,
              customerId: challan.customer,
              itemId: item._id,
              productId: item.product,
              productName: item.productName,
              quantityOut,
              quantityReturned,
              outstandingQty,
              chargePerDay: Number(item.price || 0),
            });
          });
        });
        setRows(tableRows);
      }
    } catch (err) {
      console.log("Error loading challans", err);
      setError("Unable to load eligible challans.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (row, checked) => {
    if (checked) {
      setSelectedItems((prev) => {
        if (prev.some((item) => String(item.itemId) === String(row.itemId))) {
          return prev;
        }
        return [...prev, row];
      });
    } else {
      setSelectedItems((prev) => prev.filter((i) => i.itemId !== row.itemId));
    }
  };

  return (
    <div>
      <h3>Select Challan Items</h3>

      {loading ? <p>Loading challans...</p> : null}
      {!loading && error ? <p className="error-text">{error}</p> : null}
      {!loading && !error && rows.length === 0 ? (
        <p>No eligible challan items found. Record returns first.</p>
      ) : null}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "12px 14px",
                color: "var(--color-text-muted)",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                borderBottom: "2px solid var(--color-border)",
              }}
            >
              Select
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "12px 14px",
                color: "var(--color-text-muted)",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                borderBottom: "2px solid var(--color-border)",
              }}
            >
              Challan
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "12px 14px",
                color: "var(--color-text-muted)",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                borderBottom: "2px solid var(--color-border)",
              }}
            >
              Customer
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "12px 14px",
                color: "var(--color-text-muted)",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                borderBottom: "2px solid var(--color-border)",
              }}
            >
              Product
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "12px 14px",
                color: "var(--color-text-muted)",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                borderBottom: "2px solid var(--color-border)",
              }}
            >
              Qty Out
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "12px 14px",
                color: "var(--color-text-muted)",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                borderBottom: "2px solid var(--color-border)",
              }}
            >
              Outstanding
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.itemId}>
              <td
                style={{
                  padding: "14px",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.some((i) => i.itemId === row.itemId)}
                  onChange={(e) => handleSelect(row, e.target.checked)}
                  style={{ width: "auto" }}
                />
              </td>

              <td
                style={{
                  padding: "14px",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: "14px",
                }}
              >
                {row.challanRef}
              </td>

              <td
                style={{
                  padding: "14px",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: "14px",
                }}
              >
                {row.customer}
              </td>

              <td
                style={{
                  padding: "14px",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: "14px",
                }}
              >
                {row.productName}
              </td>

              <td
                style={{
                  padding: "14px",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: "14px",
                }}
              >
                {row.quantityOut}
              </td>

              <td
                style={{
                  padding: "14px",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: "14px",
                }}
              >
                {row.outstandingQty}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="form-buttons">
        <button
          className="btn-save"
          onClick={onNext}
          disabled={selectedItems.length === 0}
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}
