import { useState, useEffect } from 'react';
import { categoryData, getTemplateForCategory } from '../../data/categoryData';
import { getTemplateByCategory } from '../../data/ProductTemplates';
import { addProduct } from '../../../api/productApi';
import { useNavigate } from 'react-router-dom'; // ← Import this

const ProductForm = () => {
  const navigate = useNavigate(); // ← Initialize navigate
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [specifications, setSpecifications] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    brand: '',
    name: '',
    MRP: '',
    sellingPrice: '',
    discount: '0',
    stock: '',
    description: '',
    includeComponents: '',
    images: []
  });

  // Update form fields when category changes
  useEffect(() => {
    if (selectedCategory) {
      const template = getTemplateByCategory(selectedCategory);
      const fields = Object.entries(template.fields).map(([key, config]) => ({
        key,
        ...config
      }));
      setFormFields(fields);
      setSpecifications({});
    }
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, category }));
  };

  const handleSpecificationChange = (key, value) => {
    setSpecifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Calculate discount or selling price automatically
  const calculatePrice = (field, value) => {
    const mrp = parseFloat(formData.MRP) || 0;
    const discount = parseFloat(formData.discount) || 0;

    if (field === 'MRP') {
      const newMrp = parseFloat(value) || 0;
      if (discount > 0 && newMrp > 0) {
        const newSellingPrice = newMrp - (newMrp * discount / 100);
        setFormData(prev => ({
          ...prev,
          MRP: value,
          sellingPrice: newSellingPrice.toFixed(2)
        }));
      } else {
        setFormData(prev => ({ ...prev, MRP: value }));
      }
    } 
    else if (field === 'sellingPrice') {
      const newSellingPrice = parseFloat(value) || 0;
      if (mrp > 0 && newSellingPrice > 0) {
        const newDiscount = ((mrp - newSellingPrice) / mrp) * 100;
        setFormData(prev => ({
          ...prev,
          sellingPrice: value,
          discount: newDiscount.toFixed(2)
        }));
      } else {
        setFormData(prev => ({ ...prev, sellingPrice: value }));
      }
    }
    else if (field === 'discount') {
      const newDiscount = parseFloat(value) || 0;
      if (mrp > 0 && newDiscount >= 0) {
        const newSellingPrice = mrp - (mrp * newDiscount / 100);
        setFormData(prev => ({
          ...prev,
          discount: value,
          sellingPrice: newSellingPrice.toFixed(2)
        }));
      } else {
        setFormData(prev => ({ ...prev, discount: value }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle price calculations for specific fields
    if (name === 'MRP' || name === 'sellingPrice' || name === 'discount') {
      calculatePrice(name, value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // In ProductForm.js, update the handleSubmit function:
// In ProductForm.js, update the handleSubmit function:

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formDataToSend = new FormData();
    
    // Add basic fields - make sure all required fields have values
    const requiredFields = ['category', 'subCategory', 'brand', 'name', 'MRP', 'sellingPrice', 'stock'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`❌ ${field} is required`);
        setLoading(false);
        return;
      }
      formDataToSend.append(field, formData[field]);
    }

    // ✅ Add ALL optional fields including the missing ones
    const optionalFields = [
      'discount', 
      'description', 
      'rating',           // ✅ Added
      'reviews',          // ✅ Added
      'choose_W_G',       // ✅ Added
      'warranty_guarantee', // ✅ Added
      'includeComponents'  // ✅ Added
    ];
    
    for (const field of optionalFields) {
      if (formData[field] !== undefined && formData[field] !== null && formData[field] !== '') {
        formDataToSend.append(field, formData[field]);
      }
    }

    // Get product type from template
    const template = getTemplateByCategory(selectedCategory);
    if (template) {
      formDataToSend.append('productType', template.productType || 'fan');
    }

    // ✅ Send specifications as JSON
    console.log("Specifications being sent:", specifications);
    formDataToSend.append('specifications', JSON.stringify(specifications));

    // ✅ Also send individual specification fields (for backend to pick up)
    Object.keys(specifications).forEach(key => {
      if (specifications[key] !== undefined && specifications[key] !== '') {
        formDataToSend.append(key, specifications[key]);
      }
    });

    // Add images - ensure at least one image
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach(file => {
        formDataToSend.append('images', file);
      });
    } else {
      alert('❌ Please select at least one image');
      setLoading(false);
      return;
    }

    // Log the FormData contents for debugging
    console.log("FormData entries:");
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await addProduct(formDataToSend);
    
    if (response.success) {
      alert('✅ Product created successfully!');
      // Reset form
      setFormData({
        category: '',
        subCategory: '',
        brand: '',
        name: '',
        MRP: '',
        sellingPrice: '',
        discount: '',
        stock: '',
        description: '',
        rating: '',          // ✅ Added
        reviews: '',         // ✅ Added
        choose_W_G: '',      // ✅ Added
        warranty_guarantee: '', // ✅ Added
        includeComponents: '',
        images: []
      });
      setSpecifications({});
      setSelectedCategory('');
      setImagePreviews([]);
      navigate('/admin/products');
    } else {
      alert('❌ Failed to create product: ' + (response.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error creating product:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Please try again.';
    alert(`❌ Error creating product: ${errorMessage}`);
  } finally {
    setLoading(false);
  }
};
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: files }));
    
    // Create image previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">
        Add New Product
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Category Selection */}
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-700 text-sm">
            Category <span className="text-red-500 ml-1">*</span>
          </label>
          <select 
            name="category" 
            value={formData.category}
            onChange={handleCategoryChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {Object.keys(categoryData).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sub Category */}
        {selectedCategory && (
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-700 text-sm">
              Sub Category <span className="text-red-500 ml-1">*</span>
            </label>
            <select 
              name="subCategory" 
              value={formData.subCategory}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Sub Category</option>
              {categoryData[selectedCategory]?.subCategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}

        {/* Brand */}
        {selectedCategory && (
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-700 text-sm">
              Brand <span className="text-red-500 ml-1">*</span>
            </label>
            <select 
              name="brand" 
              value={formData.brand}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Brand</option>
              {categoryData[selectedCategory]?.brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        )}

        {/* Basic Fields */}
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-700 text-sm">
            Product Name <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter product name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-700 text-sm">
              M.R.P <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              name="MRP"
              value={formData.MRP}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2999"
              step="0.01"
            />
          </div>

          {/*Selling Price */}
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-700 text-sm">
              Selling Price <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2499"
              step="0.01"
            />
          </div>
        </div>

        {/* Discount % */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-700 text-sm">
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 10"
              min="0"
              max="100"
              step="0.01"
            />
          </div>

           {/* Rating */}
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-700 text-sm">
              Rating <span className="text-red-500 ml-1">*</span>
            </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                placeholder="Rating (e.g., 4.5)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none   focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Reviews */}
          <div className="mb-4">
             <label className="block font-medium mb-1 text-gray-700 text-sm">
              Reviews <span className="text-red-500 ml-1">*</span>
            </label>
              <input
                type="number"
                name="reviews"
                value={formData.reviews}
                onChange={handleInputChange}
                placeholder="Number of Reviews"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm  
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              />  
            </div>

            {/* Choose W/G */}
            <div className="mb-4">
              <label className="block font-medium mb-1 text-gray-700 text-sm">
              Choose one <span className="text-red-500 ml-1">*</span>
            </label>
              <select
                name="choose_W_G"
                value={formData.choose_W_G}
                onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Warranty or Guarantee</option>
                <option value="warranty">Warranty</option>
                <option value="guarantee">Guarantee</option>
              </select>
            </div>

            {/* Warranty_Guarantee */}
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-700 text-sm">
              Warranty_Guarantee <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="warranty_guarantee"
              value={formData.warranty_guarantee}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50"
            />
          </div>

          {/* Include Components */}
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-700 text-sm">
              Include Components <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="includeComponents"
              value={formData.includeComponents}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50"
            />
          </div>

            {/* Stock */}
          <div className="mb-4">
            <label className="block font-medium mb-1 text-gray-700 text-sm">
              Stock <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50"
              min="0"
            />
          </div>
     
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-700 text-sm">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="Enter product description"
          />
        </div>

        {/* Dynamic Specifications */}
        {selectedCategory && formFields.length > 0 && (
          <div className="mt-5">
            <h3 className="text-lg font-semibold mt-4 mb-3 text-gray-700 border-b-2 border-gray-300 pb-2">
              Product Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formFields.map((field) => (
                <div key={field.key} className="mb-4">
                  <label className="block font-medium mb-1 text-gray-700 text-sm">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={specifications[field.key] || ''}
                      onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={specifications[field.key] || ''}
                      onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={specifications[field.key] || ''}
                      onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-700 text-sm">
            Product Images <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreviews.map((preview, index) => (
                <span key={index} className="bg-gray-200 px-3 py-1 rounded text-xs text-gray-700">
                  Image {index + 1}
                </span>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className={`w-full py-3 px-4 rounded-md text-white font-bold text-base transition-colors ${
            loading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Creating Product...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;