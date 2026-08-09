// frontend/src/Admin/pages/EditProduct.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiArrowLeft, FiSave, FiX, FiImage, FiPlus, FiTrash2,
  FiUpload, FiInfo, FiTag, FiDollarSign, FiPackage,
  FiShoppingCart, FiTruck, FiEye, FiSettings
} from "react-icons/fi";
import { productApi, categoryApi } from "../../api";

// ============================================
// INITIAL FORM STATE
// ============================================
const INITIAL_FORM = {
  name: "", description: "", shortDescription: "",
  price: "", compareAtPrice: "", costPerItem: "",
  sku: "", barcode: "", quantity: 0, lowStockThreshold: 5,
  images: [],
  category: "", subCategory: "", brand: "", tags: "",
  variants: [], attributes: [],
  metaTitle: "", metaDescription: "", metaKeywords: "",
  weight: { value: "", unit: "kg" },
  dimensions: { length: "", width: "", height: "", unit: "cm" },
  isPhysicalProduct: true, isDigitalProduct: false, digitalFileUrl: "",
  shippingClass: "standard", freeShipping: false,
  status: "draft", isFeatured: false, visibility: "visible", publishedAt: "",
  discount: { type: "percentage", value: "", startDate: "", endDate: "", isActive: false },
  relatedProducts: [], frequentlyBoughtTogether: [],
  hasVariants: false, minOrderQuantity: 1, maxOrderQuantity: "",
  taxClass: "standard", isReturnable: true, returnPeriod: 30,
  warranty: { period: "", description: "" },
  video: { url: "", thumbnail: "", provider: "youtube" },
};

// ============================================
// MAIN COMPONENT
// ============================================
const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [tempImageFiles, setTempImageFiles] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Variant & Attribute temp states
  const [newVariant, setNewVariant] = useState({ name: "", value: "", sku: "", barcode: "", price: "", quantity: "" });
  const [newAttribute, setNewAttribute] = useState({ name: "", value: "", isFilterable: false });

  // ============================================
  // QUERY: Fetch Product
  // ============================================
  const {
    isLoading: productLoading,
    isError: productError,
    error: productErrorData,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getProductById(id).then(res => res.data.data || res.data),
    enabled: !!id,
    onSuccess: (data) => {
      // Populate form with fetched data
      setFormData({
        ...INITIAL_FORM,
        ...data,
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags || ""),
        metaKeywords: Array.isArray(data.metaKeywords) ? data.metaKeywords.join(", ") : (data.metaKeywords || ""),
        weight: data.weight || { value: "", unit: "kg" },
        dimensions: data.dimensions || { length: "", width: "", height: "", unit: "cm" },
        discount: data.discount || { type: "percentage", value: "", startDate: "", endDate: "", isActive: false },
        warranty: data.warranty || { period: "", description: "" },
        video: data.video || { url: "", thumbnail: "", provider: "youtube" },
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().split('T')[0] : "",
        discount: {
          ...data.discount,
          startDate: data.discount?.startDate ? new Date(data.discount.startDate).toISOString().slice(0, 16) : "",
          endDate: data.discount?.endDate ? new Date(data.discount.endDate).toISOString().slice(0, 16) : "",
        },
      });
    },
    onError: () => {
      toast.error("Failed to load product");
      navigate("/admin/products");
    },
  });

  // ============================================
  // QUERY: Fetch Categories
  // ============================================
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getCategories().then(res => res.data),
  });
  const categories = categoriesData?.data || [];

  // ============================================
  // QUERY: Fetch SubCategories when category changes
  // ============================================
  const { data: subCategoriesData } = useQuery({
    queryKey: ["subcategories", formData.category],
    queryFn: () => categoryApi.getSubCategories(formData.category).then(res => res.data),
    enabled: !!formData.category,
  });

  useEffect(() => {
    if (subCategoriesData?.data) {
      setSubCategories(subCategoriesData.data);
    } else {
      setSubCategories([]);
    }
  }, [subCategoriesData]);

  // ============================================
  // MUTATION: Update Product
  // ============================================
  const updateMutation = useMutation({
    mutationFn: (formDataToSend) => productApi.updateProduct(id, formDataToSend),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["product", id]);
      queryClient.invalidateQueries(["admin-products"]);
      navigate("/admin/products");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to update product";
      toast.error(msg);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  // ============================================
  // HANDLERS
  // ============================================

  // Simple field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Nested field change (e.g., weight.value)
  const handleNestedChange = (parent, child, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [child]: value },
    }));
  };

  // Discount field change
  const handleDiscountChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      discount: { ...prev.discount, [field]: value },
    }));
  };

  // Warranty field change
  const handleWarrantyChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      warranty: { ...prev.warranty, [field]: value },
    }));
  };

  // ============================================
  // IMAGE HANDLERS
  // ============================================
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const invalid = files.filter(f => !validTypes.includes(f.type));
    if (invalid.length) {
      toast.error("Only JPEG, PNG, GIF, WebP allowed");
      return;
    }

    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      alt: formData.name || "Product",
      isPrimary: formData.images.length === 0 && tempImageFiles.length === 0,
    }));

    setTempImageFiles(prev => [...prev, ...newImages]);
    e.target.value = "";
  };

  const handleRemoveImage = (imageUrl, isTemp = false) => {
    if (isTemp) {
      URL.revokeObjectURL(imageUrl);
      setTempImageFiles(prev => prev.filter(img => img.url !== imageUrl));
    } else {
      setRemoveImages(prev => [...prev, imageUrl]);
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img.url !== imageUrl),
      }));
    }
  };

  const handleSetPrimary = (imageUrl, isTemp = false) => {
    if (isTemp) {
      setTempImageFiles(prev =>
        prev.map(img => ({ ...img, isPrimary: img.url === imageUrl }))
      );
    }
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => ({ ...img, isPrimary: img.url === imageUrl })),
    }));
  };

  // ============================================
  // VARIANT HANDLERS
  // ============================================
  const handleAddVariant = () => {
    if (!newVariant.name || !newVariant.value) {
      toast.error("Variant name and value are required");
      return;
    }
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant }],
      hasVariants: true,
    }));
    setNewVariant({ name: "", value: "", sku: "", barcode: "", price: "", quantity: "" });
  };

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
      hasVariants: prev.variants.length > 1,
    }));
  };

  // ============================================
  // ATTRIBUTE HANDLERS
  // ============================================
  const handleAddAttribute = () => {
    if (!newAttribute.name || !newAttribute.value) {
      toast.error("Attribute name and value are required");
      return;
    }
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { ...newAttribute }],
    }));
    setNewAttribute({ name: "", value: "", isFilterable: false });
  };

  const handleRemoveAttribute = (index) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  // ============================================
  // FORM SUBMIT
  // ============================================
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    const validationErrors = {};
    if (!formData.name?.trim()) validationErrors.name = "Product name is required";
    if (!formData.price || parseFloat(formData.price) <= 0) validationErrors.price = "Valid price is required";
    if (!formData.category) validationErrors.category = "Category is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors");
      return;
    }

    // Build submit data
    const submitData = {
      name: formData.name,
      description: formData.description,
      shortDescription: formData.shortDescription,
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      costPerItem: formData.costPerItem ? parseFloat(formData.costPerItem) : undefined,
      sku: formData.sku || undefined,
      barcode: formData.barcode || undefined,
      quantity: parseInt(formData.quantity) || 0,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
      category: formData.category,
      subCategory: formData.subCategory || undefined,
      brand: formData.brand || undefined,
      status: formData.status,
      isFeatured: formData.isFeatured,
      visibility: formData.visibility,
      publishedAt: formData.publishedAt || undefined,
      hasVariants: formData.hasVariants,
      minOrderQuantity: parseInt(formData.minOrderQuantity) || 1,
      maxOrderQuantity: formData.maxOrderQuantity ? parseInt(formData.maxOrderQuantity) : undefined,
      taxClass: formData.taxClass,
      isReturnable: formData.isReturnable,
      returnPeriod: parseInt(formData.returnPeriod) || 30,
      isPhysicalProduct: formData.isPhysicalProduct,
      isDigitalProduct: formData.isDigitalProduct,
      digitalFileUrl: formData.digitalFileUrl || undefined,
      shippingClass: formData.shippingClass,
      freeShipping: formData.freeShipping,
      metaTitle: formData.metaTitle || formData.name,
      metaDescription: formData.metaDescription || formData.shortDescription?.substring(0, 160),
      weight: formData.weight,
      dimensions: formData.dimensions,
      discount: formData.discount.isActive ? formData.discount : undefined,
      warranty: formData.warranty,
      video: formData.video.url ? formData.video : undefined,
      tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      metaKeywords: formData.metaKeywords ? formData.metaKeywords.split(",").map(k => k.trim()).filter(Boolean) : [],
      variants: formData.variants.map(v => ({
        name: v.name,
        value: v.value,
        sku: v.sku || undefined,
        barcode: v.barcode || undefined,
        price: v.price ? parseFloat(v.price) : undefined,
        quantity: v.quantity ? parseInt(v.quantity) : 0,
      })),
      attributes: formData.attributes,
      relatedProducts: formData.relatedProducts || [],
      frequentlyBoughtTogether: formData.frequentlyBoughtTogether || [],
      removeImages: removeImages,
    };

    // Create FormData
    const fd = new FormData();
    fd.append("data", JSON.stringify(submitData));

    // Append new image files
    tempImageFiles.forEach(img => {
      if (img.file) fd.append("images", img.file);
    });

    updateMutation.mutate(fd);
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (productError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Product</h2>
          <p className="text-gray-600 mb-6">{productErrorData?.message || "Product not found"}</p>
          <button
            onClick={() => navigate("/admin/products")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // INPUT CLASS HELPER
  // ============================================
  const inputClass = (field) =>
    `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FiArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-sm text-gray-500">Update product: {formData.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/product/${formData.slug || id}`}
                target="_blank"
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm flex items-center gap-2"
              >
                <FiEye size={16} /> View
              </Link>
              <button
                onClick={handleSubmit}
                disabled={updateMutation.isPending}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <><FiSave size={16} /> Update Product</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ========== MAIN COLUMN (2/3) ========== */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiInfo className="text-blue-600" /> Basic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      className={inputClass("name")} placeholder="Enter product name" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange}
                      rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Detailed product description" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Short Description</label>
                    <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange}
                      rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Brief summary (max 500 chars)" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiDollarSign className="text-green-600" /> Pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input type="number" name="price" value={formData.price} onChange={handleChange}
                        className={`${inputClass("price")} pl-8`} step="0.01" min="0" />
                    </div>
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Compare at Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input type="number" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" step="0.01" min="0" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cost per Item</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input type="number" name="costPerItem" value={formData.costPerItem} onChange={handleChange}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" step="0.01" min="0" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiPackage className="text-purple-600" /> Inventory
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "SKU", name: "sku", placeholder: "PROD-001" },
                    { label: "Barcode", name: "barcode", placeholder: "Barcode" },
                    { label: "Quantity", name: "quantity", type: "number" },
                    { label: "Low Stock Alert", name: "lowStockThreshold", type: "number" },
                  ].map(({ label, name, type = "text", placeholder }) => (
                    <div key={name}>
                      <label className="block text-sm font-medium mb-1">{label}</label>
                      <input type={type} name={name} value={formData[name]} onChange={handleChange}
                        placeholder={placeholder} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories & Tags */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiTag className="text-orange-600" /> Categories & Tags
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
                    <select name="category" value={formData.category} onChange={handleChange} className={inputClass("category")}>
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sub-Category</label>
                    <select name="subCategory" value={formData.subCategory} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">Select Sub-Category</option>
                      {subCategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Brand name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="tag1, tag2, tag3" />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiImage className="text-pink-600" /> Images
                </h2>

                {/* Existing + Temp Images Grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                  {/* Existing Images */}
                  {formData.images.map((image, i) => (
                    <div key={`existing-${i}`} className="relative group aspect-square">
                      <img src={image.url} alt={image.alt || ""} className="w-full h-full object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-1">
                        <button type="button" onClick={() => handleSetPrimary(image.url)}
                          className={`px-2 py-1 text-xs rounded ${image.isPrimary ? "bg-green-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}>
                          {image.isPrimary ? "Primary" : "Set Main"}
                        </button>
                        <button type="button" onClick={() => handleRemoveImage(image.url)}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                      {image.isPrimary && (
                        <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">Main</span>
                      )}
                    </div>
                  ))}

                  {/* Temp Images */}
                  {tempImageFiles.map((image, i) => (
                    <div key={`temp-${i}`} className="relative group aspect-square">
                      <img src={image.url} alt="" className="w-full h-full object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-1">
                        <button type="button" onClick={() => handleSetPrimary(image.url, true)}
                          className={`px-2 py-1 text-xs rounded ${image.isPrimary ? "bg-green-500 text-white" : "bg-white text-gray-700"}`}>
                          {image.isPrimary ? "Primary" : "Set Main"}
                        </button>
                        <button type="button" onClick={() => handleRemoveImage(image.url, true)}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Upload Button */}
                  <label className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition">
                    <FiUpload className="text-gray-400 mb-1" size={22} />
                    <span className="text-xs text-gray-500">Add</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-gray-400">JPEG, PNG, GIF, WebP • Max 5MB each</p>
              </div>

              {/* Variants */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiShoppingCart className="text-indigo-600" /> Variants
                </h2>

                {/* Existing Variants */}
                {formData.variants.length > 0 && (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Value</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">SKU</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Price</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Qty</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {formData.variants.map((v, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2">{v.name}</td>
                            <td className="px-3 py-2">{v.value}</td>
                            <td className="px-3 py-2 text-gray-500">{v.sku || "-"}</td>
                            <td className="px-3 py-2">{v.price ? `₹${v.price}` : "-"}</td>
                            <td className="px-3 py-2">{v.quantity || "-"}</td>
                            <td className="px-3 py-2">
                              <button type="button" onClick={() => handleRemoveVariant(i)} className="text-red-500 hover:text-red-700">
                                <FiTrash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add Variant Form */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <input type="text" placeholder="Name (Size)" value={newVariant.name}
                    onChange={e => setNewVariant(p => ({ ...p, name: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm" />
                  <input type="text" placeholder="Value (XL)" value={newVariant.value}
                    onChange={e => setNewVariant(p => ({ ...p, value: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm" />
                  <input type="text" placeholder="SKU" value={newVariant.sku}
                    onChange={e => setNewVariant(p => ({ ...p, sku: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm" />
                  <input type="number" placeholder="Price" value={newVariant.price}
                    onChange={e => setNewVariant(p => ({ ...p, price: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm" />
                  <input type="number" placeholder="Qty" value={newVariant.quantity}
                    onChange={e => setNewVariant(p => ({ ...p, quantity: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm" />
                  <button type="button" onClick={handleAddVariant}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-1">
                    <FiPlus size={16} /> Add
                  </button>
                </div>
              </div>

              {/* Attributes */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">Attributes</h2>

                {formData.attributes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.attributes.map((attr, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                        <strong>{attr.name}:</strong> {attr.value}
                        {attr.isFilterable && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Filter</span>}
                        <button type="button" onClick={() => handleRemoveAttribute(i)} className="text-red-500 hover:text-red-700 ml-1">
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input type="text" placeholder="Name (RAM)" value={newAttribute.name}
                    onChange={e => setNewAttribute(p => ({ ...p, name: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm" />
                  <input type="text" placeholder="Value (8GB)" value={newAttribute.value}
                    onChange={e => setNewAttribute(p => ({ ...p, value: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm" />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={newAttribute.isFilterable}
                      onChange={e => setNewAttribute(p => ({ ...p, isFilterable: e.target.checked }))}
                      className="rounded" /> Filterable
                  </label>
                  <button type="button" onClick={handleAddAttribute}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-1">
                    <FiPlus size={16} /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* ========== SIDEBAR (1/3) ========== */}
            <div className="space-y-6">
              
              {/* Status & Visibility */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">Status & Visibility</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="outOfStock">Out of Stock</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Visibility</label>
                    <select name="visibility" value={formData.visibility} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                      <option value="schedule">Schedule</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Publish Date</label>
                    <input type="date" name="publishedAt" value={formData.publishedAt} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="font-medium">Featured Product</span>
                  </label>
                </div>
              </div>

              {/* SEO */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">SEO</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Title</label>
                    <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange}
                      maxLength={70} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <p className="text-xs text-gray-400 mt-1">{(formData.metaTitle || "").length}/70</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                    <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange}
                      rows={2} maxLength={160} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <p className="text-xs text-gray-400 mt-1">{(formData.metaDescription || "").length}/160</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Keywords (comma separated)</label>
                    <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="keyword1, keyword2" />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiTruck className="text-teal-600" /> Shipping
                </h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Weight</label>
                      <input type="number" value={formData.weight.value}
                        onChange={e => handleNestedChange("weight", "value", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm" step="0.01" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Unit</label>
                      <select value={formData.weight.unit} onChange={e => handleNestedChange("weight", "unit", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm">
                        <option value="kg">kg</option><option value="g">g</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Dimensions (L×W×H)</label>
                    <div className="grid grid-cols-3 gap-1">
                      <input type="number" value={formData.dimensions.length} onChange={e => handleNestedChange("dimensions", "length", e.target.value)}
                        placeholder="L" className="px-3 py-2 border rounded-lg text-sm" />
                      <input type="number" value={formData.dimensions.width} onChange={e => handleNestedChange("dimensions", "width", e.target.value)}
                        placeholder="W" className="px-3 py-2 border rounded-lg text-sm" />
                      <input type="number" value={formData.dimensions.height} onChange={e => handleNestedChange("dimensions", "height", e.target.value)}
                        placeholder="H" className="px-3 py-2 border rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Shipping Class</label>
                    <select name="shippingClass" value={formData.shippingClass} onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="standard">Standard</option><option value="express">Express</option>
                      <option value="free">Free</option><option value="pickup">Pickup</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="freeShipping" checked={formData.freeShipping} onChange={handleChange} className="rounded" /> Free Shipping
                  </label>
                </div>
              </div>

              {/* Discount */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4">Discount</h2>
                <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
                  <input type="checkbox" checked={formData.discount.isActive}
                    onChange={e => handleDiscountChange("isActive", e.target.checked)} className="rounded" />
                  <span className="font-medium">Enable Discount</span>
                </label>
                {formData.discount.isActive && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <select value={formData.discount.type} onChange={e => handleDiscountChange("type", e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm">
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                      </select>
                      <input type="number" value={formData.discount.value} onChange={e => handleDiscountChange("value", e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm" placeholder="Value" />
                    </div>
                    <input type="datetime-local" value={formData.discount.startDate} onChange={e => handleDiscountChange("startDate", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                    <input type="datetime-local" value={formData.discount.endDate} onChange={e => handleDiscountChange("endDate", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                )}
              </div>

              {/* Additional Settings */}
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiSettings className="text-gray-600" /> Settings
                </h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Min Order</label>
                      <input type="number" name="minOrderQuantity" value={formData.minOrderQuantity} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Max Order</label>
                      <input type="number" name="maxOrderQuantity" value={formData.maxOrderQuantity} onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Unlimited" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isReturnable" checked={formData.isReturnable} onChange={handleChange} className="rounded" /> Returnable
                  </label>
                  {formData.isReturnable && (
                    <input type="number" name="returnPeriod" value={formData.returnPeriod} onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Return period (days)" />
                  )}
                  <div>
                    <label className="block text-xs font-medium mb-1">Warranty (months)</label>
                    <input type="number" value={formData.warranty.period} onChange={e => handleWarrantyChange("period", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-6 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 flex items-center justify-end gap-3">
            <Link to="/admin/products" className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm">
              Cancel
            </Link>
            <button type="submit" disabled={updateMutation.isPending}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50">
              {updateMutation.isPending ? "Updating..." : <><FiSave size={16} /> Update Product</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;