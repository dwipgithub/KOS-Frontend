import axios from "axios";
import { tokenUser } from "../services/authService";

const axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    withCredentials: true
});

// interceptor global
axiosJWT.interceptors.request.use(
    async (config) => {
        const response = await tokenUser();
        const token = response.data.data.access_token;

        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosJWT;