// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: "", role: "", department: "" });

  // Fetch authenticated user from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user) {
        setUser(currentUser.user);

        // Fetch additional profile info from 'profiles' table (if you have one)
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("full_name, role, department")
          .eq("id", currentUser.user.id)
          .single();

        if (!error && profileData) {
          setProfile({
            name: profileData.full_name,
            role: profileData.role,
            // department: profileData.department,
          });
        } else {
          // fallback if no extra profile data
          // setProfile({
          //   name: "Admin Officer",
          //   role: "City Authority",
          //   department: "Municipal Corporation",
          // });
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

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">👤 Profile Settings</h2>
            <div className="space-y-4">
              <p><b>Name:</b> {profile.name}</p>
              <p><b>Email:</b> {user?.email}</p>
              <p><b>Role:</b> {profile.role}</p>
              <p><b>Department:</b> {profile.department}</p>
              <button className="bg-[#FFA500] text-white px-4 py-2 rounded-lg hover:bg-[#e59400]">
                Edit Profile
              </button>
            </div>
          </div>
        );
      case "security":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">🔒 Security Settings</h2>
            <div className="space-y-4">
              <button className="bg-[#32CD32] text-white px-4 py-2 rounded-lg hover:bg-green-600">
                Change Password
              </button>
              <button className="bg-[#007BFF] text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Enable 2FA (Two-Factor Authentication)
              </button>
            </div>
          </div>
        );
      case "logs":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">📜 Activity Logs</h2>
            <ul className="list-disc list-inside text-sm space-y-2">
              <li>Logged in from Pune HQ - 10:23 AM</li>
              <li>Changed status of complaint #23 - 10:45 AM</li>
              <li>Updated system preferences - 11:00 AM</li>
            </ul>
            <button className="mt-4 bg-[#FFA500] text-white px-4 py-2 rounded-lg hover:bg-[#e59400]">
              Export Logs
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#333] mb-6">
          Admin Settings ⚙️
        </h1>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 pb-2 mb-6">
          {["profile", "security", "logs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg font-medium ${
                activeTab === tab
                  ? "bg-[#FFA500] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">{renderContent()}</div>

        {/* Logout */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleLogout}
            className="bg-[#FF4500] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition"
          >
            🚪 Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
