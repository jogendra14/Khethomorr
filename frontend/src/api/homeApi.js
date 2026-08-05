import API from "./axios.js";

export const getHomeContent = async () => {
  const { data } = await API.get("/home");
  return data;
};

export const updateHomeContent = async (content) => {
  const { data } = await API.put("/home", content);
  return data;
};
