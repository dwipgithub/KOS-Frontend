import axiosJWT from "./axiosJWT";

export const getKamarApi = (filters) => {
    try {
        return axiosJWT.get("/api/v1/kamar", { params: filters });
    } catch (error) {
        console.error("Gagal mengambil data kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const showKamarApi = (id) => {
    try {
        return axiosJWT.get(`/api/v1/kamar/${id}`);
    } catch (error) {
        console.error("Gagal mengambil data kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const createKamarApi = (data) => {
    try {
        return axiosJWT.post("/api/v1/kamar", data);
    } catch (error) {
        console.error("Gagal membuat kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const updateKamarApi = (id, data) => {
    try {
        return axiosJWT.patch(`/api/v1/kamar/${id}`, data);
    } catch (error) {
        console.error("Gagal memperbarui kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}