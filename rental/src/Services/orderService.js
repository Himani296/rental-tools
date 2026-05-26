import axios from "axios";

const API = "http://localhost:5000/api/orders";

export const createOrder = async (data) => {
  const res = await axios.post(API, data);
  return res.data;
};

export const getOrders = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const getOrdersByPhone = async (phone) => {
  const res = await axios.get(`${API}/phone/${encodeURIComponent(phone)}`);
  return res.data;
};

export const getOrder = async (id) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
};

export const updateOrder = async (id, data) => {
  const res = await axios.patch(`${API}/${id}`, data);
  return res.data;
};

export const deleteOrder = async (id) => {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
};
