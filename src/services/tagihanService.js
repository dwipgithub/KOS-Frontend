import { getTagihanApi, showTagihanApi, createTagihanApi } from "../api/tagihan";

export const getTagihan = async (filters = {}) => {
    try {
        const response = await getTagihanApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const showSewa = async (id) => {
    try {
        const response = await showTagihanApi(id);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const createSewa = async (data) => {
    try {
        const response = await createTagihanApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat properti:", error);
        throw error.response?.data || { message: "Terjadi   kesalahan koneksi" };
    } 
}