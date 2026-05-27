// customerService.js
import api from "./api";

const RESOURCE = "/customers";

// ✅ Bulk Add
export const addCustomersBulk = (dataArray) => api.post(`${RESOURCE}/bulk`, dataArray);

// ✅ Single Add
export const addCustomer = (data) => api.post(RESOURCE, data);

// ✅ Get All
export const getCustomers = async () => {
  const response = await api.get(RESOURCE);
  return response.data;
};

// ✅ Delete
export const deleteCustomer = (id) => api.delete(`${RESOURCE}/${id}`);
