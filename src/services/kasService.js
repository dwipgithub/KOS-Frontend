import { getKasApi } from "../api/kas"

export const getKas = async (filters) => {
    try {
        const response = await getKasApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kas:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}