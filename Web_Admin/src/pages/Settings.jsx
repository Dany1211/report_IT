// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: "", role: "", department: "", avatar: "" });

  // Fetch user + profile info from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user) {
        setUser(currentUser.user);

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("full_name, role, department, avatar_url")
          .eq("id", currentUser.user.id)
          .single();

        if (!error && profileData) {
          setProfile({
            name: profileData.full_name,
            role: profileData.role,
            department: profileData.department,
            avatar: profileData.avatar_url,
          });
        } else {
          // fallback if no extra profile data
          setProfile({
            name: "Admin Officer",
            role: "City Authority",
            department: "Municipal Corporation",
            avatar: "https://ui-avatars.com/api/?name=Admin&background=FFA500&color=fff", // default avatar
          });
        }
      } else {
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Render tab content
  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-10">
            {/* Profile Card */}
            <div className="flex items-center space-x-6 bg-gray-50 p-6 rounded-xl shadow-sm">
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-20 h-20 rounded-full border-4 border-[#FFA500] object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold">{profile.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500">
                  {profile.role} • {profile.department}
                </p>
                <button className="mt-3 bg-[#FFA500] text-white px-4 py-2 rounded-lg hover:bg-[#e59400]">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Theme */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Theme</h3>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#FFA500] border-2 border-black"></div>
                <span>Custom Theme (Orange)</span>
              </div>
              <div className="mt-3 flex space-x-4">
                <button className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Light Mode</button>
                <button className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900">Dark Mode</button>
              </div>
            </div>

            
          </div>

        );
      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Change Password</h3>
              <button className="bg-[#32CD32] text-white px-4 py-2 rounded-lg hover:bg-green-600">
                Update Password
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Two-Factor Authentication</h3>
              <button className="bg-[#007BFF] text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Enable 2FA
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md min-h-screen p-6">
        <h2 className="text-xl font-bold text-[#000000] mb-6">Settings</h2>
        <nav className="space-y-4">
          {[
            { id: "general", label: "General" },
            { id: "security", label: "Security" },
            { id: "activity", label: "Activity" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${activeTab === tab.id
                  ? "bg-[#FFA500] text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-white shadow-md rounded-l-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#333] capitalize">{activeTab} Settings</h1>
          <button
            onClick={handleLogout}
            className="bg-[#FF4500] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition"
          >
            🚪 Log Out
          </button>
        </div>

        <div>{renderContent()}</div>
      </main>
    </div>
  );
};

export default SettingsPage;
