import axiosJWT from "./axiosJWT";

export const getPropertiApi = async (filters = {}) => {
    try {
        return axiosJWT.get("/api/v1/properti", { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const getPropertiByIdApi = async (id) => {
    try {
        return axiosJWT.get(`/api/v1/properti/${id}`);
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const createPropertiApi = async (data) => {
    try {
        return axiosJWT.post(`/api/v1/properti`, data);
    } catch (error) {
        console.error("Gagal membuat properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const updatePropertiApi = async (id, data) => {
    try {
        return axiosJWT.patch(`/api/v1/properti/${id}`, data);
    } catch (error) {
        console.error("Gagal memperbarui properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

// import axios from "axios";
// import { tokenUser } from "./auth";

// const axiosJWT = axios.create({
//     baseURL: process.env.REACT_APP_BASE_URL,
//     withCredentials: true
// });

// axiosJWT.interceptors.request.use(
//     async (config) => {
//         const response = await tokenUser(); // ✅ tunggu token dulu
//         const token = response.data.data.access_token;
//         config.headers.Authorization = `Bearer ${token}`;
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// )

// export const getProperti = async (filters = {}) => {
//     try {
//         const response = await axiosJWT.get(`/api/v1/properti`, {
//             params: filters,
//         });
//         return response.data;
//     } catch (error) {
//         console.error("Gagal mengambil data properti:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }

// export const getPropertiById = async (id) => {
//     try {
//         const response = await axiosJWT.get(`/api/v1/properti/${id}`);
//         return response.data;
//     } catch (error) {
//         console.error("Gagal mengambil data properti:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }

// export const createProperti = async (data) => {
//     try {
//         const response = await axiosJWT.post(`/api/v1/properti`, data);
//         return response.data;
//     } catch (error) {
//         console.error("Gagal membuat properti:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }

// export const updateProperti = async (id, data) => {
//     try {
//         const response = await axiosJWT.patch(`/api/v1/properti/${id}`, data);
//         return response.data;
//     } catch (error) {
//         console.error("Gagal memperbarui properti:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }