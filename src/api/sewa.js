import axiosJWT from "./axiosJWT";

export const getSewaApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/sewa`, { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data sewa:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const showSewaApi = async (id) => {
    try {
        return axiosJWT.get(`/api/v1/sewa/${id}`);
    } catch (error) {
        console.error("Gagal mengambil data sewa:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const createSewaApi = async (data) => {
    try {
        return axiosJWT.post(`/api/v1/sewa`, data);
    } catch (error) {
        console.error("Gagal membuat sewa:", error);
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

// export const getSewa = async (filters = {}) => {
//     try {
//         const response = await axiosJWT.get(`/api/v1/sewa`, {
//             params: filters,
//         });
//         return response.data;
//     } catch (error) {
//         console.error("Gagal mengambil data sewa:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }

// export const showSewa = async (id) => {
//     try {
//         const response = await axiosJWT.get(`/api/v1/sewa/${id}`);
//         return response.data;
//     } catch (error) {
//         console.error("Gagal mengambil data sewa:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }

// export const createSewa = async (data) => {
//     try {
//         const response = await axiosJWT.post(`/api/v1/sewa`, data);
//         return response.data;
//     } catch (error) {
//         console.error("Gagal membuat sewa:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }