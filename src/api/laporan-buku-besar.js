import axiosJWT from "./axiosJWT";

export const getLaporanBukuBesarApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/laporan/buku-besar`, { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data laporan buku besar", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}