import axios from "axios";
import { getAccessToken, tokenUser } from "../services/authService";

const axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    withCredentials: true
});

// REQUEST INTERCEPTOR
axiosJWT.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// interceptor global
axiosJWT.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if ([401, 403].includes(error.response?.status) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await tokenUser();
                const newToken = res.data.data.access_token;

                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                return axiosJWT(originalRequest);
            } catch (err) {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default axiosJWT;