// frontend/src/pages/Admin/EditProduct.jsx

import { useState, useEffect } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { categoryData } from "../../data/categoryData.js";
import { getProductById, updateProduct } from "../../../api/productApi.js";
import { getTemplateByCategory, PRODUCT_TEMPLATES } from "../../data/ProductTemplates.js";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState({
    category: "",
    subCategory: "",
    brand: "",
    name: "",
    MRP: "",
    sellingPrice: "",
    discount: "",
    rating: "",
    reviews: "",
    choose_W_G: "",
    warranty_guarantee: "",
    stock: "",
    description: "",
    productType: "fan",
    specifications: {}
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specFields, setSpecFields] = useState([]);

  // Fetch Product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        
        // Extract specifications from product
        const specs = data.specifications || {};
        
        setProduct({
          ...data,
          specifications: specs
        });
        
        setExistingImages(data.images || []);
        
        // Get template fields for this category
        if (data.category) {
          const template = getTemplateByCategory(data.category);
          const fields = Object.keys(template.fields).map(key => ({
            key,
            ...template.fields[key]
          }));
          setSpecFields(fields);
        }
        
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updated = {
      ...product,
      [name]: value,
    };

    const MRP = Number(name === "MRP" ? value : updated.MRP);
    const sellingPrice = Number(name === "sellingPrice" ? value : updated.sellingPrice);
    const discount = Number(name === "discount" ? value : updated.discount);

    // Auto-calculate discount
    if ((name === "MRP" || name === "sellingPrice") && MRP > 0 && sellingPrice > 0) {
      updated.discount = (((MRP - sellingPrice) / MRP) * 100).toFixed(0);
    }

    // Auto-calculate new price from discount
    if (name === "discount" && MRP > 0) {
      updated.sellingPrice = (MRP - (MRP * discount) / 100).toFixed(2);
    }

    setProduct(updated);
  };

  // Handle specification changes
  const handleSpecChange = (key, value) => {
    setProduct(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value
      }
    }));
  };

  // Category change handler - update spec fields
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setProduct(prev => ({ ...prev, category, subCategory: "", brand: "" }));
    
    // Update spec fields based on category
    if (category) {
      const template = getTemplateByCategory(category);
      const fields = Object.keys(template.fields).map(key => ({
        key,
        ...template.fields[key]
      }));
      setSpecFields(fields);
      
      // Reset specifications
      setProduct(prev => ({ ...prev, specifications: {} }));
    }
  };

  // Image Upload
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const imagePreview = files.map((file) => URL.createObjectURL(file));
    setPreview(imagePreview);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreview = [...preview];
    newImages.splice(index, 1);
    newPreview.splice(index, 1);
    setImages(newImages);
    setPreview(newPreview);
  };

  const removeExistingImage = (index) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  // Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Basic fields
      formData.append("category", product.category);
      formData.append("subCategory", product.subCategory);
      formData.append("brand", product.brand);
      formData.append("name", product.name);
      formData.append("MRP", product.MRP);
      formData.append("sellingPrice", product.sellingPrice);
      formData.append("discount", product.discount || 0);
      formData.append("rating", product.rating || 4.4);
      formData.append("reviews", product.reviews || 225);
      formData.append("choose_W_G", product.choose_W_G || "");
      formData.append("warranty_guarantee", product.warranty_guarantee || "");
      formData.append("stock", product.stock);
      formData.append("description", product.description || "");
      
      // Product type
      const template = getTemplateByCategory(product.category);
      formData.append("productType", template.productType || "fan");

      // ✅ Specifications as JSON
      formData.append("specifications", JSON.stringify(product.specifications));

      // Existing Images
      const imageUrls = existingImages.map((img) => 
        typeof img === "object" ? img.url : img
      );
      formData.append("existingImages", JSON.stringify(imageUrls));

      // New Images
      images.forEach((img) => {
        formData.append("images", img);
      });

      await updateProduct(id, formData);
      alert("✅ Product Updated Successfully");
      navigate("/admin/products");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "❌ Product Update Failed");
    }
  };

  // Get current category data
  const currentCategoryData = product.category ? categoryData[product.category] : null;
  const subCategories = currentCategoryData?.subCategories || [];
  const brands = currentCategoryData?.brands || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8">Update Product</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="font-semibold">Category *</label>
              <select
                name="category"
                value={product.category}
                onChange={handleCategoryChange}
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {Object.keys(categoryData).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sub-Category */}
            <div>
              <label className="font-semibold">Sub-Category *</label>
              <select
                name="subCategory"
                value={product.subCategory}
                onChange={handleChange}
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!product.category}
                required
              >
                <option value="">
                  {product.category ? "Select Sub-Category" : "Select Category First"}
                </option>
                {subCategories.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="font-semibold">Brand *</label>
              <select
                name="brand"
                value={product.brand}
                onChange={handleChange}
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!product.category}
                required
              >
                <option value="">
                  {product.category ? "Select Brand" : "Select Category First"}
                </option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label className="font-semibold">Product Name *</label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                placeholder="Enter Product Name"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Old Price */}
            <div>
              <label className="font-semibold">Old Price *</label>
              <input
                type="number"
                name="MRP"
                value={product.MRP}
                onChange={handleChange}
                placeholder="₹ Old Price"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* New Price */}
            <div>
              <label className="font-semibold">New Price *</label>
              <input
                type="number"
                name="sellingPrice"
                value={product.sellingPrice}
                onChange={handleChange}
                placeholder="₹ Selling Price"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Discount */}
            <div>
              <label className="font-semibold">Discount %</label>
              <input
                type="number"
                name="discount"
                value={product.discount}
                onChange={handleChange}
                placeholder="Discount %"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="font-semibold">Rating</label>
              <input
                type="number"
                name="rating"
                value={product.rating}
                onChange={handleChange}
                placeholder="Rating (e.g., 4.5)"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>

            {/* Reviews */}
            <div>
              <label className="font-semibold">Reviews</label>
              <input
                type="number"
                name="reviews"
                value={product.reviews}
                onChange={handleChange}
                placeholder="Number of Reviews"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Choose W/G */}
            <div>
              <label className="font-semibold">Choose Warranty/Guarantee</label>
              <select
                name="choose_W_G"
                value={product.choose_W_G}
                onChange={handleChange}
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Warranty or Guarantee</option>
                <option value="warranty">Warranty</option>
                <option value="guarantee">Guarantee</option>
              </select>
            </div>

            {/* Warranty Period */}
            <div>
              <label className="font-semibold">Warranty/Guarantee Period</label>
              <input
                type="text"
                name="warranty_guarantee"
                value={product.warranty_guarantee}
                onChange={handleChange}
                placeholder="e.g., 2 Years"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="font-semibold">Stock *</label>
              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                placeholder="Available Stock"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* ✅ Dynamic Specifications - Category ke hisaab se */}
          {product.category && specFields.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                Product Specifications
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {specFields.map((field) => (
                  <div key={field.key}>
                    <label className="font-semibold">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={product.specifications[field.key] || ''}
                        onChange={(e) => handleSpecChange(field.key, e.target.value)}
                        className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={product.specifications[field.key] || ''}
                        onChange={(e) => handleSpecChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows="3"
                        className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={product.specifications[field.key] || ''}
                        onChange={(e) => handleSpecChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="font-semibold">Description</label>
            <textarea
              rows="4"
              name="description"
              value={product.description}
              onChange={handleChange}
              placeholder="Write Product Description..."
              className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Existing Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={typeof img === "object" ? img.url : img} 
                      alt="" 
                      className="rounded-lg h-36 w-full object-cover border" 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeExistingImage(index)} 
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Images */}
          <div>
            <label className="font-semibold">Upload New Images</label>
            <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-52 cursor-pointer hover:border-blue-500 transition">
              <FaUpload className="text-5xl text-blue-600 mb-4" />
              <p className="font-semibold">Click to Upload Images</p>
              <p className="text-gray-500 text-sm">PNG, JPG, JPEG (Max 5MB each)</p>
              <input type="file" multiple hidden onChange={handleImages} accept="image/*" />
            </label>
          </div>

          {/* New Images Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">New Images Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {preview.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt="" className="rounded-lg h-36 w-full object-cover border" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)} 
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg"
            >
              Update Product
            </button>
            <button 
              type="button" 
              onClick={() => navigate("/admin/products")} 
              className="bg-gray-400 hover:bg-gray-500 text-white px-10 py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}