import { getKecamatanApi } from "../api/kecamatan"

export const getKecamatan = async (filters) => {
    try {
        const response = await getKecamatanApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kecamatan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}