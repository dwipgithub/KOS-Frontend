// services/authService.js
import { loginApi, logoutApi, tokenApi } from "../api/authApi";

const ACCESS_TOKEN_KEY = "kos_access_token";
let accessToken = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

// =======================
// TOKEN HELPER
// =======================
export const setAccessToken = (token) => {
    accessToken = token;
    if (typeof window !== "undefined") {
        if (token) {
            localStorage.setItem(ACCESS_TOKEN_KEY, token);
        } else {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
    }
};

export const getAccessToken = () => {
    if (accessToken) return accessToken;
    if (typeof window !== "undefined") {
        accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        return accessToken;
    }
    return null;
};

export const clearAccessToken = () => {
    accessToken = null;
    if (typeof window !== "undefined") {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
};

export const loginUser = async (email, password) => {
    try {
        const res = await loginApi(email, password);
        const data = res.data?.data || res.data;

        if (data?.access_token) {
            setAccessToken(data.access_token);
        }

        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};

export const logoutUser = async() => {
    try {
        const res = await logoutApi();

        // hapus token
        clearAccessToken();

        return res.data;
    } catch (error) {
        console.error("Logout error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};

export const tokenUser = async() => {
    try {
        const response = await tokenApi();

        if (response.data?.data?.access_token) {
            setAccessToken(response.data.data.access_token);
        }

        return response;
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
};