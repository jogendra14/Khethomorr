import axios from "axios";

const API = axios.create({
  baseURL: "http://10.189.116.49:5000/api",
  withCredentials: true,
});

export default API;