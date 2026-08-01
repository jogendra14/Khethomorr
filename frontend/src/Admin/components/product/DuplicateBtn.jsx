// components/admin/DuplicateButton.jsx
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
      await duplicateProduct(id);
      
      // Success message
      alert(`Product successfully! New product`);
      
      // Parent component ko update karne ke liye callback
      if (onDuplicateSuccess) {
        onDuplicateSuccess();
      }
    } 
    catch (error) {
      alert(error.response?.data?.message || "Failed to duplicate button duplicate product");
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