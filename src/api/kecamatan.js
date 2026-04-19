import axiosJWT from "./axiosJWT";

export const getKecamatanApi =  async (filters = {}) => {
    try {
        return axiosJWT.get("/api/v1/kecamatan", { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data kecamatan:", error);
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

// export const getKecamatan = async (filters = {}) => {
//     try {
//         const response = await axiosJWT.get(`/api/v1/kecamatan`, {
//             params: filters,
//         });
//         return response.data;
//     } catch (error) {
//         console.error("Gagal mengambil data properti:", error);
//         throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
//     }
// }