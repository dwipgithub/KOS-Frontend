import axiosJWT from "./axiosJWT";

export const createPenggunaApi = async (data) => {
    try {
        return axiosJWT.post(`/api/v1/pengguna`, data);
    } catch (error) {
        console.error("Gagal membuat pengguna:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const changePasswordApi = async (data) => {
    try {
        return axiosJWT.patch('/api/v1/pengguna/change-password', data);
    } catch (error) {
        console.error("Gagal mengubah password:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}