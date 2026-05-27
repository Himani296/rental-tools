import api from "./api";

const RESOURCE = "/dashboard";

export const getDashboardStats = async () => {
  const res = await api.get(RESOURCE);
  return res.data || {};
};