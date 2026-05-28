import axiosJWT from "./axiosJWT";

export const getPemasukanApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/pemasukan`, { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data pemasukan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const showPemasukanApi = async (id) => {
    try {
        return axiosJWT.get(`/api/v1/pemasukan/${id}`);
    } catch (error) {
        console.error("Gagal mengambil data pemasukan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const createPemasukanApi = async (data) => {
    try {
        return axiosJWT.post(`/api/v1/pemasukan`, data);
    } catch (error) {
        console.error("Gagal membuat pemasukan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const deletePemasukanApi = async (id) => {
    try {
        return axiosJWT.delete(`/api/v1/pemasukan/${id}`);
    } catch (error) {
        console.error("Gagal menghapus pemasukan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" }; 
    }
}