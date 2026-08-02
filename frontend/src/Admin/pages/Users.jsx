// Users.jsx
import { useMemo, useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import axios from "axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get token from localStorage (or wherever you store it)
  const getAuthToken = () => {
    return localStorage.getItem("token"); // Adjust based on your storage method
  };

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Transform backend data to match your frontend structure
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
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
      // Keep dummy data as fallback
      setUsers(dummyUsers);
    } finally {
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

  const toggleStatus = async (id) => {
    try {
      // Optimistic update
      const updatedUsers = users.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Blocked" : "Active",
            }
          : user
      );
      setUsers(updatedUsers);

      // API call to update status
      const token = getAuthToken();
      const userToUpdate = users.find((u) => u.id === id);
      const newStatus = userToUpdate.status === "Active" ? "Blocked" : "Active";

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      // Revert optimistic update on error
      fetchUsers();
      setError(err.response?.data?.message || "Failed to update user status");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      // Optimistic delete
      setUsers(users.filter((u) => u.id !== id));

      const token = getAuthToken();
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Error deleting user:", err);
      // Revert optimistic delete on error
      fetchUsers();
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  // Dummy data as fallback
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
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={
                            user.status === "Active"
                              ? "text-orange-600"
                              : "text-green-600"
                          }
                        >
                          {user.status === "Active" ? (
                            <UserX size={18} />
                          ) : (
                            <UserCheck size={18} />
                          )}
                        </button>

                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
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
    </div>
  );
}