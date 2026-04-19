import { getPengenalApi } from "../api/pengenal"

export const getPengenal = async (filters) => {
    try {
        const response = await getPengenalApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data provinsi:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}