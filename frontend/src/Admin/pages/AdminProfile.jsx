import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Camera, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminProfile, updateAdminProfile, changeAdminPassword } from "../../api/adminApi";
import toast from "react-hot-toast";

export default function AdminProfile() {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // ✅ React Query - Fetch Admin Profile
  const {
    data: adminData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: getAdminProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    onError: (error) => {
      toast.error(error.message || "Failed to load profile");
    },
  });

  // ✅ Set profile data when fetched
  useEffect(() => {
    if (adminData) {
      setProfile({
        name: adminData.name || "",
        email: adminData.email || "",
        phone: adminData.phone || "",
        avatar: adminData.avatar || "https://i.pravatar.cc/150?img=12",
      });
    }
  }, [adminData]);

  // ✅ React Query - Update Profile
  const updateProfileMutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
      toast.success("Profile updated successfully! ✅");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile ❌");
    },
  });

  // ✅ React Query - Change Password
  const changePasswordMutation = useMutation({
    mutationFn: changeAdminPassword,
    onSuccess: () => {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully! 🔒");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password ❌");
    },
  });

  const handleChange = (e) => {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('email', profile.email);
    formData.append('phone', profile.phone);
    
    if (selectedFile) {
      formData.append('avatar', selectedFile);
    }
    
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Validate passwords
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

  const { isPending: isSaving } = updateProfileMutation;
  const { isPending: isChangingPassword } = changePasswordMutation;

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 grid md:grid-cols-2 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg mb-2">⚠️ Failed to load profile</p>
          <p className="text-red-500 text-sm mb-4">{error?.message || "Please try again"}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-gray-500 mb-8">Manage your admin account</p>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img 
                src={previewUrl || profile.avatar || "https://i.pravatar.cc/150?img=12"} 
                alt="Admin" 
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
              />
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition"
              >
                <Camera size={18} />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSaving}
              />
            </div>

            <div className="flex-1 grid md:grid-cols-2 gap-5">
              <div>
                <label className="font-medium mb-2 block">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    name="name" 
                    value={profile.name} 
                    onChange={handleChange} 
                    className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-medium mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    name="email" 
                    value={profile.email} 
                    onChange={handleChange} 
                    className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-medium mb-2 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    name="phone" 
                    value={profile.phone} 
                    onChange={handleChange} 
                    className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Profile Button */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
              isSaving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition`}
          >
            {isSaving ? (
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
        </div>
      </form>

      {/* Change Password - Separate Section */}
      <div className="mt-6 bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-5">Change Password</h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isChangingPassword}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
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
              <label className="block font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={isChangingPassword}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                isChangingPassword
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white transition`}
            >
              {isChangingPassword ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}