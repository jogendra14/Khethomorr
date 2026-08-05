// frontend/src/Admin/components/users/AddUser.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { addUser } from "../../../api/userApi";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    status: "Active",
  });

  const addUserMutation = useMutation({
    mutationFn: (data) => addUser(data),
    onSuccess: () => {
      toast.success("User added successfully! ✅");
      navigate("/admin/users");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to add user ❌");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = ["name", "email", "password"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`❌ ${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return;
      }
    }

    addUserMutation.mutate(formData);
  };

  const isPending = addUserMutation.isPending;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin/users")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Add User</h1>
          <p className="text-gray-500 mt-1">Create a new user account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">
        <div>
          <label className="block font-medium mb-2">Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isPending}
            minLength={6}
          />
          <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
        </div>

        <div>
          <label className="block font-medium mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          >
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={`px-8 py-3 text-white rounded-lg transition ${
              isPending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPending ? "Adding..." : "Add User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;