import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiHeart, FiSearch } from "react-icons/fi";
import "../../../index.css"; // Import the CSS file for styling

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
<div class="max-w-lg h-160 mx-auto bg-white rounded-lg shadow-lg overflow-hidden">      {/* Main Image */}
<div class="w-full aspect-square bg-gray-50 flex items-center justify-center p-4">        
  {selectedImage && <img src={selectedImage} alt="Product" className="w-w-full h-full object-contain " />}

        {/* Zoom Button */}
        <button className="absolute top-4 right-4 bg-white shadow-md rounded-full p-3 hover:bg-gray-100">
          <FiSearch size={20} />
        </button>
      </div>

      {/* Thumbnail Slider */}
      <div className="flex items-center gap-4 mt-6 px-4">
        {/* Left Arrow */}
        <button onClick={prevImage} className="w-10 h-10 pl-2.5 rounded-full border hidden lg:block items-center justify-center hover:bg-gray-100">
          <FiChevronLeft className="" />
        </button>

        {/* Thumbnails */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`cursor-pointer rounded-xl shrink-0 overflow-hidden border-2 transition ${selectedImage === img ? "border-green-700" : "border-transparent"}`}
            >
              <img src={img} alt="" className="w-22 h-20 object-cover" />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button onClick={nextImage} className="w-10 h-10 pl-2.5 rounded-full border hidden lg:block items-center justify-center hover:bg-gray-100">
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
