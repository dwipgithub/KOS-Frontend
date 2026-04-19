// api/authApi.js
import axios from "axios";

export const loginApi = (email, password) => {
    return axios.post("/api/v1/login", { email, password });
}

export const logoutApi = () => {
    return axios.delete("/api/v1/logout");
}

export const tokenApi = () => {
    return axios.get("/api/v1/token");
}