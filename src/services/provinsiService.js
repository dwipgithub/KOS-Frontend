import { getProvinsiApi } from "../api/provinsi"

export const getProvinsi = async (filters) => {
    try {
        const response = await getProvinsiApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data provinsi:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}