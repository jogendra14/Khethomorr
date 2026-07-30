import { useState, useEffect } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import { getProductById, updateProduct } from "../../../api/productApi";

const categories = [
  "Fans",
  "Lighting",
  "Electricals",
  "Kitchen Appliances",
  "Bathroom Appliances",
  "Solar Product",
  "Smart Home",
  "Safety & Security",
  "Others",
];

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    oldPrice: "",
    newPrice: "",
    brand: "",
    discount: "",
    stock: "",
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);

  
  const handleChange = (e) => {
    const { name, value } = e.target;

    let updated = {
      ...product,
      [name]: value,
    };

    const oldPrice = Number(name === "oldPrice" ? value : updated.oldPrice);
    const newPrice = Number(name === "newPrice" ? value : updated.newPrice);
    const discount = Number(name === "discount" ? value : updated.discount);

    // Old Price + New Price => Discount
    if ((name === "oldPrice" || name === "newPrice") && oldPrice > 0 && newPrice > 0) {
      updated.discount = (((oldPrice - newPrice) / oldPrice) * 100).toFixed(0);
    }

    // Old Price + Discount => New Price
    if (name === "discount" && oldPrice > 0) {
      updated.newPrice = (oldPrice - (oldPrice * discount) / 100).toFixed(2);
    }

    setProduct(updated);
  };
  // -------------------------
  // Fetch Product
  // -------------------------

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);

        setProduct({
          name: data.name || "",
          description: data.description || "",
          category: data.category || "",
          subCategory: data.subCategory || "",
          oldPrice: data.oldPrice || "",
          newPrice: data.newPrice || "",
          brand: data.brand || "",
          discount: data.discount || "",
          stock: data.stock || "",
        });

        setPreview(data.images || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProduct();
  }, [id]);

  // -------------------------
  // Image Upload
  // -------------------------

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    setImages(files);

    const imagePreview = files.map((file) => URL.createObjectURL(file));

    setPreview(imagePreview);
  };

  // -------------------------
  // Remove Image
  // -------------------------

  const removeImage = (index) => {
    const newPreview = [...preview];

    newPreview.splice(index, 1);

    setPreview(newPreview);
  };

  // -------------------------
  // Update Product
  // -------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("category", product.category);
      formData.append("subCategory", product.subCategory);
      formData.append("brand", product.brand);
      formData.append("oldPrice", product.oldPrice);
      formData.append("newPrice", product.newPrice);
      formData.append("discount", product.discount);
      formData.append("stock", product.stock);

      images.forEach((img) => {
        formData.append("images", img);
      });

      await updateProduct(id, formData);

      alert("Product Updated Successfully");

      navigate("/admin/products");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Product Update Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8">Update Product</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold">Product Name</label>

              <input type="text" name="name" value={product.name} onChange={handleChange} className="w-full mt-2 border rounded-lg p-3" />
            </div>

            <div>
              <label className="font-semibold">Brand</label>

              <input type="text" name="brand" value={product.brand} onChange={handleChange} className="w-full mt-2 border rounded-lg p-3" />
            </div>

            <div>
              <label className="font-semibold">Category</label>

              <select name="category" value={product.category} onChange={handleChange} className="w-full mt-2 border rounded-lg p-3">
                <option value="">Select Category</option>

                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold">Sub-Category</label>

              <select
                name="subCategory"
                value={product.subCategory}
                onChange={handleChange}
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Sub-Category</option>

                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold">Old Price</label>

              <input
                type="number"
                name="oldPrice"
                value={product.oldPrice}
                onChange={handleChange}
                placeholder="₹ Old Price"
                className="w-full mt-2 border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="font-semibold">New Price</label>

              <input
                type="number"
                name="newPrice"
                value={product.newPrice}
                onChange={handleChange}
                placeholder="₹ Selling Price"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold">Discount %</label>

              <input
                type="number"
                name="discount"
                value={product.discount}
                onChange={handleChange}
                placeholder="Discount"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

             <div>
              <label className="font-semibold">Stock</label>

              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                placeholder="Available Stock"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold">Description</label>

            <textarea rows="5" name="description" value={product.description} onChange={handleChange} className="w-full mt-2 border rounded-lg p-3" />
          </div>

          <div>
            <label className="font-semibold">Upload New Images</label>

            <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-52 cursor-pointer hover:border-blue-500">
              <FaUpload className="text-5xl text-blue-600 mb-4" />

              <p>Click to Upload</p>

              <input type="file" multiple hidden onChange={handleImages} />
            </label>
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Images</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {preview.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt="" className="h-36 w-full object-cover rounded-lg border" />

                    <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full">
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg">
            Update Product
          </button>
        </form>
      </div>
    </div>
  );
}
