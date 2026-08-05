import { Copy } from "lucide-react";
import { useDuplicateProduct } from "../../../hooks"; // ✅ React Query hook

export default function DuplicateButton({ id, onDuplicateSuccess }) {
  // ✅ React Query mutation
  const duplicateProduct = useDuplicateProduct();

  const handleDuplicate = async (e) => {
    e.stopPropagation(); // Table row events ko rokne ke liye
    
    const confirmDuplicate = window.confirm(
      "Are you sure you want to duplicate this product?"
    );

    if (!confirmDuplicate) return;

    try {
      // ✅ Use React Query mutation
      await duplicateProduct.mutateAsync(id);
      
      // Parent component ko update karne ke liye callback
      if (onDuplicateSuccess) {
        onDuplicateSuccess();
      }
    } catch (error) {
      // Error is handled by the mutation's onError
      console.error("Duplicate error:", error);
    }
  };

  return (
    <button
      onClick={handleDuplicate}
      disabled={duplicateProduct.isPending}
      className={`bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-all ${
        duplicateProduct.isPending ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title="Duplicate Product"
    >
      {duplicateProduct.isPending ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <Copy size={18} />
      )}
    </button>
  );
}