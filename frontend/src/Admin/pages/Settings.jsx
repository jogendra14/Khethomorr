// frontend/src/Admin/pages/Settings.jsx
import { useState } from "react";
import { 
  Save, Loader2, RefreshCw, AlertTriangle, 
  User, Globe, Phone, MapPin, Link2, MessageSquare,
  Clock, Lock, Eye, EyeOff, Shield
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
    <Skeleton className="h-8 w-48" />
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-6">
          <Skeleton className="h-6 w-32 mb-5" />
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((j) => (
              <div key={j}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================
// SECTION HEADER
// ============================================
const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="p-2 bg-blue-100 rounded-lg">
      <Icon className="text-blue-600" size={20} />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  </div>
);

// ============================================
// INPUT FIELD
// ============================================
const InputField = ({ label, name, value, onChange, type = "text", placeholder = "", disabled = false, required = false, icon: Icon }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={16} />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border border-gray-300 rounded-lg py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm ${
          Icon ? "pl-10 pr-4" : "px-4"
        } disabled:bg-gray-50 disabled:cursor-not-allowed`}
        disabled={disabled}
        required={required}
      />
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function Settings() {
  const queryClient = useQueryClient();

  // Form States
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // ============================================
  // QUERY: Fetch Current User Profile
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
        setProfileForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            country: data.address?.country || "India",
            zipCode: data.address?.zipCode || "",
          },
        });
      }
    },
    onError: () => {
      toast.error("Failed to load profile");
    },
  });

  // ============================================
  // MUTATIONS
  // ============================================

  // Update Profile
  const updateProfileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-profile"]);
      queryClient.invalidateQueries(["auth", "me"]);
      toast.success("Profile updated successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  // Update Address
  const updateAddressMutation = useMutation({
    mutationFn: (data) => userApi.updateAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-profile"]);
      toast.success("Address updated successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update address");
    },
  });

  // Change Password
  const changePasswordMutation = useMutation({
    mutationFn: (data) => userApi.changePassword(data),
    onSuccess: () => {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully! 🔒");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to change password");
    },
  });

  // ============================================
  // HANDLERS
  // ============================================
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Save Profile
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateProfileMutation.mutate({
      name: profileForm.name,
      phone: profileForm.phone,
    });
  };

  // Save Address
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    updateAddressMutation.mutate(profileForm.address);
  };

  // Change Password
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const isSaving = updateProfileMutation.isPending || updateAddressMutation.isPending;
  const isChangingPassword = changePasswordMutation.isPending;

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
          <h2 className="text-xl font-bold text-red-800 mb-2">Failed to Load Settings</h2>
          <p className="text-red-600 mb-4">{error?.message}</p>
          <button onClick={() => refetch()} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
            <RefreshCw className="inline mr-2" size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile, address, and security</p>
      </div>

      <div className="space-y-6">
        {/* ========== PROFILE ========== */}
        <form onSubmit={handleProfileSubmit}>
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
            <SectionHeader icon={User} title="Profile Information" description="Update your personal details" />
            <div className="grid md:grid-cols-2 gap-5">
              <InputField label="Full Name" name="name" value={profileForm.name} onChange={handleProfileChange} required icon={User} disabled={isSaving} placeholder="Your name" />
              <InputField label="Email Address" name="email" value={profileForm.email} onChange={handleProfileChange} disabled={true} icon={Globe} placeholder="your@email.com" />
              <InputField label="Phone Number" name="phone" value={profileForm.phone} onChange={handleProfileChange} icon={Phone} disabled={isSaving} placeholder="+91 9876543210" />
            </div>
            <div className="flex justify-end mt-6">
              <button type="submit" disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
                {updateProfileMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </form>

        {/* ========== ADDRESS ========== */}
        <form onSubmit={handleAddressSubmit}>
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
            <SectionHeader icon={MapPin} title="Address" description="Your business or shipping address" />
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <InputField label="Street Address" name="street" value={profileForm.address.street} onChange={handleAddressChange} icon={MapPin} disabled={isSaving} placeholder="123 Main Street" />
              </div>
              <InputField label="City" name="city" value={profileForm.address.city} onChange={handleAddressChange} disabled={isSaving} placeholder="New Delhi" />
              <InputField label="State" name="state" value={profileForm.address.state} onChange={handleAddressChange} disabled={isSaving} placeholder="Delhi" />
              <InputField label="Country" name="country" value={profileForm.address.country} onChange={handleAddressChange} disabled={isSaving} placeholder="India" />
              <InputField label="ZIP Code" name="zipCode" value={profileForm.address.zipCode} onChange={handleAddressChange} disabled={isSaving} placeholder="110001" />
            </div>
            <div className="flex justify-end mt-6">
              <button type="submit" disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
                {updateAddressMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {updateAddressMutation.isPending ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        </form>

        {/* ========== SOCIAL LINKS (Optional) ========== */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
          <SectionHeader icon={Link2} title="Social Links" description="Your social media profiles (coming soon)" />
          <div className="grid md:grid-cols-3 gap-4">
            <InputField label="Facebook" name="facebook" value="" onChange={() => {}} placeholder="https://facebook.com/..." disabled />
            <InputField label="Instagram" name="instagram" value="" onChange={() => {}} placeholder="https://instagram.com/..." disabled />
            <InputField label="Twitter" name="twitter" value="" onChange={() => {}} placeholder="https://twitter.com/..." disabled />
          </div>
        </div>

        {/* ========== CHANGE PASSWORD ========== */}
        <form onSubmit={handlePasswordSubmit}>
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
            <SectionHeader icon={Lock} title="Change Password" description="Update your account password for security" />
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
                    placeholder="Enter current password"
                    required
                    disabled={isChangingPassword}
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
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    disabled={isChangingPassword}
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
                    placeholder="Re-enter new password"
                    required
                    disabled={isChangingPassword}
                  />
                  <button type="button" onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Shield size={16} /> Password Requirements:
              </p>
              <ul className="text-xs text-blue-700 space-y-1 ml-6 list-disc">
                <li>At least 6 characters long</li>
                <li>Must be different from current password</li>
                <li>Use a mix of letters, numbers, and symbols for strength</li>
              </ul>
            </div>

            <div className="flex justify-end mt-6">
              <button type="submit" disabled={isChangingPassword}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
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