import { useState } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import { addDeal } from "../../api/dealApi";
import { useNavigate } from "react-router-dom";

export default function AddDeal() {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    title: "",
    brand: "",
    price: "",
  });

  const [image, setImage] = useState();
  const [preview, setPreview] = useState();

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleImages = (e) => {
    const file = e.target.files[0];

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("title", product.title);
      formData.append("brand", product.brand);
      formData.append("price", product.price);
      formData.append("image", image);

      const data = await addDeal(formData);

      alert("✅ Product Added Successfully");

      console.log(data);

      // Form Reset
      setProduct({
        title: "",
        brand: "",
        price: "",
      });

      setImage(null);
      setPreview(null);

      // Optional: Add Product ke baad Products page par bhejna
      navigate("/admin/deals");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Product Add Failed");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8">Add New Deal</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold">Deal Name</label>

              <input
                type="text"
                name="title"
                value={product.title}
                onChange={handleChange}
                placeholder="Enter Deal Name"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold">Brand</label>

              <input
                type="text"
                name="brand"
                value={product.brand}
                onChange={handleChange}
                placeholder="Enter Brand"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold">Price</label>

              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                placeholder="₹ Price"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold">Upload Images</label>

            <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-52 cursor-pointer hover:border-blue-500 transition">
              <FaUpload className="text-5xl text-blue-600 mb-4" />

              <p className="font-semibold">Click to Upload Images</p>

              <p className="text-gray-500 text-sm">PNG, JPG, JPEG</p>

              <input type="file" hidden onChange={handleImages} />
            </label>
          </div>

          {preview && (
            <div>
              <h3 className="font-semibold mb-4">Image Preview</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                <div className="relative">
                  <img src={preview} alt="Preview" className="rounded-lg h-36 w-full object-cover border" />

                  <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white px-10 py-3 rounded-lg font-semibold">
            Add Deal
          </button>
        </form>
      </div>
    </div>
  );
}
