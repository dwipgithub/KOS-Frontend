import { getStatusPernikahanApi } from "../api/status-pernikahan"

export const getStatusPernikahan= async (filters = {}) => {
    try {
        const response = await getStatusPernikahanApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}