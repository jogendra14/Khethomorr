// frontend/src/Admin/components/category/AddCategory.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCategory } from "../../../api/categoryApi";
import { X, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AddCategory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    image: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  // ✅ React Query - Add Category Mutation
  const addCategoryMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category added successfully! ✅");
      navigate("/admin/categories");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add category ❌");
    },
  });

  // ✅ Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Handle image/file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  // ✅ Remove selected image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // ✅ Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    // Prepare form data for API
    const categoryData = {
      name: formData.name.trim(),
      icon: formData.icon.trim() || "",
      image: formData.image.trim() || "",
    };

    // If file selected, send as FormData
    if (selectedFile) {
      const formDataToSend = new FormData();
      formDataToSend.append("name", categoryData.name);
      formDataToSend.append("icon", categoryData.icon);
      formDataToSend.append("image", selectedFile);
      
      addCategoryMutation.mutate(formDataToSend);
    } else {
      // If no file, send as JSON
      addCategoryMutation.mutate(categoryData);
    }
  };

  const { isPending } = addCategoryMutation;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
        <p className="text-gray-500 mt-1">Create a new product category</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Category Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter category name (e.g., Electronics, Fashion, etc.)"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isPending}
            autoFocus
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Category Icon */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category Icon (Emoji or Icon Name)
          </label>
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="e.g., 📦, 🛒, 💻 or fa-solid fa-user"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            disabled={isPending}
          />
          <p className="mt-1 text-xs text-gray-400">
            You can use emoji or FontAwesome icon class name
          </p>
        </div>

        {/* Category Image */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category Image
          </label>
          
          {/* Image Upload Area */}
          {!previewUrl ? (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    SVG, PNG, JPG or WEBP (Max 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isPending}
                />
              </label>
            </div>
          ) : (
            // Image Preview
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Category preview"
                className="w-48 h-48 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                disabled={isPending}
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Preview Section */}
        {(formData.name || formData.icon || previewUrl) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center text-3xl">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Category preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  formData.icon || "📦"
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {formData.name || "Category Name"}
                </p>
                <p className="text-sm text-gray-500">
                  {formData.icon ? `Icon: ${formData.icon}` : "No icon set"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isPending}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              isPending
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding Category...
              </span>
            ) : (
              "Add Category"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            disabled={isPending}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;