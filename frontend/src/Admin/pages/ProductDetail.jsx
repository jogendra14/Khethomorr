import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, Edit, Trash2, Eye, Package, DollarSign, 
  Tag, Truck, Star, Calendar, Loader2, AlertTriangle,
  Image as ImageIcon, BarChart3, ShoppingBag
} from "lucide-react";
import { productApi } from "../../api";
import toast from "react-hot-toast";

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-100 text-green-700", draft: "bg-yellow-100 text-yellow-700",
    inactive: "bg-gray-100 text-gray-600", outOfStock: "bg-red-100 text-red-700",
  };
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || ""}`}>{status}</span>;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getProductById(id).then(res => res.data.data || res.data),
    enabled: !!id,
  });

  const product = data?.data || data;

  if (isLoading) return (
    <div className="p-6 flex justify-center py-20"><Loader2 className="animate-spin" size={40} /></div>
  );

  if (isError) return (
    <div className="p-6 text-center py-20">
      <AlertTriangle className="mx-auto text-red-400 mb-3" size={48} />
      <p className="text-red-600">{error?.message}</p>
    </div>
  );

  if (!product) return null;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin/products")} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-gray-500 text-sm">Product ID: {product._id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/admin/products/${product._id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">
            <Edit size={16} /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold mb-4">Product Images</h2>
            <div className="grid grid-cols-4 gap-3">
              {product.images?.length > 0 ? product.images.map((img, i) => (
                <img key={i} src={img.url} alt="" className="w-full aspect-square object-cover rounded-lg border" />
              )) : (
                <div className="col-span-4 text-center py-8 text-gray-400">
                  <ImageIcon className="mx-auto mb-2" size={48} />
                  <p>No images</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold mb-3">Description</h2>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{product.description || "No description"}</p>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold mb-4">Variants ({product.variants.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Name</th><th className="p-2 text-left">Value</th>
                      <th className="p-2 text-left">SKU</th><th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {product.variants.map((v, i) => (
                      <tr key={i}>
                        <td className="p-2 font-medium">{v.name}</td><td className="p-2">{v.value}</td>
                        <td className="p-2 text-gray-500">{v.sku || "-"}</td>
                        <td className="p-2 text-right">₹{v.price || product.price}</td>
                        <td className="p-2 text-right">{v.quantity || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={product.status} /></div>
            <div className="flex justify-between"><span className="text-gray-500">Price</span><span className="font-bold">₹{product.price?.toLocaleString()}</span></div>
            {product.compareAtPrice > product.price && (
              <div className="flex justify-between"><span className="text-gray-500">Compare At</span><span className="line-through text-gray-400">₹{product.compareAtPrice?.toLocaleString()}</span></div>
            )}
            <div className="flex justify-between"><span className="text-gray-500">Stock</span><span className={product.quantity === 0 ? "text-red-600" : "text-green-600"}>{product.quantity}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">SKU</span><span className="font-mono text-sm">{product.sku || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Category</span><span>{product.category?.name || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Brand</span><span>{product.brand || "N/A"}</span></div>
            <hr />
            <div className="flex justify-between"><span className="text-gray-500">Total Sold</span><span className="font-bold">{product.totalSold || 0}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Rating</span><span>⭐ {product.averageRating?.toFixed(1) || 0} ({product.totalReviews || 0})</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Featured</span><span>{product.isFeatured ? "✅ Yes" : "❌ No"}</span></div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link to={`/admin/products/${product._id}/edit`} className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-100">
                <Edit size={16} /> Edit Product
              </Link>
              <Link to={`/product/${product.slug || product._id}`} target="_blank" className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2 hover:bg-green-100">
                <Eye size={16} /> View in Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}