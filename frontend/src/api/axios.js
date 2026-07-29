import axios from "axios";

const API = axios.create({
  baseURL: "http://10.43.39.49:5000/api",
  withCredentials: true,
});

export default API;