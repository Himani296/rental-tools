import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import signupImg from "../assets/signup.png";
import axios from "axios";
import API_URL from "../config";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const res = await axios.post(
      `${API_URL}/user/register`,
      {
        username: formData.username ,   // company name as username
        email: formData.email,
        password: formData.password,
        displayName: formData.company
      }
    );
    console.log("res.data");
    alert("Account Created Successfully ✅");

    navigate("/login");

  } catch (error) {
     console.log("Signup Error 👉", error.response?.data);
  alert(error.response?.data?.message || "Signup Failed ❌");

  }
};
  return (
    <div className="signup-container">
      {/* LEFT SIDE */}
      <div className="left-section">
        <h1>Set Up Your Rental Hub in Minutes</h1>
        <p>
          Create your company profile and start tracking challans,
          returns, inventory, and invoicing from day one.
        </p>
        <img
          src={signupImg}
          alt="Rental Dashboard"
          className="left-image"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="right-section">
        <div className="form-card">
          <div className="brand">
            <div className="logo-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" stroke="white" strokeWidth="1.5" />
                <path d="M12 2V22" stroke="white" strokeWidth="1.5" />
                <path d="M4 6L20 18" stroke="white" strokeWidth="1.5" />
                <path d="M20 6L4 18" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>

            <h4>
              RENTWAALE <span className="beta">BETA</span>
            </h4>
            
          </div>

          <h2>Create Your Account</h2>

          <form onSubmit={handleSignUp}>
            <label>UserName *</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <label>Email *</label>
            <input
              type="email"
              name="email"
              placeholder="name@.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button type="submit" className="signup-btn">
              Create Account
            </button>

            <p className="create-account">
              Already have an account?{' '}
              <span
                onClick={() => navigate('/login')}
                style={{ cursor: 'pointer' }}
              >
                Sign in
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;