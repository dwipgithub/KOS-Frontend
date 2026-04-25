import axiosJWT from "./axiosJWT";

export const getLaporanArusKasApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/laporan/arus-kas`, { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data laporan arus kas:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}