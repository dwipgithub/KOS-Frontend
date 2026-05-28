import { getDeskripsiTagihanApi } from "../api/deskripsi-tagihan"

export const getDeskripsiTagihan = async (filters) => {
    try {
        const response = await getDeskripsiTagihanApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data deskripsi tagihan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}