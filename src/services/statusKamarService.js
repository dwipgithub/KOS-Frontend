import { getStatusKamarApi } from "../api/status-kamar"

export const getStatusKamar= async (filters = {}) => {
    try {
        const response = await getStatusKamarApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}