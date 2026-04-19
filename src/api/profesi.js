import axiosJWT from "./axiosJWT";

export const getProfesiApi = async (filters = {}) => {
    try {
        return axiosJWT.get(`/api/v1/profesi`, {
            params: filters,
        });
    } catch (error) {
        console.error("Gagal mengambil data jenis profesi:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}
