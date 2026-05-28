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

export const getPenggunaAPI = async () => {
    try {
        return axiosJWT.get('/api/v1/pengguna')
    } catch (error) {
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const showPenggunaAPI = async (id) => {
    try {
        return axiosJWT.get(`/api/v1/pengguna/${id}`)
    } catch (error) {
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}