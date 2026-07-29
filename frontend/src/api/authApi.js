import API from "./axios.js";

// Register API server ko data bhejna database me save krna. 
export const registerUser = async (userData) => {
  const { data } = await API.post("/auth/register", userData);
  return data;
};

// Login API server se data mangwana 
export const loginUser = async (userData) => {
  const { data } = await API.post("/auth/login", userData);
  return data;
};