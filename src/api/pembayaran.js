import axios from "axios";
import { tokenUser } from "./auth";

const axiosJWT = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    withCredentials: true
});

axiosJWT.interceptors.request.use(
    async (config) => {
        const response = await tokenUser(); // ✅ tunggu token dulu
        const token = response.data.data.access_token;
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

/** @param {FormData} data — multipart dengan bukti bayar (wajib) */
export const createPembayaran = async (data) => {
    try {
        const response = await axiosJWT.post(`/api/v1/pembayaran`, data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat pembayaran:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}