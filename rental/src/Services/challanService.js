import api from "./api";

const RESOURCE = "/challans";

export const getChallans = async () => {
  const res = await api.get(RESOURCE);
  return res.data;
};

export const addChallan = async (data) => {
  const res = await api.post(RESOURCE, data);
  return res.data;
};

export const updateChallan = async (id, data) => {
  const res = await api.put(`${RESOURCE}/${id}`, data);
  return res.data;
};

export const deleteChallan = async (id) => {
  const res = await api.delete(`${RESOURCE}/${id}`);
  return res.data;
};