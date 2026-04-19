import { getKamarApi, showKamarApi, createKamarApi, updateKamarApi } from "../api/kamar";

export const getKamar = async (filters) => {
    try {
        const response = await getKamarApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const showKamar = async (id) => {
    try {
        const response = await showKamarApi(id);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const createKamar = async (data) => {
    try {
        const response = await createKamarApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}

export const updateKamar = async (id, data) => {
    try {
        const response = await updateKamarApi(id, data);
        return response.data;
    } catch (error) {
        console.error("Gagal memperbarui kamar:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}