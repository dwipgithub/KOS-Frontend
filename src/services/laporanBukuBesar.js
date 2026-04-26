import { getLaporanBukuBesarApi } from "../api/laporan-buku-besar"

export const getLaporanBukuBesar = async (filters) => {
    try {
        const response = await getLaporanBukuBesarApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data laporan buku besar", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}