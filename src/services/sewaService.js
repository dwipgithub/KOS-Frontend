import { getSewaApi, showSewaApi, createSewaApi } from "../api/sewa";

export const getSewa = async (filters = {}) => {
    try {
        const response = await getSewaApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const showSewa = async (id) => {
    try {
        const response = await showSewaApi(id);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const createSewa = async (data) => {
    try {
        const response = await createSewaApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat properti:", error);
        throw error.response?.data || { message: "Terjadi   kesalahan koneksi" };
    } 
}