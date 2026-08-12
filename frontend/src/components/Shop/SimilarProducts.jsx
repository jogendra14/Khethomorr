import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../home/trendingProducts/ProductCard";

export default function SimilarProducts({ product }) {
  // Fetch products list
  const { data, isLoading, isError, error, refetch } = useProducts({
    limit: 30,
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

  // Filter products by same subCategory (or category + subCategory)
  const similarProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];

    const currentId = String(product._id || product.id);
    const currentCat = getVal(product.category);
    const currentSubCat = getVal(product.subCategory);

    return allProducts.filter((p) => {
      const pId = String(p._id || p.id);
      if (pId === currentId) return false; // Exclude current product

      const pCat = getVal(p.category);
      const pSubCat = getVal(p.subCategory);

      // Match subCategory if current product has a subCategory
      if (currentSubCat && pSubCat) {
        return pSubCat === currentSubCat;
      }

      // Fallback: match category
      return currentCat && pCat === currentCat;
    });
  }, [allProducts, product]);

  const subCatName = typeof product?.subCategory === "object"
    ? product.subCategory?.name
    : product?.subCategory;

  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Similar Products</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Loading recommendation items...</p>
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
        <p className="text-red-500 text-sm font-medium mb-3">⚠️ {error?.message || "Failed to load similar products"}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </section>
    );
  }

  if (similarProducts.length === 0) {
    return (
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Similar Products</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              No similar products found in {subCatName ? `"${subCatName}"` : "this sub-category"}.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs md:text-sm font-semibold text-red-600 hover:text-black transition-colors"
          >
            Explore Shop &rarr;
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Similar Products</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Handpicked items matching {subCatName ? `sub-category "${subCatName}"` : "your interest"}
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
        {similarProducts.slice(0, 10).map((productItem) => (
          <div key={productItem._id || productItem.id} className="flex-shrink-0">
            <ProductCard product={productItem} />
          </div>
        ))}
      </div>
    </section>
  );
}