import { getLaporanArusKasApi } from "../api/laporan-arus-kas"

export const getLaporanArusKas = async (filters) => {
    try {
        const response = await getLaporanArusKasApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data laporan arus kas:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}