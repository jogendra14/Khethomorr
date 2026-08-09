import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import { dealApi, productApi } from "../../api";

export default function EditDeal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    title: "", description: "", brand: "", originalPrice: "", dealPrice: "",
    discountType: "percentage", startDate: "", endDate: "",
    productId: "", tags: "", isFeatured: false, priority: 0, status: "active",
  });

  const { data: productsData } = useQuery({
    queryKey: ["products-list"],
    queryFn: () => productApi.getProducts({ limit: 100 }).then(r => r.data),
  });
  const products = productsData?.data || [];

  const { isLoading } = useQuery({
    queryKey: ["deal", id],
    queryFn: () => dealApi.getById(id).then(res => res.data.data || res.data),
    enabled: !!id,
    onSuccess: (data) => {
      const d = data.data || data;
      setForm({
        title: d.title || "", description: d.description || "", brand: d.brand || "",
        originalPrice: d.originalPrice || "", dealPrice: d.dealPrice || "",
        discountType: d.discountType || "percentage",
        startDate: d.startDate ? new Date(d.startDate).toISOString().split("T")[0] : "",
        endDate: d.endDate ? new Date(d.endDate).toISOString().split("T")[0] : "",
        productId: d.productId || "", tags: d.tags?.join(", ") || "",
        isFeatured: d.isFeatured || false, priority: d.priority || 0, status: d.status || "active",
      });
      if (d.image) setImagePreview(d.image);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (fd) => dealApi.update(id, fd),
    onSuccess: () => { toast.success("Deal updated!"); queryClient.invalidateQueries(["deal", id]); navigate("/admin/deals"); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "tags") fd.append(k, JSON.stringify(v.split(",").map(t => t.trim()).filter(Boolean)));
      else fd.append(k, v);
    });
    if (imageFile) fd.append("image", imageFile);
    updateMutation.mutate(fd);
  };

  if (isLoading) return <div className="p-6 flex justify-center"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/admin/deals")} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold">Edit Deal</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Title *</label><input name="title" value={form.title} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
          <div><label className="block text-sm font-medium mb-1">Brand *</label><input name="brand" value={form.brand} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
          <div><label className="block text-sm font-medium mb-1">Original Price *</label><input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
          <div><label className="block text-sm font-medium mb-1">Deal Price *</label><input name="dealPrice" type="number" value={form.dealPrice} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
          <div><label className="block text-sm font-medium mb-1">Start Date</label><input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">End Date</label><input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="active">Active</option><option value="paused">Paused</option><option value="expired">Expired</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Priority</label><input name="priority" type="number" value={form.priority} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
        </div>

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
              <Upload size={24} className="text-gray-400 mb-2" /><span className="text-sm text-gray-500">Upload image</span>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="rounded" /> Featured Deal
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={() => navigate("/admin/deals")} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
          <button type="submit" disabled={updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 flex items-center gap-2">
            {updateMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Update
          </button>
        </div>
      </form>
    </div>
  );
}