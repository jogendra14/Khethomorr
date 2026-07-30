import axios from "axios";

const API = axios.create({
  baseURL: "https://khethomorr.onrender.com",
  withCredentials: true,
});

export default API;