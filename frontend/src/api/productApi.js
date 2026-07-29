import API from "./axios";

export const getProducts = async () => {
  const { data } = await API.get("/products");
  return data;
};

//Add Product API server ko data send krna 
export const addProduct = async (formData) => {
  const response = await API.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};


// Get Product API server se data mangwana
export const getProductById = async (id) => {
  const res = await API.get(`/products/${id}`);
  return res.data;
};

//UpdateProduct API server pr data update krna 
export const updateProduct = async (id, data) => {
  const res = await API.put(`/products/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

//DeleteProduct API database se data delete krna 
export const deleteProduct = async (id) => {
  const res = await API.delete(`/products/${id}`);
  return res.data;
};
