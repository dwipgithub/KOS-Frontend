import axiosJWT from "./axiosJWT";

export const getDeskripsiTagihanApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/deskripsi-tagihan`, {
            params: filters,
        });
    } catch (error) {
        console.error("Gagal mengambil data deskripsi tagihan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}