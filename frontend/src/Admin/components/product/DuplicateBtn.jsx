// frontend/src/components/admin/DuplicateButton.jsx

import { Copy } from "lucide-react";
import { useState } from "react";
import { duplicateProduct } from "../../../api/productApi";

export default function DuplicateButton({ id, onDuplicateSuccess }) {
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async (e) => {
    e.stopPropagation(); // Table row events ko rokne ke liye
    
    const confirmDuplicate = window.confirm(
      "Are you sure you want to duplicate this product?"
    );

    if (!confirmDuplicate) return;

    setIsDuplicating(true);

    try {
      const response = await duplicateProduct(id);
      
      // ✅ Fix: Success message
      alert(`✅ Product duplicated successfully!`);
      
      // Parent component ko update karne ke liye callback
      if (onDuplicateSuccess) {
        onDuplicateSuccess();
      }
    } 
    catch (error) {
      // ✅ Fix: Better error message
      alert(error.response?.data?.message || "❌ Failed to duplicate product");
      console.error("Duplicate error:", error);
    } 
    finally {
      setIsDuplicating(false);
    }
  };

  return (
    <button
      onClick={handleDuplicate}
      disabled={isDuplicating}
      className={`bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-all ${
        isDuplicating ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title="Duplicate Product"
    >
      <Copy size={18} />
    </button>
  );
}