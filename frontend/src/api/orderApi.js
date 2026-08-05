import API from "./axios";

export const createOrder = async (order) => {
  const { data } = await API.post("/orders", order);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await API.get("/orders/myorders");
  return data;
};
