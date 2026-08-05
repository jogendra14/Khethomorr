// frontend/src/api/couponApi.js

import API from "./axios";

// ============================================
// ✅ GET ALL COUPONS (Admin)
// ============================================
export const getCoupons = async () => {
  try {
    const response = await API.get("/admin/coupons");
    return response.data.coupons || response.data || [];
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error.response?.data || { message: "Failed to fetch coupons" };
  }
};

// ============================================
// ✅ GET COUPON BY ID (Admin)
// ============================================
export const getCouponById = async (id) => {
  try {
    if (!id) {
      throw new Error("Coupon ID is required");
    }
    const response = await API.get(`/admin/coupons/${id}`);
    return response.data.coupon || response.data;
  } catch (error) {
    console.error("Error fetching coupon:", error);
    throw error.response?.data || { message: "Failed to fetch coupon" };
  }
};

// ============================================
// ✅ CREATE COUPON (Admin)
// ============================================
export const createCoupon = async (data) => {
  try {
    // Validate required fields
    if (!data.code) {
      throw new Error("Coupon code is required");
    }
    if (!data.discountValue || Number(data.discountValue) <= 0) {
      throw new Error("Valid discount value is required");
    }

    const response = await API.post("/admin/coupons", {
      code: data.code.toUpperCase().trim(),
      discountType: data.discountType || "percentage",
      discountValue: Number(data.discountValue),
      minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
      expiresAt: data.expiresAt || undefined,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error.response?.data || { message: "Failed to create coupon" };
  }
};

// ============================================
// ✅ UPDATE COUPON (Admin)
// ============================================
export const updateCoupon = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Coupon ID is required");
    }
    if (!data.code) {
      throw new Error("Coupon code is required");
    }

    const response = await API.put(`/admin/coupons/${id}`, {
      code: data.code.toUpperCase().trim(),
      discountType: data.discountType || "percentage",
      discountValue: Number(data.discountValue),
      minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
      expiresAt: data.expiresAt || undefined,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    
    return response.data;
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw error.response?.data || { message: "Failed to update coupon" };
  }
};

// ============================================
// ✅ DELETE COUPON (Admin)
// ============================================
export const deleteCoupon = async (id) => {
  try {
    if (!id) {
      throw new Error("Coupon ID is required");
    }
    const response = await API.delete(`/admin/coupons/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error.response?.data || { message: "Failed to delete coupon" };
  }
};

// ============================================
// ✅ VALIDATE COUPON (Public)
// ============================================
export const validateCoupon = async (code, cartTotal) => {
  try {
    if (!code) {
      throw new Error("Coupon code is required");
    }
    const response = await API.post("/coupons/validate", {
      code: code.toUpperCase().trim(),
      cartTotal: Number(cartTotal) || 0,
    });
    return response.data;
  } catch (error) {
    console.error("Error validating coupon:", error);
    throw error.response?.data || { message: "Invalid coupon code" };
  }
};

// ============================================
// ✅ GET ACTIVE COUPONS (Public)
// ============================================
export const getActiveCoupons = async () => {
  try {
    const response = await API.get("/coupons/active");
    return response.data.coupons || response.data || [];
  } catch (error) {
    console.error("Error fetching active coupons:", error);
    throw error.response?.data || { message: "Failed to fetch coupons" };
  }
};

// ============================================
// ✅ APPLY COUPON TO CART
// ============================================
export const applyCoupon = async (code, cartTotal) => {
  try {
    if (!code) {
      throw new Error("Coupon code is required");
    }
    const response = await API.post("/coupons/apply", {
      code: code.toUpperCase().trim(),
      cartTotal: Number(cartTotal) || 0,
    });
    return response.data;
  } catch (error) {
    console.error("Error applying coupon:", error);
    throw error.response?.data || { message: "Failed to apply coupon" };
  }
};

// ============================================
// ✅ EXPORT ALL FUNCTIONS
// ============================================
export default {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
  applyCoupon,
};