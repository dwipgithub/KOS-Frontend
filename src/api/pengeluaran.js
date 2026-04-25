import axiosJWT from "./axiosJWT";

export const getPengeluaranApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/pengeluaran`, { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data pengeluaran:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const showPengeluaranApi = async (id) => {
    try {
        return axiosJWT.get(`/api/v1/pengeluaran/${id}`);
    } catch (error) {
        console.error("Gagal mengambil data pengeluaran:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const createPengeluaranApi = async (data) => {
    try {
        return axiosJWT.post(`/api/v1/pengeluaran`, data);
    } catch (error) {
        console.error("Gagal membuat pengeluaran:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}