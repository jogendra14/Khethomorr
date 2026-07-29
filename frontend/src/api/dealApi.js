import API from "./axios";

//Add Product API server ko data send krna 
export const addDeal = async (formData) => {
  const response = await API.post("/deals", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};


// Get Product API server se data mangwana
export const getDealById = async (id) => {
  const res = await API.get(`/deals/${id}`);
  return res.data;
};

//UpdateProduct API server pr data update krna 
export const updateDeal = async (id, data) => {
  const res = await API.put(`/deals/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

//DeleteProduct API database se data delete krna 
export const deleteDeal = async (id) => {
  const res = await API.delete(`/deals/${id}`);
  return res.data;
};

