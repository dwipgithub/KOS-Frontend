import { getTagihanApi, showTagihanApi, deleteTagihanApi, createTagihanApi } from "../api/tagihan";

export const getTagihan = async (filters = {}) => {
    try {
        const response = await getTagihanApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const showTagihan = async (id) => {
    try {
        const response = await showTagihanApi(id);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const createTagihan = async (data) => {
    try {
        const response = await createTagihanApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat properti:", error);
        throw error.response?.data || { message: "Terjadi   kesalahan koneksi" };
    } 
}

export const deleteTagihan = async (id) => {
    try {
        const response = await deleteTagihanApi(id);
        return response.data;
    } catch (error) {
        console.error("Gagal menghapus tagihan:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    }
}