// services/authService.js
import { loginApi, logoutApi, tokenApi } from "../api/authApi";

export const loginUser = async (email, password) => {
    try {
        const res = await loginApi(email, password);
        return res.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const logoutUser = async() => {
    try {
        const res = await logoutApi();
        return res.data;
    } catch (error) {
        console.error("Logout error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const tokenUser = async() => {
    try {
        const response = await tokenApi();
        return response
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}