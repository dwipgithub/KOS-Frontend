import { getKabKotaApi } from "../api/kab-kota"

export const getKabKota = async (filters) => {
    try {
        const response = await getKabKotaApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kabkota:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}