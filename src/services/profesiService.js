import { getProfesiApi } from "../api/profesi"

export const getProfesi = async (filters) => {
    try {
        const response = await getProfesiApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data profesi:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}