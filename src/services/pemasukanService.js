import { getPemasukanApi, showPemasukanApi, deletePemasukanApi, createPemasukanApi } from "../api/pemasukan";

export const getPemasukan = async (filters = {}) => {
    try {
        const response = await getPemasukanApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data pemasukan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const showPemasukan = async (id) => {
    try {
        const response = await showPemasukanApi(id);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data pemasukan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const createPemasukan = async (data) => {
    try {
        const response = await createPemasukanApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat pemasukan:", error);
        throw error.response?.data || { message: "Terjadi   kesalahan koneksi" };
    } 
}

export const deletePemasukan = async (id) => {
    try {
        const response = await deletePemasukanApi(id);
        return response.data;
    } catch (error) {
        console.error("Gagal menghapus pemasukan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}