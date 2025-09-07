"use client"

// src/pages/SettingsPage.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"

const SettingsPage = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ name: "", role: "", email: "", avatar: "" })

  // Fetch user + profile info from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: currentUser } = await supabase.auth.getUser()

      if (currentUser?.user) {
        setUser(currentUser.user)

        // fetch from profiles table using email
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("name, role, email")
          .eq("email", currentUser.user.email)
          .single()

        if (!error && profileData) {
          setProfile({
            name: profileData.name,
            role: profileData.role,
            email: profileData.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              profileData.name,
            )}&background=FFA500&color=fff`, // auto avatar
          })
        } else {
          // fallback if no profile data
          setProfile({
            name: "Admin Officer",
            role: "Authority",
            email: currentUser.user.email,
            avatar: "https://ui-avatars.com/api/?name=Admin&background=FFA500&color=fff",
          })
        }
      } else {
        navigate("/login")
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6]">
      <main className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#333333]">Admin Settings</h1>
          <button
            onClick={handleLogout}
            className="bg-[#FF4500] text-[#FFFFFF] px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-md"
          >
          Log Out
          </button>
        </div>

        <div className="bg-[#FFFFFF] rounded-xl shadow-lg p-8" style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
          <h2 className="text-2xl font-semibold text-[#333333] mb-6">Profile Information</h2>

          <div className="flex items-center space-x-8">
            <img
              src={profile.avatar || "/placeholder.svg"}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-[#FFA500] object-cover shadow-md"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-[#333333] mb-2">{profile.name}</h3>
              {/* <p className="text-[#555555] text-lg mb-1">{profile.email}</p> */}
              {/* <p className="text-[#555555] mb-4">
                <span className="inline-block bg-[#FFE4B5] text-[#333333] px-3 py-1 rounded-full text-sm font-medium">
                  {profile.role}
                </span>
              </p> */}

              <div className="space-y-3">
                <div className="text-[#555555]">
                  <strong>Account Status:</strong>
                  <span className="ml-2 inline-block bg-[#32CD32] text-[#FFFFFF] px-3 py-1 rounded-full text-sm">
                    Active
                  </span>
                </div>
                <div className="text-[#555555]">
                  <strong>Last Login:</strong> {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-8 bg-[#FFFFFF] rounded-xl shadow-lg p-8"
          style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
        >
          <h2 className="text-2xl font-semibold text-[#333333] mb-6">Admin Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[#333333] font-medium mb-2">Full Name</label>
                <div className="bg-[#FFE4B5] p-3 rounded-lg text-[#555555]">{profile.name}</div>
              </div>

              <div>
                <label className="block text-[#333333] font-medium mb-2">Email Address</label>
                <div className="bg-[#FFE4B5] p-3 rounded-lg text-[#555555]">{profile.email}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#333333] font-medium mb-2">Role</label>
                <div className="bg-[#FFE4B5] p-3 rounded-lg text-[#555555]">{profile.role}</div>
              </div>

              <div>
                <label className="block text-[#333333] font-medium mb-2">Access Level</label>
                <div className="bg-[#FFE4B5] p-3 rounded-lg text-[#555555]">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
