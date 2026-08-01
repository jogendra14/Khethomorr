import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

export default function ProductGallery({ product }) {
  const images = product.images || [];
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const currentIndex = images.indexOf(selectedImage);

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1]);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1]);
    }
  };

  return (
    <div>
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        {selectedImage && <img src={selectedImage} alt="Product" className="w-full h-100 object-cover" />}

        {/* Zoom Button */}
        <button className="absolute top-4 right-4 bg-white shadow-md rounded-full p-3 hover:bg-gray-100">
          <FiSearch size={20} />
        </button>
      </div>

      {/* Thumbnail Slider */}
      <div className="flex items-center gap-4 mt-6">
        {/* Left Arrow */}
        <button onClick={prevImage} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">
          <FiChevronLeft />
        </button>

        {/* Thumbnails */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`cursor-pointer rounded-xl overflow-hidden border-2 transition ${selectedImage === img ? "border-green-700" : "border-transparent"}`}
            >
              <img src={img} alt="" className="w-24 h-24 object-cover" />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button onClick={nextImage} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
