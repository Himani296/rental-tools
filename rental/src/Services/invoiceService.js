import axios from "axios";

const API = "http://localhost:5000/api/invoices";

export const getInvoices = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const getEligibleChallans = async (customerName) => {
  const params = customerName ? { customerName } : {};
  const res = await axios.get(`${API}/eligible-challans`, { params });
  return res.data;
};

export const createInvoice = async (data) => {
  const res = await axios.post(`${API}/create`, data);
  return res.data;
};

// Update an invoice by ID
export const updateInvoice = async (id, data) => {
  const res = await axios.put(`${API}/${id}`, data);
  return res.data;
};

// Delete an invoice by ID
export const deleteInvoice = async (id) => {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
};