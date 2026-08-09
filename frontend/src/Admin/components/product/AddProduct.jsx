// frontend/src/pages/admin/AddProduct.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  FiSave, FiX, FiPlus, FiTrash2, FiUpload, FiImage,
  FiPackage, FiDollarSign, FiTag, FiTruck, FiSettings,
  FiChevronDown, FiChevronUp, FiInfo
} from "react-icons/fi";
import ProductAPI from "../../../api/productApi";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [activeSection, setActiveSection] = useState("basic");

  // Form Data State
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
    quantity: "0",
    lowStockThreshold: "5",
    
    // Category & Brand
    category: "",
    brand: "",
    tags: [],
    
    // Media
    videoUrl: "",
    
    // Variants
    variants: [],
    
    // SEO
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    
    // Shipping
    weight: "",
    weightUnit: "kg",
    length: "",
    width: "",
    height: "",
    dimensionUnit: "cm",
    shippingClass: "standard",
    freeShipping: false,
    
    // Settings
    status: "draft",
    isFeatured: false,
    isPhysicalProduct: true,
    isDigitalProduct: false,
    digitalFileUrl: "",
    
    // Additional
    minOrderQuantity: "1",
    maxOrderQuantity: "",
    taxClass: "standard",
    isReturnable: true,
    returnPeriod: "30",
    warrantyPeriod: "",
    warrantyDescription: "",
    
    // Custom Fields
    customFields: {},
  });

  // Variant State
  const [newVariant, setNewVariant] = useState({
    name: "",
    value: "",
    sku: "",
    price: "",
    quantity: "",
    image: null,
  });

  // Custom Field State
  const [newCustomField, setNewCustomField] = useState({
    key: "",
    value: "",
  });

  // ============================================
  // HANDLERS
  // ============================================

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/avif", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp"];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error("Only JPEG, PNG, GIF, and WebP images are allowed");
      return;
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error("Each image must be less than 5MB");
      return;
    }

    // Create previews
    const newFiles = [...imageFiles, ...files];
    const newPreviews = files.map(file => URL.createObjectURL(file));

    setImageFiles(newFiles);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // Remove Image
  const removeImage = (index) => {
    // Revoke object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Tags
  const addTag = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  // Handle Variants
  const addVariant = () => {
    if (!newVariant.name || !newVariant.value) {
      toast.error("Variant name and value are required");
      return;
    }

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant, id: Date.now() }],
    }));

    // Reset variant form
    setNewVariant({
      name: "",
      value: "",
      sku: "",
      price: "",
      quantity: "",
      image: null,
    });
  };

  const removeVariant = (variantId) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== variantId),
    }));
  };

  // Handle Custom Fields
  const addCustomField = () => {
    if (!newCustomField.key || !newCustomField.value) {
      toast.error("Both key and value are required");
      return;
    }

    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [newCustomField.key]: newCustomField.value,
      },
    }));

    setNewCustomField({ key: "", value: "" });
  };

  const removeCustomField = (key) => {
    setFormData(prev => {
      const updated = { ...prev.customFields };
      delete updated[key];
      return { ...prev, customFields: updated };
    });
  };

  // Handle Form Submit
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (!formData.name.trim()) {
    toast.error("Product name is required");
    return;
  }
  if (!formData.price || formData.price <= 0) {
    toast.error("Valid price is required");
    return;
  }

  setLoading(true);

  try {
    // Create a clean object to send as JSON
    const productData = {
      // Basic Information
      name: formData.name,
      description: formData.description,
      shortDescription: formData.shortDescription,
      
      // Pricing
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      costPerItem: formData.costPerItem ? parseFloat(formData.costPerItem) : undefined,
      
      // Inventory
      sku: formData.sku,
      barcode: formData.barcode,
      quantity: parseInt(formData.quantity) || 0,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
      
      // Category & Brand
      category: formData.category || undefined,
      brand: formData.brand || undefined,
      
      // Status & Visibility
      status: formData.status,
      isFeatured: formData.isFeatured,
      
      // Product Type
      isPhysicalProduct: formData.isPhysicalProduct,
      isDigitalProduct: formData.isDigitalProduct,
      digitalFileUrl: formData.digitalFileUrl || undefined,
      
      // Additional Settings
      minOrderQuantity: parseInt(formData.minOrderQuantity) || 1,
      maxOrderQuantity: formData.maxOrderQuantity ? parseInt(formData.maxOrderQuantity) : undefined,
      taxClass: formData.taxClass,
      isReturnable: formData.isReturnable,
      returnPeriod: parseInt(formData.returnPeriod) || 30,
      
      // Shipping
      shippingClass: formData.shippingClass,
      freeShipping: formData.freeShipping,
      
      // SEO
      metaTitle: formData.metaTitle || formData.name,
      metaDescription: formData.metaDescription || formData.shortDescription,
      metaKeywords: formData.metaKeywords || "",
      
      // Nested objects
      weight: {
        value: parseFloat(formData.weight) || 0,
        unit: formData.weightUnit
      },
      dimensions: {
        length: parseFloat(formData.length) || 0,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
        unit: formData.dimensionUnit
      },
      
      // Warranty
      warranty: {
        period: formData.warrantyPeriod || "",
        description: formData.warrantyDescription || ""
      },
      
      // Tags
      tags: formData.tags,
      
      // Variants (clean up before sending)
      variants: formData.variants.map(v => ({
        name: v.name,
        value: v.value,
        sku: v.sku || "",
        price: v.price ? parseFloat(v.price) : undefined,
        quantity: v.quantity ? parseInt(v.quantity) : 0
      })),
      
      // Custom Fields
      customFields: formData.customFields,
    };

    // Create FormData
    const formDataToSend = new FormData();
    
    // Append all product data as JSON string
    formDataToSend.append('data', JSON.stringify(productData));

    // Append Images
    imageFiles.forEach((file) => {
      formDataToSend.append('images', file);
    });

    // API Call to Create Product
    const response = await ProductAPI.createProduct(formDataToSend);

    toast.success("Product created successfully!");
    
    // Navigate to product list
    setTimeout(() => {
      navigate("/admin/products");
    }, 1000);

  } catch (error) {
    console.error("Error creating product:", error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        "Failed to create product";
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  // ============================================
  // SECTION COMPONENTS
  // ============================================

  const SectionHeader = ({ title, section, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveSection(activeSection === section ? "" : section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {activeSection === section ? <FiChevronUp /> : <FiChevronDown />}
    </button>
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the details to create a new product listing
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiX className="inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiSave className="inline mr-2" />
                {loading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Product"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg shadow">
            <SectionHeader title="Basic Information" section="basic" icon={FiPackage} />
            {activeSection === "basic" && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter product name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Enter detailed product description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Brief product summary"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="home">Home & Garden</option>
                      <option value="books">Books</option>
                      <option value="sports">Sports</option>
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
                      onChange={handleChange}
                      placeholder="Enter brand name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="bg-white rounded-lg shadow">
            <SectionHeader title="Pricing" section="pricing" icon={FiDollarSign} />
            {activeSection === "pricing" && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compare at Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="compareAtPrice"
                        value={formData.compareAtPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost per Item
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="costPerItem"
                        value={formData.costPerItem}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inventory Section */}
          <div className="bg-white rounded-lg shadow">
            <SectionHeader title="Inventory" section="inventory" icon={FiPackage} />
            {activeSection === "inventory" && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU (Stock Keeping Unit)
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="e.g., PROD-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode (ISBN, UPC, etc.)
                    </label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      placeholder="Enter barcode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get alerted when stock reaches this level
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Images Section */}
          <div className="bg-white rounded-lg shadow">
            <SectionHeader title="Product Images" section="images" icon={FiImage} />
            {activeSection === "images" && (
              <div className="p-6 border-t">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiTrash2 size={14} />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                    
                    <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                      <FiUpload className="text-gray-400 mb-2" size={24} />
                      <span className="text-sm text-gray-500">Add Image</span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB per image.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="bg-white rounded-lg shadow">
            <SectionHeader title="Tags" section="tags" icon={FiTag} />
            {activeSection === "tags" && (
              <div className="p-6 border-t">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Type tag and press Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FiPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Variants Section */}
          <div className="bg-white rounded-lg shadow">
            <SectionHeader title="Variants" section="variants" icon={FiPackage} />
            {activeSection === "variants" && (
              <div className="p-6 border-t">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Size"
                        value={newVariant.name}
                        onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Value *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., XL"
                        value={newVariant.value}
                        onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        placeholder="Variant SKU"
                        value={newVariant.sku}
                        onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={newVariant.price}
                        onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newVariant.quantity}
                        onChange={(e) => setNewVariant({ ...newVariant, quantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addVariant}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <FiPlus className="inline mr-1" /> Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Variants List */}
                {formData.variants.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Added Variants ({formData.variants.length})
                    </h3>
                    {formData.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="font-medium">
                            {variant.name}: {variant.value}
                          </span>
                          {variant.sku && <span className="text-gray-600">SKU: {variant.sku}</span>}
                          {variant.price && <span className="text-gray-600">₹{variant.price}</span>}
                          {variant.quantity !== "" && (
                            <span className="text-gray-600">Qty: {variant.quantity}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shipping Section */}
          <div className="bg-white rounded-lg shadow">
            <SectionHeader title="Shipping" section="shipping" icon={FiTruck} />
            {activeSection === "shipping" && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="0"
                        step="0.01"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        name="weightUnit"
                        value={formData.weightUnit}
                        onChange={handleChange}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions (L × W × H)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="length"
                        value={formData.length}
                        onChange={handleChange}
                        placeholder="Length"
                        step="0.1"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        name="width"
                        value={formData.width}
                        onChange={handleChange}
                        placeholder="Width"
                        step="0.1"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="Height"
                        step="0.1"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        name="dimensionUnit"
                        value={formData.dimensionUnit}
                        onChange={handleChange}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Class
                    </label>
                    <select
                      name="shippingClass"
                      value={formData.shippingClass}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
                      <option value="free">Free Shipping</option>
                      <option value="pickup">Local Pickup</option>
                    </select>
                  </div>

                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      name="freeShipping"
                      checked={formData.freeShipping}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Free Shipping
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className="bg-white rounded-lg shadow">
            <SectionHeader title="Product Settings" section="settings" icon={FiSettings} />
            {activeSection === "settings" && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Featured Product (Displayed on homepage)
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Order Quantity
                    </label>
                    <input
                      type="number"
                      name="minOrderQuantity"
                      value={formData.minOrderQuantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      onChange={handleChange}
                      min="0"
                      placeholder="Leave empty for no limit"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons - Bottom */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Product...
                </span>
              ) : (
                <>
                  <FiSave className="inline mr-2" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;