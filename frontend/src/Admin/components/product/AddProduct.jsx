// frontend/src/components/products/AddProduct.jsx

import { useState, useEffect } from "react";
import { createProduct, getProductTypes, getTemplateFields } from "../../../api/productApi";
import { toast } from "react-hot-toast"; // ya aapka custom toast

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const [templateFields, setTemplateFields] = useState([]);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    productType: "fan",
    category: "",
    subCategory: "",
    brand: "",
    name: "",
    MRP: "",
    sellingPrice: "",
    discount: "0",
    rating: "0",
    reviews: "0",
    choose_W_G: "",
    warranty_guarantee: "",
    stock: "",
    description: "",
    includeComponents: [],
    specifications: {},
  });

  // Fetch product types on mount
  useEffect(() => {
    fetchProductTypes();
  }, []);

  // Fetch template fields when product type changes
  useEffect(() => {
    if (formData.productType) {
      fetchTemplateFields(formData.productType);
    }
  }, [formData.productType]);

  const fetchProductTypes = async () => {
    try {
      const response = await getProductTypes();
      setProductTypes(response.productTypes || []);
    } catch (error) {
      toast.error("Failed to load product types");
    }
  };

  const fetchTemplateFields = async (type) => {
    try {
      const response = await getTemplateFields(type);
      setTemplateFields(response.templateFields || []);
      
      // Reset specifications when type changes
      const specs = {};
      response.templateFields?.forEach(field => {
        specs[field] = "";
      });
      
      setFormData(prev => ({
        ...prev,
        specifications: specs,
      }));
    } catch (error) {
      toast.error("Failed to load template fields");
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle specification change
  const handleSpecChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    // Validate file size (5MB each)
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    setImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previewImages];
    
    URL.revokeObjectURL(newPreviews[index]); // Clean up preview URL
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setPreviewImages(newPreviews);
  };

  // Handle include components
  const [componentInput, setComponentInput] = useState("");
  
  const addComponent = () => {
    if (componentInput.trim()) {
      setFormData(prev => ({
        ...prev,
        includeComponents: [...prev.includeComponents, componentInput.trim()],
      }));
      setComponentInput("");
    }
  };

  const removeComponent = (index) => {
    setFormData(prev => ({
      ...prev,
      includeComponents: prev.includeComponents.filter((_, i) => i !== index),
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category || !formData.MRP || !formData.sellingPrice || !formData.stock) {
      toast.error("Please fill all required fields");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "includeComponents") {
          submitData.append(key, JSON.stringify(value));
        } else if (key === "specifications") {
          // Remove empty specifications
          const filledSpecs = {};
          Object.entries(value).forEach(([specKey, specValue]) => {
            if (specValue !== "" && specValue !== null && specValue !== undefined) {
              filledSpecs[specKey] = specValue;
            }
          });
          submitData.append(key, JSON.stringify(filledSpecs));
        } else {
          submitData.append(key, value);
        }
      });

      // Append images
      images.forEach((image) => {
        submitData.append("images", image);
      });

      const response = await createProduct(submitData);
      console.log("data stored",response);
      
      toast.success("Product created successfully!");
      
      // Reset form
      setFormData({
        productType: "fan",
        category: "",
        subCategory: "",
        brand: "",
        name: "",
        MRP: "",
        sellingPrice: "",
        discount: "0",
        rating: "0",
        reviews: "0",
        choose_W_G: "",
        warranty_guarantee: "",
        stock: "",
        description: "",
        includeComponents: [],
        specifications: {},
      });
      setImages([]);
      setPreviewImages([]);
      
    } catch (error) {
      toast.error(error.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Type *</label>
          <select
            name="productType"
            value={formData.productType}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          >
            {productTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Product name"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Ceiling Fan"
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sub Category</label>
            <input
              type="text"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              placeholder="Sub category"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Brand name"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">MRP *</label>
            <input
              type="number"
              name="MRP"
              value={formData.MRP}
              onChange={handleChange}
              placeholder="Maximum Retail Price"
              className="w-full p-2 border rounded-md"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Selling Price *</label>
            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              placeholder="Selling price"
              className="w-full p-2 border rounded-md"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              placeholder="Discount percentage"
              className="w-full p-2 border rounded-md"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Stock *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Available stock"
              className="w-full p-2 border rounded-md"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              placeholder="0-5"
              className="w-full p-2 border rounded-md"
              min="0"
              max="5"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reviews</label>
            <input
              type="number"
              name="reviews"
              value={formData.reviews}
              onChange={handleChange}
              placeholder="Number of reviews"
              className="w-full p-2 border rounded-md"
              min="0"
            />
          </div>
        </div>

        {/* Warranty/Guarantee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Warranty/Guarantee Type</label>
            <select
              name="choose_W_G"
              value={formData.choose_W_G}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">None</option>
              <option value="warranty">Warranty</option>
              <option value="guarantee">Guarantee</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <input
              type="text"
              name="warranty_guarantee"
              value={formData.warranty_guarantee}
              onChange={handleChange}
              placeholder="e.g., 2 Years"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Product description (max 2000 characters)"
            className="w-full p-2 border rounded-md h-32"
            maxLength="2000"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/2000 characters
          </p>
        </div>

        {/* Include Components */}
        <div>
          <label className="block text-sm font-medium mb-2">Include Components</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={componentInput}
              onChange={(e) => setComponentInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addComponent())}
              placeholder="Add component"
              className="flex-1 p-2 border rounded-md"
            />
            <button
              type="button"
              onClick={addComponent}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.includeComponents.map((component, index) => (
              <span
                key={index}
                className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"
              >
                {component}
                <button
                  type="button"
                  onClick={() => removeComponent(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Specifications */}
        {templateFields.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templateFields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-2 capitalize">
                    {field.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    type="text"
                    value={formData.specifications[field] || ""}
                    onChange={(e) => handleSpecChange(field, e.target.value)}
                    placeholder={`Enter ${field}`}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Images * (Max 10, Max 5MB each)</label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md"
          />
          
          {/* Image Previews */}
          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
              {previewImages.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Product...
              </span>
            ) : (
              "Create Product"
            )}
          </button>
          
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;