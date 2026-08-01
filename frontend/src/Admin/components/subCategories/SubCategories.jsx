// frontend/src/Admin/components/subCategories/SubCategories.jsx

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Loader2, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProduct } from "../../../api/productApi"; 

const SubCategories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryName = searchParams.get('category'); // URL से category लें
  
  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (categoryName) {
      fetchSubCategories();
    }
  }, [categoryName]);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productsData = await getProduct();
      
      // सिर्फ उस category के products filter करें
      const filteredProducts = productsData.filter(
        product => product.category === categoryName
      );
      
      setProducts(filteredProducts);
      
      // Sub-categories count करें
      const subCategoryCounts = filteredProducts.reduce((acc, product) => {
        if (product.subCategory) {
          acc[product.subCategory] = (acc[product.subCategory] || 0) + 1;
        }
        return acc;
      }, {});
      
      const uniqueSubCategories = Object.keys(subCategoryCounts).map(subCategoryName => ({
        id: subCategoryName.toLowerCase().replace(/\s/g, '-'),
        name: subCategoryName,
        productCount: subCategoryCounts[subCategoryName],
      }));

      setSubCategories(uniqueSubCategories);    
    } catch (err) {
      setError(err.message || 'Failed to fetch sub-categories');
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

   // Sub-Category पर click करने पर Brands page पर जाएं
  const handleSubCategoryClick = (subCategoryName) => {
    navigate(`/admin/brands?category=${encodeURIComponent(categoryName)}&subCategory=${encodeURIComponent(subCategoryName)}`);
  };

  const handleDeleteSubCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete sub-category "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      setSubCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      alert(`Failed to delete sub-category: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleBack = () => {
    navigate('/admin/categories');
  };

  const filteredSubCategories = subCategories.filter(subCategory =>
    subCategory.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Sub-Categories: {categoryName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all sub-categories under {categoryName}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Sub-Category
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search sub-category..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Sub-Categories List View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading sub-categories...</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-red-600 mb-3">Error loading sub-categories: {error}</p>
              <button 
                onClick={fetchSubCategories}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && subCategories.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 
              `No sub-categories found matching "${searchTerm}"` : 
              'No sub-categories available for this category'
            }
          </div>
        )}

        {!loading && !error && subCategories.length > 0 && (
          <>
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Image</div>
              <div className="col-span-3">Sub-Category</div>
              <div className="col-span-2">Products</div>
              <div className="col-span-5 text-right">Action</div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredSubCategories.map((subCategory) => (
                <div 
                  key={subCategory.id} 
                  className="p-4 hover:bg-gray-50 transition-colors"
                  onClick={() => handleSubCategoryClick(subCategory.name)}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-1 lg:col-span-2 flex items-center gap-3">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
                        {subCategory.image || subCategory.icon || '📁'}
                      </div>
                      <span className="lg:hidden text-sm font-medium text-gray-500">Image</span>
                    </div>
                    
                    <div className="sm:col-span-1 lg:col-span-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{subCategory.name}</span>
                      </div>
                    </div>
                    
                    <div className="sm:col-span-1 lg:col-span-2 flex items-center gap-2">
                      <span className="lg:hidden text-sm font-medium text-gray-500">Products:</span>
                      <span className="text-sm text-gray-700">
                        {subCategory.productCount || 0} items
                      </span>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-5 flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => e.stopPropagation()} // Row click को रोकें
                        title="View products"
                      >
                        <span className="text-sm">View</span>
                      </button>
                      <button
                        onClick={() => {/* Edit sub-category */}}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit sub-category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubCategory(subCategory.id, subCategory.name)}
                        disabled={deletingId === subCategory.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete sub-category"
                      >
                        {deletingId === subCategory.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubCategories;