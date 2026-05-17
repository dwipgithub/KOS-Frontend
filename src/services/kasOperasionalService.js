import { getKasOperasionalApi, showKasOperasionalApi, createKasOperasionalApi } from "../api/KasOperasional";

export const getKasOperasional = async (filters = {}) => {
    try {
        const response = await getKasOperasionalApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kas operasional:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const showKasOperasional = async (id) => {
    try {
        const response = await showKasOperasionalApi(id);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data kas operasional:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const createKasOperasional = async (data) => {
    try {
        const response = await createKasOperasionalApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat mutasi kas", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}