import { getLaporanLabaRugiApi } from "../api/laporan-laba-rugi"

export const getLaporanLabaRugi = async (filters) => {
    try {
        const response = await getLaporanLabaRugiApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data laporan laba rugi", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

// Backward compatibility for existing imports
export const getLaporanlabaRugi = getLaporanLabaRugi;