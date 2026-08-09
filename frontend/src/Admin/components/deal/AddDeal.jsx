import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import { dealApi, productApi } from "../../api";

export default function AddDeal() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    title: "", description: "", brand: "", originalPrice: "", dealPrice: "",
    discountType: "percentage", startDate: "", endDate: "",
    productId: "", tags: "", isFeatured: false, priority: 0,
  });

  // Fetch products for dropdown
  const { data: productsData } = useQuery({
    queryKey: ["products-list"],
    queryFn: () => productApi.getProducts({ limit: 100, status: "active" }).then(r => r.data),
  });
  const products = productsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (fd) => dealApi.create(fd),
    onSuccess: () => { toast.success("Deal created!"); navigate("/admin/deals"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.brand || !form.originalPrice || !form.dealPrice) {
      toast.error("Fill required fields"); return;
    }
    if (Number(form.dealPrice) >= Number(form.originalPrice)) {
      toast.error("Deal price must be less than original"); return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "tags") fd.append(k, JSON.stringify(v.split(",").map(t => t.trim()).filter(Boolean)));
      else fd.append(k, v);
    });
    if (imageFile) fd.append("image", imageFile);

    createMutation.mutate(fd);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/admin/deals")} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold">Add New Deal</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Deal title" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand *</label>
            <input name="brand" value={form.brand} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Brand name" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Original Price *</label>
            <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deal Price *</label>
            <input name="dealPrice" type="number" value={form.dealPrice} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Linked Product</label>
            <select name="productId" value={form.productId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">None</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="tag1, tag2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Deal Image</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="" className="w-40 h-28 object-cover rounded-lg border" />
              <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14} /></button>
            </div>
          ) : (
            <label className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center cursor-pointer hover:border-blue-400">
              <Upload size={24} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload</span>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="rounded" /> Featured
          </label>
          <div>
            <label className="block text-xs font-medium mb-1">Priority</label>
            <input name="priority" type="number" value={form.priority} onChange={handleChange} className="w-20 px-2 py-1 border rounded text-sm" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={() => navigate("/admin/deals")} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
          <button type="submit" disabled={createMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 flex items-center gap-2">
            {createMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {createMutation.isPending ? "Creating..." : "Create Deal"}
          </button>
        </div>
      </form>
    </div>
  );
}