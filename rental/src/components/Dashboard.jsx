import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { getDashboardStats } from "../Services/dashboardService";

function Dashboard() {
  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    challans: 0,
    invoices: 0,
    pendingReturns: [],
    pendingReturnRevenue: 0,
    invoicesAwaitingCollection: [],
    pendingInvoiceAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔐 Login token check
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // 📊 Dashboard stats fetch
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Dashboard error:", error);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <main className="dashboard">
        <h1 className="page-title">Dashboard</h1>
        {loading ? <p>Loading dashboard...</p> : null}
        {!loading && error ? <p className="error-text">{error}</p> : null}

        <div className="stats">
          <div className="stat-card">
            <p>Products</p>
            <h2>{stats.products}</h2>
            <span>Active inventory SKUs</span>
          </div>

          <div className="stat-card">
            <p>Customers</p>
            <h2>{stats.customers}</h2>
            <span>Business partners onboarded</span>
          </div>

          <div className="stat-card">
            <p>Challans</p>
            <h2>{stats.challans}</h2>
            <span>Total challans created</span>
          </div>

          <div className="stat-card">
            <p>Invoices</p>
            <h2>{stats.invoices}</h2>
            <span>Invoices generated</span>
          </div>
        </div>

        <section className="card">
          <div className="card-header">
            <h3>Pending returns (per-day revenue)</h3>
            <strong>
              {currencyFormatter.format(
                Number(stats.pendingReturnRevenue || 0),
              )}
            </strong>
          </div>

          <table>
            <thead>
              <tr>
                <th>Challan</th>
                <th>Customer</th>
                <th>Created</th>
                <th>Expected Return</th>
                <th>Qty</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(stats.pendingReturns || []).length > 0 ? (
                stats.pendingReturns.map((row) => (
                  <tr key={row.challanId}>
                    <td>{row.referenceNo || "-"}</td>
                    <td>{row.customerName || "-"}</td>
                    <td>
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td className={row.isOverdue ? "danger" : ""}>
                      {row.expectedReturn
                        ? new Date(row.expectedReturn).toLocaleDateString(
                            "en-IN",
                          )
                        : "-"}
                    </td>
                    <td>{row.qtyPending}</td>
                    <td className="money">
                      {currencyFormatter.format(Number(row.perDayRevenue || 0))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty">
                    No pending returns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="card">
          <div className="card-header">
            <h3>Invoices awaiting collection</h3>
            <strong className="pending">
              {currencyFormatter.format(
                Number(stats.pendingInvoiceAmount || 0),
              )}
            </strong>
          </div>

          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Issued</th>
                <th>Status</th>
                <th>Total</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {(stats.invoicesAwaitingCollection || []).length > 0 ? (
                stats.invoicesAwaitingCollection.map((row) => (
                  <tr key={row.id}>
                    <td>{row.invoiceNumber}</td>
                    <td>{row.customerName || "-"}</td>
                    <td>
                      {row.issueDate
                        ? new Date(row.issueDate).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td>{row.status || "Draft"}</td>
                    <td>
                      {currencyFormatter.format(Number(row.totalAmount || 0))}
                    </td>
                    <td className="money">
                      {currencyFormatter.format(Number(row.pendingAmount || 0))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty">
                    No invoices awaiting collection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
export default Dashboard;
