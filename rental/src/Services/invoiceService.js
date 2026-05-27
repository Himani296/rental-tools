import api from "./api";

const RESOURCE = "/invoices";

export const getInvoices = async () => {
  const res = await api.get(RESOURCE);
  return res.data;
};

export const getEligibleChallans = async (customerName) => {
  const params = customerName ? { customerName } : {};
  const res = await api.get(`${RESOURCE}/eligible-challans`, { params });
  return res.data;
};

export const createInvoice = async (data) => {
  const res = await api.post(`${RESOURCE}/create`, data);
  return res.data;
};

// Update an invoice by ID
export const updateInvoice = async (id, data) => {
  const res = await api.put(`${RESOURCE}/${id}`, data);
  return res.data;
};

// Delete an invoice by ID
export const deleteInvoice = async (id) => {
  const res = await api.delete(`${RESOURCE}/${id}`);
  return res.data;
};