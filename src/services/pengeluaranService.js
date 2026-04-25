import { getPengeluaranApi, showPengeluaranApi, createPengeluaranApi } from "../api/pengeluaran";

export const getPengeluaran = async (filters = {}) => {
    try {
        const response = await getPengeluaranApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data pengeluaran:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const showPengeluaran = async (id) => {
    try {
        const response = await showPengeluaranApi(id);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data pengeluaran:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const createPengeluaran = async (data) => {
    try {
        const response = await createPengeluaranApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat pengeluaran:", error);
        throw error.response?.data || { message: "Terjadi   kesalahan koneksi" };
    } 
}