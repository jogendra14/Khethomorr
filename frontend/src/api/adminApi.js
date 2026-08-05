// frontend/src/api/adminApi.js
import API from "./axios";

export const getAdminProfile = async () => {
  const response = await API.get("/admin/profile");
  return response.data;
};

export const updateAdminProfile = async (formData) => {
  const response = await API.put("/admin/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const changeAdminPassword = async (data) => {
  const response = await API.put("/admin/change-password", data);
  return response.data;
};