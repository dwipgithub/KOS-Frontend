import axiosJWT from "./axiosJWT";

export const getLaporanLabaRugiApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/laporan/laba-rugi`, { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data laporan laba rugi", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}