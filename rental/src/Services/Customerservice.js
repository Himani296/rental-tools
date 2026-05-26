// customerService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/customers";

// ✅ Bulk Add
export const addCustomersBulk = (dataArray) => {
  return axios.post(`${API_URL}/bulk`, dataArray);
};

// ✅ Single Add
export const addCustomer = (data) => {
  return axios.post(API_URL, data);
};

// ✅ Get All
export const getCustomers = async () => {
  const response = await axios.get("http://localhost:5000/api/customers");
  return response.data;
};

// ✅ Delete
export const deleteCustomer = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};
