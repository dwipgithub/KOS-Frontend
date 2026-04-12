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

export const getPenyewa = async (filters = {}) => {
    try {
        const response = await axiosJWT.get(`/api/v1/penyewa`, {
            params: filters,
        });
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const showPenyewa = async (id) => {
    try {
        const response = await axiosJWT.get(`/api/v1/penyewa/${id}`);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data penyewa:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

/** @param {FormData} data — multipart dengan dokumen pengenal (wajib) */
export const createPenyewa = async (data) => {
    try {
        const response = await axiosJWT.post(`/api/v1/penyewa`, data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat penyewa:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

/** @param {string|number} id @param {FormData|object} data */
export const updatePenyewa = async (id, data) => {
    try {
        const response = await axiosJWT.patch(`/api/v1/penyewa/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Gagal memperbarui penyewa:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}