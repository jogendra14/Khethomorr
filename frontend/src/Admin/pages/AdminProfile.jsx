// frontend/src/Admin/pages/AdminProfile.jsx
import { useState, useRef } from "react";
import { 
  User, Mail, Phone, Lock, Camera, Save, Loader2,
  AlertTriangle, RefreshCw, Eye, EyeOff, Shield,
  MapPin, Calendar, BadgeCheck
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api";
import toast from "react-hot-toast";

// ============================================
// SKELETON
// ============================================
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const PageSkeleton = () => (
  <div className="p-6 max-w-4xl mx-auto space-y-6">
    <Skeleton className="h-8 w-48 mb-2" />
    <Skeleton className="h-4 w-64 mb-8" />
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Skeleton className="w-32 h-32 rounded-full" />
        <div className="flex-1 grid md:grid-cols-2 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminProfile() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Form States
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // ============================================
  // QUERY: Fetch Profile
  // ============================================
  const {
    data: profileData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: () => userApi.getProfile().then(res => res.data.data || res.data),
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      if (data) {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        setPreviewUrl(data.avatar || null);
      }
    },
    onError: () => toast.error("Failed to load profile"),
  });

  const userData = profileData?.data || profileData;

  // ============================================
  // MUTATIONS
  // ============================================

  // Update Profile
  const updateProfileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-profile"]);
      queryClient.invalidateQueries(["auth", "me"]);
      setSelectedFile(null);
      toast.success("Profile updated! ✅");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update"),
  });

  // Upload Avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: (formData) => userApi.uploadAvatar(formData),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["admin-profile"]);
      queryClient.invalidateQueries(["auth", "me"]);
      setSelectedFile(null);
      toast.success("Avatar updated! 📸");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to upload"),
  });

  // Change Password
  const changePasswordMutation = useMutation({
    mutationFn: (data) => userApi.changePassword(data),
    onSuccess: () => {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed! 🔒");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to change password"),
  });

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, GIF, WebP allowed");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    // Auto-upload avatar
    const formData = new FormData();
    formData.append("avatar", file);
    uploadAvatarMutation.mutate(formData);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Save Profile
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateProfileMutation.mutate({
      name: profile.name.trim(),
      phone: profile.phone?.trim(),
    });
  };

  // Change Password
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) { toast.error("Current password required"); return; }
    if (passwordForm.newPassword.length < 6) { toast.error("Min 6 characters"); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (passwordForm.currentPassword === passwordForm.newPassword) { toast.error("Must be different from current"); return; }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  // ============================================
  // LOADING
  // ============================================
  if (isLoading) return <PageSkeleton />;

  // ============================================
  // ERROR
  // ============================================
  if (isError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle className="mx-auto text-red-400 mb-3" size={48} />
          <h2 className="text-xl font-bold text-red-800 mb-2">Failed to Load</h2>
          <p className="text-red-600 mb-4">{error?.message}</p>
          <button onClick={() => refetch()} className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm">
            <RefreshCw className="inline mr-2" size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const isSaving = updateProfileMutation.isPending;
  const isUploading = uploadAvatarMutation.isPending;
  const isChangingPassword = changePasswordMutation.isPending;

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your admin account settings</p>
      </div>

      <div className="space-y-6">
        {/* ========== PROFILE CARD ========== */}
        <form onSubmit={handleProfileSubmit}>
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              {/* Avatar */}
              <div className="relative group">
                <img
                  src={previewUrl || userData?.avatar || "https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff&size=150"}
                  alt="Avatar"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-2.5 hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                  title="Change avatar"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-900">{profile.name || "Admin"}</h2>
                <p className="text-gray-500 capitalize flex items-center justify-center md:justify-start gap-1 mt-1">
                  <BadgeCheck size={16} className="text-blue-600" />
                  {userData?.role || "Administrator"}
                </p>
                {userData?.createdAt && (
                  <p className="text-sm text-gray-400 flex items-center justify-center md:justify-start gap-1 mt-1">
                    <Calendar size={14} />
                    Joined {new Date(userData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" name="name" value={profile.name} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    placeholder="Your name" required disabled={isSaving} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="email" name="email" value={profile.email}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    disabled readOnly />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" name="phone" value={profile.phone} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    placeholder="+91 9876543210" disabled={isSaving} />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button type="submit" disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition">
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

        {/* ========== CHANGE PASSWORD ========== */}
        <form onSubmit={handlePasswordSubmit}>
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-green-100 rounded-lg">
                <Lock className="text-green-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    placeholder="••••••••" required disabled={isChangingPassword}
                  />
                  <button type="button" onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    placeholder="Min 6 characters" required minLength={6} disabled={isChangingPassword}
                  />
                  <button type="button" onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    placeholder="Re-enter password" required disabled={isChangingPassword}
                  />
                  <button type="button" onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Tips */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 flex items-center gap-2 mb-2">
                <Shield size={16} /> Password Tips:
              </p>
              <ul className="text-xs text-blue-700 space-y-1 ml-6 list-disc">
                <li>At least 6 characters long</li>
                <li>Different from current password</li>
                <li>Mix letters, numbers & symbols for strength</li>
              </ul>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <button type="submit" disabled={isChangingPassword}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition">
                {isChangingPassword ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
                {isChangingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}