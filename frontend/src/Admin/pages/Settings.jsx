import { Save } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    adminName: "Admin",
    email: "admin@shopnest.com",
    websiteName: "ShopNest",
    websiteUrl: "https://shopnest.com",
    phone: "+91 9876543210",
    address: "New Delhi, India",
    facebook: "",
    instagram: "",
    twitter: "",
  });

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Settings Saved Successfully");
  };

  return (
    <div className="p-6">

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">
          Manage website and admin settings
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* Admin Info */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-5">
            Admin Information
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block mb-2 font-medium">
                Admin Name
              </label>

              <input
                type="text"
                name="adminName"
                value={settings.adminName}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none"
              />
            </div>

          </div>

        </div>

        {/* Website */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-5">
            Website Settings
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block mb-2 font-medium">
                Website Name
              </label>

              <input
                type="text"
                name="websiteName"
                value={settings.websiteName}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Website URL
              </label>

              <input
                type="text"
                name="websiteUrl"
                value={settings.websiteUrl}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Contact Number
              </label>

              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none"
              />
            </div>

          </div>

        </div>

        {/* Social Links */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-5">
            Social Media
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <input
              type="text"
              name="facebook"
              placeholder="Facebook URL"
              value={settings.facebook}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 outline-none"
            />

            <input
              type="text"
              name="instagram"
              placeholder="Instagram URL"
              value={settings.instagram}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 outline-none"
            />

            <input
              type="text"
              name="twitter"
              placeholder="Twitter URL"
              value={settings.twitter}
              onChange={handleChange}
              className="border rounded-lg px-4 py-3 outline-none"
            />

          </div>

        </div>

        {/* Security */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-5">
            Change Password
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <input
              type="password"
              placeholder="Current Password"
              className="border rounded-lg px-4 py-3 outline-none"
            />

            <input
              type="password"
              placeholder="New Password"
              className="border rounded-lg px-4 py-3 outline-none"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="border rounded-lg px-4 py-3 outline-none"
            />

          </div>

        </div>

        {/* Save */}

        <div className="flex justify-end">

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>

        </div>

      </form>

    </div>
  );
}