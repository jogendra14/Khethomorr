// frontend/src/Admin/components/deal/AddDeal.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { addDeal } from "../../../api/dealApi";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const AddDeal = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    price: "",
  });
  const [image, setImage] = useState(null);

  const addDealMutation = useMutation({
    mutationFn: (data) => addDeal(data),
    onSuccess: () => {
      toast.success("Deal added successfully! ✅");
      navigate("/admin/deals");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to add deal ❌");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = ["title", "brand", "price"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`❌ ${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return;
      }
    }

    if (!image) {
      toast.error("❌ Please select an image");
      return;
    }

    const dealData = new FormData();
    dealData.append("title", formData.title);
    dealData.append("brand", formData.brand);
    dealData.append("price", formData.price);
    dealData.append("image", image);

    addDealMutation.mutate(dealData);
  };

  const isPending = addDealMutation.isPending;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin/deals")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Add Deal</h1>
          <p className="text-gray-500 mt-1">Create a new deal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">
        <div>
          <label className="block font-medium mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
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
          <label className="block font-medium mb-2">Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isPending}
            min="0"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Image *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isPending}
          />
          {image && (
            <p className="text-sm text-green-600 mt-1">✓ {image.name} selected</p>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/deals")}
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
            {isPending ? "Adding..." : "Add Deal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDeal;