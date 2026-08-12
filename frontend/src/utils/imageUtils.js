/**
 * Safely resolves a product or category image URL.
 * Handles string URLs, object image representations ({ url, src, etc }),
 * relative backend paths (/uploads/products/...), and full HTTP URLs.
 */
export const getImageUrl = (imageSource, fallback = "/placeholder-image.jpg") => {
  if (!imageSource) return fallback;

  let rawPath = "";

  // If passed a product object with .images or image object with .url
  if (Array.isArray(imageSource)) {
    if (imageSource.length === 0) return fallback;
    const primary = imageSource.find((img) => img?.isPrimary);
    const chosen = primary || imageSource[0];
    rawPath = typeof chosen === "string" ? chosen : chosen?.url || chosen?.src || "";
  } else if (typeof imageSource === "object") {
    if (Array.isArray(imageSource.images) && imageSource.images.length > 0) {
      return getImageUrl(imageSource.images, fallback);
    }
    rawPath = imageSource.url || imageSource.src || imageSource.image || "";
  } else if (typeof imageSource === "string") {
    rawPath = imageSource;
  }

  if (!rawPath || typeof rawPath !== "string") {
    return fallback;
  }

  // If already absolute URL or base64 data URI
  if (
    rawPath.startsWith("http://") ||
    rawPath.startsWith("https://") ||
    rawPath.startsWith("data:") ||
    rawPath.startsWith("blob:")
  ) {
    return rawPath;
  }

  // Prepend Backend Base URL for relative paths (/uploads/...)
  const backendBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  return `${backendBase}${cleanPath}`;
};
