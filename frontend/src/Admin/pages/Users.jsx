// frontend/src/Admin/pages/Users.jsx
import { useMemo, useState } from "react";
import { 
  Search, Plus, Edit, Trash2, UserCheck, UserX, Users as UsersIcon,
  Shield, User, RefreshCw, ChevronLeft, ChevronRight, X,
  Mail, Phone, Calendar, Loader2, AlertTriangle, Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userApi } from "../../api";

// ============================================
// CONSTANTS
// ============================================
const ROLES = ["user", "vendor", "admin", "superadmin"];
const ROLE_COLORS = {
  superadmin: "bg-red-100 text-red-700 border-red-300",
  admin: "bg-purple-100 text-purple-700 border-purple-300",
  vendor: "bg-blue-100 text-blue-700 border-blue-300",
  user: "bg-gray-100 text-gray-700 border-gray-300",
};

// ============================================
// SKELETON
// ============================================
const TableSkeleton = () => (
  <div className="p-4 space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-48" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-8 h-8 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function Users() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editModal, setEditModal] = useState({ show: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: "" });

  // ============================================
  // QUERY: Fetch Users
  // ============================================
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-users", page, limit, search, roleFilter, statusFilter],
    queryFn: () =>
      userApi.getUsers({
        page,
        limit,
        ...(search && { search }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { isActive: statusFilter === "active" ? "true" : "false" }),
      }).then(res => res.data),
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });

  const users = usersData?.data || [];
  const total = usersData?.total || 0;
  const totalPages = usersData?.pagination?.totalPages || 1;

  // ============================================
  // MUTATIONS
  // ============================================
  
  // Update User
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      setEditModal({ show: false, user: null });
      toast.success("User updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  // Toggle Status
  const toggleStatusMutation = useMutation({
    mutationFn: (id) => userApi.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("User status updated!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
      refetch();
    },
  });

  // Update Role
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => userApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("User role updated!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update role");
    },
  });

  // Delete User
  const deleteMutation = useMutation({
    mutationFn: (id) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      setDeleteModal({ show: false, id: null, name: "" });
      toast.success("User deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });

  // ============================================
  // HANDLERS
  // ============================================
  const handleEdit = (user) => {
    setEditModal({
      show: true,
      user: { ...user },
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
    };
    updateMutation.mutate({ id: editModal.user._id, data });
  };

  const handleToggleStatus = (user) => {
    const action = user.isActive ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} "${user.name}"?`)) return;
    toggleStatusMutation.mutate(user._id);
  };

  const handleRoleChange = (userId, newRole) => {
    if (!window.confirm(`Change role to "${newRole}"?`)) return;
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const handleDelete = (user) => {
    setDeleteModal({ show: true, id: user._id, name: user.name });
  };

  const confirmDelete = () => {
    if (deleteModal.id) deleteMutation.mutate(deleteModal.id);
  };

  // ============================================
  // COMPUTED
  // ============================================
  const stats = {
    total: total,
    active: users.filter(u => u.isActive).length,
    admin: users.filter(u => u.role === "admin" || u.role === "superadmin").length,
    vendor: users.filter(u => u.role === "vendor").length,
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} users total · Manage all registered users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, icon: UsersIcon, color: "blue" },
          { label: "Active", value: stats.active, icon: UserCheck, color: "green" },
          { label: "Admins", value: stats.admin, icon: Shield, color: "purple" },
          { label: "Vendors", value: stats.vendor, icon: User, color: "orange" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${color}-100 rounded-lg`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
          <AlertTriangle className="mx-auto text-red-400 mb-3" size={40} />
          <h3 className="font-semibold text-red-800 mb-2">Failed to Load Users</h3>
          <p className="text-red-600 text-sm mb-4">{error?.message}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
            Try Again
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Contact</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Joined</th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <UsersIcon className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500 font-medium">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition">
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 hidden md:table-cell">
                        <div className="text-sm space-y-0.5">
                          {user.phone && (
                            <p className="flex items-center gap-1 text-gray-600">
                              <Phone size={12} /> {user.phone}
                            </p>
                          )}
                          <p className="flex items-center gap-1 text-gray-500">
                            <Mail size={12} /> {user.email}
                          </p>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-full border outline-none cursor-pointer ${ROLE_COLORS[user.role] || ROLE_COLORS.user}`}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${
                            user.isActive
                              ? "bg-green-100 text-green-700 border-green-300 hover:bg-red-50"
                              : "bg-red-100 text-red-700 border-red-300 hover:bg-green-50"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Joined */}
                      <td className="p-4 hidden lg:table-cell">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(user)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                            <Edit size={17} />
                          </button>
                          <button onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-lg transition ${
                              user.isActive
                                ? "text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                                : "text-green-500 hover:text-green-700 hover:bg-green-50"
                            }`}
                            title={user.isActive ? "Deactivate" : "Activate"}>
                            {user.isActive ? <UserX size={17} /> : <UserCheck size={17} />}
                          </button>
                          <button onClick={() => handleDelete(user)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} · {total} users
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let num;
                if (totalPages <= 5) num = i + 1;
                else if (page <= 3) num = i + 1;
                else if (page >= totalPages - 2) num = totalPages - 4 + i;
                else num = page - 2 + i;
                return (
                  <button key={num} onClick={() => setPage(num)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                      page === num ? "bg-blue-600 text-white" : "hover:bg-gray-200"
                    }`}>{num}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========== EDIT MODAL ========== */}
      {editModal.show && editModal.user && (
        <Modal onClose={() => !updateMutation.isPending && setEditModal({ show: false, user: null })}>
          <h2 className="text-xl font-bold mb-6">Edit User</h2>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" name="name" defaultValue={editModal.user.name}
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required
                disabled={updateMutation.isPending} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" name="email" defaultValue={editModal.user.email}
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required
                disabled={updateMutation.isPending} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" name="phone" defaultValue={editModal.user.phone || ""}
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={updateMutation.isPending} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select name="role" defaultValue={editModal.user.role}
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={updateMutation.isPending}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={updateMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2">
                {updateMutation.isPending ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditModal({ show: false, user: null })}
                disabled={updateMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium disabled:opacity-50">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========== DELETE MODAL ========== */}
      {deleteModal.show && (
        <Modal onClose={() => setDeleteModal({ show: false, id: null, name: "" })}>
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-600" size={28} />
            </div>
            <h3 className="text-lg font-bold mb-2">Delete User?</h3>
            <p className="text-gray-500 text-sm mb-1">Are you sure you want to delete:</p>
            <p className="font-semibold text-gray-800 mb-4">"{deleteModal.name}"</p>
            <p className="text-xs text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteModal({ show: false, id: null, name: "" })}
                className="px-5 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
              <button onClick={confirmDelete} disabled={deleteMutation.isPending}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                {deleteMutation.isPending ? <><Loader2 className="animate-spin" size={16} /> Deleting...</> : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================
// MODAL COMPONENT
// ============================================
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="fixed inset-0 bg-black/50" />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);