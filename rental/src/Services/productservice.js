import api from "./api";
console.log("PRODUCT SERVICE LOADED");

const RESOURCE = "/products";

export const getProductAvailableQty = (product) =>
  Number(product?.AvailableQty ?? product?.available ?? 0);

export const normalizeProductInventory = (product) => ({
  ...product,
  availableQty: getProductAvailableQty(product),
  totalQty: Number(
    product?.quantity ?? product?.AvailableQty ?? product?.available ?? 0,
  ),
  pendingReturnQty: Number(product?.pendingReturn ?? 0),
});

export const addProduct = async (productData) => {
  const response = await api.post(RESOURCE, productData);
  return response.data;
};

export const getProducts = async () => {
  const response = await api.get(RESOURCE);
  return response.data;
};
export const updateProduct = async (id, productData) => {
  const response = await api.put(`${RESOURCE}/${id}`, productData);
  return response.data;
};

export const deleteProduct = (id) => api.delete(`${RESOURCE}/${id}`);

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "yes" || normalized === "true" || normalized === "1";
  }
  return Boolean(value);
};

export const mapCsvProductRow = (row) => ({
  productName: String(row["Product Name"] || row.productName || "").trim(),
  description: String(row.Description || row.description || "").trim(),
  hsnCode: String(row["HSN Code"] || row.hsnCode || "").trim(),
  quantity: toNumber(row.Quantity ?? row.quantity, 0),
  AvailableQty: toNumber(row["Available Quantity"] ?? row.AvailableQty ?? row.availableQty ?? row.Quantity ?? row.quantity, 0),
  costPrice: toNumber(row["Cost Price"] ?? row.costPrice, 0),
  chargePerDay: toNumber(row["Charge Per Day"] ?? row.chargePerDay, 0),
  minDays: Math.max(toNumber(row["Min Days Charge For Order"] ?? row.minDays, 1), 1),
  includeOutDate: toBoolean(row["Include Out Date For Calculations"] ?? row.includeOutDate),
  includeInDate: toBoolean(row["Include In Date For Calculations"] ?? row.includeInDate),
  loadingCharges: toNumber(row["Loading Charges"] ?? row.loadingCharges, 0),
  unloadingCharges: toNumber(row["Unloading Charges"] ?? row.unloadingCharges, 0),
  depositCharges: toNumber(row["Deposit Charge Per Unit"] ?? row.depositCharges, 0),
  displayOrder: toNumber(row["Display Order"] ?? row.displayOrder, 0),
  status: String(row.status || "Active").trim() || "Active",
});

export const bulkImportProducts = async (rows) => {
  const existingProducts = await getProducts();
  const existingKeys = new Set(
    (existingProducts || []).map((product) =>
      `${String(product.productName || "").trim().toLowerCase()}|${String(product.hsnCode || "").trim().toLowerCase()}`,
    ),
  );

  const created = [];
  let skipped = 0;

  for (const row of rows) {
    const payload = mapCsvProductRow(row);
    if (!payload.productName) {
      skipped += 1;
      continue;
    }

    const dedupeKey = `${payload.productName.toLowerCase()}|${payload.hsnCode.toLowerCase()}`;
    if (existingKeys.has(dedupeKey)) {
      skipped += 1;
      continue;
    }

    const createdProduct = await addProduct(payload);
    created.push(createdProduct);
    existingKeys.add(dedupeKey);
  }

  return { created, skipped };
};