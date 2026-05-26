import "./Products.css";
import { useEffect, useState } from "react";
import {
  getProducts,
  deleteProduct,
  normalizeProductInventory,
} from "../../Services/productservice";
import NewProductModal from "./NewProductModal";
import ImportProductsModal from "./ProductCSVimport";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      p.productName?.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    );
  });

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts((data || []).map(normalizeProductInventory));
    } catch (error) {
      console.log(error);
      setProducts([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="products-page">
      {/* Header */}
      <div className="page-header">
        <h1>Products</h1>
        <p>
          Configure inventory SKUs with default pricing before recording
          moments.
        </p>
      </div>

      <div className="product-card">
        {/* Toolbar */}
        <div className="product-toolbar">
          <input
            placeholder="Search by name, SKU or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
          <button className="primary" onClick={() => {}}>
            Search
          </button>
          <button onClick={loadProducts}>Refresh</button>

          <div className="spacer" />

          <button onClick={() => setShowImport(true)}>Import Products</button>
          <button className="primary" onClick={() => setShowModal(true)}>
            New Product
          </button>
        </div>

        {/* Table */}
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Available</th>
              <th>Pending Return</th>
              <th>Charge / Day</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts?.length > 0 ? (
              filteredProducts.map((p, i) => (
                <tr key={p.id || i}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{p.productName}</strong>
                    <div className="muted">{p.sku}</div>
                  </td>
                  <td>{p.availableQty}</td>
                  <td>{p.pendingReturnQty}</td>
                  <td>₹ {p.chargePerDay || 0}</td>
                  <td>
                    <span
                      className={`status ${(p.status || "Active").toLowerCase()}`}
                    >
                      {p.status || "Active"}
                    </span>
                  </td>
                  <td className="action-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => setEditProduct(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(p._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty">
                  {searchTerm
                    ? `No products match "${searchTerm}"`
                    : "No products found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <NewProductModal
          closeModal={() => setShowModal(false)}
          onProductAdded={loadProducts}
        />
      )}

      {editProduct && (
        <NewProductModal
          closeModal={() => setEditProduct(null)}
          onProductAdded={loadProducts}
          product={editProduct}
        />
      )}

      {showImport && (
        <ImportProductsModal
          closeModal={() => setShowImport(false)}
          onImportSuccess={loadProducts}
        />
      )}
    </div>
  );
}
