import { getPropertiApi, getPropertiByIdApi, createPropertiApi, updatePropertiApi } from "../api/properti";

export const getProperti = async (filters = {}) => {
    try {
        const response = await getPropertiApi(filters);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const getPropertiById = async (id) => {
    try {
        const response = await getPropertiByIdApi(id);
        return response.data;
    } catch (error) {
        console.error("Gagal mengambil data properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}

export const createProperti = async (data) => {
    try {
        const response = await createPropertiApi(data);
        return response.data;
    } catch (error) {
        console.error("Gagal membuat properti:", error);
        throw error.response?.data || { message: "Terjadi   kesalahan koneksi" };
    } 
}

export const updateProperti = async (id, data) => {
    try {
        const response = await updatePropertiApi(id, data);
        return response.data;
    } catch (error) {
        console.error("Gagal memperbarui properti:", error);
        throw error.response?.data || { message: "Terjadi kesalahan koneksi" };
    } 
}