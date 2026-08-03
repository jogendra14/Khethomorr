// frontend/src/Admin/components/product/AddProduct.jsx

import { useState } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import { addProduct } from "../../../api/productApi";
import { useNavigate } from "react-router-dom";
import { categoryData } from "../../data/categoryData.js";

export default function AddProduct() {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    
      category: "",
      subCategory: "",
      brand: "",
      name: "",
      
      oldPrice: "",
      newPrice: "",
      discount: "",
      rating: "",
      rewiews: "",
      choose_W_G: "",
      warranty_guarantee: "",
      stock: "",
      description: "",

      fanDesign: "",
      color: "",
      motor: "",
      sweepSize: "",
      bladeCount: "",
      material: "",
      fanWattage: "",
      airDelivery: "",
      fanRpm: "",
      weight: "",
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

      formData.append("category", product.category);
      formData.append("subCategory", product.subCategory);
      formData.append("brand", product.brand);
      formData.append("name", product.name);
      
      formData.append("oldPrice", product.oldPrice);
      formData.append("newPrice", product.newPrice);
      formData.append("discount", product.discount);
      formData.append("rating", product.rating);
      formData.append("reviews", product.rewiews);
      
      formData.append("choose_W_G", product.choose_W_G);
      formData.append("warranty_guarantee", product.warranty_guarantee);
      formData.append("stock", product.stock);
      formData.append("description", product.description);

      formData.append("fanDesign", product.fanDesign);
      formData.append("color", product.color);
      formData.append("motor", product.motor);
      formData.append("sweepSize", product.sweepSize);
      formData.append("bladeCount", product.bladeCount);
      formData.append("material", product.material);
      formData.append("fanWattage", product.fanWattage);
      formData.append("airDelivery", product.airDelivery);
      formData.append("fanRpm", product.fanRpm);
      formData.append("weight", product.weight);

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
      
      oldPrice: "",
      newPrice: "",
      discount: "",
      rating: "",
      rewiews: "",
      choose_W_G: "",
      warranty_guarantee: "",
      stock: "",
      description: "",

      fanDesign: "",
      color: "",
      motor: "",
      sweepSize: "",
      bladeCount: "",
      material: "",
      fanWattage: "",
      airDelivery: "",
      fanRpm: "",
      weight: "",
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
                type="text"
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
                type="text"
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
              type="text"
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
                disabled={!product.category}
              />
            </div>

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
                
                disabled={!product.category}
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
                disabled={!product.category}
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
                disabled={!product.category}
              />
            </div>

            {/* rating */}
            <div>
              <label className="font-semibold">Rating</label>

              <input
                type="number"
                name="rating"
                value={product.rating}
                onChange={handleChange}
                placeholder="Rating"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!product.category}
              />
            </div>

            {/* Reviews */}
            <div>
              <label className="font-semibold">Reviews</label>

              <input
                type="number"
                name="reviews"
                value={product.reviews}
                onChange={handleChange}
                placeholder="Reviews"
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!product.category}
              />
            </div>

            {/* Choose Warranty/Guarantee */}
            <div>
                <label className="font-semibold">Choose Warranty/Guarantee</label>
                <div>
                  <select
                    type="string"
                    name="choose_W_G"
                    value={product.choose_W_G}
                    onChange={handleChange}
                    className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Warranty or Guarantee</option>
                    <option value="warranty">Warranty</option>
                    <option value="guarantee">Guarantee</option>
                  </select>
                </div>
              </div>

            {/* Warranty/Garraty */}
            <div>
              <label className="font-semibold">Warranty/Guarantee Period</label>

              <input
                type="string"
                name="warranty_guarantee"
                value={product.warranty_guarantee}
                onChange={handleChange}
                placeholder="Period"
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
         
            {/* Fan Design - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Fan Design</label>
                <div>
                  <select
                    type="string"
                    name="fanDesign"
                    value={product.fanDesign}
                    onChange={handleChange}
                    className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Fan Design</option>
                    <option value="Ceiling">Ceiling Fan</option>
                    <option value="Tower">Tower Fan</option>
                    <option value="Table">Table Fan</option>
                    <option value="Pedestal">Pedestal Fan</option>
                    <option value="Wall Mounted">Wall Mounted Fan</option>
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

             {/* Fan Motor - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Fan Motor</label>
                  <select
                    type="String"
                    name="motor"
                    value={product.motor}
                    onChange={handleChange}
                    className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Motor</option>
                    <option value="Induction">Induction</option>
                    <option value="BLDC">BLDC</option>
                  </select>              
              </div>
            )}

             {/* Fan SweepSize - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Fan Sweep Size</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    name="sweepSize"
                    value={product.sweepSize}
                    onChange={handleChange}
                    placeholder="Enter Seep Size "
                    className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />                
                </div>
              </div>
            )}

             {/* Fan bladeCount - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Blade Count</label>
                 <select
                    type="String"
                    name="bladeCount"
                    value={product.bladeCount}
                    onChange={handleChange}
                    className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Blade Count</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select> 
              </div>
            )}

             {/* Fan Material - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Fan Material</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    name="material"
                    value={product.material}
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
        
                  <input
                  type="string"
                  name="fanWattage"
                  value={product.fanWattage}
                  onChange={handleChange}
                  placeholder="Fan Watttage"
                  className="w-full mt-2 border rounded-lg p-3"
                  disabled={!product.category}
                />
              </div>
            )}

            {/* Fan Air Delivery - Show only when category is Fans */}
            {isFanCategory && (
              <div>
                <label className="font-semibold">Air Delivery</label>
                
                <input
                  type="string"
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
                  type="string"
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
                  type="string"
                  name="weight"
                  value={product.weight}
                  onChange={handleChange}
                  placeholder="Fan Weight"
                  className="w-full mt-2 border rounded-lg p-3"
                />
              </div>
            )}
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

              <input type="file" multiple hidden onChange={handleImages} disabled={!product.category}  />
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
            disabled={!product.category}
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}
