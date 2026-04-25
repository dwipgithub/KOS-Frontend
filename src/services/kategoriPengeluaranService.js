import { getKategoriPengeluaran as getKategoriPengeluaranApi } from "../api/kategori-pengeluaran"

export const getKategoriPengeluaran = async (filters) => {
    try {
        const response = await getKategoriPengeluaranApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kategori pengeluaran:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}