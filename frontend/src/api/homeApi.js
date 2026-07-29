import API from "./axios.js";

export const getHomeContent = async () => {
  const { data } = await API.get("/home");
  return data;
};
