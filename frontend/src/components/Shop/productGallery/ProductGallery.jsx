import { useState, useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../../../index.css";

export default function ProductGallery({ product }) {
  const images = product.images || [];
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const currentIndex = images.indexOf(selectedImage);
  
  // Touch swipe related states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const imageRef = useRef(null);

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

  // Touch event handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // Swipe left = next image
    const isRightSwipe = distance < -50; // Swipe right = previous image

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }

    // Reset touch values
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="max-w-lg lg:max-w-full lg:h-190 mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Main Image Container */}
      <div 
        ref={imageRef}
        className="relative w-full bg-gray-50  flex aspect-square items-center justify-center "
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Product"
            className="w-full h-full object-cover mb-6 pointer-events-none"
            draggable={false}
          />
        )}

        {/* Mobile Dots Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? "w-6 bg-green-700" : "w-1.5 bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail Slider - only visible on desktop (lg and above) */}
      <div className="hidden lg:flex items-center gap-4 mt-6 px-4 pb-4">
        {/* Left Arrow */}
        <button
          onClick={prevImage}
          className="w-10 h-10 flex items-center justify-center rounded-full border hover:bg-gray-100 shrink-0 disabled:opacity-30"
          disabled={currentIndex === 0}
        >
          <FiChevronLeft />
        </button>

        {/* Thumbnails */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`cursor-pointer rounded-xl shrink-0 overflow-hidden border-2 transition ${
                selectedImage === img ? "border-green-700" : "border-transparent"
              }`}
            >
              <img src={img} alt="" className="w-22 h-20 object-cover" />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextImage}
          className="w-10 h-10 flex items-center justify-center rounded-full border hover:bg-gray-100 shrink-0 disabled:opacity-30"
          disabled={currentIndex === images.length - 1}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}