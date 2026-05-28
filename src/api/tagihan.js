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

export const deleteTagihanApi = async (id) => {
    try {
        return axiosJWT.delete(`/api/v1/tagihan/${id}`);
    } catch (error) {
        console.error("Gagal menghapus tagihan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" }; 
    }
}