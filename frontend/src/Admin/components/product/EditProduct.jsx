// frontend/src/pages/admin/EditProduct.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FiArrowLeft, FiSave, FiX, FiImage, FiPlus, FiTrash2,
  FiUpload, FiInfo, FiTag, FiDollarSign, FiPackage,
  FiShoppingCart, FiTruck, FiEye, FiEyeOff
} from "react-icons/fi";
import ProductAPI from "../../../api/productApi";
import CategoryAPI from "../../../api/categoryApi";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [errors, setErrors] = useState({});

  // Product Form State
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    description: "",
    shortDescription: "",
    
    // Pricing
    price: "",
    compareAtPrice: "",
    costPerItem: "",
    
    // Inventory
    sku: "",
    barcode: "",
    quantity: "",
    lowStockThreshold: 5,
    
    // Media
    images: [],
    video: {
      url: "",
      thumbnail: "",
      provider: "youtube"
    },
    
    // Categories & Tags
    category: "",
    subCategory: "",
    tags: "",
    brand: "",
    
    // Variations
    variants: [],
    
    // Attributes
    attributes: [],
    
    // SEO
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    
    // Shipping
    weight: { value: "", unit: "kg" },
    dimensions: { length: "", width: "", height: "", unit: "cm" },
    isPhysicalProduct: true,
    isDigitalProduct: false,
    digitalFileUrl: "",
    shippingClass: "standard",
    freeShipping: false,
    
    // Status & Visibility
    status: "draft",
    isFeatured: false,
    visibility: "visible",
    publishedAt: "",
    
    // Discount
    discount: {
      type: "percentage",
      value: "",
      startDate: "",
      endDate: "",
      isActive: false
    },
    
    // Related Products
    relatedProducts: [],
    frequentlyBoughtTogether: [],
    
    // Additional Settings
    hasVariants: false,
    minOrderQuantity: 1,
    maxOrderQuantity: "",
    taxClass: "standard",
    isReturnable: true,
    returnPeriod: 30,
    warranty: {
      period: "",
      description: ""
    }
  });

  const [newVariant, setNewVariant] = useState({
    name: "",
    value: "",
    sku: "",
    barcode: "",
    price: "",
    quantity: "",
    images: []
  });

  const [newAttribute, setNewAttribute] = useState({
    name: "",
    value: "",
    isFilterable: false
  });

  const [tempImageFiles, setTempImageFiles] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);

  // ============================================
  // FETCH PRODUCT DATA
  // ============================================
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ProductAPI.getProductById(id);
      const product = response.data;

      // Format data for form
      setFormData({
        ...product,
        tags: product.tags?.join(", ") || "",
        metaKeywords: product.metaKeywords?.join(", ") || "",
        weight: product.weight || { value: "", unit: "kg" },
        dimensions: product.dimensions || { length: "", width: "", height: "", unit: "cm" },
        discount: product.discount || {
          type: "percentage",
          value: "",
          startDate: "",
          endDate: "",
          isActive: false
        },
        warranty: product.warranty || { period: "", description: "" },
        publishedAt: product.publishedAt ? new Date(product.publishedAt).toISOString().split('T')[0] : ""
      });

    } catch (error) {
      toast.error("Failed to fetch product");
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // ============================================
  // FETCH CATEGORIES
  // ============================================
  const fetchCategories = async () => {
    try {
      const response = await CategoryAPI.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  // ============================================
  // FETCH SUB-CATEGORIES
  // ============================================
  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await CategoryAPI.getSubCategories(categoryId);
      setSubCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch sub-categories");
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [fetchProduct]);

  useEffect(() => {
    if (formData.category) {
      fetchSubCategories(formData.category);
    }
  }, [formData.category]);

  // ============================================
  // HANDLE INPUT CHANGE
  // ============================================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes('.')) {
      // Handle nested fields (e.g., weight.value)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name.includes('[')) {
      // Handle array fields like discount.type
      const match = name.match(/(\w+)\[(\w+)\]/);
      if (match) {
        const [, parent, child] = match;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // ============================================
  // HANDLE IMAGE UPLOAD
  // ============================================
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      alt: formData.name || "Product image",
      isPrimary: formData.images.length === 0 && tempImageFiles.length === 0,
      order: formData.images.length + tempImageFiles.length + 1
    }));

    setTempImageFiles(prev => [...prev, ...newImages]);
    e.target.value = ""; // Reset input
  };

  // ============================================
  // REMOVE IMAGE
  // ============================================
  const handleRemoveImage = (imageUrl, index) => {
    // If it's a new image (temp)
    const tempIndex = tempImageFiles.findIndex(img => img.url === imageUrl);
    if (tempIndex !== -1) {
      setTempImageFiles(prev => prev.filter((_, i) => i !== tempIndex));
      return;
    }

    // If it's an existing image
    setRemoveImages(prev => [...prev, imageUrl]);
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.url !== imageUrl)
    }));
  };

  // ============================================
  // SET PRIMARY IMAGE
  // ============================================
  const handleSetPrimary = (imageUrl) => {
    // Update temp images
    const tempIndex = tempImageFiles.findIndex(img => img.url === imageUrl);
    if (tempIndex !== -1) {
      setTempImageFiles(prev => prev.map((img, i) => ({
        ...img,
        isPrimary: i === tempIndex
      })));
      return;
    }

    // Update existing images
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isPrimary: img.url === imageUrl
      }))
    }));
  };

  // ============================================
  // HANDLE VARIANT
  // ============================================
  const handleAddVariant = () => {
    if (!newVariant.name || !newVariant.value) {
      toast.error("Variant name and value are required");
      return;
    }

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant }],
      hasVariants: true
    }));

    setNewVariant({
      name: "",
      value: "",
      sku: "",
      barcode: "",
      price: "",
      quantity: "",
      images: []
    });
  };

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
      hasVariants: prev.variants.length > 1
    }));
  };

  // ============================================
  // HANDLE ATTRIBUTE
  // ============================================
  const handleAddAttribute = () => {
    if (!newAttribute.name || !newAttribute.value) {
      toast.error("Attribute name and value are required");
      return;
    }

    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { ...newAttribute }]
    }));

    setNewAttribute({
      name: "",
      value: "",
      isFilterable: false
    });
  };

  const handleRemoveAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  // ============================================
// HANDLE FORM SUBMIT
// ============================================
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate required fields
  const requiredFields = ['name', 'price', 'category', 'quantity'];
  const newErrors = {};
  requiredFields.forEach(field => {
    if (!formData[field]) {
      newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    toast.error("Please fill in all required fields");
    return;
  }

  setSaving(true);
  
  try {
    // Create a clean object to send as JSON
    const submitData = {
      // Basic fields
      name: formData.name,
      description: formData.description,
      shortDescription: formData.shortDescription,
      price: formData.price,
      compareAtPrice: formData.compareAtPrice,
      costPerItem: formData.costPerItem,
      sku: formData.sku,
      barcode: formData.barcode,
      quantity: formData.quantity,
      lowStockThreshold: formData.lowStockThreshold,
      category: formData.category,
      subCategory: formData.subCategory,
      brand: formData.brand,
      status: formData.status,
      isFeatured: formData.isFeatured,
      visibility: formData.visibility,
      publishedAt: formData.publishedAt,
      hasVariants: formData.hasVariants,
      minOrderQuantity: formData.minOrderQuantity,
      maxOrderQuantity: formData.maxOrderQuantity || undefined,
      taxClass: formData.taxClass,
      isReturnable: formData.isReturnable,
      returnPeriod: formData.returnPeriod,
      isPhysicalProduct: formData.isPhysicalProduct,
      isDigitalProduct: formData.isDigitalProduct,
      digitalFileUrl: formData.digitalFileUrl || undefined,
      shippingClass: formData.shippingClass,
      freeShipping: formData.freeShipping,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      
      // Nested objects
      weight: formData.weight,
      dimensions: formData.dimensions,
      discount: formData.discount,
      warranty: formData.warranty,
      video: formData.video,
      
      // Arrays
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      metaKeywords: formData.metaKeywords ? formData.metaKeywords.split(',').map(kw => kw.trim()).filter(kw => kw) : [],
      variants: formData.variants,
      attributes: formData.attributes,
      relatedProducts: formData.relatedProducts,
      frequentlyBoughtTogether: formData.frequentlyBoughtTogether,
      
      // Images
      removeImages: removeImages
    };

    // Create FormData
    const formDataToSend = new FormData();
    
    // Append all data as JSON string
    formDataToSend.append('data', JSON.stringify(submitData));

    // Append new image files
    if (tempImageFiles.length > 0) {
      tempImageFiles.forEach((img) => {
        if (img.file) {
          formDataToSend.append('images', img.file);
        }
      });
    }

    // Send update request
    await ProductAPI.updateProduct(id, formDataToSend);
    
    toast.success("Product updated successfully!");
    navigate("/admin/products");
    
  } catch (error) {
    console.error("Update error:", error);
    toast.error(error.response?.data?.message || "Failed to update product");
    
    if (error.response?.data?.errors) {
      setErrors(error.response.data.errors);
    }
  } finally {
    setSaving(false);
  }
};

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/products"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-sm text-gray-500">Update product information and settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/product/${formData.slug || id}`}
                target="_blank"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <FiEye />
                View Product
              </Link>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave />
                {saving ? "Saving..." : "Update Product"}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiInfo className="text-blue-600" />
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Detailed product description"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief product description (max 500 chars)"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiDollarSign className="text-green-600" />
                  Pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600 mt-1">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compare at Price
                    </label>
                    <input
                      type="number"
                      name="compareAtPrice"
                      value={formData.compareAtPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost per Item
                    </label>
                    <input
                      type="number"
                      name="costPerItem"
                      value={formData.costPerItem}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiPackage className="text-purple-600" />
                  Inventory
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Product SKU"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Product Barcode"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.quantity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              {/* Categories & Tags */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiTag className="text-orange-600" />
                  Categories & Tags
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-Category
                    </label>
                    <select
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Sub-Category</option>
                      {subCategories.map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Product brand"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiImage className="text-pink-600" />
                  Images
                </h2>
                
                {/* Existing Images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt || "Product"}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(image.url)}
                            className={`px-2 py-1 text-xs rounded ${
                              image.isPrimary
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {image.isPrimary ? 'Primary' : 'Set Primary'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image.url)}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {image.isPrimary && (
                          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Temp Images */}
                {tempImageFiles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                    {tempImageFiles.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(image.url)}
                            className={`px-2 py-1 text-xs rounded ${
                              image.isPrimary
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {image.isPrimary ? 'Primary' : 'Set Primary'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image.url)}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {image.isPrimary && (
                          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload multiple images. First image will be set as primary.
                  </p>
                </div>
              </div>

              {/* Variants */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiShoppingCart className="text-indigo-600" />
                  Variants
                </h2>
                
                {formData.variants.length > 0 && (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.variants.map((variant, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{variant.name}</td>
                            <td className="px-4 py-2 text-sm">{variant.value}</td>
                            <td className="px-4 py-2 text-sm">{variant.sku || '-'}</td>
                            <td className="px-4 py-2 text-sm">${variant.price || '-'}</td>
                            <td className="px-4 py-2 text-sm">{variant.quantity || '-'}</td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name (e.g., Color)"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., Red)"
                    value={newVariant.value}
                    onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <FiPlus /> Add Variant
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <input
                    type="text"
                    placeholder="SKU"
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newVariant.quantity}
                    onChange={(e) => setNewVariant({ ...newVariant, quantity: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Attributes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Attributes</h2>
                
                {formData.attributes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.attributes.map((attr, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        {attr.name}: {attr.value}
                        {attr.isFilterable && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Filterable
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Attribute Name"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={newAttribute.value}
                    onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAttribute.isFilterable}
                      onChange={(e) => setNewAttribute({ ...newAttribute, isFilterable: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Filterable
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <FiPlus /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Status */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Status & Visibility</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="outOfStock">Out of Stock</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visibility
                    </label>
                    <select
                      name="visibility"
                      value={formData.visibility}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                      <option value="schedule">Schedule</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Published Date
                    </label>
                    <input
                      type="date"
                      name="publishedAt"
                      value={formData.publishedAt}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Product</span>
                  </label>
                </div>
              </div>

              {/* SEO */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">SEO</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Meta title (max 70 chars)"
                      maxLength="70"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.metaTitle?.length || 0}/70 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Meta description (max 160 chars)"
                      maxLength="160"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.metaDescription?.length || 0}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      name="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiTruck className="text-teal-600" />
                  Shipping
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight
                      </label>
                      <input
                        type="number"
                        name="weight.value"
                        value={formData.weight.value}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        name="weight.unit"
                        value={formData.weight.unit}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Length
                      </label>
                      <input
                        type="number"
                        name="dimensions.length"
                        value={formData.dimensions.length}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width
                      </label>
                      <input
                        type="number"
                        name="dimensions.width"
                        value={formData.dimensions.width}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height
                      </label>
                      <input
                        type="number"
                        name="dimensions.height"
                        value={formData.dimensions.height}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Class
                    </label>
                    <select
                      name="shippingClass"
                      value={formData.shippingClass}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
                      <option value="free">Free</option>
                      <option value="pickup">Pickup</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="freeShipping"
                      checked={formData.freeShipping}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Free Shipping</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPhysicalProduct"
                      checked={formData.isPhysicalProduct}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Physical Product</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isDigitalProduct"
                      checked={formData.isDigitalProduct}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Digital Product</span>
                  </label>

                  {formData.isDigitalProduct && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Digital File URL
                      </label>
                      <input
                        type="url"
                        name="digitalFileUrl"
                        value={formData.digitalFileUrl}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/file.zip"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Discount */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Discount</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="discount.isActive"
                      checked={formData.discount.isActive}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        discount: { ...prev.discount, isActive: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Discount</span>
                  </label>

                  {formData.discount.isActive && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            name="discount.type"
                            value={formData.discount.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Value
                          </label>
                          <input
                            type="number"
                            name="discount.value"
                            value={formData.discount.value}
                            onChange={handleInputChange}
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="datetime-local"
                          name="discount.startDate"
                          value={formData.discount.startDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="datetime-local"
                          name="discount.endDate"
                          value={formData.discount.endDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Settings */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Additional Settings</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Order Quantity
                      </label>
                      <input
                        type="number"
                        name="minOrderQuantity"
                        value={formData.minOrderQuantity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Order Quantity
                      </label>
                      <input
                        type="number"
                        name="maxOrderQuantity"
                        value={formData.maxOrderQuantity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Class
                    </label>
                    <select
                      name="taxClass"
                      value={formData.taxClass}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="standard">Standard</option>
                      <option value="reduced">Reduced</option>
                      <option value="zero">Zero</option>
                      <option value="exempt">Exempt</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isReturnable"
                      checked={formData.isReturnable}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Returnable</span>
                  </label>

                  {formData.isReturnable && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Return Period (days)
                      </label>
                      <input
                        type="number"
                        name="returnPeriod"
                        value={formData.returnPeriod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty Period (months)
                    </label>
                    <input
                      type="number"
                      name="warranty.period"
                      value={formData.warranty.period}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty Description
                    </label>
                    <input
                      type="text"
                      name="warranty.description"
                      value={formData.warranty.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Warranty description"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4 flex items-center justify-end gap-3">
            <Link
              to="/admin/products"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave />
              {saving ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;