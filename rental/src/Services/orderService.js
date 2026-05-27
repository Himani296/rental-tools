import api from "./api";

const RESOURCE = "/orders";

export const createOrder = async (data) => {
  const res = await api.post(RESOURCE, data);
  return res.data;
};

export const getOrders = async () => {
  const res = await api.get(RESOURCE);
  return res.data;
};

export const getOrdersByPhone = async (phone) => {
  const res = await api.get(`${RESOURCE}/phone/${encodeURIComponent(phone)}`);
  return res.data;
};

export const getOrder = async (id) => {
  const res = await api.get(`${RESOURCE}/${id}`);
  return res.data;
};

export const updateOrder = async (id, data) => {
  const res = await api.patch(`${RESOURCE}/${id}`, data);
  return res.data;
};

export const deleteOrder = async (id) => {
  const res = await api.delete(`${RESOURCE}/${id}`);
  return res.data;
};
