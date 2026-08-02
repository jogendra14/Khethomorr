// Users.jsx
import { useMemo, useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import axios from "axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false); // Add loading state for save

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const transformedUsers = response.data.map((user) => ({
        id: user._id || user.id,
        name: user.name || "Unknown",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "User",
        status: user.status || "Active",
        verified: user.verified || false,
      }));

      setUsers(transformedUsers);
      setError("");
    } 
    catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
      setUsers(dummyUsers);
    } 
    finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  // ✅ Updated handleSaveEdit with better error handling and loading state
  const handleSaveEdit = async (updatedUserData) => {
    try {
      setSaving(true);
      setError("");
      
      const token = getAuthToken();
      
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      // Prepare data for backend - match your backend schema
      const userData = {
        name: updatedUserData.name,
        email: updatedUserData.email,
        phone: updatedUserData.phone || "",
        role: updatedUserData.role.toLowerCase(), // role lowercase
        status: updatedUserData.status,
      };

      console.log("Saving user data:", userData); // Debug log

      // Make API call to update user
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/users/${updatedUserData.id}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Update response:", response.data); // Debug log

      // Update local state with the response data
      const updatedUser = response.data.user || response.data;
      const updatedUsers = users.map((user) =>
        user.id === updatedUserData.id
          ? {
              ...user,
              name: updatedUser.name || updatedUserData.name,
              email: updatedUser.email || updatedUserData.email,
              phone: updatedUser.phone || updatedUserData.phone,
              role: updatedUser.role || updatedUserData.role,
              status: updatedUser.status || updatedUserData.status,
            }
          : user
      );
      
      setUsers(updatedUsers);
      setShowEditModal(false);
      setEditingUser(null);
      
      // Show success message (optional)
      alert("User updated successfully!");
      
    } catch (err) {
      console.error("Error updating user:", err);
      
      // Show detailed error message
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to update user. Please try again.";
      
      setError(errorMessage);
      
      // Revert optimistic update on error
      await fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const updatedUsers = users.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Blocked" : "Active",
            }
          : user
      );
      setUsers(updatedUsers);

      const token = getAuthToken();
      const userToUpdate = users.find((u) => u.id === id);
      const newStatus = userToUpdate.status === "Active" ? "Blocked" : "Active";

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/admin/users/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      fetchUsers();
      setError(err.response?.data?.message || "Failed to update user status");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      setUsers(users.filter((u) => u.id !== id));

      const token = getAuthToken();
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } 
    catch (err) {
      console.error("Error deleting user:", err);
      fetchUsers();
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const dummyUsers = [
    {
      id: "1",
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "9876543210",
      role: "User",
      status: "Active",
    },
    {
      id: "2",
      name: "Aman Singh",
      email: "aman@gmail.com",
      phone: "9123456780",
      role: "Admin",
      status: "Active",
    },
    {
      id: "3",
      name: "Priya Verma",
      email: "priya@gmail.com",
      phone: "9988776655",
      role: "User",
      status: "Blocked",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500">Manage all registered users</p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2">
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow mt-6 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-4 py-3 outline-none"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow mt-6 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.phone || "N/A"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "Admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit user"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={
                            user.status === "Active"
                              ? "text-orange-600 hover:text-orange-800 transition-colors"
                              : "text-green-600 hover:text-green-800 transition-colors"
                          }
                          title={user.status === "Active" ? "Block user" : "Unblock user"}
                        >
                          {user.status === "Active" ? (
                            <UserX size={18} />
                          ) : (
                            <UserCheck size={18} />
                          )}
                        </button>

                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => {
            if (!saving) {
              setShowEditModal(false);
              setEditingUser(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                if (!saving) {
                  setShowEditModal(false);
                  setEditingUser(null);
                }
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={saving}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit User</h2>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedUser = {
                  id: editingUser.id,
                  name: formData.get('name'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  role: formData.get('role'),
                  status: formData.get('status'),
                };
                handleSaveEdit(updatedUser);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingUser.name}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser.email}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingUser.phone || ''}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    defaultValue={editingUser.role}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    disabled={saving}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingUser.status}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    disabled={saving}
                  >
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 text-white font-medium py-2.5 rounded-lg transition-colors ${
                    saving 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!saving) {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }
                  }}
                  disabled={saving}
                  className={`flex-1 font-medium py-2.5 rounded-lg transition-colors ${
                    saving 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}