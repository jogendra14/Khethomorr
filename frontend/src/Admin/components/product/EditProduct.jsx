import { useState, useEffect } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import { getProductById, updateProduct } from "../../../api/productApi";

const categoryData = {
  Fans: ["Classic","Designer", "BLDC", "Antique", "Chandelier"],
  Lighting: ["LED Bulbs", "Tube Lights", "Panel Lights", "Flood Lights"],
  Electricals: ["Switches", "Sockets", "MCB", "Wires","Ragulator"],
   Appliances: ["Kitchen", "Bathroom", "Home"],
  "Solar Product": ["Solar Panel", "Solar Inverter", "Solar Battery"],
  "Smart Home": ["Smart Switch", "Smart Plug", "Smart Camera"],
  "Safety & Security": ["CCTV", "Door Lock", "Video Door Phone"],
  Others: ["Accessories", "Spare Parts"],
};


export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    brand: "",
    oldPrice: "",
    newPrice: "",
    discount: "",
    fanSize: "",
    color: "",
    stock: "",
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

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

  // Fetch Product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        setExistingImages(data.images || []);
      } 
      catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to load product data");
      }
    };
    fetchProduct();
  }, [id]);

  // Image Upload
  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    setImages(files);
    const imagePreview = files.map((file) => URL.createObjectURL(file));
    setPreview(imagePreview);
  };

  // Remove Image
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreview = [...preview];

    newImages.splice(index, 1);
    newPreview.splice(index, 1);

    setImages(newImages);
    setPreview(newPreview);
  };

  const removeExistingImage = (index) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  // Update Product
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
      
      formData.append("fanSize", product.fanSize);
      formData.append("stock", product.stock);
      formData.append("color", product.color); 
      
      // Send existing images URLs
      formData.append("existingImages", JSON.stringify(existingImages));
      
      // Send new images
      images.forEach((img) => {
        formData.append("images", img);
      });
      
      await updateProduct(id, formData);

      alert("Product Updated Successfully");

      navigate("/admin/products");
    } 
    catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Product Update Failed");
    }
  };

  // Check if selected category is "Fans"
  const isFanCategory = product.category === "Fans";

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8">Update Product</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
          
           <div>
              <label className="font-semibold">Category</label>

              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>

                {Object.keys(categoryData).map((cat) => (
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
                {product.category &&
                  categoryData[product.category].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </div>

            
            <div>
              <label className="font-semibold">Brand</label>

              <input type="text" name="brand" value={product.brand} onChange={handleChange} className="w-full mt-2 border rounded-lg p-3" />
            </div>


              <div>
              <label className="font-semibold">Product Name</label>

              <input type="text" name="name" value={product.name} onChange={handleChange} className="w-full mt-2 border rounded-lg p-3" />
            </div>
           
            {/* Fan Size - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Fan Size</label>
                <select
                  name="fanSize"
                  value={product.fanSize}
                  onChange={handleChange}
                  className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Fan Size</option>
                  <option value="600">600</option>
                  <option value="900">900</option>
                  <option value="1200">1200</option>
                  <option value="1400">1400</option>
                </select>
              </div>
            )}

            {/* Fan Color - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Fan Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    name="color"
                    value={product.color}
                    onChange={handleChange}
                    placeholder="Color Name"
                    className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

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

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Existing Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.url || img}
                      alt=""
                      className="rounded-lg h-36 w-full object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Images */}
          <div>
            <label className="font-semibold">Upload New Images</label>
            <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-52 cursor-pointer hover:border-blue-500 transition">
              <FaUpload className="text-5xl text-blue-600 mb-4" />
              <p className="font-semibold">Click to Upload Images</p>
              <p className="text-gray-500 text-sm">PNG, JPG, JPEG</p>
              <input type="file" multiple hidden onChange={handleImages} />
            </label>
          </div>

          {/* New Images Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">New Images Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {preview.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt=""
                      className="rounded-lg h-36 w-full object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
                    >
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
