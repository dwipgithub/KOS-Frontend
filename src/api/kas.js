import axiosJWT from "./axiosJWT";

export const getKasApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/kas`, {
            params: filters,
        });
    } catch (error) {
        console.error("Gagal mengambil data kas:", error);
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

// export const getJenisKelamin = async (filters = {}) => {
//     try {
//         const response = await axiosJWT.get(`/api/v1/jenis-kelamin`, {
//             params: filters,
//         });
//         return response.data;
//     } catch (error) {
//         console.error("Gagal mengambil data jenis kelamin:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }