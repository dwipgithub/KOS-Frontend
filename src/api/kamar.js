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

export const getKamar = async (filters = {}) => {
    try {
        const response = await axiosJWT.get(`/api/v1/kamar`, {
            params: filters,
        });
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const showKamar = async (id) => {
    try {
        const response = await axiosJWT.get(`/api/v1/kamar/${id}`);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const createKamar = async (data) => {
    try {
        const response = await axiosJWT.post(`/api/v1/kamar`, data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const updateKamar = async (id, data) => {
    try {
        const response = await axiosJWT.put(`/api/v1/kamar/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Gagal memperbarui kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}