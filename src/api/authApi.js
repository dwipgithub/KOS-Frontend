// api/authApi.jsimport axios from "axios";
import axios from "axios";
import axiosJWT from "./axiosJWT";

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    withCredentials: true,
});

export const loginApi = (email, password) => {
    return apiClient.post("/api/v1/login", { email, password });
};

export const logoutApi = () => {
    return axiosJWT.delete("/api/v1/logout");
};

export const tokenApi = () => {
    return apiClient.get("/api/v1/token");
};