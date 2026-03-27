import React, { useState } from "react";
import "./LoginSignup.css";

const AdminAuth = () => {

  const [isSignup, setIsSignup] = useState(true);

  const [formData, setFormData] = useState({
    shopName: "",
    shopNumber: "",
    email: "",
    password: ""
  });

  // ✅ Handle Input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ SIGNUP
  const signup = async () => {

    if (!formData.email || !formData.password) {
      alert("Please fill all required fields ");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.shopName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        alert("Signup Successful ✅");

        // 👉 Auto switch to login
        setIsSignup(false);

      } else {
        alert(data.errors);
      }

    } catch (error) {
      console.error(error);
    }
  };

  // ✅ LOGIN (IMPORTANT PART )
  const login = async () => {

    if (!formData.email || !formData.password) {
      alert("Please enter email & password ❗");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth-token", data.token);
        alert("Login Successful ");

        // 👉 Redirect to Admin Panel
        window.location.replace("/addproduct");

      } else {
        alert("Invalid Email or Password "); 
      }

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">

        <h1>{isSignup ? "Admin Sign Up" : "Admin Login"}</h1>

        {/* Signup only */}
        {isSignup && (
          <input
            type="text"
            name="shopName"
            placeholder="Enter Shop Name"
            value={formData.shopName}
            onChange={handleChange}
          />
        )}

        <input
          type="text"
          name="shopNumber"
          placeholder="Enter Shop Number"
          value={formData.shopNumber}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />

        {/* Toggle */}
        <p className="login-text">
          {isSignup ? "Already have an account?" : "Create new account?"}
          <span onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? " Login here" : " Sign up here"}
          </span>
        </p>

        {/* Terms */}
        <div className="terms">
          <div className="left-term">
            <input type="checkbox" />
          </div>
          <div className="right-term">
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
        </div>

        {/* Button */}
        <button onClick={() => isSignup ? signup() : login()}>
          {isSignup ? "Continue" : "Login"}
        </button>

      </div>
    </div>
  );
};

export default AdminAuth;