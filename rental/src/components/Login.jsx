import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";import API_URL from "../config";import "./Login.css";
import signupImg from "../assets/signup.png";


function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


   const handleLogin = async () => {
  try {
    const res = await axios.post(
      `${API_URL}/user/login`,
      {
        username,
        password
      }
    );
    console.log(res.data);
    localStorage.setItem("userId", res.data._id);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("username", res.data.username);

    alert("Login Successful ✅");

    navigate("/customer/products", { replace: true });

  } catch (error) {
    console.log(error.response?.data || error.message);
    alert("Invalid credentials ❌");
  }
};
 
  return (
    <div className="login-page">
      {/* LEFT SECTION */}
      <div className="login-left">
        <h1>Run Rentals with Confidence</h1>
        <p>
          Keep challans, returns, invoicing, and audit trails in one command
          center. Track outstanding returns and keep business flow healthy.
        </p>
        <img
                  src={signupImg}
                  alt="Rental Dashboard"
                  className="left-image"
                />

      </div>

      {/* RIGHT SECTION */}
      <div className="login-right">
        <div className="login-card">
          <div className="brand">
            <div className="logo-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" stroke="white" strokeWidth="1.5" />
                <path d="M12 2V22" stroke="white" strokeWidth="1.5" />
                <path d="M4 6L20 18" stroke="white" strokeWidth="1.5" />
                <path d="M20 6L4 18" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="brand-row">
                <span className="brand-name">RENTWAALE</span>
                <span className="beta">BETA</span>
              </div>
              <p className="tagline">Daily Rental Management</p>
            </div>
          </div>

          <h2>Sign in to continue</h2>

           <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />


         <div className="password-wrapper">
  <input
    type="password"
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <span className="eye">👁</span>

          </div>

          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>
          <p className="create-account">
            Don't have an account? <span onClick={() => navigate("/signup")}>Create one</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
