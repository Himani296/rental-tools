import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiSearch, FiShoppingCart, FiZap } from "react-icons/fi";
import {
  getProducts,
  normalizeProductInventory,
} from "../../Services/productservice";
import { useCustomerCart } from "./CustomerContext";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const normalizeProduct = (product) => {
  const inventory = normalizeProductInventory(product);

  return {
    ...inventory,
    id: product._id || product.id || product.productName,
    productName: product.productName || "Unnamed product",
    description: product.description || "",
    chargePerDay: Number(product.chargePerDay ?? 0),
    depositCharges: Number(product.depositCharges ?? 0),
    loadingCharges: Number(product.loadingCharges ?? 0),
    unloadingCharges: Number(product.unloadingCharges ?? 0),
    minDays: Math.max(Number(product.minDays ?? 1), 1),
    hsnCode: product.hsnCode || "",
    status: product.status || "Active",
  };
};

export default function CustomerPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const { addToCart, summary } = useCustomerCart();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const loadProducts = async (isBackground = false) => {
      if (!isBackground) {
        setLoading(true);
      }
      setError("");

      try {
        const data = await getProducts();
        const activeProducts = (data || [])
          .map(normalizeProduct)
          .filter((product) => product.status.toLowerCase() === "active")
          .sort((firstProduct, secondProduct) =>
            firstProduct.productName.localeCompare(secondProduct.productName),
          );

        setProducts(activeProducts);
      } catch (fetchError) {
        console.error(fetchError);
        setProducts([]);
        setError("Unable to load products right now.");
      } finally {
        setLoading(false);
        isFirstLoad.current = false;
      }
    };

    loadProducts(false);

    const intervalId = window.setInterval(() => loadProducts(true), 15000);
    const handleFocus = () => loadProducts(true);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      if (!term) {
        return true;
      }

      return [product.productName, product.description, product.hsnCode]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [products, searchTerm]);

  return (
    <section className="customer-page-section customer-container">
      <div className="customer-hero-card">
        <div>
          <p className="customer-kicker">CUSTOMER PRODUCT PANEL</p>
          <h1>Choose products from the live admin inventory.</h1>
          <p>
            Customers can browse products added by the admin, add them to cart,
            and move straight to billing without entering the admin dashboard.
          </p>
        </div>

        <div className="customer-hero-sidecard">
          <span>Cart status</span>
          <strong>{summary.itemCount} items selected</strong>
          <p>
            Billing is calculated from item quantity, rental days, deposit, and
            handling.
          </p>
          <Link
            to="/customer/cart"
            className="customer-solid-button full-width"
          >
            <FiShoppingCart /> Open cart and bill
          </Link>
        </div>
      </div>

      <div className="customer-toolbar">
        <label className="customer-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search products by name, description or HSN code"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <div className="customer-stats-inline">
          <div>
            <span>Live products</span>
            <strong>{products.length}</strong>
          </div>
          <div>
            <span>Available stock</span>
            <strong>
              {products.reduce(
                (total, product) => total + product.availableQty,
                0,
              )}
            </strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="customer-state-card">Loading products...</div>
      ) : null}
      {!loading && error ? (
        <div className="customer-state-card error">{error}</div>
      ) : null}
      {!loading && !error && filteredProducts.length === 0 ? (
        <div className="customer-state-card">
          No products match the current search.
        </div>
      ) : null}

      {!loading && !error && filteredProducts.length > 0 ? (
        <div className="customer-product-grid">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.availableQty <= 0;

            return (
              <article key={product.id} className="customer-product-card">
                <div className="product-card-topline">
                  <span
                    className={isOutOfStock ? "stock-pill warn" : "stock-pill"}
                  >
                    {isOutOfStock
                      ? "Out of stock"
                      : `${product.availableQty} ready now`}
                  </span>
                  <span className="product-code">
                    {product.hsnCode || "HSN pending"}
                  </span>
                </div>

                <h2>{product.productName}</h2>
                <p>
                  {product.description ||
                    "This item is available for rental from the admin inventory."}
                </p>

                <div className="product-highlight-grid">
                  <div>
                    <span>Per day</span>
                    <strong>
                      {currencyFormatter.format(product.chargePerDay)}
                    </strong>
                  </div>
                  <div>
                    <span>Deposit</span>
                    <strong>
                      {currencyFormatter.format(product.depositCharges)}
                    </strong>
                  </div>
                  <div>
                    <span>Loading</span>
                    <strong>
                      {currencyFormatter.format(product.loadingCharges)}
                    </strong>
                  </div>
                  <div>
                    <span>Unloading</span>
                    <strong>
                      {currencyFormatter.format(product.unloadingCharges)}
                    </strong>
                  </div>
                </div>

                <div className="product-facts-list">
                  <div>
                    <FiPackage />
                    <span>Total stock: {product.totalQty}</span>
                  </div>
                  <div>
                    <FiZap />
                    <span>Minimum billing: {product.minDays} day(s)</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="customer-solid-button full-width"
                  disabled={isOutOfStock}
                  onClick={() => addToCart(product)}
                >
                  <FiShoppingCart />{" "}
                  {isOutOfStock ? "Unavailable" : "Add to cart"}
                </button>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
