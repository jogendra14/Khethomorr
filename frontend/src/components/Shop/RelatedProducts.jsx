import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../home/trendingProducts/ProductCard";

export default function RelatedProducts({ product: currentProduct }) {
  // Fetch products list
  const { data, isLoading, isError, error, refetch } = useProducts({
    limit: 20,
    sort: "createdAt",
    order: "desc",
  });

  // Extract products array safely
  const allProducts = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.data)) return data.data;
    if (data.pages && Array.isArray(data.pages)) {
      return data.pages.flatMap((page) => page.products || page.data || []);
    }
    return [];
  }, [data]);

  // Helper to extract string/ID comparison value
  const getVal = (val) => {
    if (!val) return "";
    if (typeof val === "object") return String(val._id || val.id || val.name || "").toLowerCase();
    return String(val).toLowerCase();
  };

  // Filter products by same Category
  const relatedProducts = useMemo(() => {
    if (!currentProduct || !allProducts.length) return [];

    const currentId = String(currentProduct._id || currentProduct.id);
    const currentCat = getVal(currentProduct.category);

    return allProducts.filter((p) => {
      const pId = String(p._id || p.id);
      if (pId === currentId) return false; // Exclude current product

      const pCat = getVal(p.category);
      return currentCat && pCat === currentCat;
    });
  }, [allProducts, currentProduct]);

  const categoryName = typeof currentProduct?.category === "object"
    ? currentProduct.category?.name
    : currentProduct?.category;

  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">You May Also Like</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Loading related items...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-64 w-full"></div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-8">
        <p className="text-red-500 text-sm font-medium mb-3">⚠️ {error?.message || "Failed to load related products"}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </section>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">You May Also Like</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Top picks from category {categoryName ? `"${categoryName}"` : ""}
          </p>
        </div>
        <Link
          to="/shop"
          className="text-xs md:text-sm font-semibold text-red-600 hover:text-black transition-colors"
        >
          View All &rarr;
        </Link>
      </div>

      {/* Products Horizontal Slider */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 hide-scrollbar scroll-smooth">
        {relatedProducts.slice(0, 10).map((prod) => (
          <div key={prod._id || prod.id} className="shrink-0">
            <ProductCard product={prod} />
          </div>
        ))}
      </div>
    </section>
  );
}