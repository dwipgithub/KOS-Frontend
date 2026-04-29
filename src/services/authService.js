// services/authService.js
import { loginApi, logoutApi, tokenApi } from "../api/authApi";

// MEMORY TOKEN (ini inti)
let accessToken = null;

// =======================
// TOKEN HELPER
// =======================
export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => {
    return accessToken;
};

export const clearAccessToken = () => {
    accessToken = null;
};

export const loginUser = async (email, password) => {
    try {
        const res = await loginApi(email, password);

        // simpan ke memory
        setAccessToken(res.data.data.access_token);

        return res.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

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
}

export const tokenUser = async() => {
    try {
        const response = await tokenApi();

        // update token dari refresh
        setAccessToken(response.data.data.access_token);

        return response
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}