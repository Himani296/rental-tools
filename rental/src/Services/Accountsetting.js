import axios from "axios";
import API_URL from "../config";

const handleRegister = async () => {
  await axios.post(`${API_URL}/user/register`, {
    username: Username,      // 👈 match backend field
    email: email,
    password: password,
    displayName: company     // 👈 match backend field
  });
};