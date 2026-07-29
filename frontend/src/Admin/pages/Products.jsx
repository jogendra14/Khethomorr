import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { deleteProduct } from "../../api/productApi";


export default function Products() {
  const [products, setProducts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setProducts(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const fetchProducts = () => {
    fetch(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) return;

    try {
      await deleteProduct(id);

      alert("Product Deleted Successfully");

      fetchProducts();
    } catch (error) {
      console.log(error);

      alert("Delete Failed");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500">Manage all your products</p>
        </div>

        <button
          onClick={() => navigate("/admin/add-product")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Search */}

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />

        <input type="text" placeholder="Search product..." className="w-full border rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Image</th>

              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">Category</th>

              <th className="p-4 text-left">Price</th>

              <th className="p-4 text-left">Stock</th>

              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <img src={product.images?.[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                </td>

                <td className="p-4 font-medium">{product.name}</td>

                <td className="p-4">{product.category}</td>

                <td className="p-4">₹{product.price}</td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${product.stock > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {product.stock}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => navigate(`/admin/edit-product/${product._id}`)} className="bg-yellow-400 hover:bg-yellow-500 p-2 rounded-lg">
                      <Pencil size={18} />
                    </button>

                    <button onClick={() => handleDelete(product._id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg">
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
