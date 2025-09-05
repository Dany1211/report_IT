// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Dummy login validation
    if (email === "admin@example.com" && password === "admin123") {
      navigate("/"); // redirect to dashboard home
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] p-6">
      <div className="w-full max-w-md bg-white shadow-lg shadow-[rgba(0,0,0,0.1)] rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#333333]">
          Admin Login
        </h2>

        {error && (
          <div className="bg-[#FF4500]/10 text-[#FF4500] text-sm p-2 rounded mb-4 border border-[#FF4500]/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#555555]">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#555555]">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#FFA500] text-white py-2 rounded-lg font-medium hover:bg-[#e59400] transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-[#555555] mt-4 bg-[#FFE4B5] py-2 rounded-lg">
          Demo: <b>admin@example.com</b> / <b>admin123</b>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
