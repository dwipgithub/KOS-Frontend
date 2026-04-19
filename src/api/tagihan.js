import axiosJWT from "./axiosJWT";

export const getTagihanApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/tagihan`, {
            params: filters,
        });
    } catch (error) {
        console.error("Gagal mengambil data tagihan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const showTagihanApi = async (id) => {
    try {
        return axiosJWT.get(`/api/v1/tagihan/${id}`);
    } catch (error) {
        console.error("Gagal mengambil data tagihan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const createTagihanApi = async (data) => {
    try {
        return axiosJWT.post(`/api/v1/tagihan`, data);
    } catch (error) {
        console.error   ("Gagal membuat tagihan:", error);
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

// export const getTagihan = async (filters = {}) => {
//     try {
//         const response = await axiosJWT.get(`/api/v1/tagihan`, {
//             params: filters,
//         });
//         return response.data;
//     } catch (error) {
//         console.error("Gagal mengambil data tagihan:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }

// export const showTagihan = async (id) => {
//     try {
//         const response = await axiosJWT.get(`/api/v1/tagihan/${id}`);
//         return response.data;
//     } catch (error) {
//         console.error("Gagal mengambil data tagihan:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }

// export const createTagihan = async (data) => {
//     try {
//         const response = await axiosJWT.post(`/api/v1/tagihan`, data);
//         return response.data;
//     } catch (error) {
//         console.error   ("Gagal membuat tagihan:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }