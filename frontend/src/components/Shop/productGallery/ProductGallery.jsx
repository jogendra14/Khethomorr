import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getImageUrl } from "../../../utils/imageUtils";
import "../../../index.css";

export default function ProductGallery({ product }) {
  // ✅ Process image URLs through getImageUrl helper
  const images = useMemo(() => {
    const rawImages = product?.images || [];
    if (rawImages.length === 0) return [];
    return rawImages.map((img) => getImageUrl(img));
  }, [product]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // ✅ Reset index when product changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [product]);

  const selectedImage = images[selectedIndex] || "/placeholder-image.jpg";

  // ✅ Navigate to next image
  const nextImage = useCallback(() => {
    if (images.length === 0) return;
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
  }, [images.length]);

  // ✅ Navigate to previous image
  const prevImage = useCallback(() => {
    if (images.length === 0) return;
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, [images.length]);

  // ✅ Touch events for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && selectedIndex < images.length - 1) {
      nextImage();
    }
    if (isRightSwipe && selectedIndex > 0) {
      prevImage();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // ✅ Zoom events
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  // ✅ If no images
  if (!images || images.length === 0) {
    return (
      <div className="max-w-lg lg:max-w-full mx-auto bg-white rounded-md shadow-lg overflow-hidden">
        <div className="relative w-full bg-gray-100 flex aspect-square items-center justify-center">
          <p className="text-gray-500 font-medium">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg lg:max-w-full mx-auto bg-white rounded-md shadow-lg overflow-hidden">
      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="relative w-full bg-white flex aspect-square items-center justify-center overflow-hidden cursor-zoom-in p-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {selectedImage && (
          <div className="relative w-full h-full">
            <img
              src={selectedImage}
              alt={product?.name || 'Product'}
              className={`w-full h-full object-contain transition-transform duration-200 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              draggable={false}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder-image.jpg";
              }}
              style={isZoomed ? {
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
              } : {}}
            />
          </div>
        )}

        {/* Navigation Arrows - Desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg hidden md:flex items-center justify-center transition disabled:opacity-30"
              disabled={selectedIndex === 0}
              aria-label="Previous image"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg hidden md:flex items-center justify-center transition disabled:opacity-30"
              disabled={selectedIndex === images.length - 1}
              aria-label="Next image"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {/* Mobile Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === selectedIndex ? "w-6 bg-red-600" : "w-1.5 bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Slider - Desktop */}
      {images.length > 1 && (
        <div className="hidden lg:flex items-center gap-4 mt-6 px-4 pb-4">
          {/* Left Arrow */}
          <button
            onClick={prevImage}
            className="w-10 h-10 flex items-center justify-center rounded-full border hover:bg-gray-100 shrink-0 disabled:opacity-30 transition"
            disabled={selectedIndex === 0}
            aria-label="Previous image"
          >
            <FiChevronLeft size={20} />
          </button>

          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto hide-scrollbar">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`cursor-pointer rounded-xl shrink-0 overflow-hidden border-2 transition ${
                  selectedIndex === index ? "border-red-600 shadow-lg" : "border-transparent hover:border-gray-300"
                }`}
              >
                <img 
                  src={imgUrl} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-20 h-20 object-contain p-1"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextImage}
            className="w-10 h-10 flex items-center justify-center rounded-full border hover:bg-gray-100 shrink-0 disabled:opacity-30 transition"
            disabled={selectedIndex === images.length - 1}
            aria-label="Next image"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}