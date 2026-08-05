import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings, changeAdminPassword } from "../../api/settingsApi.js";
import toast from "react-hot-toast";

export default function Settings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    adminName: "",
    email: "",
    websiteName: "",
    websiteUrl: "",
    phone: "",
    address: "",
    facebook: "",
    instagram: "",
    twitter: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ React Query - Fetch Settings
  const {
    data: fetchedSettings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    onError: (error) => {
      toast.error(error.message || "Failed to load settings");
    },
  });

  // ✅ Set settings when fetched
  useEffect(() => {
    if (fetchedSettings) {
      setSettings({
        adminName: fetchedSettings.adminName || "Admin",
        email: fetchedSettings.email || "admin@shopnest.com",
        websiteName: fetchedSettings.websiteName || "ShopNest",
        websiteUrl: fetchedSettings.websiteUrl || "https://shopnest.com",
        phone: fetchedSettings.phone || "+91 9876543210",
        address: fetchedSettings.address || "New Delhi, India",
        facebook: fetchedSettings.facebook || "",
        instagram: fetchedSettings.instagram || "",
        twitter: fetchedSettings.twitter || "",
      });
    }
  }, [fetchedSettings]);

  // ✅ React Query - Update Settings
  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success("Settings saved successfully! ✅");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save settings ❌");
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
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settings);
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

  const { isPending: isSaving } = updateSettingsMutation;
  const { isPending: isChangingPassword } = changePasswordMutation;

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-5"></div>
              <div className="grid md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j}>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg mb-2">⚠️ Failed to load settings</p>
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage website and admin settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Admin Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">Admin Information</h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 font-medium">Admin Name</label>
              <input
                type="text"
                name="adminName"
                value={settings.adminName}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Website */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">Website Settings</h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 font-medium">Website Name</label>
              <input
                type="text"
                name="websiteName"
                value={settings.websiteName}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Website URL</label>
              <input
                type="text"
                name="websiteUrl"
                value={settings.websiteUrl}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Contact Number</label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">Social Media</h2>

          <div className="grid md:grid-cols-3 gap-5">
            <input
              type="text"
              name="facebook"
              placeholder="Facebook URL"
              value={settings.facebook}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />

            <input
              type="text"
              name="instagram"
              placeholder="Instagram URL"
              value={settings.instagram}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />

            <input
              type="text"
              name="twitter"
              placeholder="Twitter URL"
              value={settings.twitter}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Save Button */}
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
              <label className="block mb-2 font-medium">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isChangingPassword}
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isChangingPassword}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isChangingPassword}
                required
              />
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
                  <Save size={18} />
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