import { getJenisKelaminApi } from "../api/jenis-kelamin"

export const getJenisKelamin = async (filters) => {
    try {
        const response = await getJenisKelaminApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data jenis kelamin:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}