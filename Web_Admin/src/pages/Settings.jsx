"use client"

// src/pages/Settings.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"
import { Mail, User, Shield } from "lucide-react"

const Settings = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ name: "", role: "", email: "", avatar: "" })

  // ✅ Fetch user + profile info from Supabase
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
            )}&background=F56565&color=fff`,
          })
        } else {
          // fallback if no profile data
          setProfile({
            name: "Admin Officer",
            role: "Authority",
            email: currentUser.user.email,
            avatar: "https://ui-avatars.com/api/?name=Admin&background=F56565&color=fff",
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
    <div className="min-h-screen bg-[#E8EDF4]">
      <main className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-[#1A202C]">Admin Settings</h1>
          <button
            onClick={handleLogout}
            className="bg-[#F56565] hover:bg-[#D64545] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            Log Out
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-[#A0B0C0]">
          <div className="flex items-center gap-6">
            <img
              src={profile.avatar || "/placeholder.svg"}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-[#F56565] object-cover shadow-sm"
            />
            <div>
              <h2 className="text-2xl font-semibold text-[#1A202C]">{profile.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">
                  Active
                </span>
                <span className="text-sm text-[#4A5568]">
                  Last Login: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Information */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-[#A0B0C0]">
          <h2 className="text-xl font-semibold text-[#1A202C] mb-6">Admin Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#4A5568] mb-1">Full Name</label>
              <div className="flex items-center gap-2 text-lg font-medium text-[#1A202C] bg-[#F0F4F8] p-3 rounded-lg">
                <User className="w-5 h-5 text-[#A0B0C0]" />
                {profile.name}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#4A5568] mb-1">Email Address</label>
              <div className="flex items-center gap-2 text-lg font-medium text-[#1A202C] bg-[#F0F4F8] p-3 rounded-lg">
                <Mail className="w-5 h-5 text-[#A0B0C0]" />
                {profile.email}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#4A5568] mb-1">Role</label>
              <div className="flex items-center gap-2 text-lg font-medium text-[#1A202C] bg-[#F0F4F8] p-3 rounded-lg">
                <Shield className="w-5 h-5 text-[#A0B0C0]" />
                {profile.role}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#4A5568] mb-1">Access Level</label>
              <div className="flex items-center gap-2 text-lg font-medium text-[#1A202C] bg-[#F0F4F8] p-3 rounded-lg">
                <Shield className="w-5 h-5 text-[#A0B0C0]" />
                Administrator
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Settings