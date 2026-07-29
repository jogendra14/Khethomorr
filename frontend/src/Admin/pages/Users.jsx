import { useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";

const dummyUsers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    role: "User",
    status: "Active",
  },
  {
    id: 2,
    name: "Aman Singh",
    email: "aman@gmail.com",
    phone: "9123456780",
    role: "Admin",
    status: "Active",
  },
  {
    id: 3,
    name: "Priya Verma",
    email: "priya@gmail.com",
    phone: "9988776655",
    role: "User",
    status: "Blocked",
  },
];

export default function Users() {
  const [users, setUsers] = useState(dummyUsers);
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()));
  }, [search, users]);

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ?
          {
            ...user,
            status: user.status === "Active" ? "Blocked" : "Active",
          }
        : user,
      ),
    );
  };

  const deleteUser = (id) => {
    if (window.confirm("Delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

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

      {/* Table */}

      <div className="bg-white rounded-xl shadow mt-6 overflow-x-auto">
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
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{user.name}</td>

                <td className="p-4">{user.email}</td>

                <td className="p-4">{user.phone}</td>

                <td className="p-4">{user.role}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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

                    <button onClick={() => toggleStatus(user.id)} className={user.status === "Active" ? "text-orange-600" : "text-green-600"}>
                      {user.status === "Active" ?
                        <UserX size={18} />
                      : <UserCheck size={18} />}
                    </button>

                    <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
