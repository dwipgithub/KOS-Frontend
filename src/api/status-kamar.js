import axiosJWT from "./axiosJWT";

export const getStatusKamarApi = async (filters = {}) => {
    try {
        return axiosJWT.get("/api/v1/status-kamar", { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}