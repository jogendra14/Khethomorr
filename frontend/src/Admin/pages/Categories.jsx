import { useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

const dummyCategories = [
  {
    id: 1,
    image: "https://via.placeholder.com/60",
    name: "Sofas",
    products: 12,
    status: "Active",
  },
  {
    id: 2,
    image: "https://via.placeholder.com/60",
    name: "Beds",
    products: 8,
    status: "Active",
  },
  {
    id: 3,
    image: "https://via.placeholder.com/60",
    name: "Tables",
    products: 5,
    status: "Inactive",
  },
];

export default function Categories() {
  const [categories, setCategories] = useState(dummyCategories);
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    return categories.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search]);

  const deleteCategory = (id) => {
    if (window.confirm("Delete this category?")) {
      setCategories(categories.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-500">Manage all product categories</p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2">
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Search */}

      <div className="bg-white rounded-xl shadow mt-6 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search category..."
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
              <th className="text-left p-4">Image</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Products</th>
              <th className="text-left p-4">Status</th>
              <th className="text-center p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <img src={category.image} alt={category.name} className="w-14 h-14 rounded-lg object-cover" />
                </td>

                <td className="p-4 font-medium">{category.name}</td>

                <td className="p-4">{category.products}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      category.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {category.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>

                    <button onClick={() => deleteCategory(category.id)} className="text-red-600 hover:text-red-800">
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
