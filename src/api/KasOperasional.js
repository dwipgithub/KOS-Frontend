import axiosJWT from "./axiosJWT";

export const getKasOperasionalApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/mutasi-kas`, { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data mutasi kas:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const showKasOperasionalApi = async (id) => {
    try {
        return axiosJWT.get(`/api/v1/mutasi-kas/${id}`);
    } catch (error) {
        console.error("Gagal mengambil data mutasi kas:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const createKasOperasionalApi = async (data) => {
    try {
        return axiosJWT.post(`/api/v1/mutasi-kas`, data);
    } catch (error) {
        console.error("Gagal membuat mutasi kas:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}