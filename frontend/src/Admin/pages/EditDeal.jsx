import { useState, useEffect } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import { getDealById, updateDeal } from "../../api/dealApi";

export default function EditDeal() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState({
    title: "",
    brand: "",
    price: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // -------------------------
  // Fetch Product
  // -------------------------

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const data = await getDealById(id);

        setProduct({
          title: data.title || "",
          brand: data.brand || "",
          price: data.price || "",
        });

        setPreview(data.image);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDeal();
  }, [id]);

  // -------------------------
  // Input Change
  // -------------------------

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  // -------------------------
  // Image Upload
  // -------------------------

  const handleImages = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // -------------------------
  // Remove Image
  // -------------------------
  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };
  // -------------------------
  // Update Product
  // -------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("title", product.title);
      formData.append("brand", product.brand);
      formData.append("price", product.price);
      if (image) {
        formData.append("image", image);
      }

      await updateDeal(id, formData);

      alert("Product Updated Successfully");

      navigate("/admin/deals");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Product Update Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8">Update Deal</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold">Product Name</label>

              <input type="text" name="title" value={product.title} onChange={handleChange} className="w-full mt-2 border rounded-lg p-3" />
            </div>

            <div>
              <label className="font-semibold">Brand</label>

              <input type="text" name="brand" value={product.brand} onChange={handleChange} className="w-full mt-2 border rounded-lg p-3" />
            </div>

            <div>
              <label className="font-semibold">Price</label>

              <input type="number" name="price" value={product.price} onChange={handleChange} className="w-full mt-2 border rounded-lg p-3" />
            </div>

            <div>
              <label className="font-semibold">Upload New Images</label>

              <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-52 cursor-pointer hover:border-blue-500">
                <FaUpload className="text-5xl text-blue-600 mb-4" />

                <p>Click to Upload</p>

                <input type="file" hidden onChange={handleImages} />
              </label>
            </div>

            {preview && (
              <div>
                <h3 className="font-semibold mb-4">Images</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                  <div className="relative">
                    <img src={preview} alt="" className="h-36 w-full object-cover rounded-lg border" />

                    <button type="button" onClick={removeImage()} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg">
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
