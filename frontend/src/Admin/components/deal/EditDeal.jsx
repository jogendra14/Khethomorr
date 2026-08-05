// frontend/src/Admin/components/deal/EditDeal.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getDealById, updateDeal } from "../../../api/dealApi";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const EditDeal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    price: "",
  });
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");

  // ✅ Fetch deal
  const {
    data: deal,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["deal", id],
    queryFn: () => getDealById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Set form data when deal loads
  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || "",
        brand: deal.brand || "",
        price: deal.price || "",
      });
      setExistingImage(deal.image || "");
    }
  }, [deal]);

  // ✅ Update deal mutation
  const updateDealMutation = useMutation({
    mutationFn: ({ id, data }) => updateDeal(id, data),
    onSuccess: () => {
      toast.success("Deal updated successfully! ✅");
      navigate("/admin/deals");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update deal ❌");
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

    const dealData = new FormData();
    dealData.append("title", formData.title);
    dealData.append("brand", formData.brand);
    dealData.append("price", formData.price);
    
    if (image) {
      dealData.append("image", image);
    }

    updateDealMutation.mutate({ id, data: dealData });
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="bg-white rounded-xl shadow p-6 space-y-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
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
          <p className="text-red-600 text-lg mb-2">⚠️ Failed to load deal</p>
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

  const isPending = updateDealMutation.isPending;

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
          <h1 className="text-3xl font-bold">Edit Deal</h1>
          <p className="text-gray-500 mt-1">Update deal details</p>
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
          <label className="block font-medium mb-2">Image</label>
          {existingImage && !image && (
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-2">Current Image</p>
              <img
                src={existingImage}
                alt="Deal"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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
            {isPending ? "Updating..." : "Update Deal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDeal;