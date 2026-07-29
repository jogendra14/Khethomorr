import { useState } from "react";
import { User, Mail, Phone, Lock, Camera, Save } from "lucide-react";

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    name: "Admin",
    email: "admin@shopnest.com",
    phone: "+91 9876543210",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Profile Updated Successfully");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>

      <p className="text-gray-500 mb-8">Manage your admin account</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?img=12" alt="Admin" className="w-32 h-32 rounded-full object-cover border" />

              <button type="button" className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-2">
                <Camera size={18} />
              </button>
            </div>

            <div className="flex-1 grid md:grid-cols-2 gap-5">
              <div>
                <label className="font-medium mb-2 block">Name</label>

                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />

                  <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-4 py-3" />
                </div>
              </div>

              <div>
                <label className="font-medium mb-2 block">Email</label>

                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />

                  <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-4 py-3" />
                </div>
              </div>

              <div>
                <label className="font-medium mb-2 block">Phone</label>

                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />

                  <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="w-full border rounded-lg pl-10 pr-4 py-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">Change Password</h2>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />

              <input
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={profile.currentPassword}
                onChange={handleChange}
                className="w-full border rounded-lg pl-10 pr-4 py-3"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />

              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={profile.newPassword}
                onChange={handleChange}
                className="w-full border rounded-lg pl-10 pr-4 py-3"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={profile.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded-lg pl-10 pr-4 py-3"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2">
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
