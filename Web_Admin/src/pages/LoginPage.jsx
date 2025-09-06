// // src/pages/LoginPage.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient"; // ✅ import supabase client

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     // ✅ Supabase login
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       setError(error.message);
//     } else {
//       console.log("Logged in:", data);
//       navigate("/"); // redirect to dashboard home
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] p-6">
//       <div className="w-full max-w-md bg-white shadow-lg shadow-[rgba(0,0,0,0.1)] rounded-2xl p-8">
//         <h2 className="text-2xl font-bold text-center mb-6 text-[#333333]">
//           Admin Login
//         </h2>

//         {error && (
//           <div className="bg-[#FF4500]/10 text-[#FF4500] text-sm p-2 rounded mb-4 border border-[#FF4500]/20">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1 text-[#555555]">
//               Email
//             </label>
//             <input
//               type="email"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="admin@example.com"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1 text-[#555555]">
//               Password
//             </label>
//             <input
//               type="password"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-[#FFA500] text-white py-2 rounded-lg font-medium hover:bg-[#e59400] transition"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p className="text-sm text-center text-[#555555] mt-4">
//           Don’t have an account?{" "}
//           <button
//             onClick={() => navigate("/signup")}
//             className="text-[#FF4500] font-medium hover:underline"
//           >
//             Sign Up
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


// src/pages/LoginPage.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient"; // ✅ keep your import

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     // ✅ Supabase login
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       setError(error.message);
//     } else {
//       console.log("Logged in:", data);
//       navigate("/"); // redirect to dashboard home
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] p-6">
//       <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex">
        
//         {/* Left side - Image */}
//         <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#FFD580] to-[#FF9C73] items-center justify-center p-6">
//           <img
//             src="/login-illustration.png" // 👉 put your image inside public/ folder
//             alt="Login Illustration"
//             className="w-4/5 h-auto rounded-xl shadow-lg"
//           />
//         </div>

//         {/* Right side - Form */}
//         <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
//           <h2 className="text-3xl font-bold text-center mb-6 text-[#333333]">
//             Admin Login
//           </h2>

//           {error && (
//             <div className="bg-[#FF4500]/10 text-[#FF4500] text-sm p-2 rounded mb-4 border border-[#FF4500]/20">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleLogin} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1 text-[#555555]">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="admin@example.com"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1 text-[#555555]">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 required
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-[#FFA500] text-white py-2 rounded-lg font-medium hover:bg-[#e59400] transition"
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>

//           <p className="text-sm text-center text-[#555555] mt-4">
//             Don’t have an account?{" "}
//             <button
//               onClick={() => navigate("/signup")}
//               className="text-[#FF4500] font-medium hover:underline"
//             >
//               Sign Up
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


// src/pages/LoginPage.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabaseClient";

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       // Supabase login
//       const { data, error: loginError } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (loginError) {
//         setError(loginError.message);
//         setLoading(false);
//         return;
//       }

//       // Fetch user role
//       const { data: profile, error: profileError } = await supabase
//         .from("profiles")
//         .select("role")
//         .eq("id", data.user.id)
//         .single();

//       if (profileError || !profile) {
//         setError("Failed to verify role. Please contact support.");
//         await supabase.auth.signOut();
//         setLoading(false);
//         return;
//       }

//       if (profile.role !== "admin") {
//         setError("❌ Access denied. You brought a butter knife to a gunfight 🔫 — use the user app.");
//         await supabase.auth.signOut();
//         setLoading(false);
//         return;
//       }

//       // Admin login success
//       navigate("/"); // Redirect to dashboard

//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong. Try again.");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] p-6">
//       <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex">
        
//         {/* Left side - Image */}
//         <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#FFD580] to-[#FF9C73] items-center justify-center p-6">
//           <img
//             src="/login-illustration.png"
//             alt="Login Illustration"
//             className="w-4/5 h-auto rounded-xl shadow-lg"
//           />
//         </div>

//         {/* Right side - Form */}
//         <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
//           <h2 className="text-3xl font-bold text-center mb-6 text-[#333333]">
//             Admin Login
//           </h2>

//           {error && (
//             <div className="bg-[#FF4500]/10 text-[#FF4500] text-sm p-2 rounded mb-4 border border-[#FF4500]/20">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleLogin} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1 text-[#555555]">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="admin@example.com"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1 text-[#555555]">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 required
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-[#FFA500] text-white py-2 rounded-lg font-medium hover:bg-[#e59400] transition"
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

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
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#FFD580] to-[#FF9C73] items-center justify-center p-6">
          <img
            src="/login-illustration.png"
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
