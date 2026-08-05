// frontend/src/Admin/components/product/EditProduct.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getProductById, updateProduct } from "../../../api/productApi";
import { getCategories } from "../../../api/categoryApi";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, X } from "lucide-react";

const productTypes = [
  "fan",
  "lighting",
  "electricals",
  "kitchenAppliances",
  "bathroomAppliances",
  "solar",
  "smartHome",
  "safety",
  "others",
];

const warrantyOptions = ["", "warranty", "guarantee"];

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [includeComponents, setIncludeComponents] = useState([""]);

  // ✅ Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Fetch product
  const {
    data: product,
    isLoading: productLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subCategory: "",
    brand: "",
    MRP: "",
    sellingPrice: "",
    discount: "0",
    stock: "",
    description: "",
    productType: "fan",
    choose_W_G: "",
    warranty_guarantee: "",
    color: "",
  });

  // ✅ Set form data when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        subCategory: product.subCategory || "",
        brand: product.brand || "",
        MRP: product.MRP || "",
        sellingPrice: product.sellingPrice || "",
        discount: product.discount || "0",
        stock: product.stock || "",
        description: product.description || "",
        productType: product.productType || "fan",
        choose_W_G: product.choose_W_G || "",
        warranty_guarantee: product.warranty_guarantee || "",
        color: product.color || "",
      });

      setExistingImages(product.images || []);
      
      // ✅ Set specifications
      if (product.specifications && typeof product.specifications === "object") {
        const specs = Object.entries(product.specifications).map(([key, value]) => ({
          key,
          value: typeof value === "string" ? value : JSON.stringify(value),
        }));
        setSpecifications(specs.length > 0 ? specs : [{ key: "", value: "" }]);
      }

      // ✅ Set include components
      if (product.includeComponents && Array.isArray(product.includeComponents)) {
        setIncludeComponents(product.includeComponents.length > 0 ? product.includeComponents : [""]);
      }
    }
  }, [product]);

  // ✅ Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully! ✅");
      navigate("/admin/products");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update product ❌");
      setLoading(false);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSpecificationChange = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const removeSpecification = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComponentChange = (index, value) => {
    const updated = [...includeComponents];
    updated[index] = value;
    setIncludeComponents(updated);
  };

  const addComponent = () => {
    setIncludeComponents([...includeComponents, ""]);
  };

  const removeComponent = (index) => {
    setIncludeComponents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Validate required fields
    const requiredFields = ["name", "category", "brand", "MRP", "sellingPrice", "stock"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`❌ ${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        setLoading(false);
        return;
      }
    }

    // ✅ Build form data
    const productData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== undefined && formData[key] !== "") {
        productData.append(key, formData[key]);
      }
    });

    // ✅ Append existing images
    productData.append("existingImages", JSON.stringify(existingImages));

    // ✅ Append new images
    images.forEach((image) => {
      productData.append("images", image);
    });

    // ✅ Append specifications
    const specObj = {};
    specifications.forEach((spec) => {
      if (spec.key && spec.value) {
        specObj[spec.key] = spec.value;
      }
    });
    productData.append("specifications", JSON.stringify(specObj));

    // ✅ Append include components
    const components = includeComponents.filter((c) => c.trim() !== "");
    if (components.length > 0) {
      productData.append("includeComponents", components.join(","));
    }

    updateProductMutation.mutate({ id, data: productData });
  };

  // ✅ Loading state
  if (productLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6">
                <div className="h-6 w-32 bg-gray-200 rounded mb-5"></div>
                <div className="grid md:grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j}>
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg mb-2">⚠️ Failed to load product</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isPending = updateProductMutation.isPending || loading;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin/products")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-gray-500 mt-1">Update product details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">Basic Information</h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block font-medium mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isPending}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Sub Category</label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Product Type *</label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isPending}
              >
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">Pricing & Stock</h2>

          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-2">MRP *</label>
              <input
                type="number"
                name="MRP"
                value={formData.MRP}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isPending}
                min="0"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Selling Price *</label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isPending}
                min="0"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isPending}
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isPending}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">Product Images</h2>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Current Images</p>
              <div className="flex flex-wrap gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div className="flex flex-wrap gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`New ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                disabled={isPending}
              />
              <Plus size={32} className="text-gray-400" />
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">Upload up to 10 images (PNG, JPG, WEBP)</p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">Description</h2>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed product description..."
            disabled={isPending}
          />
        </div>

        {/* Warranty */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">Warranty Information</h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block font-medium mb-2">Warranty Type</label>
              <select
                name="choose_W_G"
                value={formData.choose_W_G}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isPending}
              >
                {warrantyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option || "None"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Warranty Details</label>
              <input
                type="text"
                name="warranty_guarantee"
                value={formData.warranty_guarantee}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2 years"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">Specifications</h2>

          {specifications.map((spec, index) => (
            <div key={index} className="flex gap-4 mb-3">
              <input
                type="text"
                placeholder="Key"
                value={spec.key}
                onChange={(e) => handleSpecificationChange(index, "key", e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isPending}
              />
              <input
                type="text"
                placeholder="Value"
                value={spec.value}
                onChange={(e) => handleSpecificationChange(index, "value", e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => removeSpecification(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                disabled={specifications.length === 1}
              >
                <X size={20} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSpecification}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            disabled={isPending}
          >
            <Plus size={18} /> Add Specification
          </button>
        </div>

        {/* Include Components */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-5">Include Components</h2>

          {includeComponents.map((component, index) => (
            <div key={index} className="flex gap-4 mb-3">
              <input
                type="text"
                value={component}
                onChange={(e) => handleComponentChange(index, e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Remote Control, User Manual"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => removeComponent(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                disabled={includeComponents.length === 1}
              >
                <X size={20} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addComponent}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            disabled={isPending}
          >
            <Plus size={18} /> Add Component
          </button>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={`px-8 py-3 text-white rounded-lg transition ${
              isPending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPending ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;