import { useState } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import { addProduct } from "../../../api/productApi";
import { useNavigate } from "react-router-dom";

const categoryData = {
  Fans: ["Ceiling Fans", "Table Fans", "Wall Fans", "Exhaust Fans"],
  Lighting: ["LED Bulbs", "Tube Lights", "Panel Lights", "Flood Lights"],
  Electricals: ["Switches", "Sockets", "MCB", "Wires"],
  "Kitchen Appliances": ["Mixer Grinder", "Induction Cooktop", "Electric Kettle"],
  "Bathroom Appliances": ["Water Heater", "Hand Dryer", "Exhaust Fan"],
  "Solar Product": ["Solar Panel", "Solar Inverter", "Solar Battery"],
  "Smart Home": ["Smart Switch", "Smart Plug", "Smart Camera"],
  "Safety & Security": ["CCTV", "Door Lock", "Video Door Phone"],
  Others: ["Accessories", "Spare Parts"],
};

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
    size: "",
    stock: "",
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [feature, setFeature] = useState("");
  const [colors, setColors] = useState([{ name: "", code: "#000000" }]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    let updated = {
      ...product,
      [name]: value,
    };

    // Category change hote hi SubCategory reset
    if (name === "category") {
      updated.subCategory = "";
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
      formData.append("subCategory", product.subSategory);
      formData.append("brand", product.brand);
      formData.append("oldPrice", product.oldPrice);
      formData.append("newPrice", product.newPrice);
      formData.append("discount", product.discount);
      formData.append("stock", product.stock);

      images.forEach((img) => {
        formData.append("images", img);
      });

      const data = await addProduct(formData);

      alert("✅ Product Added Successfully");

      console.log(data);

      // Form Reset
      setProduct({
        name: "",
        description: "",
        category: "",
        subCategory: "",
        brand: "",
        price: "",
        discount: "",
        stock: "",
      });

      setImages([]);
      setPreview([]);

      // Optional: Add Product ke baad Products page par bhejna
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Product Add Failed");
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold">Product Name</label>

              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                placeholder="Enter Product Name"
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
              <label className="font-semibold">Fan Size</label>
              <div>
                <select
                  value={feature}
                  onChange={(e) => setFeature(e.target.value)}
                  className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"

                >
                  <option value="">-- Select --</option>
                  <option value="Anti Dust">600</option>
                  <option value="Energy Saving Motors">900</option>
                  <option value="Smart Controls">1200</option>
                  <option value="Premium Design">1400</option>
                </select>  
              </div>         
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

            <div>
              <label className="font-semibold">Fan Color</label>
              <div className="flex justify-between gap-3">
              {colors.map((item, index) => (
                <div key={index} className="flex gap-4 ">
                  <input
                    type="text"
                    placeholder="Color Name"
                    value={item.name}
                    onChange={(e) => {
                      const arr = [...colors];
                      arr[index].name = e.target.value;
                      setColors(arr);
                    }}
                    className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                
                  <input
                    type="color"
                    value={item.code}
                    onChange={(e) => {
                      const arr = [...colors];
                      arr[index].code = e.target.value;
                      setColors(arr);
                    }}
                     className="mt-2 rounded-full h-12  cursor-pointer appearance-none bg-transparent" 
                  />
                  
              </div>
              ))}
                <button onClick={() => setColors([...colors, { name: "", code: "#000000" }])}
                  className="bg-blue-500 hover:bg-blue-600 mt-2 px-3 text-md font-semibold text-white rounded-xl"  
                  >+ Add Color
                </button>
              </div>
            </div>
          </div>

          <div>
              <label className="font-semibold">Description</label>

              <textarea
                rows="3"
                name="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Write Product Description..."
                className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          <div>
            <label className="font-semibold">Upload Images</label>

            <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-52 cursor-pointer hover:border-blue-500 transition">
              <FaUpload className="text-5xl text-blue-600 mb-4" />

              <p className="font-semibold">Click to Upload Images</p>

              <p className="text-gray-500 text-sm">PNG, JPG, JPEG</p>

              <input type="file" multiple hidden onChange={handleImages} />
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

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white px-10 py-3 rounded-lg font-semibold">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}
