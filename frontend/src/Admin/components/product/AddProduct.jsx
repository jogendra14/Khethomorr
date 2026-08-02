// frontend/src/Admin/components/product/AddProduct.jsx

import { useState } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import { addProduct } from "../../../api/productApi";
import { useNavigate } from "react-router-dom";
import { CategoryData } from "../../../data/CategoryData";

const categoryData = CategoryData;

export default function AddProduct() {
  const navigate = useNavigate();

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
    fanWattage: "",
    fanVoltage: "",
    weight: "",
    warranty_guarantee: "",
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

    // Agar category change hoti hai toh subCategory aur brand reset karo
    if (name === "category") {
      updated.subCategory = "";
      updated.brand = "";
    }
   
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

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previewImages = files.map((file) => URL.createObjectURL(file));
    setPreview(previewImages);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreview = [...preview];

    newImages.splice(index, 1);
    newPreview.splice(index, 1);

    setImages(newImages);
    setPreview(newPreview);
  };

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
      formData.append("color", product.color);
      formData.append("fanWattage", product.fanWattage);
      formData.append("fanVoltage", product.fanVoltage);
      formData.append("airDelivery", product.airDelivery);
      formData.append("fanRpm", product.fanRpm);
      formData.append("weight", product.weight);
      formData.append("warranty_guarantee", product.warranty_guarantee);
      formData.append("stock", product.stock);

      images.forEach((img) => {
        formData.append("images", img);
      });

      const data = await addProduct(formData);

      alert("✅ Product Added Successfully");

      console.log(data);
      // Form Reset
      setProduct({
        category: "",
        subCategory: "",
        brand: "",
        name: "",
        fanSize: "",
        color: "",
        fanWattage: "",
        fanVoltage: "",
        airDelivery: "",
        fanRpm: "",
        weight: "",
        oldPrice: "",
        newPrice: "",
        discount: "",
        warranty_guarantee: "",
        stock: "",
        description: "",
      });


      setImages([]);
      setPreview([]);

      // Optional: Add Product ke baad Products page par bhejna
      navigate("/admin/products");
    } 
    catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Product Add Failed");
    }
  };

  const isFanCategory = product.category === "Fans";

    // Current category ke sub-categories aur brands
  const currentCategoryData = product.category ? categoryData[product.category] : null;
  const subCategories = currentCategoryData?.subCategories || [];
  const brands = currentCategoryData?.brands || [];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
             {/* Category */}
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

            {/* Sub-Category - Category select karne ke baad hi show hogi */}
            <div>
              <label className="font-semibold">Sub-Category</label>

              <select
                name="subCategory"
                value={product.subCategory}
                onChange={handleChange}
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!product.category}
              >
                <option value="">
                  {product.category ? "Select Sub-Category" : "Select Category First"}
                </option>
                {subCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

                {/* Brand Category select karne ke baad hi show hogi */}
            <div>
              <label className="font-semibold">Brand</label>

              <select
                name="brand"
                value={product.brand}
                onChange={handleChange}
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!product.category}
              >
                <option value="">
                  {product.category ? "Select Brand" : "Select Category First"}
                </option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
               
             {/* Product Name - Brand select karne ke baad hi show karenge */}
            <div>
              <label className="font-semibold">Product Name</label>
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                placeholder={product.brand ? "Enter Product Name" : "Select Brand First"}
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!product.brand}
              />
            </div>

            {/* Fan Size - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Fan Size</label>
                <div>
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

            {/* Fan wattage - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Fan Wattage</label>
                <div>
                  <select
                    name="fanWattage"
                    value={product.fanWattage}
                    onChange={handleChange}
                    className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Fan Wattage</option>
                    <option value="45">45</option>
                    <option value="50">50</option>
                    <option value="55">55</option>
                    <option value="60">60</option>
                  </select>
                </div>
              </div>
            )}

            {/* Fan Voltage - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Fan Voltage</label>
                <div>
                  <select
                    name="fanVoltage"
                    value={product.fanVoltage}
                    onChange={handleChange}
                    className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Fan Voltage</option>
                    <option value="240">240</option>
                    <option value="250">250</option>
                    <option value="260">260</option>
                    <option value="440">440</option>
                  </select>
                </div>
              </div>
            )}

            {/* Fan Air Delivery - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Air Delivery</label>
                
                <input
                  type="number"
                  name="airDelivery"
                  value={product.airDelivery}
                  onChange={handleChange}
                  placeholder="Air Delivery"
                  className="w-full mt-2 border rounded-lg p-3"
                />
              </div>
            )}

            {/* Fan RPM - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Fan RPMt</label>
                
                <input
                  type="number"
                  name="fanRpm"
                  value={product.fanRpm}
                  onChange={handleChange}
                  placeholder="Fan RPM"
                  className="w-full mt-2 border rounded-lg p-3"
                />
              </div>
            )}

            {/* Fan Weight - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Fan Weight</label>
                
                <input
                  type="number"
                  name="weight"
                  value={product.weight}
                  onChange={handleChange}
                  placeholder="Fan Weight"
                  className="w-full mt-2 border rounded-lg p-3"
                />
              </div>
            )}
           
             {/* Old Price - Brand select ke baad hi show karenge */}
            <div>
              <label className="font-semibold">Old Price</label>

              <input
                type="number"
                name="oldPrice"
                value={product.oldPrice}
                onChange={handleChange}
                placeholder="₹ Old Price"
                className="w-full mt-2 border rounded-lg p-3"
                
                disabled={!product.brand}
              />
            </div>

              {/* New Price */}
            <div>
              <label className="font-semibold">New Price</label>

              <input
                type="number"
                name="newPrice"
                value={product.newPrice}
                onChange={handleChange}
                placeholder="₹ Selling Price"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!product.brand}
              />
            </div>

            {/* Discount */}
            <div>
              <label className="font-semibold">Discount %</label>

              <input
                type="number"
                name="discount"
                value={product.discount}
                onChange={handleChange}
                placeholder="Discount"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!product.brand}
              />
            </div>

            {/* Warranty/Garraty */}
            <div>
              <label className="font-semibold">Warranty/Guarantee</label>

              <input
                type="string"
                name="warranty_guarantee"
                value={product.warranty_guarantee}
                onChange={handleChange}
                placeholder="Warranty/Guarantee Period"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock */}
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

           {/* Description */}
          <div>
            <label className="font-semibold">Description</label>

            <textarea
              rows="3"
              type="text"
              name="description"
              value={product.description}
              onChange={handleChange}
              placeholder="Write Product Description..."
              className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="font-semibold">Upload Images</label>
            <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-52 cursor-pointer hover:border-blue-500 transition">
              <FaUpload className="text-5xl text-blue-600 mb-4" />

              <p className="font-semibold">Click to Upload Images</p>
              <p className="text-gray-500 text-sm">PNG, JPG, JPEG</p>

              <input type="file" multiple hidden onChange={handleImages} disabled={!product.brand}  />
            </label>
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Image Preview</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {preview.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} alt="" className="rounded-lg h-36 w-full object-cover border" />

                    <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full">
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-10 py-3 rounded-lg font-semibold"
            disabled={!product.brand}
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}
