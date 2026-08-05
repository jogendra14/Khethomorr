import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../../../index.css";

export default function ProductGallery({ product }) {
  const images = useMemo(() => product?.images || [], [product]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // ✅ Set initial image when product changes
  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);

  // ✅ Navigate to next image
  const nextImage = useCallback(() => {
    if (images.length === 0) return;
    const currentIndex = images.indexOf(selectedImage);
    if (currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1]);
    }
  }, [images, selectedImage]);

  // ✅ Navigate to previous image
  const prevImage = useCallback(() => {
    if (images.length === 0) return;
    const currentIndex = images.indexOf(selectedImage);
    if (currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1]);
    }
  }, [images, selectedImage]);

  // ✅ Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevImage, nextImage]);

  // ✅ Touch event handlers for swipe
  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, nextImage, prevImage]);

  // ✅ Mouse hover zoom
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsZoomed(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZoomed(false);
  }, []);

  // ✅ Current index for indicators
  const currentIndex = images.indexOf(selectedImage);

  // ✅ If no images
  if (!images || images.length === 0) {
    return (
      <div className="max-w-lg lg:max-w-full mx-auto bg-white rounded-md shadow-lg overflow-hidden">
        <div className="relative w-full bg-gray-100 flex aspect-square items-center justify-center">
          <p className="text-gray-500">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg lg:max-w-full mx-auto bg-white rounded-md shadow-lg overflow-hidden">
      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="relative w-full bg-white flex aspect-square items-center justify-center overflow-hidden cursor-zoom-in"
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
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              draggable={false}
              loading="lazy"
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
              disabled={currentIndex === 0}
              aria-label="Previous image"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg hidden md:flex items-center justify-center transition disabled:opacity-30"
              disabled={currentIndex === images.length - 1}
              aria-label="Next image"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Mobile Dots Indicator */}
        {images.length > 1 && (
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
        )}
      </div>

      {/* Thumbnail Slider - Desktop */}
      {images.length > 1 && (
        <div className="hidden lg:flex items-center gap-4 mt-6 px-4 pb-4">
          {/* Left Arrow */}
          <button
            onClick={prevImage}
            className="w-10 h-10 flex items-center justify-center rounded-full border hover:bg-gray-100 shrink-0 disabled:opacity-30 transition"
            disabled={currentIndex === 0}
            aria-label="Previous image"
          >
            <FiChevronLeft size={20} />
          </button>

          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto hide-scrollbar">
            {images.map((img, index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`cursor-pointer rounded-xl shrink-0 overflow-hidden border-2 transition ${
                  selectedImage === img ? "border-green-700 shadow-lg" : "border-transparent hover:border-gray-300"
                }`}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-22 h-20 object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextImage}
            className="w-10 h-10 flex items-center justify-center rounded-full border hover:bg-gray-100 shrink-0 disabled:opacity-30 transition"
            disabled={currentIndex === images.length - 1}
            aria-label="Next image"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}