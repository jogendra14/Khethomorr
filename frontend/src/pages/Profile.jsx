// frontend/src/pages/Profile.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentUserProfile, changeUserPassword } from "../api/userApi";
import Navbar from "../components/home/navbar/Navbar";
import Footer from "../components/home/footer/Footer";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, Save } from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // ✅ Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateCurrentUserProfile,
    onSuccess: (data) => {
      updateUser(data.user || data);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated successfully! ✅");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update profile ❌");
    },
  });

  // ✅ Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: changeUserPassword,
    onSuccess: () => {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully! 🔒");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to change password ❌");
    },
  });

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    if (!profile.name || !profile.email) {
      toast.error("Name and email are required");
      return;
    }

    updateProfileMutation.mutate(profile);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const { isPending: isUpdatingProfile } = updateProfileMutation;
  const { isPending: isChangingPassword } = changePasswordMutation;

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Please login to view profile</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-500 mb-8">Manage your account details</p>

        {/* Profile Form */}
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isUpdatingProfile}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isUpdatingProfile}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isUpdatingProfile}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isUpdatingProfile ? (
              <>
                <span className="animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Change Password</h2>
          
          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isChangingPassword}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isChangingPassword}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isChangingPassword}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isChangingPassword ? (
              <>
                <span className="animate-spin">⏳</span>
                Changing...
              </>
            ) : (
              <>
                <Lock size={18} />
                Change Password
              </>
            )}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}