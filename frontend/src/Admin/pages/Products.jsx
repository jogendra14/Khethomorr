import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom"; // useSearchParams import करें
import { useEffect, useState } from "react";
import { deleteProduct, getProduct } from "../../api/productApi";
import DuplicateBtn from "../components/product/DuplicateBtn";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // URL params के लिए
  
  // URL से params लें
  const categoryName = searchParams.get('category');
  const subCategoryName = searchParams.get('subCategory');
  const brandName = searchParams.get('brand');

  const fetchProducts = async () => {
    try {
      const data = await getProduct();
      setProducts(data);
      setFilteredProducts(data); // Initially all products
    } catch (error) {
      console.log(error);
    }
  };

  // Products filter करें
  const filterProducts = (productsList, search = searchTerm) => {
    let filtered = [...productsList];
    
    // Category filter
    if (categoryName) {
      filtered = filtered.filter(product => product.category === categoryName);
    }
    
    // SubCategory filter
    if (subCategoryName) {
      filtered = filtered.filter(product => product.subCategory === subCategoryName);
    }
    
    // Brand filter
    if (brandName) {
      filtered = filtered.filter(product => product.brand === brandName);
    }
    
    // Search filter
    if (search) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.category?.toLowerCase().includes(search.toLowerCase()) ||
        product.brand?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // जब products या filters change हों तो filter apply करें
  useEffect(() => {
    filterProducts(products);
  }, [products, categoryName, subCategoryName, brandName]);

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

  // Search handler
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterProducts(products, value);
  };

  // Page title based on filters
  const getPageTitle = () => {
    if (brandName) {
      return `Products: ${brandName}`;
    } else if (subCategoryName) {
      return `Products: ${subCategoryName}`;
    } else if (categoryName) {
      return `Products: ${categoryName}`;
    }
    return 'Products';
  };

  const getPageDescription = () => {
    let desc = 'Manage all your products';
    if (categoryName) {
      desc += ` in ${categoryName}`;
      if (subCategoryName) {
        desc += ` › ${subCategoryName}`;
        if (brandName) {
          desc += ` › ${brandName}`;
        }
      }
    }
    return desc;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          <p className="text-gray-500">{getPageDescription()}</p>
          {filteredProducts.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredProducts.length} products
            </p>
          )}
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
        <input 
          type="text" 
          placeholder="Search product..." 
          className="w-full border rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={handleSearch}
        />
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
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  {searchTerm ? 
                    `No products found matching "${searchTerm}"` : 
                    'No products available'
                  }
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <img 
                      src={product.images?.[0]} 
                      alt={product.name} 
                      className="w-16 h-16 rounded-lg object-cover" 
                    />
                  </td>

                  <td className="p-4 font-medium">{product.name}</td>

                  <td className="p-4">
                    {product.category}
                    {product.subCategory && (
                      <span className="block text-xs text-gray-500">/{product.subCategory}</span>
                    )}
                  </td>

                  <td className="p-4">₹{product.sellingPrice}</td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      product.stock > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {product.stock}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => navigate(`/admin/edit-product/${product._id}`)} 
                        className="bg-yellow-400 hover:bg-yellow-500 p-2 rounded-lg"
                      >
                        <Pencil size={18} />
                      </button>

                      <DuplicateBtn
                        id={product._id}
                        onDuplicateSuccess={fetchProducts}
                      />

                      <button 
                        onClick={() => handleDelete(product._id)} 
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
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
      </div>
    </div>
  );
}