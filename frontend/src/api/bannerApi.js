// frontend/src/api/bannerApi.js

import API from "./axios";

// ============================================
// ✅ GET ALL BANNERS (Admin)
// ============================================
export const getBanners = async () => {
  try {
    const response = await API.get("/admin/banners");
    return response.data.banners || response.data || [];
  } catch (error) {
    console.error("Error fetching banners:", error);
    throw error.response?.data || { message: "Failed to fetch banners" };
  }
};

// ============================================
// ✅ GET BANNER BY ID (Admin)
// ============================================
export const getBannerById = async (id) => {
  try {
    if (!id) {
      throw new Error("Banner ID is required");
    }
    const response = await API.get(`/admin/banners/${id}`);
    return response.data.banner || response.data;
  } catch (error) {
    console.error("Error fetching banner:", error);
    throw error.response?.data || { message: "Failed to fetch banner" };
  }
};

// ============================================
// ✅ CREATE BANNER (Admin)
// ============================================
export const createBanner = async (data) => {
  try {
    // Validate required fields
    if (!data.title) {
      throw new Error("Banner title is required");
    }
    if (!data.image) {
      throw new Error("Banner image is required");
    }

    // Create FormData for image upload
    const formData = new FormData();
    formData.append("title", data.title.trim());
    formData.append("subtitle", data.subtitle?.trim() || "");
    formData.append("link", data.link?.trim() || "");
    formData.append("position", data.position || "home");
    formData.append("isActive", data.isActive !== undefined ? data.isActive : true);
    formData.append("order", Number(data.order) || 0);

    // If image is a File object (from input), append it
    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else if (typeof data.image === "string") {
      // If image is a base64 string or URL
      formData.append("image", data.image);
    }

    const response = await API.post("/admin/banners", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating banner:", error);
    throw error.response?.data || { message: "Failed to create banner" };
  }
};

// ============================================
// ✅ UPDATE BANNER (Admin)
// ============================================
export const updateBanner = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Banner ID is required");
    }
    if (!data.title) {
      throw new Error("Banner title is required");
    }

    // Create FormData for image upload
    const formData = new FormData();
    formData.append("title", data.title.trim());
    formData.append("subtitle", data.subtitle?.trim() || "");
    formData.append("link", data.link?.trim() || "");
    formData.append("position", data.position || "home");
    formData.append("isActive", data.isActive !== undefined ? data.isActive : true);
    formData.append("order", Number(data.order) || 0);

    // Only append image if it's a new file upload
    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else if (typeof data.image === "string" && data.image.startsWith("data:image")) {
      // If it's a new base64 image
      formData.append("image", data.image);
    }
    // If image is an existing URL string, don't append it (keep existing)

    const response = await API.put(`/admin/banners/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error.response?.data || { message: "Failed to update banner" };
  }
};

// ============================================
// ✅ DELETE BANNER (Admin)
// ============================================
export const deleteBanner = async (id) => {
  try {
    if (!id) {
      throw new Error("Banner ID is required");
    }
    const response = await API.delete(`/admin/banners/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error.response?.data || { message: "Failed to delete banner" };
  }
};

// ============================================
// ✅ GET ACTIVE BANNERS (Public)
// ============================================
export const getActiveBanners = async (position) => {
  try {
    const params = position ? { position } : {};
    const response = await API.get("/banners/active", { params });
    return response.data.banners || response.data || [];
  } catch (error) {
    console.error("Error fetching active banners:", error);
    throw error.response?.data || { message: "Failed to fetch banners" };
  }
};

// ============================================
// ✅ GET BANNERS BY POSITION (Public)
// ============================================
export const getBannersByPosition = async (position) => {
  try {
    if (!position) {
      throw new Error("Position is required");
    }
    const response = await API.get(`/banners/position/${position}`);
    return response.data.banners || response.data || [];
  } catch (error) {
    console.error("Error fetching banners by position:", error);
    throw error.response?.data || { message: "Failed to fetch banners" };
  }
};

// ============================================
// ✅ UPDATE BANNER STATUS (Admin)
// ============================================
export const updateBannerStatus = async (id, isActive) => {
  try {
    if (!id) {
      throw new Error("Banner ID is required");
    }
    const response = await API.patch(`/admin/banners/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error("Error updating banner status:", error);
    throw error.response?.data || { message: "Failed to update banner status" };
  }
};

// ============================================
// ✅ REORDER BANNERS (Admin)
// ============================================
export const reorderBanners = async (ids) => {
  try {
    if (!ids || ids.length === 0) {
      throw new Error("Banner IDs are required");
    }
    const response = await API.put("/admin/banners/reorder", { ids });
    return response.data;
  } catch (error) {
    console.error("Error reordering banners:", error);
    throw error.response?.data || { message: "Failed to reorder banners" };
  }
};

// ============================================
// ✅ EXPORT ALL FUNCTIONS
// ============================================
export default {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getActiveBanners,
  getBannersByPosition,
  updateBannerStatus,
  reorderBanners,
};