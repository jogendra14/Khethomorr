import { useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

const dummyBanners = [
  {
    id: 1,
    image: "https://via.placeholder.com/120x70",
    title: "Summer Sale",
    button: "Shop Now",
    link: "/shop",
    status: "Active",
  },
  {
    id: 2,
    image: "https://via.placeholder.com/120x70",
    title: "New Collection",
    button: "Explore",
    link: "/deals",
    status: "Inactive",
  },
];

export default function Banner() {
  const [banners, setBanners] = useState(dummyBanners);
  const [search, setSearch] = useState("");

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) => banner.title.toLowerCase().includes(search.toLowerCase()));
  }, [banners, search]);

  const deleteBanner = (id) => {
    if (window.confirm("Delete this banner?")) {
      setBanners((prev) => prev.filter((banner) => banner.id !== id));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Banner</h1>
          <p className="text-gray-500">Manage website banners</p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2">
          <Plus size={18} />
          Add Banner
        </button>
      </div>

      {/* Search */}

      <div className="bg-white rounded-xl shadow mt-6 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search banner..."
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
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Button</th>
              <th className="text-left p-4">Link</th>
              <th className="text-left p-4">Status</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBanners.map((banner) => (
              <tr key={banner.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <img src={banner.image} alt={banner.title} className="w-28 h-16 rounded-lg object-cover" />
                </td>

                <td className="p-4 font-semibold">{banner.title}</td>

                <td className="p-4">{banner.button}</td>

                <td className="p-4 text-blue-600">{banner.link}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      banner.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {banner.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>

                    <button onClick={() => deleteBanner(banner.id)} className="text-red-600 hover:text-red-800">
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
