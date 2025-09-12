// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Supabase login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        // 🔥 Always show savage message instead of Supabase default
        setError("❌ Access denied. You brought a butter knife to a gunfight 🔫 — use the user app.");
        setLoading(false);
        return;
      }

      // Fetch user role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        setError("❌ Access denied. You brought a butter knife to a gunfight 🔫 — use the user app.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // ✅ Admin login success
      navigate("/");

    } catch (err) {
      console.error(err);
      setError("❌ Access denied. You brought a butter knife to a gunfight 🔫 — use the user app.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] p-6">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex">
        
        {/* Left side - Image */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#c8c0ae] to-[#ffffff] items-center justify-center p-6">
          <img
            src="./logo.png" // 👉 put your image inside public/ folder
            alt="Login Illustration"
            className="w-4/5 h-auto rounded-xl shadow-lg"
          />
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#333333]">
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
              disabled={loading}
              className="w-full bg-[#FFA500] text-white py-2 rounded-lg font-medium hover:bg-[#e59400] transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
