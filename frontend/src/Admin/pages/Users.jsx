import { useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUser, updateUserStatus, deleteUser, addUser } from "../../api/userApi.js";
import toast from "react-hot-toast";

export default function Users() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  // ✅ React Query - Fetch Users
  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to fetch users");
    },
  });

  // ✅ React Query - Update User
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowEditModal(false);
      setEditingUser(null);
      toast.success("User updated successfully! ✅");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user ❌");
    },
  });

  // ✅ React Query - Update User Status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User status updated! ✅");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status ❌");
      refetch();
    },
  });

  // ✅ React Query - Delete User
  const deleteUserMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User deleted successfully! 🗑️");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user ❌");
      refetch();
    },
  });

  // ✅ Filter users by search
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const searchLower = search.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
    );
  }, [search, users]);

  // ✅ Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  // ✅ Handle save edit
  const handleSaveEdit = (updatedUserData) => {
    updateUserMutation.mutate({
      id: updatedUserData.id,
      data: updatedUserData,
    });
  };

  // ✅ Handle toggle status
  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Blocked" : "Active";
    if (!window.confirm(`Are you sure you want to ${newStatus === "Active" ? "unblock" : "block"} this user?`)) {
      return;
    }
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  // ✅ Handle delete user
  const handleDeleteUser = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    deleteUserMutation.mutate(id);
  };

  const { isPending: isUpdating } = updateUserMutation;
  const { isPending: isDeleting } = deleteUserMutation;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500">Manage all registered users</p>
          {users.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              Total: {users.length} users
            </p>
          )}
        </div>

        <button 
          onClick={() => navigate("add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2 transition"
        >
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
            className="w-full border rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          ⚠️ {error?.message || "Failed to load users"}
          <button
            onClick={() => refetch()}
            className="ml-4 text-red-700 font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow mt-6 overflow-x-auto">
        {isLoading ? (
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
                    {search ? "No users found matching your search" : "No users found"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id || user._id} className="border-t hover:bg-gray-50">
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
                        {user.role || "User"}
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
                        {user.status || "Active"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit user"
                          disabled={isDeleting}
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(user.id || user._id, user.status)}
                          className={
                            user.status === "Active"
                              ? "text-orange-600 hover:text-orange-800 transition-colors"
                              : "text-green-600 hover:text-green-800 transition-colors"
                          }
                          title={user.status === "Active" ? "Block user" : "Unblock user"}
                          disabled={isDeleting || updateStatusMutation.isPending}
                        >
                          {updateStatusMutation.isPending ? (
                            <span className="animate-spin">⏳</span>
                          ) : user.status === "Active" ? (
                            <UserX size={18} />
                          ) : (
                            <UserCheck size={18} />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.id || user._id, user.name)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete user"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <Trash2 size={18} />
                          )}
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
            if (!isUpdating) {
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
                if (!isUpdating) {
                  setShowEditModal(false);
                  setEditingUser(null);
                }
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isUpdating}
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
                  id: editingUser.id || editingUser._id,
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
                    disabled={isUpdating}
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
                    disabled={isUpdating}
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
                    disabled={isUpdating}
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
                    disabled={isUpdating}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
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
                    disabled={isUpdating}
                  >
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`flex-1 text-white font-medium py-2.5 rounded-lg transition-colors ${
                    isUpdating 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isUpdating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isUpdating) {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }
                  }}
                  disabled={isUpdating}
                  className={`flex-1 font-medium py-2.5 rounded-lg transition-colors ${
                    isUpdating 
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