import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import NewChallan from "./NewChallan";
import RecordReturn from "./RecordReturn";
import "./Challans.css";

import { getProducts } from "../../Services/productservice";
import { getChallans, deleteChallan } from "../../Services/challanService";

function Challans() {
  const [showModal, setShowModal] = useState(false);
  const [preOrder, setPreOrder] = useState(null);
  const [challans, setChallans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChallans = challans.filter((c) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      c.customerName?.toLowerCase().includes(term) ||
      c.referenceNo?.toLowerCase().includes(term)
    );
  });

  // ================= LOAD FUNCTIONS =================

  const loadCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/customers");
      setCustomers(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      console.log("Products Loaded:", data); // 👈 check this in console
    } catch (err) {
      console.error("Product load error:", err);
    }
  };

  const loadChallan = async () => {
    try {
      const data = await getChallans();
      setChallans(data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= PAGE LOAD =================

  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadChallan();
  }, []);

  const location = useLocation();
  const handledStateRef = useRef(false);
  useEffect(() => {
    if (location.state?.preOrder && !handledStateRef.current) {
      handledStateRef.current = true;
      setPreOrder(location.state.preOrder);
      setShowModal(true);
      // clear the state so reopening nav doesn't re-trigger
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  // ================= SAVE =================

  const handleSave = (newChallan) => {
    setChallans((prev) => [...prev, newChallan]);
    setShowModal(false);
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this challan?")) return;
    try {
      await deleteChallan(id);
      loadChallan();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= SEARCH =================

  const handleSearch = () => {
    // search is applied live via filteredChallans computed value above
  };

  return (
    <div className="challan-page">
      <div className="page-header">
        <h1>Challan</h1>
        <p>
          Track every product movement with customers and capture returns for
          accurate invoicing.
        </p>
      </div>

      <div className="challan-card">
        <div className="challan-toolbar">
          <input
            type="text"
            placeholder="Search by challan reference or customer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button className="primary" onClick={handleSearch}>
            Search
          </button>

          <button onClick={loadChallan}>Refresh</button>

          <div className="spacer"></div>

          <button
            className="primary"
            onClick={() => {
              setPreOrder(null);
              setShowModal(true);
            }}
          >
            New Challan
          </button>
        </div>

        <table className="challan-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>REFERENCE NO</th>
              <th>CUSTOMER</th>
              <th>ITEMS</th>
              <th>QTY OUT</th>
              <th>QTY RETURNED</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredChallans.length > 0 ? (
              filteredChallans.map((c, index) => {
                const totalOut =
                  c.items?.reduce((s, i) => s + (i.quantityOut || 0), 0) ??
                  (c.quantityOut || 0);
                return (
                  <tr key={c._id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{c.referenceNo}</strong>
                    </td>
                    <td>{c.customerName}</td>
                    <td>{c.items?.length || 0}</td>
                    <td>{totalOut}</td>
                    <td>{c.quantityReturned || 0}</td>
                    <td>
                      <span
                        className={`status-badge ${(c.status || "Active").toLowerCase()}`}
                      >
                        {c.status || "Active"}
                      </span>
                    </td>
                    <td className="action-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn return-btn"
                          onClick={() => setSelectedChallan(c)}
                        >
                          Return
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(c._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="empty">
                  {searchTerm
                    ? `No challans match "${searchTerm}"`
                    : "No challans found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <NewChallan
          customers={customers}
          products={products}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setPreOrder(null);
          }}
          preOrder={preOrder}
        />
      )}

      {selectedChallan && (
        <RecordReturn
          challan={selectedChallan}
          onClose={() => setSelectedChallan(null)}
          onSuccess={loadChallan}
        />
      )}
    </div>
  );
}

export default Challans;
