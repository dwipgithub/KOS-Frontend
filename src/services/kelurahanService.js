import { getKelurahanApi } from "../api/kelurahan"

export const getKelurahan = async (filters) => {
    try {
        const response = await getKelurahanApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kelurahan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}