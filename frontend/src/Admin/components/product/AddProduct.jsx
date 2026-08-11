// frontend/src/Admin/pages/AddProduct.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiImage,
  FiPackage,
  FiDollarSign,
  FiTag,
  FiTruck,
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
} from "react-icons/fi";
import { productApi, categoryApi } from "../../../api";

const SECTIONS = {
  basic: "basic",
  pricing: "pricing",
  inventory: "inventory",
  images: "images",
  tags: "tags",
  variants: "variants",
  shipping: "shipping",
  settings: "settings",
  seo: "seo",
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(SECTIONS.basic);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getCategories().then((res) => res.data),
  });
  const categories = categoriesData?.data || [];

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    costPerItem: "",
    sku: "",
    barcode: "",
    quantity: 0,
    lowStockThreshold: 5,
    category: "",
    brand: "",
    tags: [],
    status: "draft",
    isFeatured: false,
    isPhysicalProduct: true,
    weight: { value: "", unit: "kg" },
    dimensions: { length: "", width: "", height: "", unit: "cm" },
    shippingClass: "standard",
    freeShipping: false,
    variants: [],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    minOrderQuantity: 1,
    maxOrderQuantity: "",
    taxClass: "standard",
    isReturnable: true,
    returnPeriod: 30,
    warranty: { period: "", description: "" },
    customFields: {},
  });

  // Variant & Tag temp states
  const [tagInput, setTagInput] = useState("");
  const [newVariant, setNewVariant] = useState({ name: "", value: "", sku: "", price: "", quantity: "" });

  // ========== MUTATION ==========
  const createMutation = useMutation({
    mutationFn: (formDataToSend) => productApi.createProduct(formDataToSend),
    onSuccess: () => {
      toast.success("Product created successfully!");
      setTimeout(() => navigate("/admin/products"), 500);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to create product";
      toast.error(msg);
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
    },
  });

  // ========== HANDLERS ==========
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNestedChange = (parent, child, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [child]: value },
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const invalid = files.filter((f) => !validTypes.includes(f.type));
    if (invalid.length) {
      toast.error("Only JPEG, PNG, GIF, WebP allowed");
      return;
    }

    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length) {
      toast.error("Each image must be under 5MB");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput("");
  };

  const addVariant = () => {
    if (!newVariant.name || !newVariant.value) {
      toast.error("Variant name and value required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant }],
    }));
    setNewVariant({ name: "", value: "", sku: "", price: "", quantity: "" });
  };

  // ========== SUBMIT ==========
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!formData.name.trim()) validationErrors.name = "Product name is required";
    if (!formData.price || formData.price <= 0) validationErrors.price = "Valid price required";
    if (!formData.category) validationErrors.category = "Category is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors");
      return;
    }

    const fd = new FormData();

    // Append all product data
    const productData = {
      ...formData,

      price: parseFloat(formData.price),

      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,

      costPerItem: formData.costPerItem ? parseFloat(formData.costPerItem) : undefined,

      quantity: parseInt(formData.quantity) || 0,

      lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,

      minOrderQuantity: parseInt(formData.minOrderQuantity) || 1,

      maxOrderQuantity: formData.maxOrderQuantity ? parseInt(formData.maxOrderQuantity) : undefined,

      returnPeriod: parseInt(formData.returnPeriod) || 30,

      metaTitle: formData.metaTitle || formData.name,

      metaDescription: formData.metaDescription || formData.shortDescription,

      metaKeywords: formData.metaKeywords ? formData.metaKeywords.split(",").map((k) => k.trim()) : [],

      variants: formData.variants.map((v) => ({
        ...v,
        price: v.price ? parseFloat(v.price) : undefined,
        quantity: v.quantity ? parseInt(v.quantity) : 0,
      })),
    };

    // IMPORTANT:
    // Empty subCategory should not be sent to MongoDB
    if (!productData.subCategory) {
      delete productData.subCategory;
    }

    fd.append("data", JSON.stringify(productData));
    imageFiles.forEach((file) => fd.append("images", file));

    createMutation.mutate(fd);
  };

  // ========== SECTION HEADER ==========
  const SectionHeader = ({ title, section, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveSection(activeSection === section ? "" : section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
    >
      <div className="flex items-center gap-3">
        <Icon className="text-gray-500" size={20} />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {activeSection === section ?
        <FiChevronUp />
      : <FiChevronDown />}
    </button>
  );

  const inputClass = (field) =>
    `w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin/products")} className="p-2 hover:bg-gray-100 rounded-lg">
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Add New Product</h1>
              <p className="text-sm text-gray-500">Fill in the details below</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/admin/products")} className="px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending ?
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>{" "}
                  Saving...
                </>
              : <>
                  <FiSave size={16} /> Save Product
                </>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <SectionHeader title="Basic Information" section={SECTIONS.basic} icon={FiPackage} />
            {activeSection === SECTIONS.basic && (
              <div className="p-6 border-t space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className={inputClass("name")}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Detailed product description"
                    className={inputClass("description")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Short Description</label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Brief summary (max 500 chars)"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select name="category" value={formData.category} onChange={handleChange} className={inputClass("category")}>
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Brand name"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <SectionHeader title="Pricing" section={SECTIONS.pricing} icon={FiDollarSign} />
            {activeSection === SECTIONS.pricing && (
              <div className="p-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Price *", name: "price", error: errors.price },
                  { label: "Compare at Price", name: "compareAtPrice" },
                  { label: "Cost per Item", name: "costPerItem" },
                ].map(({ label, name, error }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className={`${inputClass(name)} pl-8`}
                      />
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <SectionHeader title="Inventory" section={SECTIONS.inventory} icon={FiPackage} />
            {activeSection === SECTIONS.inventory && (
              <div className="p-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "SKU", name: "sku", placeholder: "PROD-001" },
                  { label: "Barcode", name: "barcode", placeholder: "Barcode" },
                  { label: "Quantity", name: "quantity", type: "number" },
                  { label: "Low Stock Alert", name: "lowStockThreshold", type: "number" },
                ].map(({ label, name, type = "text", placeholder }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <SectionHeader title="Product Images" section={SECTIONS.images} icon={FiImage} />
            {activeSection === SECTIONS.images && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={preview} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiTrash2 size={12} />
                      </button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">Main</span>}
                    </div>
                  ))}
                  <label className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition">
                    <FiUpload className="text-gray-400 mb-1" size={24} />
                    <span className="text-xs text-gray-500">Add Image</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-gray-400">JPEG, PNG, GIF, WebP • Max 5MB each</p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <SectionHeader title="Tags" section={SECTIONS.tags} icon={FiTag} />
            {activeSection === SECTIONS.tags && (
              <div className="p-6 border-t">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag(e)}
                    placeholder="Type tag and press Enter"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    <FiPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))}
                        className="text-blue-400 hover:text-red-500"
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <SectionHeader title="Variants" section={SECTIONS.variants} icon={FiSettings} />
            {activeSection === SECTIONS.variants && (
              <div className="p-6 border-t">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Name (Size)"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant((p) => ({ ...p, name: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Value (XL)"
                    value={newVariant.value}
                    onChange={(e) => setNewVariant((p) => ({ ...p, value: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="SKU"
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant((p) => ({ ...p, sku: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant((p) => ({ ...p, price: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <button type="button" onClick={addVariant} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    <FiPlus className="inline" /> Add
                  </button>
                </div>
                {formData.variants.length > 0 && (
                  <div className="space-y-2">
                    {formData.variants.map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm">
                        <span className="font-medium">
                          {v.name}: {v.value}
                        </span>
                        <span className="text-gray-500">
                          {v.sku && `SKU: ${v.sku}`} {v.price && `₹${v.price}`} {v.quantity && `Qty: ${v.quantity}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, variants: prev.variants.filter((_, j) => j !== i) }))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <SectionHeader title="Shipping" section={SECTIONS.shipping} icon={FiTruck} />
            {activeSection === SECTIONS.shipping && (
              <div className="p-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Weight</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={formData.weight.value}
                      onChange={(e) => handleNestedChange("weight", "value", e.target.value)}
                      placeholder="0"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <select
                      value={formData.weight.unit}
                      onChange={(e) => handleNestedChange("weight", "unit", e.target.value)}
                      className="w-20 px-2 py-2 border rounded-lg text-sm"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Dimensions (L×W×H)</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={formData.dimensions.length}
                      onChange={(e) => handleNestedChange("dimensions", "length", e.target.value)}
                      placeholder="L"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(e) => handleNestedChange("dimensions", "width", e.target.value)}
                      placeholder="W"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(e) => handleNestedChange("dimensions", "height", e.target.value)}
                      placeholder="H"
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <select
                      value={formData.dimensions.unit}
                      onChange={(e) => handleNestedChange("dimensions", "unit", e.target.value)}
                      className="w-20 px-2 py-2 border rounded-lg text-sm"
                    >
                      <option value="cm">cm</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Class</label>
                  <select name="shippingClass" value={formData.shippingClass} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="free">Free</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="freeShipping" checked={formData.freeShipping} onChange={handleChange} className="rounded" /> Free Shipping
                </label>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <SectionHeader title="Settings" section={SECTIONS.settings} icon={FiSettings} />
            {activeSection === SECTIONS.settings && (
              <div className="p-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="rounded" /> Featured Product
                </label>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Order Qty</label>
                  <input
                    type="number"
                    name="minOrderQuantity"
                    value={formData.minOrderQuantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Order Qty</label>
                  <input
                    type="number"
                    name="maxOrderQuantity"
                    value={formData.maxOrderQuantity}
                    onChange={handleChange}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2"
            >
              {createMutation.isPending ?
                "Creating..."
              : <>
                  <FiSave /> Create Product
                </>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
