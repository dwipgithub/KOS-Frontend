import axiosJWT from "./axiosJWT";

export const getKategoriPengeluaran = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/kategori-pengeluaran`, {
            params: filters,
        });
    } catch (error) {
        console.error("Gagal mengambil data kategori pengeluaran:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}