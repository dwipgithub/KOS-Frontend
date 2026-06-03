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

export const destroySewaApi = async (id) => {
    try {
        return axiosJWT.delete('/api/v1/sewa/' + id);
    } catch (error) {
        console.error("Gagal menghapus sewa:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}