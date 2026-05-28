import axiosJWT from "./axiosJWT";

export const getPengenalApi =  async (filters = {}) => {
    try {
        return axiosJWT.get("/api/v1/pengenal", { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data kelurahan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}